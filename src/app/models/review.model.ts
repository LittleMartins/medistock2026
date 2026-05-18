export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  approved: boolean;
  createdAt: string;
  updatedAt?: string;
}
