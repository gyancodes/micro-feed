# Micro Feed

A simple social feed where users can create, search, and like posts.

## Features

- Create posts (≤280 characters)
- Search posts by keyword
- Like/unlike posts with instant updates
- Paginated list of posts (newest first)
- Real-time updates across all users
- Email/password authentication

## Setup

1. **Environment Variables**
   
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

2. **Database Setup**
   
   Run in Supabase SQL Editor:
   ```sql
   -- Create tables
   create table profiles (
     id uuid primary key references auth.users(id) on delete cascade,
     username text unique not null,
     created_at timestamptz default now()
   );

   create table posts (
     id uuid primary key default gen_random_uuid(),
     author_id uuid not null references profiles(id) on delete cascade,
     content text not null check (char_length(content) <= 280),
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   create table likes (
     post_id uuid references posts(id) on delete cascade,
     user_id uuid references profiles(id) on delete cascade,
     created_at timestamptz default now(),
     primary key (post_id, user_id)
   );

   -- Enable RLS
   alter table profiles enable row level security;
   alter table posts enable row level security;
   alter table likes enable row level security;

   -- Policies
   create policy "read profiles" on profiles for select using (true);
   create policy "manage own profile" on profiles for all using (auth.uid() = id);
   create policy "read posts" on posts for select using (true);
   create policy "manage own posts" on posts for all using (auth.uid() = author_id);
   create policy "read likes" on likes for select using (true);
   create policy "manage own likes" on likes for all using (auth.uid() = user_id);

   -- Enable real-time
   ALTER PUBLICATION supabase_realtime ADD TABLE posts;
   ALTER PUBLICATION supabase_realtime ADD TABLE likes;
   ```

3. **Seed Data (Optional)**
   
   Create a test user and some posts through the UI, or run:
   ```sql
   -- After signing up a user, you can add test posts
   insert into posts (author_id, content) values 
   ((select id from profiles limit 1), 'Hello world! This is my first post.'),
   ((select id from profiles limit 1), 'Testing the micro feed functionality 🚀');
   ```

4. **Run**
   ```bash
   npm install
   npm run dev
   ```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Subscriptions

## Key Features

- **Pagination**: Cursor-based pagination (10 posts per page)
- **Search**: Server-side filtering with debounced input
- **Optimistic UI**: Instant like updates with rollback on failure
- **Real-time**: Live updates across all connected users
- **Responsive**: Mobile-friendly design

## Design Notes

**Routing Choice**: I chose Route Handlers over Server Actions for cleaner API separation and explicit REST endpoints. This provides better debugging, testing, and familiar HTTP patterns with proper status codes. The API routes handle authentication via both cookies and Bearer tokens for flexibility.

**Error Handling & Optimistic UI**: Client-side hooks manage error states with automatic rollback for failed optimistic updates. Like/unlike operations update the UI immediately, then revert if the API call fails. RLS policies assume a public feed where users can read all content but only modify their own posts and likes, with automatic profile creation on first sign-in.

## Tradeoffs & Timeboxing

**What was skipped**: Image uploads (text-only requirement), advanced user profiles beyond username, push notifications, and comprehensive moderation features. I focused on core functionality with cursor-based pagination for performance, debounced search to reduce API calls, and real-time subscriptions for live updates.

**Why**: These decisions prioritize the three main requirements (paginated posts, search, optimistic likes) while maintaining clean architecture that's easy to extend. The foundation supports adding skipped features later without major refactoring.