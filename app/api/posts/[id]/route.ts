import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/server-db';
import { updatePostSchema } from '@/lib/validators';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PATCH /api/posts/[id] called for post:', params.id);
    
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
    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { content } = validation.data;

    const { data: post, error } = await supabase
      .from('posts')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('author_id', user.id)
      .select(`
        *,
        profiles!posts_author_id_fkey(id, username),
        likes(user_id)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform post to include like information
    const transformedPost = {
      ...post,
      isLiked: post.likes.some((like: any) => like.user_id === user.id),
      _count: {
        likes: post.likes.length
      }
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE /api/posts/[id] called for post:', params.id);
    
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

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id)
      .eq('author_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}