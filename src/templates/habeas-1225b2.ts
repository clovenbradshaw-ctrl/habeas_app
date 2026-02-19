import type { Block } from "../models";

export const DEFAULT_BLOCKS: Block[] = [
  { id: "ct-1", type: "title", content: "UNITED STATES DISTRICT COURT" },
  {
    id: "ct-2",
    type: "title",
    content: "FOR THE {{COURT_DISTRICT}}",
  },
  { id: "ct-3", type: "title", content: "{{COURT_DIVISION}}" },
  {
    id: "cap-pet",
    type: "cap-name",
    content: "{{PETITIONER_FULL_NAME}},",
  },
  {
    id: "cap-role",
    type: "cap-center",
    content: "Petitioner-Plaintiff,",
  },
  { id: "cap-v", type: "cap-center", content: "v." },
  {
    id: "cap-r1",
    type: "cap-resp",
    content:
      "{{WARDEN_NAME}}, Warden of {{DETENTION_FACILITY_NAME}};",
  },
  {
    id: "cap-r2",
    type: "cap-resp",
    content:
      "{{FIELD_OFFICE_DIRECTOR}}, FOD, {{FIELD_OFFICE_NAME}}, ERO, ICE;",
  },
  {
    id: "cap-r3",
    type: "cap-resp",
    content: "U.S. Department of Homeland Security;",
  },
  {
    id: "cap-r4",
    type: "cap-resp",
    content:
      "{{ICE_DIRECTOR}}, {{ICE_DIRECTOR_TITLE}}, ICE, DHS;",
  },
  {
    id: "cap-r5",
    type: "cap-resp",
    content: "{{DHS_SECRETARY}}, Secretary, DHS; and",
  },
  {
    id: "cap-r6",
    type: "cap-resp",
    content:
      "{{ATTORNEY_GENERAL}}, Attorney General; Respondents-Defendants.",
  },
  {
    id: "cap-case",
    type: "cap-case",
    content: "C/A No. {{CASE_NUMBER}}",
  },
  {
    id: "cap-title",
    type: "cap-doctitle",
    content:
      "PETITION FOR WRIT OF HABEAS CORPUS AND COMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF",
  },
  { id: "h-intro", type: "heading", content: "INTRODUCTION" },
  {
    id: "p-1",
    type: "para",
    content:
      '1. {{PETITIONER_FULL_NAME}} ("Petitioner") is a citizen of {{PETITIONER_COUNTRY}} who has resided in the U.S. for {{PETITIONER_YEARS_IN_US}} years. ICE apprehended him in {{PETITIONER_APPREHENSION_LOCATION}} on or about {{PETITIONER_APPREHENSION_DATE}}.',
  },
  {
    id: "p-2",
    type: "para",
    content:
      "2. Petitioner is detained at {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}.",
  },
  {
    id: "p-3",
    type: "para",
    content:
      '3. The BIA reinterpreted the INA. <em>Matter of Yajure Hurtado</em>, 29 I&N Dec. 216 (BIA 2025). Petitioner is subject to mandatory detention under \u00a7 1225(b)(2)(A) with no bond.',
  },
  {
    id: "p-4",
    type: "para",
    content:
      '4. This violates the INA. Petitioner, residing nearly {{PETITIONER_YEARS_IN_US}} years, is not an "applicant for admission." He should be under \u00a7 1226(a), which allows bond.',
  },
  {
    id: "p-5",
    type: "para",
    content:
      "5. Petitioner seeks declaratory relief under \u00a7 1226(a) and asks for release or a bond hearing.",
  },
  { id: "h-cust", type: "heading", content: "CUSTODY" },
  {
    id: "p-6",
    type: "para",
    content:
      '6. Petitioner is in ICE custody at {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}. <em>Jones v. Cunningham</em>, 371 U.S. 236, 243 (1963).',
  },
  { id: "h-jur", type: "heading", content: "JURISDICTION" },
  {
    id: "p-7",
    type: "para",
    content:
      "7. Jurisdiction under 28 U.S.C. \u00a7 2241, \u00a7 1331, the Suspension Clause, and the INA.",
  },
  { id: "h-ven", type: "heading", content: "VENUE" },
  {
    id: "p-12",
    type: "para",
    content:
      "12. Venue proper under 28 U.S.C. \u00a7 1391(e). Petitioner is under ICE\u2019s {{FIELD_OFFICE_NAME}} and detained at {{DETENTION_FACILITY_NAME}}.",
  },
  { id: "h-par", type: "heading", content: "PARTIES" },
  {
    id: "p-16",
    type: "para",
    content:
      "16. Petitioner {{PETITIONER_FULL_NAME}} is from {{PETITIONER_COUNTRY}}, in the U.S. since {{PETITIONER_ENTRY_DATE}}.",
  },
  {
    id: "p-17",
    type: "para",
    content:
      "17\u201321. Respondents {{WARDEN_NAME}}, {{FIELD_OFFICE_DIRECTOR}}, {{ICE_DIRECTOR}}, {{DHS_SECRETARY}}, and {{ATTORNEY_GENERAL}} are sued in their official capacities.",
  },
  {
    id: "h-leg",
    type: "heading",
    content: "LEGAL BACKGROUND",
  },
  {
    id: "p-22",
    type: "para",
    content:
      "22\u201337. \u00a7 1226(a) allows bond. \u00a7 1225(b) is for those seeking admission at borders. The BIA\u2019s reinterpretation in <em>Yajure Hurtado</em> is contrary to statute, regulations, and precedent. Under <em>Loper Bright</em>, 603 U.S. 369 (2024), no deference is owed.",
  },
  {
    id: "h-facts",
    type: "heading",
    content: "STATEMENT OF FACTS",
  },
  {
    id: "p-38",
    type: "para",
    content:
      "38\u201343. Petitioner is from {{PETITIONER_COUNTRY}}, entered {{PETITIONER_ENTRY_METHOD}} in {{PETITIONER_ENTRY_DATE}}, {{PETITIONER_CRIMINAL_HISTORY}}, arrested in {{PETITIONER_APPREHENSION_LOCATION}} on {{PETITIONER_APPREHENSION_DATE}}, detained at {{DETENTION_FACILITY_NAME}}.",
  },
  {
    id: "h-c1",
    type: "heading",
    content: "COUNT I \u2014 Violation of \u00a7 1226(a)",
  },
  {
    id: "p-45",
    type: "para",
    content:
      "45. Petitioner is entitled to a bond hearing under \u00a7 1226(a). His detention is unlawful.",
  },
  {
    id: "h-c2",
    type: "heading",
    content: "COUNT II \u2014 Violation of Bond Regulations",
  },
  {
    id: "p-51",
    type: "para",
    content:
      "51. Application of \u00a7 1225(b)(2) violates 8 C.F.R. \u00a7\u00a7 236.1, 1236.1, 1003.19.",
  },
  {
    id: "h-c3",
    type: "heading",
    content: "COUNT III \u2014 Fifth Amendment Due Process",
  },
  {
    id: "p-57",
    type: "para",
    content:
      "57. Petitioner {{PETITIONER_CRIMINAL_HISTORY}} and {{PETITIONER_COMMUNITY_TIES}}. Risk of erroneous deprivation is high.",
  },
  {
    id: "h-pray",
    type: "heading",
    content: "PRAYER FOR RELIEF",
  },
  {
    id: "p-pray",
    type: "para",
    content:
      "WHEREFORE: (1) jurisdiction; (2) expedited; (3) no transfer; (4) OSC; (5) declare unlawful; (6) Writ with bond hearing; (7) EAJA fees; (8) further relief.",
  },
  {
    id: "sig-date",
    type: "sig",
    content: "Date: {{FILING_DATE}}",
  },
  {
    id: "sig-sub",
    type: "sig",
    content: "Respectfully Submitted,",
  },
  {
    id: "sig-a1",
    type: "sig",
    content:
      "/s/ {{ATTORNEY1_NAME}}\n{{ATTORNEY1_BAR_NO}}\n{{ATTORNEY1_FIRM}}\n{{ATTORNEY1_ADDRESS}}\n{{ATTORNEY1_CITY_STATE_ZIP}}\n{{ATTORNEY1_PHONE}} \u00b7 {{ATTORNEY1_FAX}}\n{{ATTORNEY1_EMAIL}}",
  },
  {
    id: "sig-a2",
    type: "sig",
    content:
      "/s/ {{ATTORNEY2_NAME}}\n{{ATTORNEY2_BAR_NO}}*\n{{ATTORNEY2_FIRM}}\n{{ATTORNEY2_ADDRESS}}\n{{ATTORNEY2_CITY_STATE_ZIP}}\n{{ATTORNEY2_PHONE}}\n{{ATTORNEY2_EMAIL}}\n{{ATTORNEY2_PRO_HAC}}",
  },
  {
    id: "sig-role",
    type: "sig-label",
    content: "Attorneys for Petitioner",
  },
  {
    id: "h-ver",
    type: "heading",
    content: "VERIFICATION \u2014 28 U.S.C. \u00a7 2242",
  },
  {
    id: "p-ver",
    type: "para",
    content:
      "I represent {{PETITIONER_FULL_NAME}} and verify the foregoing. Dated {{FILING_DAY}} day of {{FILING_MONTH_YEAR}}.",
  },
  {
    id: "sig-ver",
    type: "sig",
    content:
      "/s/ {{ATTORNEY2_NAME}}\nAttorney for Petitioner Pro Hac Vice",
  },
];
