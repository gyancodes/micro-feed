import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/server-db';
import { createPostSchema } from '@/lib/validators';
import { POSTS_PER_PAGE, decodeCursor, encodeCursor } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/posts called');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    let supabase = createServerSupabaseClient();
    let user = null;
    
    // If we have an authorization header, create a client with the token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create a new client with the token
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      
      const { data: { user: tokenUser }, error: authError } = await supabase.auth.getUser();
      console.log('User from token:', tokenUser ? 'authenticated' : 'not authenticated');
      console.log('Auth error:', authError);
      user = tokenUser;
    } else {
      // Fallback to cookie-based auth
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      console.log('User from cookies:', cookieUser ? 'authenticated' : 'not authenticated');
      console.log('Auth error:', authError);
      user = cookieUser;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const cursor = searchParams.get('cursor');
    const filter = searchParams.get('filter') || 'all';

    console.log('Search params:', { query, cursor, filter, userId: user?.id });

    // Validate filter parameter
    const validFilter = filter === 'mine' ? 'mine' : 'all';

    let queryBuilder = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey(id, username),
        likes(user_id)
      `)
      .order('created_at', { ascending: false })
      .limit(POSTS_PER_PAGE + 1);

    // Apply search filter
    if (query) {
      queryBuilder = queryBuilder.ilike('content', `%${query}%`);
    }

    // Apply user filter
    if (validFilter === 'mine' && user) {
      queryBuilder = queryBuilder.eq('author_id', user.id);
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      queryBuilder = queryBuilder.lt('created_at', decodedCursor);
    }

    const { data: posts, error } = await queryBuilder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const hasMore = posts.length > POSTS_PER_PAGE;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

    // Transform posts to include like information
    const transformedPosts = postsToReturn.map(post => ({
      ...post,
      isLiked: user ? post.likes.some((like: any) => like.user_id === user.id) : false,
      _count: {
        likes: post.likes.length
      }
    }));

    const nextCursor = hasMore && postsToReturn.length > 0
      ? encodeCursor(postsToReturn[postsToReturn.length - 1].created_at)
      : undefined;

    return NextResponse.json({
      posts: transformedPosts,
      nextCursor,
      hasMore
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/posts called');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    let supabase = createServerSupabaseClient();
    let user = null;
    
    // If we have an authorization header, create a client with the token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create a new client with the token
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      
      const { data: { user: tokenUser }, error: authError } = await supabase.auth.getUser();
      console.log('User from token:', tokenUser ? 'authenticated' : 'not authenticated');
      console.log('Auth error:', authError);
      user = tokenUser;
    } else {
      // Fallback to cookie-based auth
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      console.log('User from cookies:', cookieUser ? 'authenticated' : 'not authenticated');
      console.log('Auth error:', authError);
      user = cookieUser;
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { content } = validation.data;

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content,
        author_id: user.id,
      })
      .select(`
        *,
        profiles!posts_author_id_fkey(id, username),
        likes(user_id)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform post to include like information
    const transformedPost = {
      ...post,
      isLiked: false,
      _count: {
        likes: 0
      }
    };

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}