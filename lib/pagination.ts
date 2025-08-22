export const POSTS_PER_PAGE = 10;

export function encodeCursor(date: string): string {
  return Buffer.from(date).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString();
}