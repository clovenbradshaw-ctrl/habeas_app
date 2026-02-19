export interface AttorneyProfile {
  id: string;
  name: string;
  barNo: string;
  firm: string;
  address: string;
  cityStateZip: string;
  phone: string;
  fax: string;
  email: string;
  proHacVice: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: Array<{ by: string; at: string; change: string }>;
}
