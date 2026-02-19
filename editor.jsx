import { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const eo = (op, target, payload, frame) => ({ op, target, payload, frame: { t: now(), ...frame } });
const ts = (iso) => { try { return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}); } catch { return iso; } };

const STAGES = ["drafted","reviewed","submitted"];
const SM = { drafted:{color:"#c9a040",bg:"#faf5e4",label:"Drafted"}, reviewed:{color:"#5a9e6f",bg:"#eaf5ee",label:"Reviewed"}, submitted:{color:"#4a7ab5",bg:"#e8f0fa",label:"Submitted"} };

/* ═══════════════════════════════════════════════════════════════════
   PROVENANCE — every shared record gets this
   Matrix mapping: state events carry sender + origin_server_ts
   We mirror that here with createdBy/updatedBy/timestamps
   ═══════════════════════════════════════════════════════════════════ */
const provenance = (user) => ({ createdBy: user, createdAt: now(), updatedBy: user, updatedAt: now(), history: [] });
const touch = (record, user, change) => ({
  ...record, updatedBy: user, updatedAt: now(),
  history: [...(record.history||[]), { by: user, at: now(), change }],
});

/* ═══════════════════════════════════════════════════════════════════
   SHARED REFERENCE DATA — maps to !org room state events
   ═══════════════════════════════════════════════════════════════════ */

// org.habeas.config.national
const DEFAULT_NATIONAL = {
  iceDirector: "Tom Homan", iceDirectorTitle: "Director",
  dhsSecretary: "Kristi Noem", attorneyGeneral: "Pam Bondi",
  ...provenance("@system"),
};

// org.habeas.facility.{id} — each a state event
const makeFacility = (d, user) => ({
  id: uid(), name: "", city: "", state: "", warden: "",
  fieldOfficeName: "", fieldOfficeDirector: "",
  ...provenance(user), ...d,
});

// org.habeas.court.{id}
const makeCourt = (d, user) => ({
  id: uid(), district: "", division: "",
  ...provenance(user), ...d,
});

// org.habeas.attorney.{id}
const makeAttorneyProfile = (d, user) => ({
  id: uid(), name: "", barNo: "", firm: "", address: "",
  cityStateZip: "", phone: "", fax: "", email: "", proHacVice: "",
  ...provenance(user), ...d,
});

const makeClient = (d={}) => ({ id:uid(), createdAt:now(), name:"",country:"",yearsInUS:"",entryDate:"",entryMethod:"without inspection",apprehensionLocation:"",apprehensionDate:"",criminalHistory:"has no criminal record",communityTies:"",...d });

/* ═══════════════════════════════════════════════════════════════════ */
const FACILITY_FIELDS = [
  {key:"name",label:"Facility Name",ph:"South Louisiana ICE Processing Center"},
  {key:"city",label:"City",ph:"Basile"},{key:"state",label:"State",ph:"Louisiana"},
  {key:"warden",label:"Warden",ph:"John Smith"},
  {key:"fieldOfficeName",label:"Field Office",ph:"New Orleans Field Office"},
  {key:"fieldOfficeDirector",label:"Field Office Director",ph:"Jane Doe"},
];
const COURT_FIELDS = [
  {key:"district",label:"District",ph:"Middle District of Tennessee"},
  {key:"division",label:"Division",ph:"Nashville Division"},
];
const NATIONAL_FIELDS = [
  {key:"iceDirector",label:"ICE Director",ph:"Tom Homan"},
  {key:"iceDirectorTitle",label:"ICE Title",ph:"Director"},
  {key:"dhsSecretary",label:"DHS Secretary",ph:"Kristi Noem"},
  {key:"attorneyGeneral",label:"Attorney General",ph:"Pam Bondi"},
];
const ATT_PROFILE_FIELDS = [
  {key:"name",label:"Name"},{key:"barNo",label:"Bar No."},{key:"firm",label:"Firm"},
  {key:"address",label:"Address"},{key:"cityStateZip",label:"City/St/Zip"},
  {key:"phone",label:"Phone"},{key:"fax",label:"Fax"},{key:"email",label:"Email"},
  {key:"proHacVice",label:"Pro Hac Vice",ph:"*Pro hac vice pending"},
];
const CLIENT_FIELDS = [
  {key:"name",label:"Full Name",ph:"Juan Carlos Rivera"},{key:"country",label:"Country",ph:"Honduras"},
  {key:"yearsInUS",label:"Years in U.S.",ph:"12"},{key:"entryDate",label:"Entry Date",ph:"approximately 2013"},
  {key:"entryMethod",label:"Entry Method",ph:"without inspection"},
  {key:"apprehensionLocation",label:"Arrest Location",ph:"Nashville, Tennessee"},
  {key:"apprehensionDate",label:"Arrest Date",ph:"January 15, 2026"},
  {key:"criminalHistory",label:"Criminal History",ph:"has no criminal record"},
  {key:"communityTies",label:"Community Ties",ph:"has strong family and community ties"},
];
const FILING_FIELDS = [
  {key:"filingDate",label:"Filing Date",ph:"February 19, 2026"},
  {key:"filingDay",label:"Filing Day",ph:"19th"},
  {key:"filingMonthYear",label:"Month & Year",ph:"February, 2026"},
];

function buildVarMap(c,p,a1,a2,nat) {
  c=c||{};p=p||{};a1=a1||{};a2=a2||{};nat=nat||{};
  return {
    COURT_DISTRICT:p.district||"",COURT_DIVISION:p.division||"",CASE_NUMBER:p.caseNumber||"",
    PETITIONER_FULL_NAME:c.name||"",PETITIONER_COUNTRY:c.country||"",
    PETITIONER_YEARS_IN_US:c.yearsInUS||"",PETITIONER_ENTRY_DATE:c.entryDate||"",
    PETITIONER_ENTRY_METHOD:c.entryMethod||"",
    PETITIONER_APPREHENSION_LOCATION:c.apprehensionLocation||"",
    PETITIONER_APPREHENSION_DATE:c.apprehensionDate||"",
    PETITIONER_CRIMINAL_HISTORY:c.criminalHistory||"",
    PETITIONER_COMMUNITY_TIES:c.communityTies||"",
    DETENTION_FACILITY_NAME:p.facilityName||"",DETENTION_FACILITY_CITY:p.facilityCity||"",
    DETENTION_FACILITY_STATE:p.facilityState||"",
    WARDEN_NAME:p.warden||"",FIELD_OFFICE_DIRECTOR:p.fieldOfficeDirector||"",
    FIELD_OFFICE_NAME:p.fieldOfficeName||"",
    ICE_DIRECTOR:nat.iceDirector||"",ICE_DIRECTOR_TITLE:nat.iceDirectorTitle||"",
    DHS_SECRETARY:nat.dhsSecretary||"",ATTORNEY_GENERAL:nat.attorneyGeneral||"",
    FILING_DATE:p.filingDate||"",FILING_DAY:p.filingDay||"",FILING_MONTH_YEAR:p.filingMonthYear||"",
    ATTORNEY1_NAME:a1.name||"",ATTORNEY1_BAR_NO:a1.barNo||"",ATTORNEY1_FIRM:a1.firm||"",
    ATTORNEY1_ADDRESS:a1.address||"",ATTORNEY1_CITY_STATE_ZIP:a1.cityStateZip||"",
    ATTORNEY1_PHONE:a1.phone||"",ATTORNEY1_FAX:a1.fax||"",ATTORNEY1_EMAIL:a1.email||"",
    ATTORNEY2_NAME:a2.name||"",ATTORNEY2_BAR_NO:a2.barNo||"",ATTORNEY2_FIRM:a2.firm||"",
    ATTORNEY2_ADDRESS:a2.address||"",ATTORNEY2_CITY_STATE_ZIP:a2.cityStateZip||"",
    ATTORNEY2_PHONE:a2.phone||"",ATTORNEY2_EMAIL:a2.email||"",ATTORNEY2_PRO_HAC:a2.proHacVice||"",
  };
}

/* ── Blocks (condensed) ──────────────────────────────────────────── */
const DEFAULT_BLOCKS=[
  {id:"ct-1",type:"title",content:"UNITED STATES DISTRICT COURT"},
  {id:"ct-2",type:"title",content:"FOR THE {{COURT_DISTRICT}}"},
  {id:"ct-3",type:"title",content:"{{COURT_DIVISION}}"},
  {id:"cap-pet",type:"cap-name",content:"{{PETITIONER_FULL_NAME}},"},
  {id:"cap-role",type:"cap-center",content:"Petitioner-Plaintiff,"},
  {id:"cap-v",type:"cap-center",content:"v."},
  {id:"cap-r1",type:"cap-resp",content:"{{WARDEN_NAME}}, Warden of {{DETENTION_FACILITY_NAME}};"},
  {id:"cap-r2",type:"cap-resp",content:"{{FIELD_OFFICE_DIRECTOR}}, FOD, {{FIELD_OFFICE_NAME}}, ERO, ICE;"},
  {id:"cap-r3",type:"cap-resp",content:"U.S. Department of Homeland Security;"},
  {id:"cap-r4",type:"cap-resp",content:"{{ICE_DIRECTOR}}, {{ICE_DIRECTOR_TITLE}}, ICE, DHS;"},
  {id:"cap-r5",type:"cap-resp",content:"{{DHS_SECRETARY}}, Secretary, DHS; and"},
  {id:"cap-r6",type:"cap-resp",content:"{{ATTORNEY_GENERAL}}, Attorney General; Respondents-Defendants."},
  {id:"cap-case",type:"cap-case",content:"C/A No. {{CASE_NUMBER}}"},
  {id:"cap-title",type:"cap-doctitle",content:"PETITION FOR WRIT OF HABEAS CORPUS AND COMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF"},
  {id:"h-intro",type:"heading",content:"INTRODUCTION"},
  {id:"p-1",type:"para",content:'1. {{PETITIONER_FULL_NAME}} ("Petitioner") is a citizen of {{PETITIONER_COUNTRY}} who has resided in the U.S. for {{PETITIONER_YEARS_IN_US}} years. ICE apprehended him in {{PETITIONER_APPREHENSION_LOCATION}} on or about {{PETITIONER_APPREHENSION_DATE}}.'},
  {id:"p-2",type:"para",content:"2. Petitioner is detained at {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}."},
  {id:"p-3",type:"para",content:'3. The BIA reinterpreted the INA. <em>Matter of Yajure Hurtado</em>, 29 I&N Dec. 216 (BIA 2025). Petitioner is subject to mandatory detention under § 1225(b)(2)(A) with no bond.'},
  {id:"p-4",type:"para",content:'4. This violates the INA. Petitioner, residing nearly {{PETITIONER_YEARS_IN_US}} years, is not an "applicant for admission." He should be under § 1226(a), which allows bond.'},
  {id:"p-5",type:"para",content:"5. Petitioner seeks declaratory relief under § 1226(a) and asks for release or a bond hearing."},
  {id:"h-cust",type:"heading",content:"CUSTODY"},
  {id:"p-6",type:"para",content:'6. Petitioner is in ICE custody at {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}. <em>Jones v. Cunningham</em>, 371 U.S. 236, 243 (1963).'},
  {id:"h-jur",type:"heading",content:"JURISDICTION"},
  {id:"p-7",type:"para",content:"7. Jurisdiction under 28 U.S.C. § 2241, § 1331, the Suspension Clause, and the INA."},
  {id:"h-ven",type:"heading",content:"VENUE"},
  {id:"p-12",type:"para",content:"12. Venue proper under 28 U.S.C. § 1391(e). Petitioner is under ICE's {{FIELD_OFFICE_NAME}} and detained at {{DETENTION_FACILITY_NAME}}."},
  {id:"h-par",type:"heading",content:"PARTIES"},
  {id:"p-16",type:"para",content:"16. Petitioner {{PETITIONER_FULL_NAME}} is from {{PETITIONER_COUNTRY}}, in the U.S. since {{PETITIONER_ENTRY_DATE}}."},
  {id:"p-17",type:"para",content:"17–21. Respondents {{WARDEN_NAME}}, {{FIELD_OFFICE_DIRECTOR}}, {{ICE_DIRECTOR}}, {{DHS_SECRETARY}}, and {{ATTORNEY_GENERAL}} are sued in their official capacities."},
  {id:"h-leg",type:"heading",content:"LEGAL BACKGROUND"},
  {id:"p-22",type:"para",content:"22–37. § 1226(a) allows bond. § 1225(b) is for those seeking admission at borders. The BIA's reinterpretation in <em>Yajure Hurtado</em> is contrary to statute, regulations, and precedent. Under <em>Loper Bright</em>, 603 U.S. 369 (2024), no deference is owed."},
  {id:"h-facts",type:"heading",content:"STATEMENT OF FACTS"},
  {id:"p-38",type:"para",content:"38–43. Petitioner is from {{PETITIONER_COUNTRY}}, entered {{PETITIONER_ENTRY_METHOD}} in {{PETITIONER_ENTRY_DATE}}, {{PETITIONER_CRIMINAL_HISTORY}}, arrested in {{PETITIONER_APPREHENSION_LOCATION}} on {{PETITIONER_APPREHENSION_DATE}}, detained at {{DETENTION_FACILITY_NAME}}."},
  {id:"h-c1",type:"heading",content:"COUNT I — Violation of § 1226(a)"},
  {id:"p-45",type:"para",content:"45. Petitioner is entitled to a bond hearing under § 1226(a). His detention is unlawful."},
  {id:"h-c2",type:"heading",content:"COUNT II — Violation of Bond Regulations"},
  {id:"p-51",type:"para",content:"51. Application of § 1225(b)(2) violates 8 C.F.R. §§ 236.1, 1236.1, 1003.19."},
  {id:"h-c3",type:"heading",content:"COUNT III — Fifth Amendment Due Process"},
  {id:"p-57",type:"para",content:"57. Petitioner {{PETITIONER_CRIMINAL_HISTORY}} and {{PETITIONER_COMMUNITY_TIES}}. Risk of erroneous deprivation is high."},
  {id:"h-pray",type:"heading",content:"PRAYER FOR RELIEF"},
  {id:"p-pray",type:"para",content:"WHEREFORE: (1) jurisdiction; (2) expedited; (3) no transfer; (4) OSC; (5) declare unlawful; (6) Writ with bond hearing; (7) EAJA fees; (8) further relief."},
  {id:"sig-date",type:"sig",content:"Date: {{FILING_DATE}}"},
  {id:"sig-sub",type:"sig",content:"Respectfully Submitted,"},
  {id:"sig-a1",type:"sig",content:"/s/ {{ATTORNEY1_NAME}}\n{{ATTORNEY1_BAR_NO}}\n{{ATTORNEY1_FIRM}}\n{{ATTORNEY1_ADDRESS}}\n{{ATTORNEY1_CITY_STATE_ZIP}}\n{{ATTORNEY1_PHONE}} · {{ATTORNEY1_FAX}}\n{{ATTORNEY1_EMAIL}}"},
  {id:"sig-a2",type:"sig",content:"/s/ {{ATTORNEY2_NAME}}\n{{ATTORNEY2_BAR_NO}}*\n{{ATTORNEY2_FIRM}}\n{{ATTORNEY2_ADDRESS}}\n{{ATTORNEY2_CITY_STATE_ZIP}}\n{{ATTORNEY2_PHONE}}\n{{ATTORNEY2_EMAIL}}\n{{ATTORNEY2_PRO_HAC}}"},
  {id:"sig-role",type:"sig-label",content:"Attorneys for Petitioner"},
  {id:"h-ver",type:"heading",content:"VERIFICATION — 28 U.S.C. § 2242"},
  {id:"p-ver",type:"para",content:"I represent {{PETITIONER_FULL_NAME}} and verify the foregoing. Dated {{FILING_DAY}} day of {{FILING_MONTH_YEAR}}."},
  {id:"sig-ver",type:"sig",content:"/s/ {{ATTORNEY2_NAME}}\nAttorney for Petitioner Pro Hac Vice"},
];

const PAGE_W=816,PAGE_H=1056,MG=96,USABLE_H=PAGE_H-2*MG-28;
const CLS_MAP={title:"blk-title",heading:"blk-heading",para:"blk-para","cap-name":"blk-cap-name","cap-center":"blk-cap-center","cap-resp":"blk-cap-resp","cap-case":"blk-cap-case","cap-doctitle":"blk-cap-doctitle",sig:"blk-sig","sig-label":"blk-sig-label"};
const TITLE_IDS=new Set(["ct-1","ct-2","ct-3"]);
const CAP_L=["cap-pet","cap-role","cap-v","cap-r1","cap-r2","cap-r3","cap-r4","cap-r5","cap-r6"];
const CAP_R=["cap-case","cap-title"];
const CAP_ALL=new Set([...TITLE_IDS,...CAP_L,...CAP_R]);

/* ── Export ───────────────────────────────────────────────────────── */
function buildDocHTML(blocks,vars){
  const sub=s=>s.replace(/\{\{(\w+)\}\}/g,(_,k)=>vars[k]?.trim()||`[${k}]`);
  const cap=s=>sub(s).replace(/\n/g,"<br>");
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:1in}body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.35}.title{text-align:center;font-weight:bold;margin:0}.heading{font-weight:bold;text-transform:uppercase;margin:18pt 0 6pt}.para{margin:0 0 10pt;text-align:justify}.sig{white-space:pre-line;margin:0 0 10pt}.sig-label{font-style:italic}table.c{width:100%;border-collapse:collapse;margin:18pt 0}table.c td{vertical-align:top;padding:0 4pt}.cl{width:55%}.cm{width:5%;text-align:center}.cr{width:40%}.cn{text-align:center;font-weight:bold}.cc{text-align:center;margin:10pt 0}.rr{margin:0 0 8pt}.ck{margin:0 0 12pt}.cd{font-weight:bold}</style></head><body>${blocks.filter(b=>TITLE_IDS.has(b.id)).map(b=>`<div class="title">${cap(b.content)}</div>`).join("")}<table class="c"><tr><td class="cl">${blocks.filter(b=>CAP_L.includes(b.id)).map(b=>`<div class="${b.type==="cap-name"?"cn":b.type==="cap-center"?"cc":"rr"}">${cap(b.content)}</div>`).join("")}</td><td class="cm">${Array(24).fill(")").join("<br>")}</td><td class="cr">${blocks.filter(b=>CAP_R.includes(b.id)).map(b=>`<div class="${b.type==="cap-case"?"ck":"cd"}">${cap(b.content)}</div>`).join("")}</td></tr></table>${blocks.filter(b=>!CAP_ALL.has(b.id)).map(b=>`<div class="${b.type==="heading"?"heading":b.type==="sig"?"sig":b.type==="sig-label"?"sig-label":"para"}">${b.type==="heading"?cap(b.content).toUpperCase():cap(b.content)}</div>`).join("")}</body></html>`;
}
function doExportDoc(blocks,vars,name){
  const b=new Blob(['\ufeff'+buildDocHTML(blocks,vars)],{type:"application/msword"});
  const u=URL.createObjectURL(b),a=document.createElement("a");
  a.href=u;a.download=`habeas-${(name||"petition").replace(/\s+/g,"-").toLowerCase()}-${new Date().toISOString().slice(0,10)}.doc`;
  document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(u);},100);
}
function doExportPDF(blocks,vars){
  const w=window.open("","_blank","width=850,height=1100");
  if(!w){alert("Allow popups for PDF");return;}w.document.write(buildDocHTML(blocks,vars));w.document.close();setTimeout(()=>{w.focus();w.print();},500);
}

/* ── EditableBlock / PaginatedDoc ────────────────────────────────── */
function EditableBlock({block,vars,onEdit,readOnly}){
  const el=useRef(null),ed=useRef(false);
  const html=useCallback(c=>{let h=c.replace(/\n/g,"<br/>");return h.replace(/\{\{(\w+)\}\}/g,(_,k)=>{const v=vars[k]?.trim();return v?`<span data-var="${k}" contenteditable="false" class="vf">${v}</span>`:`<span data-var="${k}" contenteditable="false" class="ve">⟨${k}⟩</span>`;});},[vars]);
  const ext=useCallback(e=>{const c=e.cloneNode(true);c.querySelectorAll("br").forEach(b=>b.replaceWith("\n"));c.querySelectorAll("[data-var]").forEach(s=>s.replaceWith(`{{${s.dataset.var}}}`));return c.textContent||"";},[]);
  useEffect(()=>{if(!ed.current&&el.current)el.current.innerHTML=html(block.content);},[block.content,vars,html]);
  return <div ref={el} contentEditable={!readOnly} suppressContentEditableWarning
    onFocus={readOnly?undefined:()=>{ed.current=true;}}
    onBlur={readOnly?undefined:()=>{ed.current=false;if(!el.current)return;const nc=ext(el.current),n=s=>s.replace(/\s+/g," ").trim();if(n(nc)!==n(block.content))onEdit?.(block.id,nc,block.content);el.current.innerHTML=html(n(nc)!==n(block.content)?nc:block.content);}}
    className={`blk ${CLS_MAP[block.type]||"blk-para"}`} data-block-id={block.id}/>;
}

function PaginatedDoc({blocks,vars,onEdit,caseNo}){
  const mRef=useRef(null),[pages,setPages]=useState([]),[tick,setTick]=useState(0);
  const body=useMemo(()=>blocks.filter(b=>!CAP_ALL.has(b.id)),[blocks]);
  useEffect(()=>{setTick(t=>t+1);},[blocks,vars]);
  useLayoutEffect(()=>{const c=mRef.current;if(!c)return;const capH=c.querySelector("[data-mr='cap']")?.offsetHeight||0;const els=Array.from(c.querySelectorAll("[data-mr='body']>[data-block-id]"));const hs=els.map(e=>({id:e.dataset.blockId,h:e.offsetHeight}));const res=[];let cur=[],rem=USABLE_H-capH,pi=0;for(const{id,h}of hs){if(h>rem&&cur.length>0){res.push({ids:cur,first:pi===0});cur=[];rem=USABLE_H;pi++;}cur.push(id);rem-=h;}if(cur.length>0||res.length===0)res.push({ids:cur,first:pi===0});setPages(res);},[tick]);
  const bm=useMemo(()=>{const m={};blocks.forEach(b=>{m[b.id]=b;});return m;},[blocks]);
  const total=pages.length||1;
  const cap=(edit)=>(<>{blocks.filter(b=>TITLE_IDS.has(b.id)).map(b=><EditableBlock key={b.id} block={b} vars={vars} onEdit={edit?onEdit:()=>{}} readOnly={!edit}/>)}<div className="caption-grid"><div className="cap-left-col">{blocks.filter(b=>CAP_L.includes(b.id)).map(b=><EditableBlock key={b.id} block={b} vars={vars} onEdit={edit?onEdit:()=>{}} readOnly={!edit}/>)}</div><div className="cap-mid-col">{Array.from({length:24}).map((_,i)=><div key={i}>)</div>)}</div><div className="cap-right-col">{blocks.filter(b=>CAP_R.includes(b.id)).map(b=><EditableBlock key={b.id} block={b} vars={vars} onEdit={edit?onEdit:()=>{}} readOnly={!edit}/>)}</div></div></>);
  return (<><div ref={mRef} className="measure-box" aria-hidden="true"><div data-mr="cap">{cap(false)}</div><div data-mr="body">{body.map(b=><EditableBlock key={b.id} block={b} vars={vars} onEdit={()=>{}} readOnly/>)}</div></div>{pages.map((pg,pi)=>(<div key={pi} className="page-shell"><div className="page-paper"><div className="page-margin">{pg.first&&cap(true)}{pg.ids.map(id=>{const b=bm[id];return b?<EditableBlock key={b.id} block={b} vars={vars} onEdit={onEdit}/>:null;})}</div><div className="page-foot"><span>{caseNo}</span><span>Page {pi+1} of {total}</span></div></div></div>))}</>);
}

/* ── Reusable form components ────────────────────────────────────── */
function FieldGroup({title,fields,data,onChange}){
  return <div className="fg"><div className="fg-title">{title}</div>{fields.map(f=><div key={f.key} className="frow"><label className="flbl">{f.label}{data[f.key]?.trim()&&<span className="fchk">✓</span>}</label><input type="text" className="finp" value={data[f.key]||""} placeholder={f.ph||""} onChange={e=>onChange(f.key,e.target.value)}/></div>)}</div>;
}

function ProvenanceBadge({record}){
  if(!record?.createdBy) return null;
  return <div className="prov">
    <span className="prov-item">Created by <strong>{record.createdBy}</strong> {ts(record.createdAt)}</span>
    {record.updatedAt!==record.createdAt&&<span className="prov-item">Updated by <strong>{record.updatedBy}</strong> {ts(record.updatedAt)}</span>}
    {record.history?.length>0&&<details className="prov-details"><summary className="prov-sum">{record.history.length} change{record.history.length>1?"s":""}</summary>
      <div className="prov-log">{record.history.map((h,i)=><div key={i} className="prov-entry"><span className="prov-ts">{ts(h.at)}</span> <strong>{h.by}</strong>: {h.change}</div>)}</div>
    </details>}
  </div>;
}

function Picker({label,items,displayKey,value,onChange,onNew}){
  return <div className="picker">
    <label className="flbl">{label}</label>
    <div className="picker-row">
      <select className="finp picker-sel" value={value||""} onChange={e=>onChange(e.target.value)}>
        <option value="">— Select —</option>
        {items.map(it=><option key={it.id} value={it.id}>{typeof displayKey==="function"?displayKey(it):it[displayKey]||it.id}</option>)}
      </select>
      {onNew&&<button className="hbtn sm" onClick={onNew}>+</button>}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════════
   DIRECTORY VIEW — manage shared reference data
   Maps to !org room: each record = state event, edits = timeline events
   ═══════════════════════════════════════════════════════════════════ */
function DirectoryView({facilities,courts,national,attProfiles,currentUser,onUpdateFacility,onDeleteFacility,onAddFacility,onUpdateCourt,onDeleteCourt,onAddCourt,onUpdateNational,onUpdateAttProfile,onDeleteAttProfile,onAddAttProfile}){
  const [tab,setTab]=useState("facilities");
  const [editId,setEditId]=useState(null);
  const [draft,setDraft]=useState({});

  const startEdit=(record)=>{setEditId(record.id);setDraft({...record});};
  const cancelEdit=()=>{setEditId(null);setDraft({});};

  return <div className="dir-view">
    <div className="dir-tabs">
      {[["facilities",`Facilities (${Object.keys(facilities).length})`],["courts",`Courts (${Object.keys(courts).length})`],["attorneys",`Attorney Profiles (${Object.keys(attProfiles).length})`],["national","National Defaults"]].map(([k,l])=>
        <button key={k} className={`dir-tab ${tab===k?"on":""}`} onClick={()=>{setTab(k);cancelEdit();}}>{l}</button>
      )}
    </div>
    <div className="dir-body">

      {/* ── Facilities ─────────────────────────── */}
      {tab==="facilities"&&<div className="dir-section">
        <div className="dir-head"><h3>Detention Facilities</h3><button className="hbtn accent" onClick={()=>{const f=onAddFacility();startEdit(f);}}>+ Add Facility</button></div>
        <p className="dir-desc">Each facility bundles its warden, location, and linked field office. Selecting a facility on a petition auto-fills all six fields.</p>
        <p className="dir-matrix">Matrix: <code>org.habeas.facility.&#123;id&#125;</code> state event in <code>!org</code> room</p>
        <div className="dir-list">
          {Object.values(facilities).map(f=>(
            <div key={f.id} className={`dir-card ${editId===f.id?"editing":""}`}>
              {editId===f.id?<>
                {FACILITY_FIELDS.map(ff=><div key={ff.key} className="frow"><label className="flbl">{ff.label}</label><input className="finp" value={draft[ff.key]||""} placeholder={ff.ph||""} onChange={e=>setDraft(d=>({...d,[ff.key]:e.target.value}))}/></div>)}
                <div className="dir-card-actions"><button className="hbtn accent" onClick={()=>{onUpdateFacility(draft);cancelEdit();}}>Save</button><button className="hbtn" onClick={cancelEdit}>Cancel</button><button className="hbtn danger" onClick={()=>{onDeleteFacility(f.id);cancelEdit();}}>Delete</button></div>
              </>:<>
                <div className="dir-card-head" onClick={()=>startEdit(f)}>
                  <strong>{f.name||"Unnamed Facility"}</strong>
                  <span className="dir-card-sub">{f.city}, {f.state}</span>
                </div>
                <div className="dir-card-detail">Warden: {f.warden||"—"} · FO: {f.fieldOfficeName||"—"} · FOD: {f.fieldOfficeDirector||"—"}</div>
                <ProvenanceBadge record={f}/>
              </>}
            </div>
          ))}
          {Object.keys(facilities).length===0&&<div className="dir-empty">No facilities yet. Add one to get started.</div>}
        </div>
      </div>}

      {/* ── Courts ─────────────────────────────── */}
      {tab==="courts"&&<div className="dir-section">
        <div className="dir-head"><h3>Courts</h3><button className="hbtn accent" onClick={()=>{const c=onAddCourt();startEdit(c);}}>+ Add Court</button></div>
        <p className="dir-desc">District + division combos. Selecting a court on a petition fills both fields.</p>
        <p className="dir-matrix">Matrix: <code>org.habeas.court.&#123;id&#125;</code> state event in <code>!org</code> room</p>
        <div className="dir-list">
          {Object.values(courts).map(c=>(
            <div key={c.id} className={`dir-card ${editId===c.id?"editing":""}`}>
              {editId===c.id?<>
                {COURT_FIELDS.map(ff=><div key={ff.key} className="frow"><label className="flbl">{ff.label}</label><input className="finp" value={draft[ff.key]||""} placeholder={ff.ph||""} onChange={e=>setDraft(d=>({...d,[ff.key]:e.target.value}))}/></div>)}
                <div className="dir-card-actions"><button className="hbtn accent" onClick={()=>{onUpdateCourt(draft);cancelEdit();}}>Save</button><button className="hbtn" onClick={cancelEdit}>Cancel</button><button className="hbtn danger" onClick={()=>{onDeleteCourt(c.id);cancelEdit();}}>Delete</button></div>
              </>:<>
                <div className="dir-card-head" onClick={()=>startEdit(c)}><strong>{c.district||"Unnamed"}</strong><span className="dir-card-sub">{c.division}</span></div>
                <ProvenanceBadge record={c}/>
              </>}
            </div>
          ))}
          {Object.keys(courts).length===0&&<div className="dir-empty">No courts yet.</div>}
        </div>
      </div>}

      {/* ── Attorney Profiles ──────────────────── */}
      {tab==="attorneys"&&<div className="dir-section">
        <div className="dir-head"><h3>Attorney Profiles</h3><button className="hbtn accent" onClick={()=>{const a=onAddAttProfile();startEdit(a);}}>+ Add Attorney</button></div>
        <p className="dir-desc">Reusable attorney profiles. Select as Attorney 1 or 2 on any petition.</p>
        <p className="dir-matrix">Matrix: <code>org.habeas.attorney.&#123;id&#125;</code> state event in <code>!org</code> room</p>
        <div className="dir-list">
          {Object.values(attProfiles).map(a=>(
            <div key={a.id} className={`dir-card ${editId===a.id?"editing":""}`}>
              {editId===a.id?<>
                {ATT_PROFILE_FIELDS.map(ff=><div key={ff.key} className="frow"><label className="flbl">{ff.label}</label><input className="finp" value={draft[ff.key]||""} placeholder={ff.ph||""} onChange={e=>setDraft(d=>({...d,[ff.key]:e.target.value}))}/></div>)}
                <div className="dir-card-actions"><button className="hbtn accent" onClick={()=>{onUpdateAttProfile(draft);cancelEdit();}}>Save</button><button className="hbtn" onClick={cancelEdit}>Cancel</button><button className="hbtn danger" onClick={()=>{onDeleteAttProfile(a.id);cancelEdit();}}>Delete</button></div>
              </>:<>
                <div className="dir-card-head" onClick={()=>startEdit(a)}><strong>{a.name||"Unnamed"}</strong><span className="dir-card-sub">{a.firm} · {a.barNo}</span></div>
                <div className="dir-card-detail">{a.email} · {a.phone}</div>
                <ProvenanceBadge record={a}/>
              </>}
            </div>
          ))}
          {Object.keys(attProfiles).length===0&&<div className="dir-empty">No attorney profiles yet.</div>}
        </div>
      </div>}

      {/* ── National ───────────────────────────── */}
      {tab==="national"&&<div className="dir-section">
        <div className="dir-head"><h3>National Defaults</h3></div>
        <p className="dir-desc">These auto-fill on every petition. Update when officials change.</p>
        <p className="dir-matrix">Matrix: <code>org.habeas.config.national</code> state event in <code>!org</code> room</p>
        <div className="dir-card editing">
          {NATIONAL_FIELDS.map(f=><div key={f.key} className="frow"><label className="flbl">{f.label}</label><input className="finp" value={national[f.key]||""} placeholder={f.ph||""} onChange={e=>onUpdateNational(f.key,e.target.value)}/></div>)}
          <ProvenanceBadge record={national}/>
        </div>
      </div>}
    </div>
  </div>;
}

/* ── Kanban ───────────────────────────────────────────────────────── */
function Kanban({petitions,clients,role,user,onOpen,onAdvance,onRevert}){
  const all=Object.values(petitions);
  const vis=role==="admin"?all:all.filter(p=>p.createdBy===user);
  return <div className="kanban">{STAGES.map(stage=>{
    const items=vis.filter(p=>p.stage===stage).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const m=SM[stage];
    return <div key={stage} className="kb-col">
      <div className="kb-col-head" style={{borderBottomColor:m.color}}><span className="kb-col-title">{m.label}</span><span className="kb-col-count" style={{background:m.color}}>{items.length}</span></div>
      <div className="kb-col-body">{items.length===0&&<div className="kb-empty">None</div>}
        {items.map(p=>{const cl=clients[p.clientId];const si=STAGES.indexOf(p.stage);return <div key={p.id} className="kb-card" style={{borderLeftColor:m.color}}>
          <div className="kb-card-name" onClick={()=>onOpen(p.id)}>{cl?.name||"Unnamed"}</div>
          <div className="kb-card-meta">{p.caseNumber||"No case no."}{p.district?` · ${p.district}`:""}</div>
          <div className="kb-card-meta">{p.facilityName||""}</div>
          <div className="kb-card-date">{new Date(p.createdAt).toLocaleDateString()}</div>
          {p.stageHistory?.length>1&&<div className="kb-dots">{p.stageHistory.map((sh,i)=><span key={i} className="kb-dot" style={{background:SM[sh.stage]?.color}} title={`${sh.stage} ${ts(sh.at)}`}/>)}</div>}
          <div className="kb-card-actions">{si>0&&<button className="kb-btn" onClick={()=>onRevert(p.id)}>← {STAGES[si-1]}</button>}{si<STAGES.length-1&&<button className="kb-btn accent" onClick={()=>onAdvance(p.id)}>{STAGES[si+1]} →</button>}</div>
        </div>;})}
      </div>
    </div>;
  })}</div>;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */
export default function App(){
  const [facilities,setFacilities]=useState({});
  const [courts,setCourts]=useState({});
  const [national,setNational]=useState({...DEFAULT_NATIONAL});
  const [attProfiles,setAttProfiles]=useState({});
  const [clients,setClients]=useState({});
  const [petitions,setPetitions]=useState({});
  const [log,setLog]=useState([]);
  const [view,setView]=useState("board");
  const [selClient,setSelClient]=useState(null);
  const [selPetition,setSelPetition]=useState(null);
  const [editorTab,setEditorTab]=useState("client");
  const [role,setRole]=useState("admin");
  const [user]=useState("@attorney:server");
  const logEndRef=useRef(null);
  const push=useCallback(e=>setLog(p=>[...p,e]),[]);

  // Directory CRUD
  const addFacility=()=>{const f=makeFacility({},user);setFacilities(p=>({...p,[f.id]:f}));push(eo("CREATE",f.id,null,{entity:"facility"}));return f;};
  const updateFacility=(d)=>{setFacilities(p=>({...p,[d.id]:touch({...p[d.id],...d},user,`updated ${Object.keys(d).filter(k=>k!=="id"&&k!=="history"&&k!=="createdBy"&&k!=="createdAt").join(", ")}`)}));push(eo("UPDATE",d.id,null,{entity:"facility"}));};
  const deleteFacility=(id)=>{setFacilities(p=>{const n={...p};delete n[id];return n;});push(eo("DELETE",id,null,{entity:"facility"}));};
  const addCourt=()=>{const c=makeCourt({},user);setCourts(p=>({...p,[c.id]:c}));push(eo("CREATE",c.id,null,{entity:"court"}));return c;};
  const updateCourt=(d)=>{setCourts(p=>({...p,[d.id]:touch({...p[d.id],...d},user,`updated`)}));push(eo("UPDATE",d.id,null,{entity:"court"}));};
  const deleteCourt=(id)=>{setCourts(p=>{const n={...p};delete n[id];return n;});push(eo("DELETE",id,null,{entity:"court"}));};
  const updateNational=(key,val)=>{setNational(p=>touch({...p,[key]:val},user,`${key} → ${val}`));push(eo("UPDATE","national",val,{field:key}));};
  const addAttProfile=()=>{const a=makeAttorneyProfile({},user);setAttProfiles(p=>({...p,[a.id]:a}));push(eo("CREATE",a.id,null,{entity:"attorney_profile"}));return a;};
  const updateAttProfile=(d)=>{setAttProfiles(p=>({...p,[d.id]:touch({...p[d.id],...d},user,`updated`)}));push(eo("UPDATE",d.id,null,{entity:"attorney_profile"}));};
  const deleteAttProfile=(id)=>{setAttProfiles(p=>{const n={...p};delete n[id];return n;});push(eo("DELETE",id,null,{entity:"attorney_profile"}));};

  // Client/petition CRUD
  const createClient=()=>{const c=makeClient();setClients(p=>({...p,[c.id]:c}));push(eo("CREATE",c.id,null,{entity:"client"}));setSelClient(c.id);setView("clients");};
  const updateClient=(id,key,val)=>{setClients(p=>({...p,[id]:{...p[id],[key]:val}}));push(eo("FILL",`client.${key}`,val,{entity:"client",id}));};
  const createPetition=(clientId)=>{
    const p={id:uid(),clientId,createdBy:user,stage:"drafted",stageHistory:[{stage:"drafted",at:now()}],
      blocks:DEFAULT_BLOCKS.map(b=>({...b})),
      district:"",division:"",caseNumber:"",facilityName:"",facilityCity:"",facilityState:"",
      warden:"",fieldOfficeDirector:"",fieldOfficeName:"",
      filingDate:"",filingDay:"",filingMonthYear:"",createdAt:now()};
    setPetitions(prev=>({...prev,[p.id]:p}));push(eo("CREATE",p.id,null,{entity:"petition",clientId}));
    setSelPetition(p.id);setEditorTab("court");setView("editor");
  };
  const updatePetition=(id,key,val)=>{setPetitions(p=>({...p,[id]:{...p[id],[key]:val}}));push(eo("FILL",`petition.${key}`,val,{entity:"petition",id}));};
  const applyFacility=(petId,facId)=>{
    const f=facilities[facId];if(!f)return;
    setPetitions(p=>({...p,[petId]:{...p[petId],facilityName:f.name,facilityCity:f.city,facilityState:f.state,warden:f.warden,fieldOfficeName:f.fieldOfficeName,fieldOfficeDirector:f.fieldOfficeDirector,_facilityId:facId}}));
    push(eo("APPLY","facility",facId,{petition:petId}));
  };
  const applyCourt=(petId,courtId)=>{
    const c=courts[courtId];if(!c)return;
    setPetitions(p=>({...p,[petId]:{...p[petId],district:c.district,division:c.division,_courtId:courtId}}));
    push(eo("APPLY","court",courtId,{petition:petId}));
  };
  const changeStage=(id,dir)=>{setPetitions(p=>{const pet=p[id];if(!pet)return p;const idx=STAGES.indexOf(pet.stage);const ni=dir==="advance"?idx+1:idx-1;if(ni<0||ni>=STAGES.length)return p;const next=STAGES[ni];push(eo("STAGE",id,next,{prior:pet.stage}));return{...p,[id]:{...pet,stage:next,stageHistory:[...pet.stageHistory,{stage:next,at:now()}]}};});};

  const pet=selPetition?petitions[selPetition]:null;
  const client=pet?clients[pet.clientId]:selClient?clients[selClient]:null;
  // Get selected attorney profiles for this petition
  const att1=pet?._att1Id?attProfiles[pet._att1Id]:null;
  const att2=pet?._att2Id?attProfiles[pet._att2Id]:null;
  const vars=pet?buildVarMap(client,pet,att1,att2,national):{};
  const caseNo=pet?.caseNumber?.trim()?`C/A No. ${pet.caseNumber}`:"";

  const handleBlockEdit=useCallback((bid,nc,oc)=>{
    if(!pet)return;
    setPetitions(p=>({...p,[pet.id]:{...p[pet.id],blocks:p[pet.id].blocks.map(b=>b.id===bid?{...b,content:nc}:b)}}));
    push(eo("REVISE",bid,nc,{prior:oc,petition:pet.id}));
  },[pet,push]);

  const clientList=Object.values(clients);
  const clientPets=client?Object.values(petitions).filter(p=>p.clientId===client.id):[];
  const attList=Object.values(attProfiles);

  return <div className="root">
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <style>{STYLES}</style>

    <header className="hdr">
      <div className="hdr-left">
        <span className="hdr-brand">Habeas</span>
        <nav className="hdr-nav">
          {[["board","Board"],["clients","Clients"],["directory","Directory"],pet&&["editor","Editor"]].filter(Boolean).map(([k,l])=>
            <button key={k} className={`nav-btn ${view===k?"on":""}`} onClick={()=>setView(k)}>{l}</button>
          )}
        </nav>
      </div>
      <div className="hdr-right">
        <button className={`role-btn ${role==="admin"?"admin":""}`} onClick={()=>setRole(r=>r==="admin"?"attorney":"admin")}>{role==="admin"?"🔑 Admin":"👤 Attorney"}</button>
        {pet&&<>
          <span className="stage-badge" style={{background:SM[pet.stage].color}}>{pet.stage}</span>
          <button className="hbtn export" onClick={()=>doExportDoc(pet.blocks,vars,client?.name)}>⬇ Word</button>
          <button className="hbtn export" onClick={()=>doExportPDF(pet.blocks,vars)}>⬇ PDF</button>
        </>}
      </div>
    </header>

    {view==="board"&&<div className="board-view">
      <Kanban petitions={petitions} clients={clients} role={role} user={user}
        onOpen={id=>{setSelPetition(id);setView("editor");}}
        onAdvance={id=>changeStage(id,"advance")} onRevert={id=>changeStage(id,"revert")}/>
      {Object.keys(petitions).length===0&&<div className="board-empty"><p>No petitions yet. Go to <strong>Clients</strong> to create one, or set up <strong>Directory</strong> first.</p></div>}
    </div>}

    {view==="directory"&&<DirectoryView
      facilities={facilities} courts={courts} national={national} attProfiles={attProfiles} currentUser={user}
      onAddFacility={addFacility} onUpdateFacility={updateFacility} onDeleteFacility={deleteFacility}
      onAddCourt={addCourt} onUpdateCourt={updateCourt} onDeleteCourt={deleteCourt}
      onUpdateNational={updateNational}
      onAddAttProfile={addAttProfile} onUpdateAttProfile={updateAttProfile} onDeleteAttProfile={deleteAttProfile}
    />}

    {view==="clients"&&<div className="clients-view">
      <div className="cv-sidebar">
        <div className="cv-head"><span className="cv-title">Clients</span><button className="hbtn accent" onClick={createClient}>+ New</button></div>
        <div className="cv-list">{clientList.length===0&&<div className="cv-empty">No clients yet.</div>}
          {clientList.map(c=>{const pets=Object.values(petitions).filter(p=>p.clientId===c.id);return <div key={c.id} className={`cv-item ${selClient===c.id?"on":""}`} onClick={()=>setSelClient(c.id)}>
            <div className="cv-item-name">{c.name||"Unnamed"}</div><div className="cv-item-meta">{c.country}{pets.length>0&&` · ${pets.length} pet.`}</div>
            {pets.map(p=><span key={p.id} className="stage-badge sm" style={{background:SM[p.stage].color}}>{p.stage}</span>)}
          </div>;})}</div>
      </div>
      <div className="cv-detail">{client?<>
        <div className="cv-detail-head"><h2>{client.name||"New Client"}</h2><button className="hbtn accent" onClick={()=>createPetition(client.id)}>+ New Petition</button></div>
        <FieldGroup title="Client Information" fields={CLIENT_FIELDS} data={client} onChange={(k,v)=>updateClient(client.id,k,v)}/>
        {clientPets.length>0&&<div className="fg"><div className="fg-title">Petitions</div>{clientPets.map(p=><div key={p.id} className="pet-row" onClick={()=>{setSelPetition(p.id);setView("editor");}}>
          <span className="stage-badge" style={{background:SM[p.stage].color}}>{p.stage}</span>
          <span style={{flex:1,fontSize:12}}>{p.caseNumber||"No case no."}</span>
          <span style={{fontSize:11,color:"#aaa"}}>{new Date(p.createdAt).toLocaleDateString()}</span>
        </div>)}</div>}
      </>:<div className="cv-empty-detail"><div style={{fontSize:48,opacity:.3,marginBottom:16}}>⚖</div><p>Select or create a client.</p></div>}</div>
    </div>}

    {view==="editor"&&pet&&<div className="editor-view">
      <div className="ed-sidebar">
        <div className="ed-tabs">
          {[["client","Client"],["court","Court + Facility"],["atty","Attorneys"],["filing","Filing"],["log",`Log (${log.length})`]].map(([k,l])=>
            <button key={k} className={`ed-tab ${editorTab===k?"on":""}`} onClick={()=>setEditorTab(k)}>{l}</button>
          )}
        </div>
        <div className="ed-fields">
          {editorTab==="client"&&client&&<FieldGroup title="Client (shared)" fields={CLIENT_FIELDS} data={client} onChange={(k,v)=>updateClient(client.id,k,v)}/>}

          {editorTab==="court"&&<>
            <Picker label="Select Court" items={Object.values(courts)} displayKey={c=>`${c.district} — ${c.division}`} value={pet._courtId||""} onChange={v=>applyCourt(pet.id,v)} onNew={()=>{addCourt();setView("directory");}}/>
            <FieldGroup title="Court (manual override)" fields={COURT_FIELDS} data={pet} onChange={(k,v)=>updatePetition(pet.id,k,v)}/>
            <div style={{height:8}}/>
            <Picker label="Select Facility" items={Object.values(facilities)} displayKey={f=>`${f.name} — ${f.city}, ${f.state}`} value={pet._facilityId||""} onChange={v=>applyFacility(pet.id,v)} onNew={()=>{addFacility();setView("directory");}}/>
            <FieldGroup title="Facility (manual override)" fields={FACILITY_FIELDS} data={pet} onChange={(k,v)=>updatePetition(pet.id,k,v)}/>
            <FieldGroup title="Respondents (manual override)" fields={RESPONDENT_FIELDS} data={pet} onChange={(k,v)=>updatePetition(pet.id,k,v)}/>
          </>}

          {editorTab==="atty"&&<>
            <Picker label="Attorney 1" items={attList} displayKey={a=>`${a.name} — ${a.firm}`} value={pet._att1Id||""} onChange={v=>{setPetitions(p=>({...p,[pet.id]:{...p[pet.id],_att1Id:v}}));push(eo("APPLY","att1",v,{petition:pet.id}));}} onNew={()=>{addAttProfile();setView("directory");}}/>
            <Picker label="Attorney 2" items={attList} displayKey={a=>`${a.name} — ${a.firm}`} value={pet._att2Id||""} onChange={v=>{setPetitions(p=>({...p,[pet.id]:{...p[pet.id],_att2Id:v}}));push(eo("APPLY","att2",v,{petition:pet.id}));}} onNew={()=>{addAttProfile();setView("directory");}}/>
            {!pet._att1Id&&!pet._att2Id&&<p style={{fontSize:11,color:"#aaa",marginTop:8}}>Select attorney profiles from the Directory, or add new ones with +</p>}
          </>}

          {editorTab==="filing"&&<FieldGroup title="Filing" fields={FILING_FIELDS} data={pet} onChange={(k,v)=>updatePetition(pet.id,k,v)}/>}

          {editorTab==="log"&&<div className="lscroll">
            {log.length===0&&<div className="lempty">No operations yet.</div>}
            {log.map((e,i)=>{const c={FILL:"#5aa06f",REVISE:"#c9a040",CREATE:"#7a70c0",STAGE:"#4a7ab5",APPLY:"#60a0d0",UPDATE:"#a08540",DELETE:"#c05050"}[e.op]||"#888";
              return <div key={i} className="lentry"><span className="lts">{new Date(e.frame.t).toLocaleTimeString("en-US",{hour12:false})}</span>{" "}<span style={{color:c,fontWeight:600}}>{e.op}</span><span className="ld">(</span><span className="lt">{e.target}</span>{e.payload!=null&&<><span className="ld">, </span><span className="lp">{typeof e.payload==="string"?`"${e.payload.slice(0,25)}${e.payload.length>25?"…":""}"`:"…"}</span></>}<span className="ld">)</span></div>;
            })}
            <div ref={logEndRef}/>
          </div>}
        </div>
      </div>
      <div className="doc-scroll">
        <PaginatedDoc blocks={pet.blocks} vars={vars} onEdit={handleBlockEdit} caseNo={caseNo}/>
        <div style={{height:60,flexShrink:0}}/>
      </div>
    </div>}
  </div>;
}

/* ═══════════════════════════════════════════════════════════════════ */
const RESPONDENT_FIELDS=[{key:"warden",label:"Warden"},{key:"fieldOfficeDirector",label:"FOD"},{key:"fieldOfficeName",label:"Field Office"}];
const STYLES=`
*{box-sizing:border-box}
.root{display:flex;flex-direction:column;height:100vh;font-family:"DM Sans",sans-serif;background:#e8e6e0;color:#1a1a20}
.hdr{background:#141420;color:#d4d0c8;padding:0 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:2px solid #a08540;height:46px}
.hdr-left{display:flex;align-items:center;gap:18px}.hdr-right{display:flex;align-items:center;gap:8px}
.hdr-brand{font-weight:700;font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:#a08540}
.hdr-nav{display:flex;gap:2px}
.nav-btn{padding:12px 14px;font-family:inherit;font-size:11px;font-weight:500;color:#8a8a9a;background:0 0;border:0;cursor:pointer;border-bottom:2px solid transparent}
.nav-btn.on{color:#e8e4d0;border-bottom-color:#a08540}
.hbtn{padding:5px 12px;font-family:inherit;font-size:11px;font-weight:500;color:#a08540;background:0 0;border:1px solid #3a3a4e;border-radius:3px;cursor:pointer;white-space:nowrap}
.hbtn:hover{background:#1e1e30}.hbtn.accent{background:#a08540;color:#141420;border-color:#a08540}.hbtn.accent:hover{background:#b89550}
.hbtn.export{background:#262638;border-color:#4a4a60}.hbtn.danger{color:#c05050;border-color:#c05050}.hbtn.sm{padding:5px 8px}
.role-btn{padding:5px 12px;font-family:inherit;font-size:11px;font-weight:600;color:#8a8a9a;background:#1a1a2e;border:1px solid #3a3a4e;border-radius:3px;cursor:pointer}
.role-btn.admin{color:#a08540;border-color:#a08540}
.stage-badge{display:inline-block;padding:2px 10px;border-radius:10px;font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:.06em}
.stage-badge.sm{font-size:8px;padding:1px 6px;margin-left:4px}
.board-view{flex:1;overflow:auto;padding:20px;position:relative}.board-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:14px}
.kanban{display:flex;gap:16px;min-height:100%;align-items:flex-start}
.kb-col{flex:1;min-width:240px;max-width:380px;display:flex;flex-direction:column;background:#f5f4f0;border-radius:8px;overflow:hidden}
.kb-col-head{padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid;background:#fff}
.kb-col-title{font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.06em}
.kb-col-count{color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;min-width:22px;text-align:center}
.kb-col-body{padding:12px;display:flex;flex-direction:column;gap:10px;flex:1;min-height:160px}
.kb-empty{color:#bbb;font-size:12px;padding:20px;text-align:center}
.kb-card{background:#fff;border-radius:6px;padding:12px 14px;border-left:4px solid;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.kb-card:hover{box-shadow:0 2px 8px rgba(0,0,0,.1)}
.kb-card-name{font-weight:600;font-size:13px;cursor:pointer;margin-bottom:4px}.kb-card-name:hover{color:#a08540;text-decoration:underline}
.kb-card-meta{font-size:11px;color:#8a8a9a;line-height:1.4}.kb-card-date{font-size:10px;color:#bbb;margin-top:4px}
.kb-dots{display:flex;gap:4px;margin-top:6px}.kb-dot{width:8px;height:8px;border-radius:50%;opacity:.7}
.kb-card-actions{display:flex;gap:6px;margin-top:8px}
.kb-btn{padding:3px 10px;font-family:inherit;font-size:10px;font-weight:500;color:#8a8a9a;background:#f5f4f0;border:1px solid #e0ddd4;border-radius:3px;cursor:pointer}
.kb-btn:hover{background:#eae8e0}.kb-btn.accent{color:#fff;background:#a08540;border-color:#a08540}
/* Directory */
.dir-view{flex:1;display:flex;flex-direction:column;overflow:hidden}
.dir-tabs{display:flex;border-bottom:1px solid #d5d0c4;background:#fff;flex-shrink:0}
.dir-tab{padding:12px 18px;font-family:inherit;font-size:12px;font-weight:400;color:#8a8a9a;background:0 0;border:0;border-bottom:2px solid transparent;cursor:pointer}
.dir-tab.on{font-weight:600;color:#141420;border-bottom-color:#a08540}
.dir-body{flex:1;overflow:auto;padding:24px 32px;max-width:820px}
.dir-section h3{font-family:"Source Serif 4",Georgia,serif;font-size:18px;margin:0}
.dir-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.dir-desc{font-size:12px;color:#7a7a8a;margin:0 0 4px;line-height:1.5}
.dir-matrix{font-size:11px;color:#aaa;margin:0 0 16px}
.dir-matrix code{font-family:"JetBrains Mono",monospace;font-size:10px;background:#f0ede4;padding:1px 4px;border-radius:2px}
.dir-list{display:flex;flex-direction:column;gap:10px}
.dir-card{background:#fff;border:1px solid #e0ddd4;border-radius:6px;padding:12px 16px;transition:box-shadow .15s}
.dir-card:hover{box-shadow:0 1px 6px rgba(0,0,0,.06)}
.dir-card.editing{border-color:#a08540;box-shadow:0 0 0 1px #a08540}
.dir-card-head{cursor:pointer;display:flex;align-items:baseline;gap:10px}.dir-card-head strong{font-size:14px}
.dir-card-sub{font-size:12px;color:#8a8a9a}
.dir-card-detail{font-size:11px;color:#8a8a9a;margin-top:4px}
.dir-card-actions{display:flex;gap:8px;margin-top:10px}
.dir-empty{color:#bbb;font-size:12px;padding:20px;text-align:center}
/* Provenance */
.prov{margin-top:8px;font-size:10px;color:#aaa;border-top:1px solid #f0ede4;padding-top:6px}
.prov-item{display:block;line-height:1.6}.prov-item strong{color:#7a7a8a}
.prov-details{margin-top:4px}.prov-sum{cursor:pointer;color:#a08540;font-size:10px}
.prov-log{margin-top:4px;padding-left:8px;border-left:2px solid #eae6da}
.prov-entry{line-height:1.5;margin-bottom:2px}.prov-ts{color:#bbb}
/* Picker */
.picker{margin-bottom:12px}.picker-row{display:flex;gap:6px}
.picker-sel{flex:1;font-family:inherit;font-size:12px;appearance:auto}
/* Clients */
.clients-view{flex:1;display:flex;overflow:hidden}
.cv-sidebar{width:300px;border-right:1px solid #d5d0c4;background:#fff;display:flex;flex-direction:column;flex-shrink:0}
.cv-head{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eae6da}
.cv-title{font-weight:600;font-size:14px}.cv-list{flex:1;overflow:auto}
.cv-item{padding:12px 18px;border-bottom:1px solid #f0ede6;cursor:pointer;transition:background .1s}
.cv-item:hover{background:#faf9f6}.cv-item.on{background:#f5f3ec;border-left:3px solid #a08540}
.cv-item-name{font-weight:600;font-size:13px;margin-bottom:2px}.cv-item-meta{font-size:11px;color:#8a8a9a}
.cv-empty{padding:24px 18px;color:#aaa;font-size:12px}
.cv-detail{flex:1;overflow:auto;padding:24px 32px}
.cv-detail-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.cv-detail-head h2{font-family:"Source Serif 4",Georgia,serif;font-size:20px;font-weight:700;margin:0}
.cv-empty-detail{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#aaa;text-align:center}
.pet-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #eae6da;border-radius:4px;margin-bottom:8px;cursor:pointer}
.pet-row:hover{background:#faf9f6}
/* Fields */
.fg{margin-bottom:16px}.fg-title{font-weight:600;font-size:12px;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #eae6da}
.frow{margin-bottom:8px}.flbl{display:block;font-size:10px;font-weight:500;color:#6a6a7a;margin-bottom:3px}.fchk{color:#5a9e6f;margin-left:4px}
.finp{width:100%;padding:6px 8px;font-family:"Source Serif 4",Georgia,serif;font-size:13px;border:1px solid #d5d0c4;border-radius:3px;background:#fff;outline:0;transition:border-color .15s}
.finp:focus{border-color:#a08540}
/* Editor */
.editor-view{flex:1;display:flex;overflow:hidden}
.ed-sidebar{width:370px;min-width:300px;display:flex;flex-direction:column;border-right:1px solid #d5d0c4;background:#fff;flex-shrink:0}
.ed-tabs{display:flex;flex-wrap:wrap;border-bottom:1px solid #eae6da;flex-shrink:0}
.ed-tab{padding:7px 10px;font-family:inherit;font-size:10px;font-weight:400;color:#8a8a9a;background:0 0;border:0;border-bottom:2px solid transparent;cursor:pointer}
.ed-tab.on{font-weight:600;color:#141420;border-bottom-color:#a08540}
.ed-fields{flex:1;overflow:auto;padding:14px 18px}
.lscroll{flex:1;overflow:auto;padding:10px;background:#0e0e18;border-radius:4px;font-family:"JetBrains Mono",monospace;font-size:10px;line-height:1.7;color:#a0a0b0;margin:-14px -18px;min-height:300px}
.lempty{color:#4a4a5a;padding:12px}.lentry{margin-bottom:3px;word-break:break-all}
.lts{color:#555}.ld{color:#7a7a8a}.lt{color:#b0b0c0}.lp{color:#c8c0a0}
/* Document */
.doc-scroll{flex:1;overflow:auto;background:#b0ada5;padding:36px 24px;display:flex;flex-direction:column;align-items:center;gap:32px}
.measure-box{position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:${PAGE_W-2*MG}px;font-family:"Source Serif 4","Times New Roman",serif;font-size:13px;line-height:1.5}
.page-shell{flex-shrink:0}
.page-paper{width:${PAGE_W}px;height:${PAGE_H}px;background:#fff;display:flex;flex-direction:column;box-shadow:0 1px 4px rgba(0,0,0,.12),0 4px 16px rgba(0,0,0,.08)}
.page-margin{padding:${MG}px;padding-bottom:0;flex:1;overflow:hidden;font-family:"Source Serif 4","Times New Roman",serif;font-size:13px;line-height:1.5;color:#1a1a1a}
.page-foot{height:${MG}px;padding:12px ${MG}px 0;display:flex;justify-content:space-between;font-family:"Source Serif 4",serif;font-size:10px;color:#999}
.blk{outline:0;border-radius:2px;transition:box-shadow .12s,background .12s;position:relative;cursor:text}
.blk:hover{box-shadow:inset 0 0 0 1px rgba(160,133,64,.10);background:#fefdfb}
.blk:focus{box-shadow:inset 0 0 0 1.5px rgba(160,133,64,.22);background:#fefdf8}
.blk-title{text-align:center;font-weight:700;font-size:13px;letter-spacing:.3px;margin-bottom:1px;padding:2px 4px}
.blk-heading{font-weight:700;text-transform:uppercase;margin:18px 0 6px;font-size:13px;padding:2px 4px}
.blk-para{margin:0 0 10px;text-align:justify;padding:2px 4px}
.blk-sig{white-space:pre-line;margin:0 0 10px;padding:2px 4px}
.blk-sig-label{font-style:italic;margin:0 0 10px;padding:2px 4px}
.blk-cap-name{text-align:center;font-weight:700;padding:2px 4px}
.blk-cap-center{text-align:center;margin:10px 0;padding:2px 4px}
.blk-cap-resp{margin:0 0 8px;padding:2px 4px}
.blk-cap-case{margin:0 0 12px;padding:2px 4px}
.blk-cap-doctitle{font-weight:700;padding:2px 4px}
.caption-grid{display:flex;margin:20px 0 24px}
.cap-left-col{flex:0 0 55%;padding-right:6px}
.cap-mid-col{flex:0 0 5%;text-align:center;font-size:12px;line-height:1.35;color:#aaa}
.cap-right-col{flex:0 0 40%;padding-left:6px}
.vf{color:#1a1a2e;font-weight:600;background:#f0eddf;padding:0 3px;border-radius:2px;border-bottom:1.5px solid rgba(200,184,96,.37);cursor:default}
.ve{color:#a03030;font-weight:700;font-size:10px;background:#fff0f0;padding:1px 4px;border-radius:2px;letter-spacing:.03em;cursor:default}
.blk em,.measure-box em{font-style:italic}
`;
