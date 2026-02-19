export interface Block {
  id: string;
  type: string;
  content: string;
}

export interface StageEntry {
  stage: string;
  at: string;
}

export interface Petition {
  id: string;
  clientId: string;
  createdBy: string;
  stage: string;
  stageHistory: StageEntry[];
  blocks: Block[];
  district: string;
  division: string;
  caseNumber: string;
  facilityName: string;
  facilityCity: string;
  facilityState: string;
  warden: string;
  fieldOfficeDirector: string;
  fieldOfficeName: string;
  filingDate: string;
  filingDay: string;
  filingMonthYear: string;
  templateId?: string;
  att1Id?: string;
  att2Id?: string;
  _facilityId?: string;
  _courtId?: string;
  _att1Id?: string;
  _att2Id?: string;
  createdAt: string;
}
