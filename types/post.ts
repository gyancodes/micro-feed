export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: Profile;
  likes: Like[];
  _count?: {
    likes: number;
  };
  isLiked?: boolean;
}

export interface Like {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostsResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}