import type { Place } from '../types/domain';
export type RankingSort = 'rating' | 'reviews';
export function rankPlaces(places: Place[], sort: RankingSort = 'rating'): Place[] {
  return [...places].sort((a, b) => sort === 'reviews'
    ? b.reviewCount - a.reviewCount || b.rating - a.rating
    : b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 10);
}
export function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
}
