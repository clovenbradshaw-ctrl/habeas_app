export interface Facility {
  id: string;
  name: string;
  city: string;
  state: string;
  warden: string;
  fieldOfficeName: string;
  fieldOfficeDirector: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: Array<{ by: string; at: string; change: string }>;
}
