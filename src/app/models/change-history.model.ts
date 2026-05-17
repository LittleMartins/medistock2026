export interface ChangeHistory {
  id?: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  entity: 'product' | 'order' | 'user' | 'provider';
  entityId: string;
  details: string;
  timestamp: Date;
}
