export const uid = (): string =>
  Math.random().toString(36).slice(2, 10);

export const now = (): string => new Date().toISOString();

export const ts = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const STAGES = ["drafted", "reviewed", "submitted"] as const;

export const SM: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  drafted: { color: "#c9a040", bg: "#faf5e4", label: "Drafted" },
  reviewed: { color: "#5a9e6f", bg: "#eaf5ee", label: "Reviewed" },
  submitted: { color: "#4a7ab5", bg: "#e8f0fa", label: "Submitted" },
};

export function buildVarMap(
  c: Record<string, any>,
  p: Record<string, any>,
  a1: Record<string, any>,
  a2: Record<string, any>,
  nat: Record<string, any>,
): Record<string, string> {
  c = c || {};
  p = p || {};
  a1 = a1 || {};
  a2 = a2 || {};
  nat = nat || {};
  return {
    COURT_DISTRICT: p.district || "",
    COURT_DIVISION: p.division || "",
    CASE_NUMBER: p.caseNumber || "",
    PETITIONER_FULL_NAME: c.name || "",
    PETITIONER_COUNTRY: c.country || "",
    PETITIONER_YEARS_IN_US: c.yearsInUS || "",
    PETITIONER_ENTRY_DATE: c.entryDate || "",
    PETITIONER_ENTRY_METHOD: c.entryMethod || "",
    PETITIONER_APPREHENSION_LOCATION: c.apprehensionLocation || "",
    PETITIONER_APPREHENSION_DATE: c.apprehensionDate || "",
    PETITIONER_CRIMINAL_HISTORY: c.criminalHistory || "",
    PETITIONER_COMMUNITY_TIES: c.communityTies || "",
    DETENTION_FACILITY_NAME: p.facilityName || "",
    DETENTION_FACILITY_CITY: p.facilityCity || "",
    DETENTION_FACILITY_STATE: p.facilityState || "",
    WARDEN_NAME: p.warden || "",
    FIELD_OFFICE_DIRECTOR: p.fieldOfficeDirector || "",
    FIELD_OFFICE_NAME: p.fieldOfficeName || "",
    ICE_DIRECTOR: nat.iceDirector || "",
    ICE_DIRECTOR_TITLE: nat.iceDirectorTitle || "",
    DHS_SECRETARY: nat.dhsSecretary || "",
    ATTORNEY_GENERAL: nat.attorneyGeneral || "",
    FILING_DATE: p.filingDate || "",
    FILING_DAY: p.filingDay || "",
    FILING_MONTH_YEAR: p.filingMonthYear || "",
    ATTORNEY1_NAME: a1.name || "",
    ATTORNEY1_BAR_NO: a1.barNo || "",
    ATTORNEY1_FIRM: a1.firm || "",
    ATTORNEY1_ADDRESS: a1.address || "",
    ATTORNEY1_CITY_STATE_ZIP: a1.cityStateZip || "",
    ATTORNEY1_PHONE: a1.phone || "",
    ATTORNEY1_FAX: a1.fax || "",
    ATTORNEY1_EMAIL: a1.email || "",
    ATTORNEY2_NAME: a2.name || "",
    ATTORNEY2_BAR_NO: a2.barNo || "",
    ATTORNEY2_FIRM: a2.firm || "",
    ATTORNEY2_ADDRESS: a2.address || "",
    ATTORNEY2_CITY_STATE_ZIP: a2.cityStateZip || "",
    ATTORNEY2_PHONE: a2.phone || "",
    ATTORNEY2_EMAIL: a2.email || "",
    ATTORNEY2_PRO_HAC: a2.proHacVice || "",
  };
}

export const FACILITY_FIELDS = [
  {
    key: "name",
    label: "Facility Name",
    ph: "South Louisiana ICE Processing Center",
  },
  { key: "city", label: "City", ph: "Basile" },
  { key: "state", label: "State", ph: "Louisiana" },
  { key: "warden", label: "Warden", ph: "John Smith" },
  {
    key: "fieldOfficeName",
    label: "Field Office",
    ph: "New Orleans Field Office",
  },
  {
    key: "fieldOfficeDirector",
    label: "Field Office Director",
    ph: "Jane Doe",
  },
];

export const COURT_FIELDS = [
  {
    key: "district",
    label: "District",
    ph: "Middle District of Tennessee",
  },
  { key: "division", label: "Division", ph: "Nashville Division" },
];

export const NATIONAL_FIELDS = [
  { key: "iceDirector", label: "ICE Director", ph: "Tom Homan" },
  {
    key: "iceDirectorTitle",
    label: "ICE Title",
    ph: "Director",
  },
  {
    key: "dhsSecretary",
    label: "DHS Secretary",
    ph: "Kristi Noem",
  },
  {
    key: "attorneyGeneral",
    label: "Attorney General",
    ph: "Pam Bondi",
  },
];

export const ATT_PROFILE_FIELDS = [
  { key: "name", label: "Name", ph: "" },
  { key: "barNo", label: "Bar No.", ph: "" },
  { key: "firm", label: "Firm", ph: "" },
  { key: "address", label: "Address", ph: "" },
  { key: "cityStateZip", label: "City/St/Zip", ph: "" },
  { key: "phone", label: "Phone", ph: "" },
  { key: "fax", label: "Fax", ph: "" },
  { key: "email", label: "Email", ph: "" },
  {
    key: "proHacVice",
    label: "Pro Hac Vice",
    ph: "*Pro hac vice pending",
  },
];

export const CLIENT_FIELDS = [
  {
    key: "name",
    label: "Full Name",
    ph: "Juan Carlos Rivera",
  },
  { key: "country", label: "Country", ph: "Honduras" },
  { key: "yearsInUS", label: "Years in U.S.", ph: "12" },
  {
    key: "entryDate",
    label: "Entry Date",
    ph: "approximately 2013",
  },
  {
    key: "entryMethod",
    label: "Entry Method",
    ph: "without inspection",
  },
  {
    key: "apprehensionLocation",
    label: "Arrest Location",
    ph: "Nashville, Tennessee",
  },
  {
    key: "apprehensionDate",
    label: "Arrest Date",
    ph: "January 15, 2026",
  },
  {
    key: "criminalHistory",
    label: "Criminal History",
    ph: "has no criminal record",
  },
  {
    key: "communityTies",
    label: "Community Ties",
    ph: "has strong family and community ties",
  },
];

export const FILING_FIELDS = [
  {
    key: "filingDate",
    label: "Filing Date",
    ph: "February 19, 2026",
  },
  { key: "filingDay", label: "Filing Day", ph: "19th" },
  {
    key: "filingMonthYear",
    label: "Month & Year",
    ph: "February, 2026",
  },
];

export const RESPONDENT_FIELDS = [
  { key: "warden", label: "Warden", ph: "" },
  { key: "fieldOfficeDirector", label: "FOD", ph: "" },
  { key: "fieldOfficeName", label: "Field Office", ph: "" },
];
