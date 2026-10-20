import type { Review, Comment } from '../types/domain';
export function aggregateReviews(reviews: Review[], placeId?: string) {
  const active = reviews.filter(r => r.status === 'ACTIVE' && (!placeId || r.placeId === placeId));
  return {reviewCount: active.length, rating: active.length ? Number((active.reduce((sum, r) => sum + r.stars, 0) / active.length).toFixed(2)) : 0,
    distribution: [5, 4, 3, 2, 1].map(stars => ({stars, count: active.filter(r => r.stars === stars).length}))};
}
export function commentDepth(comments: Comment[], id: string, visited = new Set<string>()): number {
  const comment = comments.find(c => c.id === id);
  if (!comment || visited.has(id)) return 0;
  if (!comment.parentId) return 1;
  visited.add(id); return 1 + commentDepth(comments, comment.parentId, visited);
}
