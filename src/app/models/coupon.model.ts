export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed'; // Porcentaje o monto fijo
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}
