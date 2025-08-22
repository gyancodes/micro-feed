import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(280, 'Post content must be 280 characters or less')
    .trim(),
});

export const updatePostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(280, 'Post content must be 280 characters or less')
    .trim(),
});

export const searchPostsSchema = z.object({
  query: z.string().optional(),
  cursor: z.string().optional(),
  filter: z.string().optional().transform((val) => {
    if (val === 'mine') return 'mine';
    return 'all';
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type SearchPostsInput = z.infer<typeof searchPostsSchema>;