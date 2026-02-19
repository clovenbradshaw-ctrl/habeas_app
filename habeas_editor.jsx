import { useState, useMemo, useRef, useCallback } from "react";

const TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Habeas Petition</title>
<style>
  @page { size: Letter; margin: 1in; }
  html, body { background: #fff; color: #000; font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.35; }
  body { margin: 0; padding: 0; }
  .page { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 1in; box-sizing: border-box; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .ph { color: #a00000; font-weight: 700; }
  .filled { color: #000; font-weight: 400; }
  .center { text-align: center; }
  .court-title { font-weight: 700; letter-spacing: 0.2px; }
  .caption-wrap { margin-top: 0.35in; }
  .caption-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .caption-table td { vertical-align: top; padding: 0; }
  .cap-left { width: 58%; padding-right: 0.12in; }
  .cap-mid { width: 4%; text-align: center; }
  .cap-right { width: 38%; padding-left: 0.12in; }
  .cap-name { text-align: center; font-weight: 700; }
  .cap-centerline { text-align: center; }
  .cap-v { margin-top: 0.20in; }
  .cap-block p { margin: 0 0 10pt 0; }
  .cap-right .case-no { margin: 0 0 14pt 0; }
  .cap-right .titleblock { font-weight: 700; margin: 0; }
  h2.section { font-size: 12pt; font-weight: 700; margin: 18pt 0 6pt 0; text-transform: uppercase; }
  p.para { margin: 0 0 10pt 0; text-align: justify; }
  p.para.numbered { text-indent: 0; }
</style>
</head>
<body>
<section class="page">
  <div class="center court-title">UNITED STATES DISTRICT COURT</div>
  <div class="center court-title">FOR THE {{COURT_DISTRICT}}</div>
  <div class="center court-title">{{COURT_DIVISION}}</div>
  <div class="caption-wrap">
    <table class="caption-table">
      <tr>
        <td class="cap-left">
          <div class="cap-name">{{PETITIONER_FULL_NAME}},</div>
          <div class="cap-centerline" style="margin-top:18pt;">Petitioner-Plaintiff,</div>
          <div class="cap-v" style="margin-top:18pt;">v.</div>
          <div class="cap-block" style="margin-top:18pt;">
            <p>{{WARDEN_NAME}}, in his official capacity as Warden of {{DETENTION_FACILITY_NAME}};</p>
            <p>{{FIELD_OFFICE_DIRECTOR}}, in his official capacity as Field Office Director of the {{FIELD_OFFICE_NAME}} of Enforcement and Removal Operations, U.S. Immigration and Customs Enforcement;</p>
            <p>U.S. Department of Homeland Security;</p>
            <p>{{ICE_DIRECTOR}}, in his official capacity as {{ICE_DIRECTOR_TITLE}}, Immigration and Customs Enforcement, U.S. Department of Homeland Security;</p>
            <p>{{DHS_SECRETARY}}, in her official capacity as Secretary, U.S. Department of Homeland Security; and</p>
            <p>{{ATTORNEY_GENERAL}}, in her official capacity as Attorney General of the United States;</p>
            <p>Respondents-Defendants.</p>
          </div>
        </td>
        <td class="cap-mid"><div style="line-height:1.35;">)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)</div></td>
        <td class="cap-right">
          <p class="case-no">C/A No. {{CASE_NUMBER}}</p>
          <p class="titleblock">PETITION FOR WRIT OF HABEAS</p>
          <p class="titleblock">CORPUS AND COMPLAINT FOR</p>
          <p class="titleblock">DECLARATORY AND INJUNCTIVE</p>
          <p class="titleblock">RELIEF</p>
        </td>
      </tr>
    </table>
  </div>
</section>
<section class="page">
<h2 class="section">INTRODUCTION</h2>
<p class="para numbered">1. Petitioner-Plaintiff {{PETITIONER_FULL_NAME}} ("Petitioner") is a citizen of {{PETITIONER_COUNTRY}} who has resided in the U.S. for {{PETITIONER_YEARS_IN_US}} years. On information and belief, Immigration and Customs Enforcement ("ICE") officers apprehended him near his home in {{PETITIONER_APPREHENSION_LOCATION}}, on or about {{PETITIONER_APPREHENSION_DATE}}.</p>
<p class="para numbered">2. Petitioner is currently detained at the {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}.</p>
<p class="para numbered">3. On September 5, 2025, the Board of Immigration Appeals ("BIA") issued a precedential decision that unlawfully reinterpreted the Immigration and Nationality Act ("INA"). See Matter of Yajure Hurtado, 29 I&amp;N Dec. 216 (BIA 2025). Prior to this decision, noncitizens like Petitioner who had lived in the U.S. for many years and were apprehended by ICE in the interior of the country were detained pursuant to 8 U.S.C. &sect; 1226(a) and eligible to seek bond hearings before Immigration Judges ("IJs"). Instead, in conflict with nearly thirty years of legal precedent, Petitioner is now considered subject to mandatory detention under 8 U.S.C. &sect; 1225(b)(2)(A) and has no opportunity for release on bond while his removal proceedings are pending.</p>
<p class="para numbered">4. Petitioner's detention pursuant to &sect; 1225(b)(2)(A) violates the plain language of the INA and its implementing regulations. Petitioner, who has resided in the U.S. for nearly {{PETITIONER_YEARS_IN_US}} years and who was apprehended in the interior of the U.S., should not be considered an "applicant for admission" who is "seeking admission." Rather, he should be detained pursuant to 8 U.S.C. &sect; 1226(a), which allows for release on conditional parole or bond.</p>
<p class="para numbered">5. Petitioner seeks declaratory relief that he is subject to detention under &sect; 1226(a) and its implementing regulations and asks that this Court either order Respondents to release Petitioner from custody or provide him with a bond hearing.</p>
<h2 class="section">CUSTODY</h2>
<p class="para numbered">6. Petitioner is currently in the custody of Immigration and Customs Enforcement ("ICE") at the {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}. He is therefore in "'custody' of [the DHS] within the meaning of the habeas corpus statute." Jones v. Cunningham, 371 U.S. 236, 243 (1963).</p>
<h2 class="section">JURISDICTION</h2>
<p class="para numbered">7. This court has jurisdiction under 28 U.S.C. &sect; 2241 (habeas corpus), 28 U.S.C. &sect; 1331 (federal question), Article I, &sect; 9, cl. 2 of the United States Constitution (Suspension Clause), and the Immigration and Nationality Act ("INA"), 8 U.S.C. &sect; 1101 et seq.</p>
<p class="para numbered">8. This Court may grant relief under the habeas corpus statutes, 28 U.S.C. &sect; 2241 et seq., the Declaratory Judgment Act, 28 U.S.C. &sect; 2201 et seq., the All Writs Act, 28 U.S.C. &sect; 1651, and the Immigration and Nationality Act, 8 U.S.C. &sect; 1252(e)(2).</p>
<p class="para numbered">9. Federal district courts have jurisdiction to hear habeas claims by non-citizens challenging both the lawfulness and the constitutionality of their detention. See Zadvydas v. Davis, 533 U.S. 678, 687 (2001).</p>
<h2 class="section">REQUIREMENTS OF 28 U.S.C. &sect;&sect; 2241, 2243</h2>
<p class="para numbered">10. The Court must grant the petition for writ of habeas corpus or issue an order to show cause ("OSC") to Respondents "forthwith," unless Petitioner is not entitled to relief. 28 U.S.C. &sect; 2243. If an OSC is issued, the Court must require Respondents to file a return "within three days unless for good cause additional time, not exceeding twenty days, is allowed." Id.</p>
<p class="para numbered">11. Petitioner is "in custody" for the purpose of &sect; 2241 because Petitioner is arrested and detained by Respondents.</p>
<h2 class="section">VENUE</h2>
<p class="para numbered">12. Venue is properly before this Court pursuant to 28 U.S.C. &sect; 1391(e) because Respondents are employees or officers of the United States acting in their official capacity and because a substantial part of the events or omissions giving rise to the claim occurred in the {{COURT_DISTRICT}}. Petitioner is under the jurisdiction of ICE's {{FIELD_OFFICE_NAME}}, and he is currently detained at the {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}.</p>
<h2 class="section">EXHAUSTION OF ADMINISTRATIVE REMEDIES</h2>
<p class="para numbered">13. Administrative exhaustion is unnecessary as it would be futile. See, e.g., Aguilar v. Lewis, 50 F. Supp. 2d 539, 542&ndash;43 (E.D. Va. 1999).</p>
<p class="para numbered">14. It would be futile for Petitioner to seek a custody redetermination hearing before an IJ due to the BIA's recent decision holding that anyone who has entered the U.S. without inspection is now considered an "applicant for admission" who is "seeking admission" and therefore subject to mandatory detention under &sect; 1225(b)(2)(A). See Matter of Yajure Hurtado, 29 I&amp;N Dec. 216 (BIA 2025); see also Zaragoza Mosqueda v. Noem, 2025 WL 2591530, at *7 (C.D. Cal. Sept. 8, 2025) (noting that BIA's decision in Yajure Hurtado renders exhaustion futile).</p>
<p class="para numbered">15. Additionally, the agency does not have jurisdiction to review Petitioner's claim of unlawful custody in violation of his due process rights, and it would therefore be futile for him to pursue administrative remedies. Reno v. Amer.-Arab Anti-Discrim. Comm., 525 U.S. 471, 119 S.Ct. 936, 142 L.Ed.2d 940 (1999) (finding exhaustion to be a "futile exercise because the agency does not have jurisdiction to review" constitutional claims).</p>
<h2 class="section">PARTIES</h2>
<p class="para numbered">16. Petitioner {{PETITIONER_FULL_NAME}} is from {{PETITIONER_COUNTRY}} and has resided in the U.S. since {{PETITIONER_ENTRY_DATE}}. He is currently detained in the {{DETENTION_FACILITY_NAME}}.</p>
<p class="para numbered">17. Respondent {{WARDEN_NAME}} is sued in his official capacity as Warden of the {{DETENTION_FACILITY_NAME}}. In his official capacity, {{WARDEN_NAME}} is Petitioner's immediate custodian.</p>
<p class="para numbered">18. Respondent {{FIELD_OFFICE_DIRECTOR}} is sued in his official capacity as Field Office Director, {{FIELD_OFFICE_NAME}}, Enforcement and Removal Operations, U.S. Immigration &amp; Customs Enforcement ("ICE"). In his official capacity, Respondent {{FIELD_OFFICE_DIRECTOR}} is the legal custodian of Petitioner.</p>
<p class="para numbered">19. Respondent {{ICE_DIRECTOR}} is sued in his official capacity as {{ICE_DIRECTOR_TITLE}} of ICE. As the {{ICE_DIRECTOR_TITLE}} of ICE, Respondent {{ICE_DIRECTOR}} is a legal custodian of Petitioner.</p>
<p class="para numbered">20. Respondent {{DHS_SECRETARY}} is sued in her official capacity as Secretary of Homeland Security. As the head of the Department of Homeland Security, the agency tasked with enforcing immigration laws, Secretary {{DHS_SECRETARY}} is Petitioner's ultimate legal custodian.</p>
<p class="para numbered">21. Respondent {{ATTORNEY_GENERAL}} is sued in her official capacity as the Attorney General of the United States. As Attorney General, she has authority over the Department of Justice and is charged with faithfully administering the immigration laws of the United States.</p>
<h2 class="section">LEGAL BACKGROUND AND ARGUMENT</h2>
<p class="para numbered">22. The INA prescribes three basic forms of detention for noncitizens in removal proceedings.</p>
<p class="para numbered">23. First, individuals detained pursuant to 8 U.S.C. &sect; 1226(a) are generally entitled to a bond hearing, unless they have been arrested, charged with, or convicted of certain crimes and are subject to mandatory detention. See 8 U.S.C. &sect;&sect; 1226(a), 1226(c) (listing grounds for mandatory detention); see also 8 C.F.R. &sect;&sect; 1003.19(a) (immigration judges may review custody determinations made by DHS), 1236.1(d) (same).</p>
<p class="para numbered">24. Second, the INA provides for mandatory detention of noncitizens subject to expedited removal under 8 U.S.C. &sect; 1225(b)(1) as well as other recent arrivals deemed to be "seeking admission" under &sect; 1225(b)(2).</p>
<p class="para numbered">25. Third, the INA authorizes detention of noncitizens who have received a final order of removal, including those in withholding-only proceedings. See 8 U.S.C. &sect; 1231(a)&ndash;(b).</p>
<p class="para numbered">26. Thus, in the decades that followed, most people who entered without inspection and were thereafter detained and placed in standard removal proceedings were considered for release on bond and received bond hearings before an IJ, unless their criminal history rendered them ineligible.</p>
<p class="para numbered">27. For decades, long-term residents of the U.S. who entered without inspection and were subsequently apprehended by ICE in the interior of the country have been detained pursuant to &sect; 1226 and entitled to bond hearings before an IJ, unless barred from doing so due to their criminal history.</p>
<p class="para numbered">28. In July 2025, however, ICE began asserting that all individuals who entered without inspection should be considered "seeking admission" and therefore subject to mandatory detention under 8 U.S.C. &sect; 1225(b)(2)(A).</p>
<p class="para numbered">29. On September 5, 2025, the BIA issued a precedential decision adopting this interpretation, despite its departure from the INA's text, federal precedent, and existing regulations. Matter of Yajure Hurtado, 29 I&amp;N Dec. 216 (BIA 2025).</p>
<p class="para numbered">30. Respondents' new legal interpretation is contrary to the statutory framework and its implementing regulations.</p>
<p class="para numbered">31. Courts across the country, including this Court, have rejected this interpretation and instead have consistently found that &sect; 1226, not &sect; 1225(b)(2), authorizes detention of noncitizens who entered without inspection and were later apprehended in the interior of the country. See, e.g., Hasan v. Crawford, No. 1:25-CV-1408 (LMB/IDD), 2025 WL 2682255 (E.D. Va. Sept. 19, 2025); Quispe Ardiles v. Noem, No. 1:25-cv-01382 (E.D. Va. Sept. 30, 2025); Venancio v. Hyde et al, No. 1:25-cv-12616 (D. Mass. Oct. 9, 2025); Artiga v. Genalo, No. 2:25-cv-05208 (E.D.N.Y. Oct. 7, 2025); Sampiao v. Hyde, 2025 WL 2607924 (D. Mass. Sept. 9, 2025); Leal-Hernandez v. Noem, 2025 WL 2430025 (D. Md. Aug. 24, 2025); Lopez Benitez v. Francis, 2025 WL 2371588 (S.D.N.Y. Aug. 13, 2025); Jimenez v. FCI Berlin, Warden, No. 25-cv-326-LM-AJ (D.N.H. Sept. 8, 2025); Kostak v. Trump, 2025 WL 2472136 (W.D. La. Aug. 27, 2025); Cuevas Guzman v. Andrews, 2025 WL 2617256, at *3 n.4 (E.D. Cal. Sept. 9, 2025).</p>
<p class="para numbered">32. Under the Supreme Court's recent decision in Loper Bright v. Raimondo, this Court should independently interpret the statute and give the BIA's expansive interpretation of &sect; 1225(b)(2) no weight, as it conflicts with the statute, regulations, and precedent. 603 U.S. 369 (2024).</p>
<p class="para numbered">33. The detention provisions at &sect; 1226(a) and &sect; 1225(b)(2) were enacted as part of the Illegal Immigration Reform and Immigrant Responsibility Act ("IIRIRA") of 1996, Pub. L. No. 104-208, Div. C, &sect;&sect; 302&ndash;03, 110 Stat. 3009-546, 3009&ndash;582 to 3009&ndash;583, 3009&ndash;585. Following IIRIRA, the Executive Office for Immigration Review ("EOIR") issued regulations clarifying that individuals who entered the country without inspection were not considered detained under &sect; 1225, but rather under &sect; 1226(a). See Inspection and Expedited Removal of Aliens; Detention and Removal of Aliens; Conduct of Removal Proceedings; Asylum Procedures, 62 Fed. Reg. 10312, 10323 (Mar. 6, 1997) ("Despite being applicants for admission, aliens who are present without having been admitted or paroled (formerly referred to as aliens who entered without inspection) will be eligible for bond and bond redetermination").</p>
<p class="para numbered">34. The statutory context and structure also make clear that &sect; 1226 applies to individuals who have not been admitted and entered without inspection. In 2025, Congress added new mandatory detention grounds to &sect; 1226(c) that apply only to noncitizens who have not been admitted. By specifically referencing inadmissibility for entry without inspection under 8 U.S.C. &sect; 1182(6)(A), Congress made clear that such individuals are otherwise covered by &sect; 1226(a). Thus, &sect; 1226 plainly applies to noncitizens charged as inadmissible, including those present without admission or parole.</p>
<p class="para numbered">35. The Supreme Court has explained that &sect; 1225(b) is concerned "primarily [with those] seeking entry," and is generally imposed "at the Nation's borders and ports of entry, where the Government must determine whether [a noncitizen] seeking to enter the country is admissible." Jennings v. Rodriguez, 583 U.S. 281, 297, 298 (2018). In contrast, Section 1226 "authorizes the Government to detain certain aliens already in the country pending the outcome of removal proceedings." Id. at 289 (emphases added).</p>
<p class="para numbered">36. Furthermore, &sect; 1225(b)(2) specifically applies only to those "seeking admission." Similarly, the implementing regulations at 8 C.F.R. &sect; 1.2 addresses noncitizens who are "coming or attempting to come into the United States." The use of the present progressive tense would exclude noncitizens like Petitioner who are apprehended in the interior years after they entered, as they are no longer "seeking admission" or "coming [...] into the United States." See Martinez v. Hyde, 2025 WL 2084238 at *6 (D. Mass. July 24, 2025); see also Al Otro Lado v. McAleenan, 394 F. Supp. 3d 1168, 1200 (S.D. Cal. 2019).</p>
<p class="para numbered">37. Accordingly, the mandatory detention provision of &sect; 1225(b)(2) does not apply to Petitioner, who entered the U.S. years before he was apprehended.</p>
<h2 class="section">STATEMENT OF FACTS</h2>
<p class="para numbered">38. Petitioner is a citizen of {{PETITIONER_COUNTRY}}.</p>
<p class="para numbered">39. On information and belief, Petitioner entered the U.S. {{PETITIONER_ENTRY_METHOD}} in {{PETITIONER_ENTRY_DATE}}, and he has resided in the U.S. since then.</p>
<p class="para numbered">40. On information and belief, Petitioner {{PETITIONER_CRIMINAL_HISTORY}}.</p>
<p class="para numbered">41. On information and belief, Petitioner was arrested by immigration authorities in {{PETITIONER_APPREHENSION_LOCATION}} on {{PETITIONER_APPREHENSION_DATE}}.</p>
<p class="para numbered">42. He is now detained at the {{DETENTION_FACILITY_NAME}}.</p>
<p class="para numbered">43. Without relief from this Court, he faces the prospect of continued detention without any access to a bond hearing.</p>
<h2 class="section">COUNT I</h2>
<p class="para">Violation of 8 U.S.C. &sect; 1226(a) Unlawful Denial of Release on Bond</p>
<p class="para numbered">44. Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="para numbered">45. Petitioner may be detained, if at all, pursuant to 8 U.S.C. &sect; 1226(a).</p>
<p class="para numbered">46. Under &sect; 1226(a) and its associated regulations, Petitioner is entitled to a bond hearing. See 8 C.F.R. 236.1(d) &amp; 1003.19(a)-(f).</p>
<p class="para numbered">47. Petitioner has not been, and will not be, provided with a bond hearing as required by law.</p>
<p class="para numbered">48. Petitioner's continuing detention is therefore unlawful.</p>
<h2 class="section">COUNT II</h2>
<p class="para">Violation of the Bond Regulations, 8 C.F.R. &sect;&sect; 236.1, 1236.1 and 1003.19 Unlawful Denial of Release on Bond</p>
<p class="para numbered">49. Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="para numbered">50. In 1997, after Congress amended the INA through IIRIRA, EOIR and the then-Immigration and Naturalization Service issued an interim rule to interpret and apply IIRIRA. Specifically, under the heading of "Apprehension, Custody, and Detention of [Noncitizens]," the agencies explained that "[d]espite being applicants for admission, [noncitizens] who are present without having been admitted or paroled (formerly referred to as [noncitizens] who entered without inspection) will be eligible for bond and bond redetermination." 62 Fed. Reg. at 10323.</p>
<p class="para numbered">51. The application of &sect; 1225(b)(2) to Petitioner unlawfully mandates his continued detention and violates 8 C.F.R. &sect;&sect; 236.1, 1236.1, and 1003.19.</p>
<h2 class="section">COUNT III</h2>
<p class="para">Violation of Fifth Amendment Right to Due Process</p>
<p class="para numbered">52. Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="para numbered">53. The Fifth Amendment's Due Process Clause prohibits the federal government from depriving any person of "life, liberty, or property, without due process of law." U.S. Const. Amend. V.</p>
<p class="para numbered">54. The Supreme Court has repeatedly emphasized that the Constitution generally requires a hearing before the government deprives a person of liberty or property. Zinermon v. Burch, 494 U.S. 113, 127 (1990).</p>
<p class="para numbered">55. Under the Mathews v. Eldridge framework, the balance of interests strongly favors Petitioner's release.</p>
<p class="para numbered">56. Petitioner's private interest in freedom from detention is profound. The interest in being free from physical detention is "the most elemental of liberty interests." Hamdi v. Rumsfeld, 542 U.S. 507, 529 (2004); see also Zadvydas v. Davis, 533 U.S. 678, 690 (2001).</p>
<p class="para numbered">57. The risk of erroneous deprivation is exceptionally high. Petitioner {{PETITIONER_CRIMINAL_HISTORY}} and {{PETITIONER_COMMUNITY_TIES}}.</p>
<p class="para numbered">58. The government's interest in detaining Petitioner without due process is minimal. Immigration detention is civil, not punitive. See Zadvydas, 533 U.S. at 690.</p>
<p class="para numbered">59. Furthermore, the "fiscal and administrative burdens" of providing Petitioner with a bond hearing are minimal. See Mathews, 424 U.S. at 334&ndash;35.</p>
<p class="para numbered">60. Considering these factors, Petitioner respectfully requests that this Court order his immediate release from custody or provide him with a bond hearing.</p>
<h2 class="section">PRAYER FOR RELIEF</h2>
<p class="para">WHEREFORE, Petitioner prays that this Court will: (1) Assume jurisdiction over this matter; (2) Set this matter for expedited consideration; (3) Order that Petitioner not be transferred outside of this District; (4) Issue an Order to Show Cause ordering Respondents to show cause why this Petition should not be granted within three days; (5) Declare that Petitioner's detention is unlawful; (6) Issue a Writ of Habeas Corpus ordering Respondents to release Petitioner from custody or provide him with a bond hearing pursuant to 8 U.S.C. &sect; 1226(a) or the Due Process Clause within seven days; (7) Award Petitioner attorney's fees and costs under the Equal Access to Justice Act, and on any other basis justified under law; and (8) Grant any further relief this Court deems just and proper. Date: {{FILING_DATE}} Respectfully Submitted, /s/ {{ATTORNEY1_NAME}}</p>
<p class="para">{{ATTORNEY1_NAME}}<br>{{ATTORNEY1_BAR_NO}}<br>{{ATTORNEY1_FIRM}}<br>{{ATTORNEY1_ADDRESS}}<br>{{ATTORNEY1_CITY_STATE_ZIP}}<br>{{ATTORNEY1_PHONE}} (phone) {{ATTORNEY1_FAX}} (fax)<br>{{ATTORNEY1_EMAIL}}</p>
<p class="para">/s/ {{ATTORNEY2_NAME}}<br>{{ATTORNEY2_NAME}}<br>{{ATTORNEY2_BAR_NO}}*<br>{{ATTORNEY2_FIRM}}<br>{{ATTORNEY2_ADDRESS}}<br>{{ATTORNEY2_CITY_STATE_ZIP}}<br>{{ATTORNEY2_PHONE}} (phone)<br>{{ATTORNEY2_EMAIL}}<br>{{ATTORNEY2_PRO_HAC}}</p>
<p class="para">Attorneys for Petitioner</p>
<h2 class="section">VERIFICATION PURSUANT TO 28 U.S.C. &sect; 2242</h2>
<p class="para">I represent Petitioner, {{PETITIONER_FULL_NAME}}, and submit this verification on his behalf. I hereby verify that the factual statements made in the foregoing Petition for Writ of Habeas Corpus are true and correct to the best of my knowledge. Dated this {{FILING_DAY}} day of {{FILING_MONTH_YEAR}}. /s/ {{ATTORNEY2_NAME}}</p>
<p class="para">{{ATTORNEY2_NAME}}<br>Attorney for Petitioner Appearing Pro Hac Vice</p>
</section>
</body>
</html>`;

function extractVariables(template) {
  const matches = template.match(/\{\{([A-Z0-9_]+)\}\}/g) || [];
  const seen = new Set();
  return matches
    .map((m) => m.slice(2, -2))
    .filter((v) => {
      if (seen.has(v)) return false;
      seen.add(v);
      return true;
    });
}

function groupVariables(vars) {
  const groups = {
    "Court & Case": [],
    Petitioner: [],
    "Detention & Custody": [],
    Respondents: [],
    "Attorney 1": [],
    "Attorney 2": [],
    "Filing Details": [],
  };
  for (const v of vars) {
    if (v.startsWith("COURT_") || v === "CASE_NUMBER") groups["Court & Case"].push(v);
    else if (v.startsWith("PETITIONER_")) groups["Petitioner"].push(v);
    else if (v.startsWith("DETENTION_") || v.startsWith("FIELD_OFFICE"))
      groups["Detention & Custody"].push(v);
    else if (
      v.startsWith("WARDEN") ||
      v.startsWith("ICE_") ||
      v.startsWith("DHS_") ||
      v.startsWith("ATTORNEY_GENERAL")
    )
      groups["Respondents"].push(v);
    else if (v.startsWith("ATTORNEY1_")) groups["Attorney 1"].push(v);
    else if (v.startsWith("ATTORNEY2_")) groups["Attorney 2"].push(v);
    else if (v.startsWith("FILING_")) groups["Filing Details"].push(v);
    else groups["Court & Case"].push(v);
  }
  return Object.entries(groups).filter(([, v]) => v.length > 0);
}

function humanize(varName) {
  return varName
    .replace(
      /^(PETITIONER_|DETENTION_|FIELD_OFFICE_|COURT_|ATTORNEY1_|ATTORNEY2_|ICE_|DHS_|FILING_)/,
      ""
    )
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ALL_VARS = extractVariables(TEMPLATE);
const GROUPS = groupVariables(ALL_VARS);

export default function HabeasEditor() {
  const [values, setValues] = useState(() => {
    const init = {};
    ALL_VARS.forEach((v) => (init[v] = ""));
    return init;
  });
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]?.[0] || "");
  const iframeRef = useRef(null);

  const filledCount = useMemo(
    () => Object.values(values).filter((v) => v.trim()).length,
    [values]
  );

  const handleChange = useCallback((varName, val) => {
    setValues((prev) => ({ ...prev, [varName]: val }));
  }, []);

  const renderedHTML = useMemo(() => {
    let html = TEMPLATE;
    for (const [key, val] of Object.entries(values)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      if (val.trim()) {
        html = html.replace(
          regex,
          `<span class="filled">${val.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`
        );
      } else {
        html = html.replace(regex, `<span class="ph">{{${key}}}</span>`);
      }
    }
    return html;
  }, [values]);

  const exportHTML = useCallback(() => {
    let html = TEMPLATE;
    for (const [key, val] of Object.entries(values)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      html = html.replace(regex, val.trim() || `{{${key}}}`);
    }
    html = html.replace(/ class="ph"/g, "").replace(/ class="filled"/g, "");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habeas_petition.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [values]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(values, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "petition_variables.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [values]);

  const importJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          setValues((prev) => {
            const next = { ...prev };
            for (const key of ALL_VARS) {
              if (data[key] !== undefined) next[key] = data[key];
            }
            return next;
          });
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const clearAll = useCallback(() => {
    setValues(() => {
      const init = {};
      ALL_VARS.forEach((v) => (init[v] = ""));
      return init;
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        fontFamily: "'Source Serif 4', Georgia, serif",
        background: "#f5f3ef",
        color: "#1a1a1a",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@300;400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          background: "#1c2636",
          color: "#e8e4dc",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "3px solid #8b6914",
          fontFamily: "'DM Sans', sans-serif",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 4,
              background: "linear-gradient(135deg, #8b6914, #c4972a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
              color: "#1c2636",
              flexShrink: 0,
            }}
          >
            §
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.3 }}>
              Habeas Petition Editor
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              {filledCount} / {ALL_VARS.length} fields completed
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={importJSON} style={btnStyle("#3a4a5e", "#e8e4dc")}>
            Import JSON
          </button>
          <button onClick={exportJSON} style={btnStyle("#3a4a5e", "#e8e4dc")}>
            Export JSON
          </button>
          <button onClick={exportHTML} style={btnStyle("#8b6914", "#fff")}>
            Download HTML
          </button>
          <button onClick={clearAll} style={btnStyle("#5a2020", "#e8e4dc")}>
            Clear All
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left: Form */}
        <div
          style={{
            width: "42%",
            minWidth: 320,
            maxWidth: 500,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRight: "1px solid #d4cfc5",
            overflow: "hidden",
          }}
        >
          {/* Group tabs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0,
              borderBottom: "1px solid #d4cfc5",
              background: "#faf8f4",
              padding: "6px 10px 0",
            }}
          >
            {GROUPS.map(([name, vars]) => {
              const filled = vars.filter((v) => values[v]?.trim()).length;
              const active = activeGroup === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveGroup(name)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: active ? 600 : 400,
                    padding: "6px 10px 8px",
                    background: active ? "#fff" : "transparent",
                    color: active ? "#1c2636" : "#6b6560",
                    border: active
                      ? "1px solid #d4cfc5"
                      : "1px solid transparent",
                    borderBottom: active
                      ? "1px solid #fff"
                      : "1px solid transparent",
                    borderRadius: "5px 5px 0 0",
                    cursor: "pointer",
                    marginBottom: -1,
                    position: "relative",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                  <span
                    style={{
                      marginLeft: 4,
                      fontSize: 9,
                      color: filled === vars.length ? "#3a7d44" : "#a09890",
                    }}
                  >
                    {filled}/{vars.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fields */}
          <div style={{ flex: 1, overflow: "auto", padding: "14px 18px" }}>
            {GROUPS.filter(([name]) => name === activeGroup).map(
              ([name, vars]) => (
                <div key={name}>
                  {vars.map((v) => {
                    const isLong =
                      v.includes("HISTORY") ||
                      v.includes("TIES") ||
                      v.includes("METHOD") ||
                      v.includes("ADDRESS") ||
                      v.includes("PRO_HAC");
                    return (
                      <div key={v} style={{ marginBottom: 12 }}>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#6b6560",
                            textTransform: "uppercase",
                            letterSpacing: 0.7,
                            marginBottom: 3,
                          }}
                        >
                          {humanize(v)}
                          {!values[v]?.trim() && (
                            <span
                              style={{
                                color: "#c4972a",
                                marginLeft: 4,
                                fontSize: 8,
                              }}
                            >
                              •
                            </span>
                          )}
                        </label>
                        {isLong ? (
                          <textarea
                            value={values[v]}
                            onChange={(e) => handleChange(v, e.target.value)}
                            rows={3}
                            placeholder={placeholderFor(v)}
                            style={inputStyle(!!values[v]?.trim())}
                          />
                        ) : (
                          <input
                            type="text"
                            value={values[v]}
                            onChange={(e) => handleChange(v, e.target.value)}
                            placeholder={placeholderFor(v)}
                            style={inputStyle(!!values[v]?.trim())}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Progress bar */}
          <div
            style={{
              padding: "8px 18px",
              borderTop: "1px solid #d4cfc5",
              background: "#faf8f4",
            }}
          >
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "#e0dcd4",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(filledCount / ALL_VARS.length) * 100}%`,
                  background:
                    filledCount === ALL_VARS.length
                      ? "linear-gradient(90deg, #3a7d44, #4a9d54)"
                      : "linear-gradient(90deg, #8b6914, #c4972a)",
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "#ddd9d0",
            padding: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "8.5in",
              maxWidth: "100%",
              background: "#fff",
              boxShadow:
                "0 2px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={renderedHTML}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "140vh",
                border: "none",
                display: "block",
              }}
              title="Document Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, fg) {
  return {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    padding: "5px 12px",
    background: bg,
    color: fg,
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
    letterSpacing: 0.2,
  };
}

function inputStyle(filled) {
  return {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 13,
    padding: "7px 9px",
    border: `1.5px solid ${filled ? "#3a7d44" : "#d4cfc5"}`,
    borderRadius: 3,
    background: filled ? "#f7fbf7" : "#fff",
    color: "#1a1a1a",
    outline: "none",
    transition: "border-color 0.2s",
    resize: "vertical",
  };
}

function placeholderFor(v) {
  const hints = {
    COURT_DISTRICT: "e.g., Middle District of Tennessee",
    COURT_DIVISION: "e.g., Nashville Division",
    CASE_NUMBER: "e.g., 3:25-cv-00000",
    PETITIONER_FULL_NAME: "Full legal name",
    PETITIONER_COUNTRY: "e.g., Honduras",
    PETITIONER_YEARS_IN_US: "e.g., 15",
    PETITIONER_ENTRY_DATE: "e.g., approximately 2009",
    PETITIONER_ENTRY_METHOD: "e.g., without inspection",
    PETITIONER_APPREHENSION_LOCATION: "e.g., Nashville, Tennessee",
    PETITIONER_APPREHENSION_DATE: "e.g., January 15, 2026",
    PETITIONER_CRIMINAL_HISTORY: "e.g., has no criminal history",
    PETITIONER_COMMUNITY_TIES: "e.g., has three U.S. citizen children",
    DETENTION_FACILITY_NAME: "e.g., South Louisiana ICE Processing Center",
    DETENTION_FACILITY_CITY: "e.g., Basile",
    DETENTION_FACILITY_STATE: "e.g., Louisiana",
    WARDEN_NAME: "Full name of warden",
    ICE_DIRECTOR: "Full name",
    ICE_DIRECTOR_TITLE: "e.g., Acting Director",
    DHS_SECRETARY: "Full name",
    ATTORNEY_GENERAL: "Full name",
    FIELD_OFFICE_DIRECTOR: "Full name",
    FIELD_OFFICE_NAME: "e.g., New Orleans Field Office",
    FILING_DATE: "e.g., February 19, 2026",
    FILING_DAY: "e.g., 19th",
    FILING_MONTH_YEAR: "e.g., February 2026",
  };
  return hints[v] || `Enter ${humanize(v).toLowerCase()}...`;
}
