import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/server-db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('POST /api/posts/[id]/like called for post:', params.id);
    
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
      .from('likes')
      .insert({
        post_id: params.id,
        user_id: user.id,
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Already liked' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE /api/posts/[id]/like called for post:', params.id);
    
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
      .from('likes')
      .delete()
      .eq('post_id', params.id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}