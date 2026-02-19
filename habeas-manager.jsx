import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── DATA HELPERS ───
const uid = () => Math.random().toString(36).slice(2, 10);

const EMPTY_FACILITY = { id: "", name: "", city: "", state: "", warden: "" };
const EMPTY_ATTORNEY = { id: "", name: "", bar_no: "", firm: "", address: "", city_state_zip: "", phone: "", fax: "", email: "", pro_hac: "", role: "local" };
const EMPTY_OFFICIALS = { dhs_secretary: "", attorney_general: "", ice_director: "", ice_director_title: "", field_office_director: "", field_office_name: "" };
const EMPTY_CLIENT = {
  id: "", full_name: "", country: "", years_in_us: "", entry_date: "", entry_method: "without inspection",
  apprehension_location: "", apprehension_date: "", criminal_history: "", community_ties: "",
  facility_id: "", attorney1_id: "", attorney2_id: "",
  court_district: "", court_division: "", case_number: "",
  filing_date: "", filing_day: "", filing_month_year: "",
  field_office_director: "", field_office_name: "",
};

const STORAGE_KEY = "habeas-data-v2";

function loadData() {
  return { facilities: [], attorneys: [], clients: [], officials: { ...EMPTY_OFFICIALS } };
}

// ─── DOCUMENT TEMPLATE ───
function buildDocHTML(vars) {
  const v = (key) => {
    const val = vars[key];
    if (val && val.trim()) return `<span class="filled">${val}</span>`;
    return `<span class="unfilled">{{${key}}}</span>`;
  };

  return `<div class="doc-body">
<div class="ct">UNITED STATES DISTRICT COURT</div>
<div class="ct">FOR THE ${v("COURT_DISTRICT")}</div>
<div class="ct">${v("COURT_DIVISION")}</div>
<table class="cap"><tr>
<td class="cap-l">
<div class="cap-n">${v("PETITIONER_FULL_NAME")},</div>
<div class="cap-c">Petitioner-Plaintiff,</div>
<div class="cap-c" style="margin-top:12px">v.</div>
<div class="cap-b">
<p>${v("WARDEN_NAME")}, in his official capacity as Warden of ${v("DETENTION_FACILITY_NAME")};</p>
<p>${v("FIELD_OFFICE_DIRECTOR")}, in his official capacity as Field Office Director of the ${v("FIELD_OFFICE_NAME")} of Enforcement and Removal Operations, U.S. Immigration and Customs Enforcement;</p>
<p>U.S. Department of Homeland Security;</p>
<p>${v("ICE_DIRECTOR")}, in his official capacity as ${v("ICE_DIRECTOR_TITLE")}, Immigration and Customs Enforcement, U.S. Department of Homeland Security;</p>
<p>${v("DHS_SECRETARY")}, in her official capacity as Secretary, U.S. Department of Homeland Security; and</p>
<p>${v("ATTORNEY_GENERAL")}, in her official capacity as Attorney General of the United States;</p>
<p style="margin-top:6px">Respondents-Defendants.</p>
</div>
</td>
<td class="cap-m">)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)<br>)</td>
<td class="cap-r">
<p class="cn">C/A No. ${v("CASE_NUMBER")}</p>
<p class="tb">PETITION FOR WRIT OF HABEAS CORPUS AND COMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF</p>
</td>
</tr></table>

<h2>INTRODUCTION</h2>
<p class="p">1.&emsp;Petitioner-Plaintiff ${v("PETITIONER_FULL_NAME")} (\u201cPetitioner\u201d) is a citizen of ${v("PETITIONER_COUNTRY")} who has resided in the U.S. for ${v("PETITIONER_YEARS_IN_US")} years. On information and belief, Immigration and Customs Enforcement (\u201cICE\u201d) officers apprehended him near his home in ${v("PETITIONER_APPREHENSION_LOCATION")}, on or about ${v("PETITIONER_APPREHENSION_DATE")}.</p>
<p class="p">2.&emsp;Petitioner is currently detained at the ${v("DETENTION_FACILITY_NAME")} in ${v("DETENTION_FACILITY_CITY")}, ${v("DETENTION_FACILITY_STATE")}.</p>
<p class="p">3.&emsp;On September 5, 2025, the Board of Immigration Appeals (\u201cBIA\u201d) issued a precedential decision that unlawfully reinterpreted the Immigration and Nationality Act (\u201cINA\u201d). See <em>Matter of Yajure Hurtado</em>, 29 I&amp;N Dec. 216 (BIA 2025). Prior to this decision, noncitizens like Petitioner who had lived in the U.S. for many years and were apprehended by ICE in the interior of the country were detained pursuant to 8 U.S.C. \u00a7 1226(a) and eligible to seek bond hearings before Immigration Judges (\u201cIJs\u201d). Instead, in conflict with nearly thirty years of legal precedent, Petitioner is now considered subject to mandatory detention under 8 U.S.C. \u00a7 1225(b)(2)(A) and has no opportunity for release on bond while his removal proceedings are pending.</p>
<p class="p">4.&emsp;Petitioner\u2019s detention pursuant to \u00a7 1225(b)(2)(A) violates the plain language of the INA and its implementing regulations. Petitioner, who has resided in the U.S. for nearly ${v("PETITIONER_YEARS_IN_US")} years and who was apprehended in the interior of the U.S., should not be considered an \u201capplicant for admission\u201d who is \u201cseeking admission.\u201d Rather, he should be detained pursuant to 8 U.S.C. \u00a7 1226(a), which allows for release on conditional parole or bond.</p>
<p class="p">5.&emsp;Petitioner seeks declaratory relief that he is subject to detention under \u00a7 1226(a) and its implementing regulations and asks that this Court either order Respondents to release Petitioner from custody or provide him with a bond hearing.</p>

<h2>CUSTODY</h2>
<p class="p">6.&emsp;Petitioner is currently in the custody of Immigration and Customs Enforcement (\u201cICE\u201d) at the ${v("DETENTION_FACILITY_NAME")} in ${v("DETENTION_FACILITY_CITY")}, ${v("DETENTION_FACILITY_STATE")}. He is therefore in \u201c\u2018custody\u2019 of [the DHS] within the meaning of the habeas corpus statute.\u201d <em>Jones v. Cunningham</em>, 371 U.S. 236, 243 (1963).</p>

<h2>JURISDICTION</h2>
<p class="p">7.&emsp;This court has jurisdiction under 28 U.S.C. \u00a7 2241 (habeas corpus), 28 U.S.C. \u00a7 1331 (federal question), Article I, \u00a7 9, cl. 2 of the United States Constitution (Suspension Clause), and the Immigration and Nationality Act (\u201cINA\u201d), 8 U.S.C. \u00a7 1101 et seq.</p>
<p class="p">8.&emsp;This Court may grant relief under the habeas corpus statutes, 28 U.S.C. \u00a7 2241 et seq., the Declaratory Judgment Act, 28 U.S.C. \u00a7 2201 et seq., the All Writs Act, 28 U.S.C. \u00a7 1651, and the Immigration and Nationality Act, 8 U.S.C. \u00a7 1252(e)(2).</p>
<p class="p">9.&emsp;Federal district courts have jurisdiction to hear habeas claims by non-citizens challenging both the lawfulness and the constitutionality of their detention. See <em>Zadvydas v. Davis</em>, 533 U.S. 678, 687 (2001).</p>

<h2>REQUIREMENTS OF 28 U.S.C. \u00a7\u00a7 2241, 2243</h2>
<p class="p">10.&emsp;The Court must grant the petition for writ of habeas corpus or issue an order to show cause (\u201cOSC\u201d) to Respondents \u201cforthwith,\u201d unless Petitioner is not entitled to relief. 28 U.S.C. \u00a7 2243. If an OSC is issued, the Court must require Respondents to file a return \u201cwithin three days unless for good cause additional time, not exceeding twenty days, is allowed.\u201d <em>Id.</em></p>
<p class="p">11.&emsp;Petitioner is \u201cin custody\u201d for the purpose of \u00a7 2241 because Petitioner is arrested and detained by Respondents.</p>

<h2>VENUE</h2>
<p class="p">12.&emsp;Venue is properly before this Court pursuant to 28 U.S.C. \u00a7 1391(e) because Respondents are employees or officers of the United States acting in their official capacity and because a substantial part of the events or omissions giving rise to the claim occurred in the ${v("COURT_DISTRICT")}. Petitioner is under the jurisdiction of ICE\u2019s ${v("FIELD_OFFICE_NAME")}, and he is currently detained at the ${v("DETENTION_FACILITY_NAME")} in ${v("DETENTION_FACILITY_CITY")}, ${v("DETENTION_FACILITY_STATE")}.</p>

<h2>EXHAUSTION OF ADMINISTRATIVE REMEDIES</h2>
<p class="p">13.&emsp;Administrative exhaustion is unnecessary as it would be futile. See, e.g., <em>Aguilar v. Lewis</em>, 50 F. Supp. 2d 539, 542\u201343 (E.D. Va. 1999).</p>
<p class="p">14.&emsp;It would be futile for Petitioner to seek a custody redetermination hearing before an IJ due to the BIA\u2019s recent decision holding that anyone who has entered the U.S. without inspection is now considered an \u201capplicant for admission\u201d who is \u201cseeking admission\u201d and therefore subject to mandatory detention under \u00a7 1225(b)(2)(A). See <em>Matter of Yajure Hurtado</em>, 29 I&amp;N Dec. 216 (BIA 2025); see also <em>Zaragoza Mosqueda v. Noem</em>, 2025 WL 2591530, at *7 (C.D. Cal. Sept. 8, 2025).</p>
<p class="p">15.&emsp;Additionally, the agency does not have jurisdiction to review Petitioner\u2019s claim of unlawful custody in violation of his due process rights, and it would therefore be futile for him to pursue administrative remedies. <em>Reno v. Amer.-Arab Anti-Discrim. Comm.</em>, 525 U.S. 471 (1999).</p>

<h2>PARTIES</h2>
<p class="p">16.&emsp;Petitioner ${v("PETITIONER_FULL_NAME")} is from ${v("PETITIONER_COUNTRY")} and has resided in the U.S. since ${v("PETITIONER_ENTRY_DATE")}. He is currently detained in the ${v("DETENTION_FACILITY_NAME")}.</p>
<p class="p">17.&emsp;Respondent ${v("WARDEN_NAME")} is sued in his official capacity as Warden of the ${v("DETENTION_FACILITY_NAME")}. In his official capacity, ${v("WARDEN_NAME")} is Petitioner\u2019s immediate custodian.</p>
<p class="p">18.&emsp;Respondent ${v("FIELD_OFFICE_DIRECTOR")} is sued in his official capacity as Field Office Director, ${v("FIELD_OFFICE_NAME")}, Enforcement and Removal Operations, U.S. Immigration &amp; Customs Enforcement (\u201cICE\u201d). In his official capacity, Respondent ${v("FIELD_OFFICE_DIRECTOR")} is the legal custodian of Petitioner.</p>
<p class="p">19.&emsp;Respondent ${v("ICE_DIRECTOR")} is sued in his official capacity as ${v("ICE_DIRECTOR_TITLE")} of ICE. As the ${v("ICE_DIRECTOR_TITLE")} of ICE, Respondent ${v("ICE_DIRECTOR")} is a legal custodian of Petitioner.</p>
<p class="p">20.&emsp;Respondent ${v("DHS_SECRETARY")} is sued in her official capacity as Secretary of Homeland Security. As the head of the Department of Homeland Security, the agency tasked with enforcing immigration laws, Secretary ${v("DHS_SECRETARY")} is Petitioner\u2019s ultimate legal custodian.</p>
<p class="p">21.&emsp;Respondent ${v("ATTORNEY_GENERAL")} is sued in her official capacity as the Attorney General of the United States. As Attorney General, she has authority over the Department of Justice and is charged with faithfully administering the immigration laws of the United States.</p>

<h2>LEGAL BACKGROUND AND ARGUMENT</h2>
<p class="p">22.&emsp;The INA prescribes three basic forms of detention for noncitizens in removal proceedings.</p>
<p class="p">23.&emsp;First, individuals detained pursuant to 8 U.S.C. \u00a7 1226(a) are generally entitled to a bond hearing, unless they have been arrested, charged with, or convicted of certain crimes and are subject to mandatory detention. See 8 U.S.C. \u00a7\u00a7 1226(a), 1226(c); see also 8 C.F.R. \u00a7\u00a7 1003.19(a), 1236.1(d).</p>
<p class="p">24.&emsp;Second, the INA provides for mandatory detention of noncitizens subject to expedited removal under 8 U.S.C. \u00a7 1225(b)(1) as well as other recent arrivals deemed to be \u201cseeking admission\u201d under \u00a7 1225(b)(2).</p>
<p class="p">25.&emsp;Third, the INA authorizes detention of noncitizens who have received a final order of removal, including those in withholding-only proceedings. See 8 U.S.C. \u00a7 1231(a)\u2013(b).</p>
<p class="p">26.&emsp;Thus, in the decades that followed, most people who entered without inspection and were thereafter detained and placed in standard removal proceedings were considered for release on bond and received bond hearings before an IJ, unless their criminal history rendered them ineligible.</p>
<p class="p">27.&emsp;For decades, long-term residents of the U.S. who entered without inspection and were subsequently apprehended by ICE in the interior of the country have been detained pursuant to \u00a7 1226 and entitled to bond hearings before an IJ, unless barred from doing so due to their criminal history.</p>
<p class="p">28.&emsp;In July 2025, however, ICE began asserting that all individuals who entered without inspection should be considered \u201cseeking admission\u201d and therefore subject to mandatory detention under 8 U.S.C. \u00a7 1225(b)(2)(A).</p>
<p class="p">29.&emsp;On September 5, 2025, the BIA issued a precedential decision adopting this interpretation, despite its departure from the INA\u2019s text, federal precedent, and existing regulations. <em>Matter of Yajure Hurtado</em>, 29 I&amp;N Dec. 216 (BIA 2025).</p>
<p class="p">30.&emsp;Respondents\u2019 new legal interpretation is contrary to the statutory framework and its implementing regulations.</p>
<p class="p">31.&emsp;Courts across the country have rejected this interpretation and instead have consistently found that \u00a7 1226, not \u00a7 1225(b)(2), authorizes detention of noncitizens who entered without inspection and were later apprehended in the interior of the country. See, e.g., <em>Hasan v. Crawford</em>, 2025 WL 2682255 (E.D. Va. Sept. 19, 2025); <em>Quispe Ardiles v. Noem</em>, No. 1:25-cv-01382 (E.D. Va. Sept. 30, 2025); <em>Venancio v. Hyde</em>, No. 1:25-cv-12616 (D. Mass. Oct. 9, 2025); <em>Artiga v. Genalo</em>, No. 2:25-cv-05208 (E.D.N.Y. Oct. 7, 2025); <em>Sampiao v. Hyde</em>, 2025 WL 2607924 (D. Mass. Sept. 9, 2025); and others.</p>
<p class="p">32.&emsp;Under the Supreme Court\u2019s recent decision in <em>Loper Bright v. Raimondo</em>, this Court should independently interpret the statute and give the BIA\u2019s expansive interpretation of \u00a7 1225(b)(2) no weight. 603 U.S. 369 (2024).</p>
<p class="p">33.&emsp;The detention provisions at \u00a7 1226(a) and \u00a7 1225(b)(2) were enacted as part of the Illegal Immigration Reform and Immigrant Responsibility Act (\u201cIIRIRA\u201d) of 1996. Following IIRIRA, the Executive Office for Immigration Review (\u201cEOIR\u201d) issued regulations clarifying that individuals who entered the country without inspection were not considered detained under \u00a7 1225, but rather under \u00a7 1226(a). See 62 Fed. Reg. 10312, 10323 (Mar. 6, 1997).</p>
<p class="p">34.&emsp;The statutory context and structure also make clear that \u00a7 1226 applies to individuals who have not been admitted and entered without inspection.</p>
<p class="p">35.&emsp;The Supreme Court has explained that \u00a7 1225(b) is concerned \u201cprimarily [with those] seeking entry,\u201d and is generally imposed \u201cat the Nation\u2019s borders and ports of entry.\u201d <em>Jennings v. Rodriguez</em>, 583 U.S. 281, 297\u2013298 (2018). In contrast, Section 1226 \u201cauthorizes the Government to detain certain aliens already in the country pending the outcome of removal proceedings.\u201d <em>Id.</em> at 289.</p>
<p class="p">36.&emsp;Furthermore, \u00a7 1225(b)(2) specifically applies only to those \u201cseeking admission.\u201d The use of the present progressive tense excludes noncitizens like Petitioner who are apprehended in the interior years after they entered. See <em>Martinez v. Hyde</em>, 2025 WL 2084238 at *6 (D. Mass. July 24, 2025).</p>
<p class="p">37.&emsp;Accordingly, the mandatory detention provision of \u00a7 1225(b)(2) does not apply to Petitioner, who entered the U.S. years before he was apprehended.</p>

<h2>STATEMENT OF FACTS</h2>
<p class="p">38.&emsp;Petitioner is a citizen of ${v("PETITIONER_COUNTRY")}.</p>
<p class="p">39.&emsp;On information and belief, Petitioner entered the U.S. ${v("PETITIONER_ENTRY_METHOD")} in ${v("PETITIONER_ENTRY_DATE")}, and he has resided in the U.S. since then.</p>
<p class="p">40.&emsp;On information and belief, Petitioner ${v("PETITIONER_CRIMINAL_HISTORY")}.</p>
<p class="p">41.&emsp;On information and belief, Petitioner was arrested by immigration authorities in ${v("PETITIONER_APPREHENSION_LOCATION")} on ${v("PETITIONER_APPREHENSION_DATE")}.</p>
<p class="p">42.&emsp;He is now detained at the ${v("DETENTION_FACILITY_NAME")}.</p>
<p class="p">43.&emsp;Without relief from this Court, he faces the prospect of continued detention without any access to a bond hearing.</p>

<h2>COUNT I \u2014 Violation of 8 U.S.C. \u00a7 1226(a)</h2>
<p class="p">44.&emsp;Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="p">45.&emsp;Petitioner may be detained, if at all, pursuant to 8 U.S.C. \u00a7 1226(a).</p>
<p class="p">46.&emsp;Under \u00a7 1226(a) and its associated regulations, Petitioner is entitled to a bond hearing. See 8 C.F.R. 236.1(d) &amp; 1003.19(a)\u2013(f).</p>
<p class="p">47.&emsp;Petitioner has not been, and will not be, provided with a bond hearing as required by law.</p>
<p class="p">48.&emsp;Petitioner\u2019s continuing detention is therefore unlawful.</p>

<h2>COUNT II \u2014 Violation of Bond Regulations</h2>
<p class="p">49.&emsp;Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="p">50.&emsp;In 1997, after Congress amended the INA through IIRIRA, EOIR and the then-Immigration and Naturalization Service issued an interim rule clarifying that individuals who had entered without inspection were eligible for bond and bond hearings under 8 U.S.C. \u00a7 1226 and its implementing regulations. 62 Fed. Reg. at 10323.</p>
<p class="p">51.&emsp;The application of \u00a7 1225(b)(2) to Petitioner unlawfully mandates his continued detention and violates 8 C.F.R. \u00a7\u00a7 236.1, 1236.1, and 1003.19.</p>

<h2>COUNT III \u2014 Violation of Fifth Amendment Due Process</h2>
<p class="p">52.&emsp;Petitioner restates and realleges all paragraphs as if fully set forth here.</p>
<p class="p">53.&emsp;The Fifth Amendment\u2019s Due Process Clause prohibits the federal government from depriving any person of \u201clife, liberty, or property, without due process of law.\u201d U.S. Const. Amend. V.</p>
<p class="p">54.&emsp;The Supreme Court has repeatedly emphasized that the Constitution generally requires a hearing before the government deprives a person of liberty or property. <em>Zinermon v. Burch</em>, 494 U.S. 113, 127 (1990).</p>
<p class="p">55.&emsp;Under the <em>Mathews v. Eldridge</em> framework, the balance of interests strongly favors Petitioner\u2019s release.</p>
<p class="p">56.&emsp;Petitioner\u2019s private interest in freedom from detention is profound. <em>Hamdi v. Rumsfeld</em>, 542 U.S. 507, 529 (2004); see also <em>Zadvydas v. Davis</em>, 533 U.S. 678, 690 (2001).</p>
<p class="p">57.&emsp;The risk of erroneous deprivation is exceptionally high. Petitioner ${v("PETITIONER_CRIMINAL_HISTORY")} and ${v("PETITIONER_COMMUNITY_TIES")}.</p>
<p class="p">58.&emsp;The government\u2019s interest in detaining Petitioner without due process is minimal. Immigration detention is civil, not punitive. See <em>Zadvydas</em>, 533 U.S. at 690.</p>
<p class="p">59.&emsp;Furthermore, the \u201cfiscal and administrative burdens\u201d of providing Petitioner with a bond hearing are minimal. See <em>Mathews</em>, 424 U.S. at 334\u201335.</p>
<p class="p">60.&emsp;Considering these factors, Petitioner respectfully requests that this Court order his immediate release from custody or provide him with a bond hearing.</p>

<h2>PRAYER FOR RELIEF</h2>
<p class="p">WHEREFORE, Petitioner prays that this Court will: (1) Assume jurisdiction over this matter; (2) Set this matter for expedited consideration; (3) Order that Petitioner not be transferred outside of this District; (4) Issue an Order to Show Cause ordering Respondents to show cause why this Petition should not be granted within three days; (5) Declare that Petitioner\u2019s detention is unlawful; (6) Issue a Writ of Habeas Corpus ordering Respondents to release Petitioner from custody or provide him with a bond hearing pursuant to 8 U.S.C. \u00a7 1226(a) or the Due Process Clause within seven days; (7) Award Petitioner attorney\u2019s fees and costs under the Equal Access to Justice Act; and (8) Grant any further relief this Court deems just and proper.</p>
<div class="sig-block">
<p>Date: ${v("FILING_DATE")}</p>
<p style="margin-top:16px">Respectfully Submitted,</p>
<p class="sig">/s/ ${v("ATTORNEY1_NAME")}<br/>${v("ATTORNEY1_BAR_NO")}<br/>${v("ATTORNEY1_FIRM")}<br/>${v("ATTORNEY1_ADDRESS")}<br/>${v("ATTORNEY1_CITY_STATE_ZIP")}<br/>${v("ATTORNEY1_PHONE")} (phone)&ensp;${v("ATTORNEY1_FAX")} (fax)<br/>${v("ATTORNEY1_EMAIL")}</p>
<p class="sig">/s/ ${v("ATTORNEY2_NAME")}<br/>${v("ATTORNEY2_BAR_NO")}*<br/>${v("ATTORNEY2_FIRM")}<br/>${v("ATTORNEY2_ADDRESS")}<br/>${v("ATTORNEY2_CITY_STATE_ZIP")}<br/>${v("ATTORNEY2_PHONE")} (phone)<br/>${v("ATTORNEY2_EMAIL")}<br/>${v("ATTORNEY2_PRO_HAC")}</p>
<p><em>Attorneys for Petitioner</em></p>
</div>

<h2>VERIFICATION PURSUANT TO 28 U.S.C. \u00a7 2242</h2>
<p class="p">I represent Petitioner, ${v("PETITIONER_FULL_NAME")}, and submit this verification on his behalf. I hereby verify that the factual statements made in the foregoing Petition for Writ of Habeas Corpus are true and correct to the best of my knowledge. Dated this ${v("FILING_DAY")} day of ${v("FILING_MONTH_YEAR")}.</p>
<p class="p">/s/ ${v("ATTORNEY2_NAME")}<br/>${v("ATTORNEY2_NAME")}<br/>Attorney for Petitioner Appearing Pro Hac Vice</p>
</div>`;
}

function resolveVars(client, data) {
  const fac = data.facilities.find((f) => f.id === client.facility_id) || EMPTY_FACILITY;
  const a1 = data.attorneys.find((a) => a.id === client.attorney1_id) || EMPTY_ATTORNEY;
  const a2 = data.attorneys.find((a) => a.id === client.attorney2_id) || EMPTY_ATTORNEY;
  const o = data.officials;
  return {
    COURT_DISTRICT: client.court_district, COURT_DIVISION: client.court_division, CASE_NUMBER: client.case_number,
    FILING_DATE: client.filing_date, FILING_DAY: client.filing_day, FILING_MONTH_YEAR: client.filing_month_year,
    PETITIONER_FULL_NAME: client.full_name, PETITIONER_COUNTRY: client.country, PETITIONER_YEARS_IN_US: client.years_in_us,
    PETITIONER_ENTRY_DATE: client.entry_date, PETITIONER_ENTRY_METHOD: client.entry_method,
    PETITIONER_APPREHENSION_LOCATION: client.apprehension_location, PETITIONER_APPREHENSION_DATE: client.apprehension_date,
    PETITIONER_CRIMINAL_HISTORY: client.criminal_history, PETITIONER_COMMUNITY_TIES: client.community_ties,
    DETENTION_FACILITY_NAME: fac.name, DETENTION_FACILITY_CITY: fac.city, DETENTION_FACILITY_STATE: fac.state,
    WARDEN_NAME: fac.warden,
    FIELD_OFFICE_DIRECTOR: client.field_office_director, FIELD_OFFICE_NAME: client.field_office_name,
    ICE_DIRECTOR: o.ice_director, ICE_DIRECTOR_TITLE: o.ice_director_title,
    DHS_SECRETARY: o.dhs_secretary, ATTORNEY_GENERAL: o.attorney_general,
    ATTORNEY1_NAME: a1.name, ATTORNEY1_BAR_NO: a1.bar_no, ATTORNEY1_FIRM: a1.firm,
    ATTORNEY1_ADDRESS: a1.address, ATTORNEY1_CITY_STATE_ZIP: a1.city_state_zip,
    ATTORNEY1_PHONE: a1.phone, ATTORNEY1_FAX: a1.fax, ATTORNEY1_EMAIL: a1.email,
    ATTORNEY2_NAME: a2.name, ATTORNEY2_BAR_NO: a2.bar_no, ATTORNEY2_FIRM: a2.firm,
    ATTORNEY2_ADDRESS: a2.address, ATTORNEY2_CITY_STATE_ZIP: a2.city_state_zip,
    ATTORNEY2_PHONE: a2.phone, ATTORNEY2_EMAIL: a2.email, ATTORNEY2_PRO_HAC: a2.pro_hac,
  };
}

// ─── COMPONENTS ───

function Field({ label, value, onChange, placeholder, wide }) {
  return (
    <div style={{ marginBottom: 12, flex: wide ? "1 1 100%" : "1 1 45%", minWidth: wide ? "100%" : 200 }}>
      <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500, color: "#6b6b7b", marginBottom: 3, letterSpacing: "0.03em" }}>
        {label} {value && value.trim() && <span style={{ color: "#4a8c5c" }}>✓</span>}
      </label>
      <input
        type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""}
        style={{
          width: "100%", padding: "7px 10px", fontFamily: "var(--serif)", fontSize: 13.5,
          border: "1px solid #d0ccc0", borderRadius: 3, background: value && value.trim() ? "#fafaf6" : "#fff",
          outline: "none", boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#b89d4f")}
        onBlur={(e) => (e.target.style.borderColor = "#d0ccc0")}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ marginBottom: 12, flex: "1 1 45%", minWidth: 200 }}>
      <label style={{ display: "block", fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500, color: "#6b6b7b", marginBottom: 3, letterSpacing: "0.03em" }}>{label}</label>
      <select
        value={value || ""} onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "7px 10px", fontFamily: "var(--serif)", fontSize: 13.5,
          border: "1px solid #d0ccc0", borderRadius: 3, background: "#fff", outline: "none", boxSizing: "border-box",
        }}
      >
        <option value="">{placeholder || "— Select —"}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children, title, actions, style: extraStyle }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e0ddd4", borderRadius: 5, marginBottom: 14, ...extraStyle }}>
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #eeebe4" }}>
          <div style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{title}</div>
          {actions && <div style={{ display: "flex", gap: 6 }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}

function SmallBtn({ onClick, children, variant, style: extraStyle }) {
  const base = {
    padding: "4px 12px", fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
    border: "1px solid #d0ccc0", borderRadius: 3, cursor: "pointer", transition: "all 0.1s",
  };
  const styles = {
    default: { ...base, color: "#4a4a5a", background: "#faf9f5" },
    primary: { ...base, color: "#fff", background: "#1a1a2e", borderColor: "#1a1a2e" },
    danger: { ...base, color: "#a03030", background: "#fff5f5", borderColor: "#e0c0c0" },
    gold: { ...base, color: "#1a1a2e", background: "#f5efd8", borderColor: "#c9a55a" },
  };
  return <button onClick={onClick} style={{ ...styles[variant || "default"], ...extraStyle }}>{children}</button>;
}

// ─── PAGES ───

function FacilitiesPage({ data, setData }) {
  const [editing, setEditing] = useState(null);
  const startNew = () => { const f = { ...EMPTY_FACILITY, id: uid() }; setEditing(f); };
  const startEdit = (f) => setEditing({ ...f });
  const save = () => {
    setData((d) => {
      const exists = d.facilities.find((f) => f.id === editing.id);
      const facilities = exists ? d.facilities.map((f) => (f.id === editing.id ? editing : f)) : [...d.facilities, editing];
      return { ...d, facilities };
    });
    setEditing(null);
  };
  const remove = (id) => {
    if (!confirm("Delete this facility?")) return;
    setData((d) => ({ ...d, facilities: d.facilities.filter((f) => f.id !== id) }));
  };
  const upd = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a2e" }}>Detention Facilities</h2>
        <SmallBtn onClick={startNew} variant="primary">+ Add Facility</SmallBtn>
      </div>
      <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#7a7a8a", margin: "0 0 16px 0" }}>
        Shared across all clients. Each facility stores its warden.
      </p>
      {editing && (
        <Card title={editing.name || "New Facility"} actions={<><SmallBtn onClick={save} variant="gold">Save</SmallBtn><SmallBtn onClick={() => setEditing(null)}>Cancel</SmallBtn></>}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            <Field label="Facility Name" value={editing.name} onChange={(v) => upd("name", v)} wide placeholder="e.g. South Louisiana ICE Processing Center" />
            <Field label="City" value={editing.city} onChange={(v) => upd("city", v)} placeholder="e.g. Basile" />
            <Field label="State" value={editing.state} onChange={(v) => upd("state", v)} placeholder="e.g. Louisiana" />
            <Field label="Warden" value={editing.warden} onChange={(v) => upd("warden", v)} wide placeholder="e.g. John Smith" />
          </div>
        </Card>
      )}
      {data.facilities.length === 0 && !editing && (
        <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--sans)", fontSize: 13 }}>No facilities yet. Add one to get started.</div>
      )}
      {data.facilities.map((f) => (
        <Card key={f.id} title={f.name || "Unnamed"} actions={<><SmallBtn onClick={() => startEdit(f)}>Edit</SmallBtn><SmallBtn onClick={() => remove(f.id)} variant="danger">×</SmallBtn></>}>
          <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#5a5a6a", lineHeight: 1.6 }}>
            {f.city}, {f.state}<br />Warden: {f.warden || "—"}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AttorneysPage({ data, setData }) {
  const [editing, setEditing] = useState(null);
  const startNew = () => setEditing({ ...EMPTY_ATTORNEY, id: uid() });
  const startEdit = (a) => setEditing({ ...a });
  const save = () => {
    setData((d) => {
      const exists = d.attorneys.find((a) => a.id === editing.id);
      const attorneys = exists ? d.attorneys.map((a) => (a.id === editing.id ? editing : a)) : [...d.attorneys, editing];
      return { ...d, attorneys };
    });
    setEditing(null);
  };
  const remove = (id) => {
    if (!confirm("Delete this attorney?")) return;
    setData((d) => ({ ...d, attorneys: d.attorneys.filter((a) => a.id !== id) }));
  };
  const upd = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a2e" }}>Attorneys</h2>
        <SmallBtn onClick={startNew} variant="primary">+ Add Attorney</SmallBtn>
      </div>
      <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#7a7a8a", margin: "0 0 16px 0" }}>
        Each attorney can be assigned to multiple clients as local counsel or pro hac vice.
      </p>
      {editing && (
        <Card title={editing.name || "New Attorney"} actions={<><SmallBtn onClick={save} variant="gold">Save</SmallBtn><SmallBtn onClick={() => setEditing(null)}>Cancel</SmallBtn></>}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            <Field label="Full Name" value={editing.name} onChange={(v) => upd("name", v)} placeholder="e.g. Jane Smith" />
            <Field label="Bar Number" value={editing.bar_no} onChange={(v) => upd("bar_no", v)} placeholder="e.g. VSB No. 12345" />
            <Field label="Firm" value={editing.firm} onChange={(v) => upd("firm", v)} wide placeholder="e.g. Smith & Associates PLLC" />
            <Field label="Address" value={editing.address} onChange={(v) => upd("address", v)} wide />
            <Field label="City, State ZIP" value={editing.city_state_zip} onChange={(v) => upd("city_state_zip", v)} />
            <Field label="Phone" value={editing.phone} onChange={(v) => upd("phone", v)} />
            <Field label="Fax" value={editing.fax} onChange={(v) => upd("fax", v)} />
            <Field label="Email" value={editing.email} onChange={(v) => upd("email", v)} />
            <Field label="Pro Hac Vice Note" value={editing.pro_hac} onChange={(v) => upd("pro_hac", v)} wide placeholder="e.g. *Pro hac vice application pending" />
          </div>
        </Card>
      )}
      {data.attorneys.length === 0 && !editing && (
        <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--sans)", fontSize: 13 }}>No attorneys yet.</div>
      )}
      {data.attorneys.map((a) => (
        <Card key={a.id} title={a.name || "Unnamed"} actions={<><SmallBtn onClick={() => startEdit(a)}>Edit</SmallBtn><SmallBtn onClick={() => remove(a.id)} variant="danger">×</SmallBtn></>}>
          <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#5a5a6a", lineHeight: 1.6 }}>
            {a.firm && <>{a.firm}<br/></>}{a.bar_no && <>{a.bar_no}<br/></>}{a.email || "—"}
          </div>
        </Card>
      ))}
    </div>
  );
}

function OfficialsPage({ data, setData }) {
  const o = data.officials;
  const upd = (k, v) => setData((d) => ({ ...d, officials: { ...d.officials, [k]: v } }));
  return (
    <div>
      <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600, margin: "0 0 6px 0", color: "#1a1a2e" }}>Federal Officials</h2>
      <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#7a7a8a", margin: "0 0 16px 0" }}>
        These apply to all petitions. Update when officials change.
      </p>
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
          <Field label="DHS Secretary" value={o.dhs_secretary} onChange={(v) => upd("dhs_secretary", v)} placeholder="e.g. Kristi Noem" />
          <Field label="Attorney General" value={o.attorney_general} onChange={(v) => upd("attorney_general", v)} placeholder="e.g. Pam Bondi" />
          <Field label="ICE Director" value={o.ice_director} onChange={(v) => upd("ice_director", v)} placeholder="e.g. Tom Homan" />
          <Field label="ICE Director Title" value={o.ice_director_title} onChange={(v) => upd("ice_director_title", v)} placeholder="e.g. Director" />
        </div>
      </Card>
    </div>
  );
}

function ClientsPage({ data, setData, onGenerate }) {
  const [editing, setEditing] = useState(null);
  const startNew = () => setEditing({ ...EMPTY_CLIENT, id: uid() });
  const startEdit = (c) => setEditing({ ...c });
  const save = () => {
    setData((d) => {
      const exists = d.clients.find((c) => c.id === editing.id);
      const clients = exists ? d.clients.map((c) => (c.id === editing.id ? editing : c)) : [...d.clients, editing];
      return { ...d, clients };
    });
    setEditing(null);
  };
  const remove = (id) => {
    if (!confirm("Delete this client?")) return;
    setData((d) => ({ ...d, clients: d.clients.filter((c) => c.id !== id) }));
  };
  const upd = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  const facOptions = data.facilities.map((f) => ({ value: f.id, label: `${f.name} (${f.city}, ${f.state})` }));
  const attOptions = data.attorneys.map((a) => ({ value: a.id, label: `${a.name}${a.firm ? " — " + a.firm : ""}` }));

  const clientCount = (attId) => data.clients.filter((c) => c.attorney1_id === attId || c.attorney2_id === attId).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a2e" }}>Clients</h2>
        <SmallBtn onClick={startNew} variant="primary">+ Add Client</SmallBtn>
      </div>
      {editing && (
        <Card title={editing.full_name || "New Client"} actions={<><SmallBtn onClick={save} variant="gold">Save</SmallBtn><SmallBtn onClick={() => setEditing(null)}>Cancel</SmallBtn></>}>
          <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 8px 0" }}>Identity</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            <Field label="Full Name" value={editing.full_name} onChange={(v) => upd("full_name", v)} placeholder="e.g. Juan Carlos Rivera" />
            <Field label="Country of Origin" value={editing.country} onChange={(v) => upd("country", v)} placeholder="e.g. Honduras" />
            <Field label="Years in U.S." value={editing.years_in_us} onChange={(v) => upd("years_in_us", v)} placeholder="e.g. 12" />
            <Field label="Entry Date/Year" value={editing.entry_date} onChange={(v) => upd("entry_date", v)} placeholder="e.g. approximately 2013" />
            <Field label="Entry Method" value={editing.entry_method} onChange={(v) => upd("entry_method", v)} placeholder="e.g. without inspection" />
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "12px 0 8px 0" }}>Apprehension & History</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            <Field label="Apprehension Location" value={editing.apprehension_location} onChange={(v) => upd("apprehension_location", v)} placeholder="e.g. Nashville, TN" />
            <Field label="Apprehension Date" value={editing.apprehension_date} onChange={(v) => upd("apprehension_date", v)} placeholder="e.g. January 15, 2026" />
            <Field label="Criminal History Statement" value={editing.criminal_history} onChange={(v) => upd("criminal_history", v)} wide placeholder="e.g. has no criminal record" />
            <Field label="Community Ties" value={editing.community_ties} onChange={(v) => upd("community_ties", v)} wide placeholder="e.g. has strong family and community ties" />
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "12px 0 8px 0" }}>Assignments</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            <SelectField label="Detention Facility" value={editing.facility_id} onChange={(v) => upd("facility_id", v)} options={facOptions} placeholder="— Select facility —" />
            <SelectField label="Local Counsel (Atty 1)" value={editing.attorney1_id} onChange={(v) => upd("attorney1_id", v)} options={attOptions} placeholder="— Select attorney —" />
            <SelectField label="Pro Hac Vice (Atty 2)" value={editing.attorney2_id} onChange={(v) => upd("attorney2_id", v)} options={attOptions} placeholder="— Select attorney —" />
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "12px 0 8px 0" }}>Case & Court</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            <Field label="Court District" value={editing.court_district} onChange={(v) => upd("court_district", v)} placeholder="e.g. Middle District of Tennessee" />
            <Field label="Court Division" value={editing.court_division} onChange={(v) => upd("court_division", v)} placeholder="e.g. Nashville Division" />
            <Field label="Case Number" value={editing.case_number} onChange={(v) => upd("case_number", v)} placeholder="e.g. 3:25-cv-01234" />
            <Field label="Field Office Director" value={editing.field_office_director} onChange={(v) => upd("field_office_director", v)} />
            <Field label="Field Office Name" value={editing.field_office_name} onChange={(v) => upd("field_office_name", v)} placeholder="e.g. New Orleans Field Office" />
            <Field label="Filing Date" value={editing.filing_date} onChange={(v) => upd("filing_date", v)} placeholder="e.g. February 19, 2026" />
            <Field label="Filing Day" value={editing.filing_day} onChange={(v) => upd("filing_day", v)} placeholder="e.g. 19th" />
            <Field label="Filing Month & Year" value={editing.filing_month_year} onChange={(v) => upd("filing_month_year", v)} placeholder="e.g. February, 2026" />
          </div>
        </Card>
      )}
      {data.clients.length === 0 && !editing && (
        <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--sans)", fontSize: 13 }}>
          No clients yet. Add facilities and attorneys first, then create clients.
        </div>
      )}
      {data.clients.map((c) => {
        const fac = data.facilities.find((f) => f.id === c.facility_id);
        const a1 = data.attorneys.find((a) => a.id === c.attorney1_id);
        const a2 = data.attorneys.find((a) => a.id === c.attorney2_id);
        const vars = resolveVars(c, data);
        const filled = Object.values(vars).filter((v) => v && v.trim()).length;
        const total = Object.keys(vars).length;
        return (
          <Card key={c.id} title={c.full_name || "Unnamed Client"} actions={
            <>
              <SmallBtn onClick={() => onGenerate(c.id)} variant="gold">Generate ▸</SmallBtn>
              <SmallBtn onClick={() => startEdit(c)}>Edit</SmallBtn>
              <SmallBtn onClick={() => remove(c.id)} variant="danger">×</SmallBtn>
            </>
          }>
            <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#5a5a6a", lineHeight: 1.8 }}>
              {c.country && <span>{c.country} · </span>}
              {fac ? fac.name : <span style={{ color: "#c06030" }}>No facility assigned</span>}
              {c.case_number && <span> · {c.case_number}</span>}
              <br />
              <span style={{ fontSize: 11, color: "#9a9aaa" }}>
                Counsel: {a1 ? a1.name : "—"} / {a2 ? a2.name : "—"} · {filled}/{total} fields complete
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function GeneratePage({ client, data, onBack }) {
  const vars = useMemo(() => resolveVars(client, data), [client, data]);
  const html = useMemo(() => buildDocHTML(vars), [vars]);
  const filled = Object.values(vars).filter((v) => v && v.trim()).length;
  const total = Object.keys(vars).length;
  const missing = Object.entries(vars).filter(([, v]) => !v || !v.trim()).map(([k]) => k);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SmallBtn onClick={onBack}>← Back</SmallBtn>
          <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a2e" }}>
            {client.full_name || "Client"}
          </h2>
          <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: filled === total ? "#4a8c5c" : "#b89d4f" }}>
            {filled}/{total} fields
          </span>
        </div>
      </div>
      {missing.length > 0 && (
        <div style={{ background: "#fff8f0", border: "1px solid #e8d8c0", borderRadius: 4, padding: "8px 14px", marginBottom: 12, fontFamily: "var(--sans)", fontSize: 11, color: "#8a6a3a", flexShrink: 0 }}>
          <strong>Missing:</strong> {missing.map((k) => k.replace(/_/g, " ")).join(", ")}
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "16px 0" }}>
        <div style={{ width: "100%", maxWidth: 760, background: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.07)", borderRadius: 2 }}>
          <div style={{ padding: "56px 64px 56px 64px" }}>
            <style>{`
              .doc-body { font-family: "Source Serif 4", "Times New Roman", serif; font-size: 12.5px; line-height: 1.55; color: #1a1a1a; }
              .doc-body .ct { text-align:center; font-weight:700; font-size:12.5px; letter-spacing:0.3px; }
              .doc-body table.cap { width:100%; border-collapse:collapse; table-layout:fixed; margin-top:20px; }
              .doc-body .cap-l { width:55%; padding-right:6px; vertical-align:top; }
              .doc-body .cap-m { width:4%; text-align:center; vertical-align:top; font-size:11.5px; line-height:1.4; color:#999; }
              .doc-body .cap-r { width:41%; padding-left:6px; vertical-align:top; }
              .doc-body .cap-n { text-align:center; font-weight:700; }
              .doc-body .cap-c { text-align:center; margin-top:10px; }
              .doc-body .cap-b { margin-top:12px; }
              .doc-body .cap-b p { margin:0 0 7px 0; }
              .doc-body .cn { margin:0 0 10px 0; }
              .doc-body .tb { font-weight:700; margin:0; line-height:1.4; }
              .doc-body h2 { font-size:12.5px; font-weight:700; margin:22px 0 8px 0; text-transform:uppercase; letter-spacing:0.02em; }
              .doc-body .p { margin:0 0 9px 0; text-align:justify; text-indent:0; }
              .doc-body em { font-style:italic; }
              .doc-body .sig-block { margin-top:20px; }
              .doc-body .sig { margin:16px 0; }
              .doc-body .filled { color:#1a1a2e; font-weight:600; background:#f5f3e8; padding:0 2px; border-radius:2px; }
              .doc-body .unfilled { color:#b03030; font-weight:700; font-size:10px; background:#fff0f0; padding:1px 3px; border-radius:2px; font-family:var(--sans); letter-spacing:0.02em; }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───

const NAV_ITEMS = [
  { id: "clients", label: "Clients", icon: "👤" },
  { id: "attorneys", label: "Attorneys", icon: "⚖️" },
  { id: "facilities", label: "Facilities", icon: "🏢" },
  { id: "officials", label: "Officials", icon: "🏛" },
];

export default function App() {
  const [data, setDataRaw] = useState(loadData);
  const [page, setPage] = useState("clients");
  const [generateClientId, setGenerateClientId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("habeas-data");
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setDataRaw((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) { /* no stored data yet */ }
      setLoaded(true);
    })();
  }, []);

  // Save to storage on change
  const saveTimer = useRef(null);
  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try { await window.storage.set("habeas-data", JSON.stringify(next)); } catch (e) { console.warn("Storage save failed:", e); }
      }, 500);
      return next;
    });
  }, []);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "habeas-data.json"; a.click(); URL.revokeObjectURL(url);
  };
  const handleImport = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { try { setData(JSON.parse(ev.target.result)); } catch { alert("Invalid JSON"); } };
      reader.readAsText(file);
    };
    input.click();
  };

  const genClient = data.clients.find((c) => c.id === generateClientId);

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#888" }}>Loading…</div>;

  return (
    <div style={{ "--sans": "'DM Sans', sans-serif", "--serif": "'Source Serif 4', Georgia, serif", display: "flex", height: "100vh", background: "#f4f3ef", fontFamily: "var(--serif)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <nav style={{ width: 200, background: "#1a1a2e", color: "#d0cec4", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #2a2a3e" }}>
          <div style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "#c9a55a" }}>Habeas</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 10, color: "#6a6a7a", marginTop: 2 }}>Petition Manager</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setGenerateClientId(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 18px",
                fontFamily: "var(--sans)", fontSize: 13, fontWeight: page === item.id && !genClient ? 600 : 400,
                color: page === item.id && !genClient ? "#fff" : "#8a8a9a",
                background: page === item.id && !genClient ? "#2a2a42" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                borderLeft: page === item.id && !genClient ? "3px solid #c9a55a" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
              {item.id === "clients" && data.clients.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#6a6a7a", background: "#2a2a42", padding: "1px 6px", borderRadius: 8 }}>{data.clients.length}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid #2a2a3e", display: "flex", gap: 6 }}>
          <SmallBtn onClick={handleImport} style={{ flex: 1, color: "#8a8a9a", background: "#2a2a3e", borderColor: "#3a3a4e", fontSize: 10 }}>Import</SmallBtn>
          <SmallBtn onClick={handleExport} style={{ flex: 1, color: "#8a8a9a", background: "#2a2a3e", borderColor: "#3a3a4e", fontSize: 10 }}>Export</SmallBtn>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: genClient ? "20px 24px" : "24px 32px", display: "flex", flexDirection: "column" }}>
        {genClient ? (
          <GeneratePage client={genClient} data={data} onBack={() => setGenerateClientId(null)} />
        ) : page === "clients" ? (
          <ClientsPage data={data} setData={setData} onGenerate={(id) => setGenerateClientId(id)} />
        ) : page === "attorneys" ? (
          <AttorneysPage data={data} setData={setData} />
        ) : page === "facilities" ? (
          <FacilitiesPage data={data} setData={setData} />
        ) : page === "officials" ? (
          <OfficialsPage data={data} setData={setData} />
        ) : null}
      </main>
    </div>
  );
}
