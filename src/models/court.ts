export interface Court {
  id: string;
  district: string;
  division: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: Array<{ by: string; at: string; change: string }>;
}
