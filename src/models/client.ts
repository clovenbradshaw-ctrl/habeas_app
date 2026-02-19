export interface ImmigrationClient {
  id: string;
  name: string;
  country: string;
  yearsInUS: string;
  entryDate: string;
  entryMethod: string;
  apprehensionLocation: string;
  apprehensionDate: string;
  criminalHistory: string;
  communityTies: string;
  createdAt?: string;
}
