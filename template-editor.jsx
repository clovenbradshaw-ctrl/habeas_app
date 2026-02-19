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
  <div class="center court-title">FOR THE <span class="ph">{{COURT_DISTRICT}}</span></div>
  <div class="center court-title"><span class="ph">{{COURT_DIVISION}}</span></div>
  <div class="caption-wrap">
    <table class="caption-table">
      <tr>
        <td class="cap-left">
          <div class="cap-name"><span class="ph">{{PETITIONER_FULL_NAME}}</span>,</div>
          <div class="cap-centerline" style="margin-top:18pt;">Petitioner-Plaintiff,</div>
          <div class="cap-v" style="margin-top:18pt;">v.</div>
          <div class="cap-block" style="margin-top:18pt;">
            <p><span class="ph">{{WARDEN_NAME}}</span>, in his official capacity as Warden of <span class="ph">{{DETENTION_FACILITY_NAME}}</span>;</p>
            <p><span class="ph">{{FIELD_OFFICE_DIRECTOR}}</span>, in his official capacity as Field Office Director of the <span class="ph">{{FIELD_OFFICE_NAME}}</span> of Enforcement and Removal Operations, U.S. Immigration and Customs Enforcement;</p>
            <p>U.S. Department of Homeland Security;</p>
            <p><span class="ph">{{ICE_DIRECTOR}}</span>, in his official capacity as <span class="ph">{{ICE_DIRECTOR_TITLE}}</span>, Immigration and Customs Enforcement, U.S. Department of Homeland Security;</p>
            <p><span class="ph">{{DHS_SECRETARY}}</span>, in her official capacity as Secretary, U.S. Department of Homeland Security; and</p>
            <p><span class="ph">{{ATTORNEY_GENERAL}}</span>, in her official capacity as Attorney General of the United States;</p>
            <p>Respondents-Defendants.</p>
          </div>
        </td>
        <td class="cap-mid"><div style="line-height:1.35;">)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)<br/>)</div></td>
        <td class="cap-right">
          <p class="case-no">C/A No. <span class="ph">{{CASE_NUMBER}}</span></p>
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
<p class="para numbered">1. Petitioner-Plaintiff <span class="ph">{{PETITIONER_FULL_NAME}}</span> ("Petitioner") is a citizen of <span class="ph">{{PETITIONER_COUNTRY}}</span> who has resided in the U.S. for <span class="ph">{{PETITIONER_YEARS_IN_US}}</span> years. On information and belief, Immigration and Customs Enforcement ("ICE") officers apprehended him near his home in <span class="ph">{{PETITIONER_APPREHENSION_LOCATION}}</span>, on or about <span class="ph">{{PETITIONER_APPREHENSION_DATE}}</span>.</p>
<p class="para numbered">2. Petitioner is currently detained at the <span class="ph">{{DETENTION_FACILITY_NAME}}</span> in <span class="ph">{{DETENTION_FACILITY_CITY}}</span>, <span class="ph">{{DETENTION_FACILITY_STATE}}</span>.</p>
<p class="para numbered">3. On September 5, 2025, the Board of Immigration Appeals ("BIA") issued a precedential decision that unlawfully reinterpreted the Immigration and Nationality Act ("INA"). See Matter of Yajure Hurtado, 29 I&amp;N Dec. 216 (BIA 2025). Prior to this decision, noncitizens like Petitioner who had lived in the U.S. for many years and were apprehended by ICE in the interior of the country were detained pursuant to 8 U.S.C. § 1226(a) and eligible to seek bond hearings before Immigration Judges ("IJs"). Instead, in conflict with nearly thirty years of legal precedent, Petitioner is now considered subject to mandatory detention under 8 U.S.C. § 1225(b)(2)(A) and has no opportunity for release on bond while his removal proceedings are pending.</p>
<p class="para numbered">4. Petitioner's detention pursuant to § 1225(b)(2)(A) violates the plain language of the INA and its implementing regulations. Petitioner, who has resided in the U.S. for nearly <span class="ph">{{PETITIONER_YEARS_IN_US}}</span> years and who was apprehended in the interior of the U.S., should not be considered an "applicant for admission" who is "seeking admission." Rather, he should be detained pursuant to 8 U.S.C. § 1226(a), which allows for release on conditional parole or bond.</p>
<p class="para numbered">5. Petitioner seeks declaratory relief that he is subject to detention under § 1226(a) and its implementing regulations and asks that this Court either order Respondents to release Petitioner from custody or provide him with a bond hearing.</p>
<h2 class="section">CUSTODY</h2>
<p class="para numbered">6. Petitioner is currently in the custody of Immigration and Customs Enforcement ("ICE") at the <span class="ph">{{DETENTION_FACILITY_NAME}}</span> in <span class="ph">{{DETENTION_FACILITY_CITY}}</span>, <span class="ph">{{DETENTION_FACILITY_STATE}}</span>. He is therefore in "'custody' of [the DHS] within the meaning of the habeas corpus statute." Jones v. Cunningham, 371 U.S. 236, 243 (1963).</p>
<h2 class="section">JURISDICTION</h2>
<p class="para numbered">7. This court has jurisdiction under 28 U.S.C. § 2241 (habeas corpus), 28 U.S.C. § 1331 (federal question), Article I, § 9, cl. 2 of the United States Constitution (Suspension Clause), and the Immigration and Nationality Act ("INA"), 8 U.S.C. § 1101 et seq.</p>
<p class="para numbered">8. This Court may grant relief under the habeas corpus statutes, 28 U.S.C. § 2241 et seq., the Declaratory Judgment Act, 28 U.S.C. § 2201 et seq., the All Writs Act, 28 U.S.C. § 1651, and the Immigration and Nationality Act, 8 U.S.C. § 1252(e)(2).</p>
<p class="para numbered">9. Federal district courts have jurisdiction to hear habeas claims by non-citizens challenging both the lawfulness and the constitutionality of their detention. See Zadvydas v. Davis, 533 U.S. 678, 687 (2001).</p>
<h2 class="section">REQUIREMENTS OF 28 U.S.C. §§ 2241, 2243</h2>
<p class="para numbered">10. The Court must grant the petition for writ of habeas corpus or issue an order to show cause ("OSC") to Respondents "forthwith," unless Petitioner is not entitled to relief. 28 U.S.C. § 2243. If an OSC is issued, the Court must require Respondents to file a return "within three days unless for good cause additional time, not exceeding twenty days, is allowed." Id.</p>
<p class="para numbered">11. Petitioner is "in custody" for the purpose of § 2241 because Petitioner is arrested and detained by Respondents.</p>
<h2 class="section">VENUE</h2>
<p class="para numbered">12. Venue is properly before this Court pursuant to 28 U.S.C. § 1391(e) because Respondents are employees or officers of the United States acting in their official capacity and because a substantial part of the events or omissions giving rise to the claim occurred in the <span class="ph">{{COURT_DISTRICT}}</span>. Petitioner is under the jurisdiction of ICE's <span class="ph">{{FIELD_OFFICE_NAME}}</span>, and he is currently detained at the <span class="ph">{{DETENTION_FACILITY_NAME}}</span> in <span class="ph">{{DETENTION_FACILITY_CITY}}</span>, <span class="ph">{{DETENTION_FACILITY_STATE}}</span>.</p>
<h2 class="section">EXHAUSTION OF ADMINISTRATIVE REMEDIES</h2>
<p class="para numbered">13. Administrative exhaustion is unnecessary as it would be futile. See, e.g., Aguilar v. Lewis, 50 F. Supp. 2d 539, 542–43 (E.D. Va. 1999).</p>
<p class="para numbered">14. It would be futile for Petitioner to seek a custody redetermination hearing before an IJ due to the BIA's recent decision holding that anyone who has entered the U.S. without inspection is now considered an "applicant for admission" who is "seeking admission" and therefore subject to mandatory detention under § 1225(b)(2)(A). See Matter of Yajure Hurtado, 29 I&amp;N Dec. 216 (BIA 2025); see also Zaragoza Mosqueda v. Noem, 2025 WL 2591530, at *7 (C.D. Cal. Sept. 8, 2025) (noting that BIA's decision in Yajure Hurtado renders exhaustion futile).</p>
<p class="para numbered">15. Additionally, the agency does not have jurisdiction to review Petitioner's claim of unlawful custody in violation of his due process rights, and it would therefore be futile for him to pursue administrative remedies. Reno v. Amer.-Arab Anti-Discrim. Comm., 525 U.S. 471, 119 S.Ct. 936, 142 L.Ed.2d 940 (1999) (finding exhaustion to be a "futile exercise because the agency does not have jurisdiction to review" constitutional claims).</p>
<h2 class="section">PARTIES</h2>
<p class="para numbered">16. Petitioner <span class="ph">{{PETITIONER_FULL_NAME}}</span> is from <span class="ph">{{PETITIONER_COUNTRY}}</span> and has resided in the U.S. since <span class="ph">{{PETITIONER_ENTRY_DATE}}</span>. He is currently detained in the <span class="ph">{{DETENTION_FACILITY_NAME}}</span>.</p>
<p class="para numbered">17. Respondent <span class="ph">{{WARDEN_NAME}}</span> is sued in his official capacity as Warden of the <span class="ph">{{DETENTION_FACILITY_NAME}}</span>. In his official capacity, <span class="ph">{{WARDEN_NAME}}</span> is Petitioner's immediate custodian.</p>
<p class="para numbered">18. Respondent <span class="ph">{{FIELD_OFFICE_DIRECTOR}}</span> is sued in his official capacity as Field Office Director, <span class="ph">{{FIELD_OFFICE_NAME}}</span>, Enforcement and Removal Operations, U.S. Immigration &amp; Customs Enforcement ("ICE"). In his official capacity, Respondent <span class="ph">{{FIELD_OFFICE_DIRECTOR}}</span> is the legal custodian of Petitioner.</p>
<p class="para numbered">19. Respondent <span class="ph">{{ICE_DIRECTOR}}</span> is sued in his official capacity as <span class="ph">{{ICE_DIRECTOR_TITLE}}</span> of ICE. As the <span class="ph">{{ICE_DIRECTOR_TITLE}}</span> of ICE, Respondent <span class="ph">{{ICE_DIRECTOR}}</span> is a legal custodian of Petitioner.</p>
<p class="para numbered">20. Respondent <span class="ph">{{DHS_SECRETARY}}</span> is sued in her official capacity as Secretary of Homeland Security. As the head of the Department of Homeland Security, the agency tasked with enforcing immigration laws, Secretary <span class="ph">{{DHS_SECRETARY}}</span> is Petitioner's ultimate legal custodian.</p>
<p class="para numbered">21. Respondent <span class="ph">{{ATTORNEY_GENERAL}}</span> is sued in her official capacity as the Attorney General of the United States. As Attorney General, she has authority over the Department of Justice and is charged with faithfully administering the immigration laws of the United States.</p>
<h2 class="section">LEGAL BACKGROUND AND ARGUMENT</h2>
<p class="para numbered">22. The INA prescribes three basic forms of detention for noncitizens in removal proceedings.</p>
<p class="para numbered">23. First, individuals detained pursuant to 8 U.S.C. § 1226(a) are generally entitled to a bond hearing, unless they have been arrested, charged with, or convicted of certain crimes and are subject to mandatory detention. See 8 U.S.C. §§ 1226(a), 1226(c) (listing grounds for mandatory detention); see also 8 C.F.R. §§ 1003.19(a) (immigration judges may review custody determinations made by DHS), 1236.1(d) (same).</p>
<p class="para numbered">24. Second, the INA provides for mandatory detention of noncitizens subject to expedited removal under 8 U.S.C. § 1225(b)(1) as well as other recent arrivals deemed to be "seeking admission" under § 1225(b)(2).</p>
<p class="para numbered">25. Third, the INA authorizes detention of noncitizens who have received a final order of removal, including those in withholding-only proceedings. See 8 U.S.C. § 1231(a)–(b).</p>
<p class="para numbered">26. Thus, in the decades that followed, most people who entered without inspection and were thereafter detained and placed in standard removal proceedings were considered for release on bond and received bond hearings before an IJ, unless their criminal history rendered them ineligible.</p>
<p class="para numbered">27. For decades, long-term residents of the U.S. who entered without inspection and were subsequently apprehended by ICE in the interior of the country have been detained pursuant to § 1226 and entitled to bond hearings before an IJ, unless barred from doing so due to their criminal history.</p>
<p class="para numbered">28. In July 2025, however, ICE began asserting that all individuals who entered without inspection should be considered "seeking admission" and therefore subject to mandatory detention under 8 U.S.C. § 1225(b)(2)(A).</p>
<p class="para numbered">29. On September 5, 2025, the BIA issued a precedential decision adopting this interpretation, despite its departure from the INA's text, federal precedent, and existing regulations. Matter of Yajure Hurtado, 29 I&amp;N Dec. 216 (BIA 2025).</p>
<p class="para numbered">30. Respondents' new legal interpretation is contrary to the statutory framework and its implementing regulations.</p>
<p class="para numbered">31. Courts across the country, including this Court, have rejected this interpretation and instead have consistently found that § 1226, not § 1225(b)(2), authorizes detention of noncitizens who entered without inspection and were later apprehended in the interior of the country. See, e.g., Hasan v. Crawford, No. 1:25-CV-1408 (LMB/IDD), 2025 WL 2682255 (E.D. Va. Sept. 19, 2025); Quispe Ardiles v. Noem, No. 1:25-cv-01382 (E.D. Va. Sept. 30, 2025); Venancio v. Hyde et al, No. 1:25-cv-12616 (D. Mass. Oct. 9, 2025); Artiga v. Genalo, No. 2:25-cv-05208 (E.D.N.Y. Oct. 7, 2025); Sampiao v. Hyde, 2025 WL 2607924 (D. Mass. Sept. 9, 2025); Leal-Hernandez v. Noem, 2025 WL 2430025 (D. Md. Aug. 24, 2025); Lopez Benitez v. Francis, 2025 WL 2371588 (S.D.N.Y. Aug. 13, 2025); Jimenez v. FCI Berlin, Warden, No. 25-cv-326-LM-AJ (D.N.H. Sept. 8, 2025); Kostak v. Trump, 2025 WL 2472136 (W.D. La. Aug. 27, 2025); Cuevas Guzman v. Andrews, 2025 WL 2617256, at *3 n.4 (E.D. Cal. Sept. 9, 2025).</p>
<p class="para numbered">32. Under the Supreme Court's recent decision in Loper Bright v. Raimondo, this Court should independently interpret the statute and give the BIA's expansive interpretation of § 1225(b)(2) no weight, as it conflicts with the statute, regulations, and precedent. 603 U.S. 369 (2024).</p>
<p class="para numbered">33. The detention provisions at § 1226(a) and § 1225(b)(2) were enacted as part of the Illegal Immigration Reform and Immigrant Responsibility Act ("IIRIRA") of 1996, Pub. L. No. 104-208, Div. C, §§ 302–03, 110 Stat. 3009-546, 3009–582 to 3009–583, 3009–585. Following IIRIRA, the Executive Office for Immigration Review ("EOIR") issued regulations clarifying that individuals who entered the country without inspection were not considered detained under § 1225, but rather under § 1226(a). See Inspection and Expedited Removal of Aliens; Detention and Removal of Aliens; Conduct of Removal Proceedings; Asylum Procedures, 62 Fed. Reg. 10312, 10323 (Mar. 6, 1997) ("Despite being applicants for admission, aliens who are present without having been admitted or paroled (formerly referred to as aliens who entered without inspection) will be eligible for bond and bond redetermination").</p>
<p class="para numbered">34. The statutory context and structure also make clear that § 1226 applies to individuals who have not been admitted and entered without inspection. In 2025, Congress added new mandatory detention grounds to § 1226(c) that apply only to noncitizens who have not been admitted. By specifically referencing inadmissibility for entry without inspection under 8 U.S.C. § 1182(6)(A), Congress made clear that such individuals are otherwise covered by § 1226(a). Thus, § 1226 plainly applies to noncitizens charged as inadmissible, including those present without admission or parole.</p>
<p class="para numbered">35. The Supreme Court has explained that § 1225(b) is concerned "primarily [with those] seeking entry," and is generally imposed "at the Nation's borders and ports of entry, where the Government must determine whether [a noncitizen] seeking to enter the country is admissible." Jennings v. Rodriguez, 583 U.S. 281, 297, 298 (2018). In contrast, Section 1226 "authorizes the Government to detain certain aliens already in the country pending the outcome of removal proceedings." Id. at 289 (emphases added).</p>
<p class="para numbered">36. Furthermore, § 1225(b)(2) specifically applies only to those "seeking admission." Similarly, the implementing regulations at 8 C.F.R. § 1.2 addresses noncitizens who are "coming or attempting to come into the United States." The use of the present progressive tense would exclude noncitizens like Petitioner who are apprehended in the interior years after they entered, as they are no longer "seeking admission" or "coming [...] into the United States." See Martinez v. Hyde, 2025 WL 2084238 at *6 (D. Mass. July 24, 2025); see also Al Otro Lado v. McAleenan, 394 F. Supp. 3d 1168, 1200 (S.D. Cal. 2019).</p>
<p class="para numbered">37. Accordingly, the mandatory detention provision of § 1225(b)(2) does not apply to Petitioner, who entered the U.S. years before he was apprehended.</p>
<h2 class="section">STATEMENT OF FACTS</h2>
<p class="para numbered">38. Petitioner is a citizen of <span class="ph">{{PETITIONER_COUNTRY}}</span>.</p>
<p class="para numbered">39. On information and belief, Petitioner entered the U.S. <span class="ph">{{PETITIONER_ENTRY_METHOD}}</span> in <span class="ph">{{PETITIONER_ENTRY_DATE}}</span>, and he has resided in the U.S. since then.</p>
<p class="para numbered">40. On information and belief, Petitioner <span class="ph">{{PETITIONER_CRIMINAL_HISTORY}}</span>.</p>
<p class="para numbered">41. On information and belief, Petitioner was arrested by immigration authorities in <span class="ph">{{PETITIONER_APPREHENSION_LOCATION}}</span> on <span class="ph">{{PETITIONER_APPREHENSION_DATE}}</span>.</p>
<p class="para numbered">42. He is now detained at the <span class="ph">{{DETENTION_FACILITY_NAME}}</span>.</p>
<p class="para numbered">43. Without relief from this Court, he faces the prospect of continued detention without any access to a bond hearing.</p>
<h2 class="section">COUNT I</h2>
<p class="para">Violation of 8 U.S.C. § 1226(a) — Unlawful Denial of Release on Bond</p>
<p class="para numbered">44. Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="para numbered">45. Petitioner may be detained, if at all, pursuant to 8 U.S.C. § 1226(a).</p>
<p class="para numbered">46. Under § 1226(a) and its associated regulations, Petitioner is entitled to a bond hearing. See 8 C.F.R. 236.1(d) &amp; 1003.19(a)-(f).</p>
<p class="para numbered">47. Petitioner has not been, and will not be, provided with a bond hearing as required by law.</p>
<p class="para numbered">48. Petitioner's continuing detention is therefore unlawful.</p>
<h2 class="section">COUNT II</h2>
<p class="para">Violation of the Bond Regulations, 8 C.F.R. §§ 236.1, 1236.1 and 1003.19 — Unlawful Denial of Release on Bond</p>
<p class="para numbered">49. Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="para numbered">50. In 1997, after Congress amended the INA through IIRIRA, EOIR and the then-Immigration and Naturalization Service issued an interim rule to interpret and apply IIRIRA. Specifically, under the heading of "Apprehension, Custody, and Detention of [Noncitizens]," the agencies explained that "[d]espite being applicants for admission, [noncitizens] who are present without having been admitted or paroled (formerly referred to as [noncitizens] who entered without inspection) will be eligible for bond and bond redetermination." 62 Fed. Reg. at 10323.</p>
<p class="para numbered">51. The application of § 1225(b)(2) to Petitioner unlawfully mandates his continued detention and violates 8 C.F.R. §§ 236.1, 1236.1, and 1003.19.</p>
<h2 class="section">COUNT III</h2>
<p class="para">Violation of Fifth Amendment Right to Due Process</p>
<p class="para numbered">52. Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="para numbered">53. The Fifth Amendment's Due Process Clause prohibits the federal government from depriving any person of "life, liberty, or property, without due process of law." U.S. Const. Amend. V.</p>
<p class="para numbered">54. The Supreme Court has repeatedly emphasized that the Constitution generally requires a hearing before the government deprives a person of liberty or property. Zinermon v. Burch, 494 U.S. 113, 127 (1990).</p>
<p class="para numbered">55. Under the Mathews v. Eldridge framework, the balance of interests strongly favors Petitioner's release.</p>
<p class="para numbered">56. Petitioner's private interest in freedom from detention is profound. The interest in being free from physical detention is "the most elemental of liberty interests." Hamdi v. Rumsfeld, 542 U.S. 507, 529 (2004); see also Zadvydas v. Davis, 533 U.S. 678, 690 (2001).</p>
<p class="para numbered">57. The risk of erroneous deprivation is exceptionally high. Petitioner <span class="ph">{{PETITIONER_CRIMINAL_HISTORY}}</span> and <span class="ph">{{PETITIONER_COMMUNITY_TIES}}</span>.</p>
<p class="para numbered">58. The government's interest in detaining Petitioner without due process is minimal. Immigration detention is civil, not punitive, and may only be used to prevent danger to the community or ensure appearance at immigration proceedings. See Zadvydas, 533 U.S. at 690.</p>
<p class="para numbered">59. Furthermore, the "fiscal and administrative burdens" of providing Petitioner with a bond hearing are minimal, particularly when weighed against the significant liberty interests at stake. See Mathews, 424 U.S. at 334–35.</p>
<p class="para numbered">60. Considering these factors, Petitioner respectfully requests that this Court order his immediate release from custody or provide him with a bond hearing.</p>
<h2 class="section">PRAYER FOR RELIEF</h2>
<p class="para">WHEREFORE, Petitioner prays that this Court will: (1) Assume jurisdiction over this matter; (2) Set this matter for expedited consideration; (3) Order that Petitioner not be transferred outside of this District; (4) Issue an Order to Show Cause ordering Respondents to show cause why this Petition should not be granted within three days; (5) Declare that Petitioner's detention is unlawful; (6) Issue a Writ of Habeas Corpus ordering Respondents to release Petitioner from custody or provide him with a bond hearing pursuant to 8 U.S.C. § 1226(a) or the Due Process Clause within seven days; (7) Award Petitioner attorney's fees and costs under the Equal Access to Justice Act, and on any other basis justified under law; and (8) Grant any further relief this Court deems just and proper.</p>
<p class="para">Date: <span class="ph">{{FILING_DATE}}</span></p>
<p class="para">Respectfully Submitted,</p>
<p class="para">/s/ <span class="ph">{{ATTORNEY1_NAME}}</span><br/><span class="ph">{{ATTORNEY1_BAR_NO}}</span><br/><span class="ph">{{ATTORNEY1_FIRM}}</span><br/><span class="ph">{{ATTORNEY1_ADDRESS}}</span><br/><span class="ph">{{ATTORNEY1_CITY_STATE_ZIP}}</span><br/><span class="ph">{{ATTORNEY1_PHONE}}</span> (phone) <span class="ph">{{ATTORNEY1_FAX}}</span> (fax)<br/><span class="ph">{{ATTORNEY1_EMAIL}}</span></p>
<p class="para">/s/ <span class="ph">{{ATTORNEY2_NAME}}</span><br/><span class="ph">{{ATTORNEY2_BAR_NO}}</span>*<br/><span class="ph">{{ATTORNEY2_FIRM}}</span><br/><span class="ph">{{ATTORNEY2_ADDRESS}}</span><br/><span class="ph">{{ATTORNEY2_CITY_STATE_ZIP}}</span><br/><span class="ph">{{ATTORNEY2_PHONE}}</span> (phone)<br/><span class="ph">{{ATTORNEY2_EMAIL}}</span><br/><span class="ph">{{ATTORNEY2_PRO_HAC}}</span></p>
<p class="para">Attorneys for Petitioner</p>
<h2 class="section">VERIFICATION PURSUANT TO 28 U.S.C. § 2242</h2>
<p class="para">I represent Petitioner, <span class="ph">{{PETITIONER_FULL_NAME}}</span>, and submit this verification on his behalf. I hereby verify that the factual statements made in the foregoing Petition for Writ of Habeas Corpus are true and correct to the best of my knowledge.</p>
<p class="para">Dated this <span class="ph">{{FILING_DAY}}</span> day of <span class="ph">{{FILING_MONTH_YEAR}}</span>.</p>
<p class="para">/s/ <span class="ph">{{ATTORNEY2_NAME}}</span><br/><span class="ph">{{ATTORNEY2_NAME}}</span><br/>Attorney for Petitioner Appearing Pro Hac Vice</p>
</section>
</body>
</html>`;

// Extract unique variables
function extractVars(template) {
  const matches = template.match(/\{\{([A-Z0-9_]+)\}\}/g) || [];
  const seen = new Set();
  return matches
    .map((m) => m.replace(/\{\{|\}\}/g, ""))
    .filter((v) => {
      if (seen.has(v)) return false;
      seen.add(v);
      return true;
    });
}

// Group variables by category
function groupVars(vars) {
  const groups = {
    "Court & Case": [],
    Petitioner: [],
    "Detention & Custody": [],
    "Government Officials": [],
    "Attorney 1": [],
    "Attorney 2": [],
    "Filing Details": [],
  };
  vars.forEach((v) => {
    if (v.startsWith("COURT_") || v === "CASE_NUMBER") groups["Court & Case"].push(v);
    else if (v.startsWith("PETITIONER_")) groups["Petitioner"].push(v);
    else if (v.startsWith("DETENTION_") || v.startsWith("FIELD_OFFICE")) groups["Detention & Custody"].push(v);
    else if (["WARDEN_NAME", "ICE_DIRECTOR", "ICE_DIRECTOR_TITLE", "DHS_SECRETARY", "ATTORNEY_GENERAL"].includes(v)) groups["Government Officials"].push(v);
    else if (v.startsWith("ATTORNEY1_")) groups["Attorney 1"].push(v);
    else if (v.startsWith("ATTORNEY2_")) groups["Attorney 2"].push(v);
    else if (v.startsWith("FILING_")) groups["Filing Details"].push(v);
    else groups["Court & Case"].push(v);
  });
  return Object.entries(groups).filter(([, vars]) => vars.length > 0);
}

function humanize(key) {
  return key
    .replace(/^(PETITIONER_|ATTORNEY[12]_|DETENTION_|FIELD_OFFICE_|COURT_|ICE_|DHS_|FILING_)/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ALL_VARS = extractVars(TEMPLATE);
const GROUPED = groupVars(ALL_VARS);

export default function HabeasEditor() {
  const [values, setValues] = useState(() => {
    const init = {};
    ALL_VARS.forEach((v) => (init[v] = ""));
    return init;
  });
  const [activeGroup, setActiveGroup] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef(null);

  const filledCount = useMemo(() => ALL_VARS.filter((v) => values[v].trim()).length, [values]);

  const rendered = useMemo(() => {
    let html = TEMPLATE;
    ALL_VARS.forEach((v) => {
      const val = values[v].trim();
      const regex = new RegExp(`\\{\\{${v}\\}\\}`, "g");
      if (val) {
        html = html.replace(regex, val);
      } else {
        html = html.replace(regex, `<span style="background:#fff3cd;color:#856404;padding:1px 4px;border-radius:2px;font-weight:700;">[${humanize(v)}]</span>`);
      }
    });
    // Remove the .ph red styling for filled values
    html = html.replace(/class="ph"/g, "");
    return html;
  }, [values]);

  const handleChange = useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([rendered], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habeas-petition.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [rendered]);

  const handleClear = useCallback(() => {
    const cleared = {};
    ALL_VARS.forEach((v) => (cleared[v] = ""));
    setValues(cleared);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Source Serif 4', 'Georgia', serif", background: "#f7f5f0", color: "#1a1a1a" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#1c2536", color: "#e8e4dc", borderBottom: "3px solid #8b6914", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.5px" }}>
            &#9878; Habeas Petition Builder
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>
            {filledCount}/{ALL_VARS.length} fields
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{ padding: "6px 16px", border: "1px solid #8b6914", borderRadius: 4, background: showPreview ? "#8b6914" : "transparent", color: showPreview ? "#fff" : "#8b6914", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s" }}
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleExport}
            style={{ padding: "6px 16px", border: "1px solid #4a7c59", borderRadius: 4, background: "#4a7c59", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
          >
            Export HTML
          </button>
          <button
            onClick={handleClear}
            style={{ padding: "6px 16px", border: "1px solid #666", borderRadius: 4, background: "transparent", color: "#999", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#ddd", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(filledCount / ALL_VARS.length) * 100}%`, background: "linear-gradient(90deg, #8b6914, #c9a227)", transition: "width 0.3s" }} />
      </div>

      {showPreview ? (
        <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", justifyContent: "center" }}>
          <iframe
            ref={iframeRef}
            srcDoc={rendered}
            style={{ width: "8.5in", minHeight: "11in", height: "100%", border: "1px solid #ccc", background: "#fff", boxShadow: "0 2px 20px rgba(0,0,0,0.1)" }}
            title="preview"
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Group nav */}
          <div style={{ width: 200, background: "#ece8df", borderRight: "1px solid #d5cfc3", padding: "12px 0", overflowY: "auto", flexShrink: 0 }}>
            {GROUPED.map(([name, vars], i) => {
              const filled = vars.filter((v) => values[v].trim()).length;
              const isActive = i === activeGroup;
              return (
                <button
                  key={name}
                  onClick={() => setActiveGroup(i)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 16px", border: "none",
                    background: isActive ? "#fff" : "transparent",
                    borderLeft: isActive ? "3px solid #8b6914" : "3px solid transparent",
                    cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: isActive ? "#1a1a1a" : "#666", fontWeight: isActive ? 600 : 400, textAlign: "left", transition: "all 0.1s",
                  }}
                >
                  <span>{name}</span>
                  <span style={{ fontSize: 11, opacity: 0.6, background: filled === vars.length ? "#4a7c59" : "#ccc", color: filled === vars.length ? "#fff" : "#666", padding: "1px 6px", borderRadius: 8 }}>
                    {filled}/{vars.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form fields */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 700, color: "#1c2536" }}>
              {GROUPED[activeGroup][0]}
            </h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "#888" }}>
              Fill in the fields below. All instances in the document will update.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
              {GROUPED[activeGroup][1].map((v) => (
                <div key={v}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                    {humanize(v)}
                  </label>
                  <input
                    type="text"
                    value={values[v]}
                    onChange={(e) => handleChange(v, e.target.value)}
                    placeholder={`{{${v}}}`}
                    style={{
                      width: "100%", padding: "8px 12px", border: values[v].trim() ? "1.5px solid #4a7c59" : "1.5px solid #ccc",
                      borderRadius: 4, fontSize: 14, fontFamily: "inherit", background: "#fff", boxSizing: "border-box",
                      outline: "none", transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#8b6914")}
                    onBlur={(e) => (e.target.style.borderColor = values[v].trim() ? "#4a7c59" : "#ccc")}
                  />
                </div>
              ))}
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 16, borderTop: "1px solid #ddd" }}>
              <button
                onClick={() => setActiveGroup(Math.max(0, activeGroup - 1))}
                disabled={activeGroup === 0}
                style={{ padding: "8px 20px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: activeGroup === 0 ? "default" : "pointer", opacity: activeGroup === 0 ? 0.4 : 1, fontFamily: "inherit", fontSize: 13 }}
              >
                &larr; Previous
              </button>
              <button
                onClick={() => setActiveGroup(Math.min(GROUPED.length - 1, activeGroup + 1))}
                disabled={activeGroup === GROUPED.length - 1}
                style={{ padding: "8px 20px", border: "1px solid #8b6914", borderRadius: 4, background: "#8b6914", color: "#fff", cursor: activeGroup === GROUPED.length - 1 ? "default" : "pointer", opacity: activeGroup === GROUPED.length - 1 ? 0.4 : 1, fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}