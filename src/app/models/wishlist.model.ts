export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Wishlist {
  id?: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}
