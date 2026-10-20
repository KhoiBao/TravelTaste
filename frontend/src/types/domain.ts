export type Role = 'GUEST' | 'USER' | 'ADMIN';
export type Status = 'ACTIVE' | 'HIDDEN';
export interface User { id: string; name: string; email: string; role: Exclude<Role, 'GUEST'>; username?: string; accountStatus?: string; avatar: string; joined: string }
export interface Category { id: string; name: string; status: Status }
export interface Place { id: string; slug: string; kind: string; longitude: number; latitude: number; district: string; street: string; houseNumber: string; name: string; city: string; category: string; categoryId: string; categoryIds?: string[]; subtitle: string; description: string; address: string; image: string; status: Status; rating: number; reviewCount: number; distribution?: { stars: number; count: number }[] }
export type PlaceSummary = Pick<Place, 'id' | 'name' | 'city' | 'category' | 'subtitle' | 'image' | 'rating' | 'reviewCount'>;
export interface ReviewImage {src: string; name: string}
export interface Review { id: string; placeId: string; userId: string; title: string; content: string; stars: number; images: {src: string; name: string}[]; date: string; status: Status }
export interface Comment { likeCount: number; liked: boolean; id: string; reviewId: string; parentId: string | null; userId: string; content: string; date: string; status: Status }
export interface AppData { users: User[]; categories: Category[]; places: Place[]; reviews: Review[]; comments: Comment[] }
export interface Result { ok: boolean; message: string; id?: string }
export type Action =
    {type: 'SAVE_REVIEW'; id?: string; values: Pick<Review, 'placeId' | 'title' | 'content' | 'stars' | 'images'>}
  | {type: 'DELETE_REVIEW' | 'DELETE_COMMENT' | 'DELETE_CATEGORY' | 'DELETE_PLACE'; id: string}
  | {type: 'LIKE_COMMENT'; id: string; liked: boolean}
  | {type: 'ADD_COMMENT'; reviewId: string; parentId?: string; content: string}
  | {type: 'SAVE_PLACE'; id?: string; values: Pick<Place, 'name' | 'city' | 'address' | 'description' | 'image' | 'categoryId' | 'kind' | 'longitude' | 'latitude' | 'district' | 'street' | 'houseNumber'>}
  | {type: 'PLACE_STATUS'; id: string; status: Status}
  | {type: 'SAVE_CATEGORY'; id?: string; name: string};
export interface Confirmation {title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel?: () => void}
export interface PopupValue {
  active: boolean; setActive: (value: boolean) => void; dirty: boolean; dirtyRef: {current: boolean};
  setDirty: (value: boolean) => void; confirmation: Confirmation | null;
  confirm: (request: Confirmation | null) => void;
  closeRef: {current: (() => void) | null};
}
export interface AppValue {
  data: AppData; role: Role; actor?: User; actorId: string; activePlaces: Place[];
  loading: boolean; ready: boolean; error: string; refresh: () => Promise<void>; execute: (action: Action) => Promise<Result>;
  confirm: (request: Confirmation) => void;
  authenticate: (identity: string, password: string) => Promise<Result & {role?: Role}>;
  register: (username: string, name: string, email: string, password: string) => Promise<Result>;
  logout: () => Promise<Result>;
}

