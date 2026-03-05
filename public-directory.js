/* ================================================================
   Public Detention Directory — Amino Immigration
   Standalone page for unauthenticated users to browse
   facilities/courts and submit edit requests.
   ================================================================ */

// ── Configuration ────────────────────────────────────────────────
var PUB_CONFIG = {
  MATRIX_SERVER_URL: 'https://app.aminoimmigration.com',
  ORG_ROOM_ALIAS: '#org:aminoimmigration.com',
  SUBMISSIONS_ROOM_ALIAS: '#submissions:aminoimmigration.com',
};

// ── State ────────────────────────────────────────────────────────
var PS = {
  tab: 'facilities',
  facilities: {},
  courts: {},
  search: '',
  stateFilter: '',
  loading: true,
  error: '',
  // Submission modal
  modal: null,       // null | { type: 'edit-facility'|'new-facility'|'edit-court'|'new-court', id?: string }
  modalDraft: {},
  modalSubmitting: false,
  modalSuccess: false,
  modalError: '',
  // Matrix connection
  matrixOrgRoomId: null,
  matrixSubmissionsRoomId: null,
  matrixConnected: false,
};

// ── US States (for display and filter) ──────────────────────────
var US_STATES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',
  GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',
  IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',
  MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
  MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
  NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',
  OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',
  SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',
  VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',
  WY:'Wyoming',PR:'Puerto Rico',VI:'U.S. Virgin Islands',GU:'Guam',
  AS:'American Samoa',MP:'Northern Mariana Islands'
};
var US_STATE_NAMES = Object.values(US_STATES).sort();

// ── ICE Facility Seeds (fallback) ───────────────────────────────
var ICE_FACILITY_SEEDS = [
  {n:'Adams County Correctional Center',c:'Natchez',s:'MS',fo:'New Orleans Field Office'},
  {n:'Adelanto ICE Processing Center',c:'Adelanto',s:'CA',fo:'Los Angeles Field Office'},
  {n:'Alamance County Detention Center',c:'Graham',s:'NC',fo:'Atlanta Field Office'},
  {n:'Allen Parish Public Safety Complex',c:'Oberlin',s:'LA',fo:'New Orleans Field Office'},
  {n:'Anchorage Correctional Complex',c:'Anchorage',s:'AK',fo:'Seattle Field Office'},
  {n:'Baker County Detention Center',c:'MacClenny',s:'FL',fo:'Miami Field Office'},
  {n:'Bluebonnet Detention Facility',c:'Anson',s:'TX',fo:'Dallas Field Office'},
  {n:'Boone County Jail',c:'Burlington',s:'KY',fo:'Chicago Field Office'},
  {n:'Broome County Correctional Facility',c:'Binghamton',s:'NY',fo:'Buffalo Field Office'},
  {n:'Broward Transitional Center',c:'Pompano Beach',s:'FL',fo:'Miami Field Office'},
  {n:'Buffalo (Batavia) Service Processing Center',c:'Batavia',s:'NY',fo:'Buffalo Field Office'},
  {n:'Burleigh County Detention Center',c:'Bismarck',s:'ND',fo:'St. Paul Field Office'},
  {n:'Butler County Sheriff\'s Office',c:'Hamilton',s:'OH',fo:'Detroit Field Office'},
  {n:'Calhoun County Correctional Center',c:'Battle Creek',s:'MI',fo:'Detroit Field Office'},
  {n:'California City Detention Facility',c:'California City',s:'CA',fo:'San Francisco Field Office'},
  {n:'Campbell County Detention Center',c:'Newport',s:'KY',fo:'Chicago Field Office'},
  {n:'Caroline Detention Facility',c:'Bowling Green',s:'VA',fo:'Washington Field Office'},
  {n:'Central Arizona Florence Correctional Center',c:'Florence',s:'AZ',fo:'Phoenix Field Office'},
  {n:'Central Louisiana ICE Processing Center',c:'Jena',s:'LA',fo:'New Orleans Field Office'},
  {n:'Chase County Jail',c:'Cottonwood Falls',s:'KS',fo:'Chicago Field Office'},
  {n:'Chippewa County Correctional Facility',c:'Sault Ste. Marie',s:'MI',fo:'Detroit Field Office'},
  {n:'Christian County Jail',c:'Hopkinsville',s:'KY',fo:'Chicago Field Office'},
  {n:'Cibola County Correctional Center',c:'Milan',s:'NM',fo:'El Paso Field Office'},
  {n:'Cimarron Correctional Facility',c:'Cushing',s:'OK',fo:'Dallas Field Office'},
  {n:'Clark County Jail',c:'Jeffersonville',s:'IN',fo:'Chicago Field Office'},
  {n:'Clay County Jail',c:'Brazil',s:'IN',fo:'Chicago Field Office'},
  {n:'Clinton County Correctional Facility',c:'McElhattan',s:'PA',fo:'Philadelphia Field Office'},
  {n:'Clinton County Jail',c:'Plattsburgh',s:'NY',fo:'Buffalo Field Office'},
  {n:'Clinton County Sheriff\'s Office',c:'Frankfort',s:'IN',fo:'Chicago Field Office'},
  {n:'Coastal Bend Detention Facility',c:'Robstown',s:'TX',fo:'San Antonio Field Office'},
  {n:'Columbia County Jail',c:'Portage',s:'WI',fo:'Chicago Field Office'},
  {n:'Core Civic Leavenworth Detention Center',c:'Leavenworth',s:'KS',fo:'Chicago Field Office'},
  {n:'Corrections Corporation of America — Tallahatchie',c:'Tutwiler',s:'MS',fo:'New Orleans Field Office'},
  {n:'Denver Contract Detention Facility',c:'Aurora',s:'CO',fo:'Denver Field Office'},
  {n:'Desert View Annex',c:'Adelanto',s:'CA',fo:'Los Angeles Field Office'},
  {n:'Dodge County Jail',c:'Juneau',s:'WI',fo:'Chicago Field Office'},
  {n:'Dorchester County Detention Center',c:'Summerville',s:'SC',fo:'Atlanta Field Office'},
  {n:'Douglas County Department of Corrections',c:'Omaha',s:'NE',fo:'Chicago Field Office'},
  {n:'Dover Air Force Base',c:'Dover',s:'DE',fo:'Philadelphia Field Office'},
  {n:'Eden Detention Center',c:'Eden',s:'TX',fo:'Dallas Field Office'},
  {n:'El Paso Service Processing Center',c:'El Paso',s:'TX',fo:'El Paso Field Office'},
  {n:'Elizabeth Contract Detention Facility',c:'Elizabeth',s:'NJ',fo:'Newark Field Office'},
  {n:'Eloy Federal Contract Facility',c:'Eloy',s:'AZ',fo:'Phoenix Field Office'},
  {n:'Essex County Correctional Facility',c:'Newark',s:'NJ',fo:'Newark Field Office'},
  {n:'Etowah County Detention Center',c:'Gadsden',s:'AL',fo:'Atlanta Field Office'},
  {n:'Farmville Detention Center',c:'Farmville',s:'VA',fo:'Washington Field Office'},
  {n:'Florence Service Processing Center',c:'Florence',s:'AZ',fo:'Phoenix Field Office'},
  {n:'Folkston ICE Processing Center',c:'Folkston',s:'GA',fo:'Atlanta Field Office'},
  {n:'Franklin County House of Corrections',c:'Greenfield',s:'MA',fo:'Boston Field Office'},
  {n:'Freeborn County Adult Detention Center',c:'Albert Lea',s:'MN',fo:'St. Paul Field Office'},
  {n:'Geauga County Safety Center',c:'Chardon',s:'OH',fo:'Detroit Field Office'},
  {n:'Glades County Detention Center',c:'Moore Haven',s:'FL',fo:'Miami Field Office'},
  {n:'Golden State Annex',c:'McFarland',s:'CA',fo:'Los Angeles Field Office'},
  {n:'Grand Forks County Correctional Center',c:'Grand Forks',s:'ND',fo:'St. Paul Field Office'},
  {n:'Guaynabo MDC (Metro)',c:'Guaynabo',s:'PR',fo:'Miami Field Office'},
  {n:'Hall County Department of Corrections',c:'Grand Island',s:'NE',fo:'Chicago Field Office'},
  {n:'Hampton Roads Regional Jail',c:'Portsmouth',s:'VA',fo:'Washington Field Office'},
  {n:'Henderson Detention Center',c:'Henderson',s:'NV',fo:'Los Angeles Field Office'},
  {n:'Hidalgo County Adult Detention Center',c:'Edinburg',s:'TX',fo:'San Antonio Field Office'},
  {n:'Houston Contract Detention Facility',c:'Houston',s:'TX',fo:'Houston Field Office'},
  {n:'Hudson County Correctional Facility',c:'Kearny',s:'NJ',fo:'Newark Field Office'},
  {n:'IAH Secure Adult Detention Facility',c:'Livingston',s:'TX',fo:'Houston Field Office'},
  {n:'Imperial Regional Detention Facility',c:'Calexico',s:'CA',fo:'San Diego Field Office'},
  {n:'Irwin County Detention Center',c:'Ocilla',s:'GA',fo:'Atlanta Field Office'},
  {n:'Jack Harwell Detention Center',c:'Waco',s:'TX',fo:'Dallas Field Office'},
  {n:'Jackson Parish Correctional Center',c:'Jonesboro',s:'LA',fo:'New Orleans Field Office'},
  {n:'Jay County Jail',c:'Portland',s:'IN',fo:'Chicago Field Office'},
  {n:'Jefferson County Jail',c:'Beaumont',s:'TX',fo:'Houston Field Office'},
  {n:'Joe Corley Processing Center',c:'Conroe',s:'TX',fo:'Houston Field Office'},
  {n:'Johnson County Corrections',c:'New Century',s:'KS',fo:'Chicago Field Office'},
  {n:'Karnes County Residential Center',c:'Karnes City',s:'TX',fo:'San Antonio Field Office'},
  {n:'Kay County Detention Center',c:'Newkirk',s:'OK',fo:'Dallas Field Office'},
  {n:'Krome North Service Processing Center',c:'Miami',s:'FL',fo:'Miami Field Office'},
  {n:'La Palma Correctional Center',c:'Eloy',s:'AZ',fo:'Phoenix Field Office'},
  {n:'LaSalle ICE Processing Center',c:'Jena',s:'LA',fo:'New Orleans Field Office'},
  {n:'Limestone County Detention Center',c:'Groesbeck',s:'TX',fo:'Dallas Field Office'},
  {n:'Linn County Jail',c:'Cedar Rapids',s:'IA',fo:'Chicago Field Office'},
  {n:'Macomb County Jail',c:'Mt. Clemens',s:'MI',fo:'Detroit Field Office'},
  {n:'Marshall County Jail',c:'Moundsville',s:'WV',fo:'Philadelphia Field Office'},
  {n:'McHenry County Adult Correctional Facility',c:'Woodstock',s:'IL',fo:'Chicago Field Office'},
  {n:'Mesa Verde ICE Processing Center',c:'Bakersfield',s:'CA',fo:'San Francisco Field Office'},
  {n:'Miami Dade Turner Guilford Knight Correctional Center',c:'Miami',s:'FL',fo:'Miami Field Office'},
  {n:'Mid-Hudson Holding Facility',c:'Goshen',s:'NY',fo:'New York City Field Office'},
  {n:'Mille Lacs County Jail',c:'Milaca',s:'MN',fo:'St. Paul Field Office'},
  {n:'Monroe County Jail',c:'Stroudsburg',s:'PA',fo:'Philadelphia Field Office'},
  {n:'Montgomery Processing Center',c:'Conroe',s:'TX',fo:'Houston Field Office'},
  {n:'Morgan County Jail',c:'Jacksonville',s:'IL',fo:'Chicago Field Office'},
  {n:'Nevada Southern Detention Center',c:'Pahrump',s:'NV',fo:'Los Angeles Field Office'},
  {n:'North Lake Correctional Facility',c:'Baldwin',s:'MI',fo:'Detroit Field Office'},
  {n:'Northwest Detention Center (NWDC)',c:'Tacoma',s:'WA',fo:'Seattle Field Office'},
  {n:'Nye County Detention Center',c:'Pahrump',s:'NV',fo:'Los Angeles Field Office'},
  {n:'Oakdale Federal Detention Center',c:'Oakdale',s:'LA',fo:'New Orleans Field Office'},
  {n:'Orange County Jail',c:'Goshen',s:'NY',fo:'New York City Field Office'},
  {n:'Otay Mesa Detention Center',c:'San Diego',s:'CA',fo:'San Diego Field Office'},
  {n:'Otero County Processing Center',c:'Chaparral',s:'NM',fo:'El Paso Field Office'},
  {n:'Pine Prairie ICE Processing Center',c:'Pine Prairie',s:'LA',fo:'New Orleans Field Office'},
  {n:'Pine Knoll Shores Facility',c:'Pine Knoll Shores',s:'NC',fo:'Atlanta Field Office'},
  {n:'Platte County Jail',c:'Platte City',s:'MO',fo:'Chicago Field Office'},
  {n:'Plymouth County Correctional Facility',c:'Plymouth',s:'MA',fo:'Boston Field Office'},
  {n:'Polk County Adult Detention Facility',c:'Livingston',s:'TX',fo:'Houston Field Office'},
  {n:'Port Isabel Service Processing Center',c:'Los Fresnos',s:'TX',fo:'San Antonio Field Office'},
  {n:'Prairieland Detention Center',c:'Alvarado',s:'TX',fo:'Dallas Field Office'},
  {n:'Pulaski County Detention Center',c:'Ullin',s:'IL',fo:'Chicago Field Office'},
  {n:'Randall County Jail',c:'Canyon',s:'TX',fo:'Dallas Field Office'},
  {n:'Richwood Correctional Center',c:'Richwood',s:'LA',fo:'New Orleans Field Office'},
  {n:'Rio Grande Detention Center',c:'Laredo',s:'TX',fo:'San Antonio Field Office'},
  {n:'River Correctional Center',c:'Ferriday',s:'LA',fo:'New Orleans Field Office'},
  {n:'Robert A. Deyton Detention Facility',c:'Lovejoy',s:'GA',fo:'Atlanta Field Office'},
  {n:'Rolling Plains Detention Center',c:'Haskell',s:'TX',fo:'Dallas Field Office'},
  {n:'Sherburne County Jail',c:'Elk River',s:'MN',fo:'St. Paul Field Office'},
  {n:'Seneca County Jail',c:'Tiffin',s:'OH',fo:'Detroit Field Office'},
  {n:'South Louisiana ICE Processing Center',c:'Basile',s:'LA',fo:'New Orleans Field Office'},
  {n:'South Texas Family Residential Center',c:'Dilley',s:'TX',fo:'San Antonio Field Office'},
  {n:'South Texas ICE Processing Center',c:'Pearsall',s:'TX',fo:'San Antonio Field Office'},
  {n:'St. Clair County Jail',c:'Belleville',s:'IL',fo:'Chicago Field Office'},
  {n:'Stewart Detention Center',c:'Lumpkin',s:'GA',fo:'Atlanta Field Office'},
  {n:'Strafford County House of Corrections',c:'Dover',s:'NH',fo:'Boston Field Office'},
  {n:'Suffolk County House of Correction',c:'Boston',s:'MA',fo:'Boston Field Office'},
  {n:'T. Don Hutto Residential Center',c:'Taylor',s:'TX',fo:'San Antonio Field Office'},
  {n:'Tallahatchie County Correctional Facility',c:'Tutwiler',s:'MS',fo:'New Orleans Field Office'},
  {n:'Torrance County Detention Facility',c:'Estancia',s:'NM',fo:'El Paso Field Office'},
  {n:'Val Verde County Detention Center',c:'Del Rio',s:'TX',fo:'San Antonio Field Office'},
  {n:'Webb County Detention Center (CCA)',c:'Laredo',s:'TX',fo:'San Antonio Field Office'},
  {n:'Weber County Jail',c:'Ogden',s:'UT',fo:'Salt Lake City Field Office'},
  {n:'West Texas Detention Facility',c:'Sierra Blanca',s:'TX',fo:'El Paso Field Office'},
  {n:'Winn Correctional Center',c:'Winnfield',s:'LA',fo:'New Orleans Field Office'},
  {n:'Worcester County Jail',c:'West Boylston',s:'MA',fo:'Boston Field Office'},
  {n:'Wyatt Detention Facility',c:'Central Falls',s:'RI',fo:'Boston Field Office'},
  {n:'York County Prison',c:'York',s:'PA',fo:'Philadelphia Field Office'},
];

// ── Court Seeds (fallback) ──────────────────────────────────────
var COURT_SEEDS = [
  {d:'Middle District of Alabama',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ALMDC',e:'https://ecf.almd.uscourts.gov/'},
  {d:'Northern District of Alabama',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ALNDC',e:'https://ecf.alnd.uscourts.gov/'},
  {d:'Southern District of Alabama',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ALSDC',e:'https://ecf.alsd.uscourts.gov/'},
  {d:'District of Alaska',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/AKDC',e:'https://ecf.akd.uscourts.gov/'},
  {d:'District of Arizona',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/AZDC',e:'https://ecf.azd.uscourts.gov/'},
  {d:'Eastern District of Arkansas',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/AREDC',e:'https://ecf.ared.uscourts.gov/'},
  {d:'Western District of Arkansas',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ARWDC',e:'https://ecf.arwd.uscourts.gov/'},
  {d:'Central District of California',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/CACDC',e:'https://ecf.cacd.uscourts.gov/'},
  {d:'Eastern District of California',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/CAEDC',e:'https://ecf.caed.uscourts.gov/'},
  {d:'Northern District of California',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/CANDC',e:'https://ecf.cand.uscourts.gov/'},
  {d:'Southern District of California',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/CASDC',e:'https://ecf.casd.uscourts.gov/'},
  {d:'District of Colorado',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/CODC',e:'https://ecf.cod.uscourts.gov/'},
  {d:'District of Connecticut',ci:'02',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/CTDC',e:'https://ecf.ctd.uscourts.gov/'},
  {d:'District of Delaware',ci:'03',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/DEDC',e:'https://ecf.ded.uscourts.gov/'},
  {d:'District of Columbia',ci:'DC',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/DCDC',e:'https://ecf.dcd.uscourts.gov/'},
  {d:'Middle District of Florida',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/FLMDC',e:'https://ecf.flmd.uscourts.gov/'},
  {d:'Northern District of Florida',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/FLNDC',e:'https://ecf.flnd.uscourts.gov/'},
  {d:'Southern District of Florida',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/FLSDC',e:'https://ecf.flsd.uscourts.gov/'},
  {d:'Middle District of Georgia',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/GAMDC',e:'https://ecf.gamd.uscourts.gov/'},
  {d:'Northern District of Georgia',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/GANDC',e:'https://ecf.gand.uscourts.gov/'},
  {d:'Southern District of Georgia',ci:'11',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/GASDC',e:'https://ecf.gasd.uscourts.gov/'},
  {d:'District of Hawaii',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/HIDC',e:'https://ecf.hid.uscourts.gov/'},
  {d:'District of Idaho',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/IDDC',e:'https://ecf.idd.uscourts.gov/'},
  {d:'Central District of Illinois',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ILCDC',e:'https://ecf.ilcd.uscourts.gov/'},
  {d:'Northern District of Illinois',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ILNDC',e:'https://ecf.ilnd.uscourts.gov/'},
  {d:'Southern District of Illinois',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ILSDC',e:'https://ecf.ilsd.uscourts.gov/'},
  {d:'Northern District of Indiana',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/INNDC',e:'https://ecf.innd.uscourts.gov/'},
  {d:'Southern District of Indiana',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/INSDC',e:'https://ecf.insd.uscourts.gov/'},
  {d:'Northern District of Iowa',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/IANDC',e:'https://ecf.iand.uscourts.gov/'},
  {d:'Southern District of Iowa',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/IASDC',e:'https://ecf.iasd.uscourts.gov/'},
  {d:'District of Kansas',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/KSDC',e:'https://ecf.ksd.uscourts.gov/'},
  {d:'Eastern District of Kentucky',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/KYEDC',e:'https://ecf.kyed.uscourts.gov/'},
  {d:'Western District of Kentucky',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/KYWDC',e:'https://ecf.kywd.uscourts.gov/'},
  {d:'Eastern District of Louisiana',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/LAEDC',e:'https://ecf.laed.uscourts.gov/'},
  {d:'Middle District of Louisiana',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/LAMDC',e:'https://ecf.lamd.uscourts.gov/'},
  {d:'Western District of Louisiana',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/LAWDC',e:'https://ecf.lawd.uscourts.gov/'},
  {d:'District of Maine',ci:'01',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MEDC',e:'https://ecf.med.uscourts.gov/'},
  {d:'District of Maryland',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MDDC',e:'https://ecf.mdd.uscourts.gov/'},
  {d:'District of Massachusetts',ci:'01',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MADC',e:'https://ecf.mad.uscourts.gov/'},
  {d:'Eastern District of Michigan',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MIEDC',e:'https://ecf.mied.uscourts.gov/'},
  {d:'Western District of Michigan',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MIWDC',e:'https://ecf.miwd.uscourts.gov/'},
  {d:'District of Minnesota',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MNDC',e:'https://ecf.mnd.uscourts.gov/'},
  {d:'Northern District of Mississippi',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MSNDC',e:'https://ecf.msnd.uscourts.gov/'},
  {d:'Southern District of Mississippi',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MSSDC',e:'https://ecf.mssd.uscourts.gov/'},
  {d:'Eastern District of Missouri',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MOEDC',e:'https://ecf.moed.uscourts.gov/'},
  {d:'Western District of Missouri',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MOWDC',e:'https://ecf.mowd.uscourts.gov/'},
  {d:'District of Montana',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/MTDC',e:'https://ecf.mtd.uscourts.gov/'},
  {d:'District of Nebraska',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NEDC',e:'https://ecf.ned.uscourts.gov/'},
  {d:'District of Nevada',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NVDC',e:'https://ecf.nvd.uscourts.gov/'},
  {d:'District of New Hampshire',ci:'01',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NHDC',e:'https://ecf.nhd.uscourts.gov/'},
  {d:'District of New Jersey',ci:'03',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NJDC',e:'https://ecf.njd.uscourts.gov/'},
  {d:'District of New Mexico',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NMDC',e:'https://ecf.nmd.uscourts.gov/'},
  {d:'Eastern District of New York',ci:'02',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NYEDC',e:'https://ecf.nyed.uscourts.gov/'},
  {d:'Northern District of New York',ci:'02',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NYNDC',e:'https://ecf.nynd.uscourts.gov/'},
  {d:'Southern District of New York',ci:'02',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NYSDC',e:'https://ecf.nysd.uscourts.gov/'},
  {d:'Western District of New York',ci:'02',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NYWDC',e:'https://ecf.nywd.uscourts.gov/'},
  {d:'Eastern District of North Carolina',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NCEDC',e:'https://ecf.nced.uscourts.gov/'},
  {d:'Middle District of North Carolina',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NCMDC',e:'https://ecf.ncmd.uscourts.gov/'},
  {d:'Western District of North Carolina',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NCWDC',e:'https://ecf.ncwd.uscourts.gov/'},
  {d:'District of North Dakota',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NDDC',e:'https://ecf.ndd.uscourts.gov/'},
  {d:'Northern District of Ohio',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/OHNDC',e:'https://ecf.ohnd.uscourts.gov/'},
  {d:'Southern District of Ohio',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/OHSDC',e:'https://ecf.ohsd.uscourts.gov/'},
  {d:'Eastern District of Oklahoma',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/OKEDC',e:'https://ecf.oked.uscourts.gov/'},
  {d:'Northern District of Oklahoma',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/OKNDC',e:'https://ecf.oknd.uscourts.gov/'},
  {d:'Western District of Oklahoma',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/OKWDC',e:'https://ecf.okwd.uscourts.gov/'},
  {d:'District of Oregon',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/ORDC',e:'https://ecf.ord.uscourts.gov/'},
  {d:'Eastern District of Pennsylvania',ci:'03',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/PAEDC',e:'https://ecf.paed.uscourts.gov/'},
  {d:'Middle District of Pennsylvania',ci:'03',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/PAMDC',e:'https://ecf.pamd.uscourts.gov/'},
  {d:'Western District of Pennsylvania',ci:'03',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/PAWDC',e:'https://ecf.pawd.uscourts.gov/'},
  {d:'District of Puerto Rico',ci:'01',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/PRDC',e:'https://ecf.prd.uscourts.gov/'},
  {d:'District of Rhode Island',ci:'01',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/RIDC',e:'https://ecf.rid.uscourts.gov/'},
  {d:'District of South Carolina',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/SCDC',e:'https://ecf.scd.uscourts.gov/'},
  {d:'District of South Dakota',ci:'08',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/SDDC',e:'https://ecf.sdd.uscourts.gov/'},
  {d:'Eastern District of Tennessee',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TNEDC',e:'https://ecf.tned.uscourts.gov/'},
  {d:'Middle District of Tennessee',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TNMDC',e:'https://ecf.tnmd.uscourts.gov/'},
  {d:'Western District of Tennessee',ci:'06',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TNWDC',e:'https://ecf.tnwd.uscourts.gov/'},
  {d:'Eastern District of Texas',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TXEDC',e:'https://ecf.txed.uscourts.gov/'},
  {d:'Northern District of Texas',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TXNDC',e:'https://ecf.txnd.uscourts.gov/'},
  {d:'Southern District of Texas',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TXSDC',e:'https://ecf.txsd.uscourts.gov/'},
  {d:'Western District of Texas',ci:'05',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/TXWDC',e:'https://ecf.txwd.uscourts.gov/'},
  {d:'District of Utah',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/UTDC',e:'https://ecf.utd.uscourts.gov/'},
  {d:'District of Vermont',ci:'02',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/VTDC',e:'https://ecf.vtd.uscourts.gov/'},
  {d:'Eastern District of Virginia',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/VAEDC',e:'https://ecf.vaed.uscourts.gov/'},
  {d:'Western District of Virginia',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/VAWDC',e:'https://ecf.vawd.uscourts.gov/'},
  {d:'Eastern District of Washington',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WAEDC',e:'https://ecf.waed.uscourts.gov/'},
  {d:'Western District of Washington',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WAWDC',e:'https://ecf.wawd.uscourts.gov/'},
  {d:'Northern District of West Virginia',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WVNDC',e:'https://ecf.wvnd.uscourts.gov/'},
  {d:'Southern District of West Virginia',ci:'04',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WVSDC',e:'https://ecf.wvsd.uscourts.gov/'},
  {d:'Eastern District of Wisconsin',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WIEDC',e:'https://ecf.wied.uscourts.gov/'},
  {d:'Western District of Wisconsin',ci:'07',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WIWDC',e:'https://ecf.wiwd.uscourts.gov/'},
  {d:'District of Wyoming',ci:'10',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/WYDC',e:'https://ecf.wyd.uscourts.gov/'},
  {d:'District of the Virgin Islands',ci:'03',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/VIDC',e:'https://ecf.vid.uscourts.gov/'},
  {d:'District of Guam',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/GUDC',e:'https://ecf.gud.uscourts.gov/'},
  {d:'District of the Northern Mariana Islands',ci:'09',p:'https://pacer.uscourts.gov/file-case/court-cmecf-lookup/court/NMISDC',e:'https://ecf.nmid.uscourts.gov/'},
];

// ── Helpers ──────────────────────────────────────────────────────
function esc(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
function uid() { return Math.random().toString(36).slice(2, 10); }

function pubToast(msg, type) {
  var c = document.getElementById('toast-container');
  if (!c) return;
  var el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(function() { el.classList.add('show'); }, 10);
  setTimeout(function() {
    el.classList.remove('show');
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }, 3000);
}

// ── Matrix API (minimal, for public read + submissions) ─────────
var pubMatrix = {
  baseUrl: PUB_CONFIG.MATRIX_SERVER_URL,
  accessToken: '',
  userId: '',

  _api: function(method, path, body) {
    var opts = { method: method, headers: {} };
    if (this.accessToken) {
      opts.headers['Authorization'] = 'Bearer ' + this.accessToken;
    }
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 15000);
    opts.signal = controller.signal;
    return fetch(this.baseUrl + '/_matrix/client/v3' + path, opts)
      .then(function(r) {
        if (!r.ok) {
          return r.text().then(function(text) {
            clearTimeout(timeoutId);
            try { throw JSON.parse(text); }
            catch(e) {
              if (e instanceof SyntaxError) throw { errcode: 'M_UNKNOWN', error: r.status + ' ' + r.statusText };
              throw e;
            }
          });
        }
        return r.json().then(function(data) { clearTimeout(timeoutId); return data; });
      })
      .catch(function(e) {
        clearTimeout(timeoutId);
        if (e && e.errcode) throw e;
        throw { errcode: 'M_NETWORK', error: (e && e.message) || 'Network error' };
      });
  },

  registerGuest: function() {
    return this._api('POST', '/register?kind=guest', {});
  },

  resolveAlias: function(alias) {
    return this._api('GET', '/directory/room/' + encodeURIComponent(alias));
  },

  getRoomState: function(roomId, eventType) {
    return this._api('GET', '/rooms/' + encodeURIComponent(roomId) + '/state/' + encodeURIComponent(eventType));
  },

  getRoomStateWithKey: function(roomId, eventType, stateKey) {
    return this._api('GET', '/rooms/' + encodeURIComponent(roomId) + '/state/' + encodeURIComponent(eventType) + '/' + encodeURIComponent(stateKey));
  },

  sendEvent: function(roomId, eventType, content) {
    var txnId = 'm' + Date.now() + '.' + Math.random().toString(36).slice(2, 8);
    return this._api('PUT', '/rooms/' + encodeURIComponent(roomId) + '/send/' + encodeURIComponent(eventType) + '/' + txnId, content);
  },

  joinRoom: function(roomIdOrAlias) {
    return this._api('POST', '/join/' + encodeURIComponent(roomIdOrAlias), {});
  },
};

// ── Data Loading ─────────────────────────────────────────────────

function loadSeedData() {
  // Use embedded seed data as fallback
  var facilities = {};
  ICE_FACILITY_SEEDS.forEach(function(s, i) {
    var id = 'seed-' + i;
    facilities[id] = {
      id: id, name: s.n, city: s.c, state: s.s,
      warden: '', fieldOfficeName: s.fo, fieldOfficeDirector: '',
      seeded: true,
    };
  });
  var courts = {};
  COURT_SEEDS.forEach(function(s, i) {
    var id = 'cseed-' + i;
    courts[id] = {
      id: id, district: s.d, division: '', circuit: s.ci,
      ecfUrl: s.e, pacerUrl: s.p, seeded: true,
    };
  });
  return { facilities: facilities, courts: courts };
}

function loadFromMatrix() {
  // Try to register as guest and read the org room state
  return pubMatrix.registerGuest()
    .then(function(data) {
      pubMatrix.accessToken = data.access_token;
      pubMatrix.userId = data.user_id;
      PS.matrixConnected = true;
      return pubMatrix.resolveAlias(PUB_CONFIG.ORG_ROOM_ALIAS);
    })
    .then(function(data) {
      PS.matrixOrgRoomId = data.room_id;
      // Try to join the org room (may fail if not configured for guests)
      return pubMatrix.joinRoom(data.room_id).catch(function() { return null; });
    })
    .then(function() {
      if (!PS.matrixOrgRoomId) throw new Error('No org room');
      // Fetch facilities
      return pubMatrix.getRoomState(PS.matrixOrgRoomId, 'com.amino.facility')
        .catch(function() { return []; });
    })
    .then(function(facilities) {
      if (Array.isArray(facilities) && facilities.length > 0) {
        var facs = {};
        facilities.forEach(function(evt) {
          var key = evt.state_key;
          var c = evt.content;
          if (key && c && c.name && !c.deleted && !c.archived) {
            facs[key] = {
              id: key, name: c.name, city: c.city || '', state: c.state || '',
              warden: c.warden || '', fieldOfficeName: c.fieldOfficeName || '',
              fieldOfficeDirector: c.fieldOfficeDirector || '',
              createdBy: evt.sender, updatedAt: evt.origin_server_ts ? new Date(evt.origin_server_ts).toISOString() : '',
            };
          }
        });
        if (Object.keys(facs).length > 0) PS.facilities = facs;
      }
      // Fetch courts
      return pubMatrix.getRoomState(PS.matrixOrgRoomId, 'com.amino.court')
        .catch(function() { return []; });
    })
    .then(function(courts) {
      if (Array.isArray(courts) && courts.length > 0) {
        var crts = {};
        courts.forEach(function(evt) {
          var key = evt.state_key;
          var c = evt.content;
          if (key && c && c.district && !c.deleted && !c.archived) {
            crts[key] = {
              id: key, district: c.district, division: c.division || '', circuit: c.circuit || '',
              ecfUrl: c.ecfUrl || c.website || '', pacerUrl: c.pacerUrl || '',
              createdBy: evt.sender, updatedAt: evt.origin_server_ts ? new Date(evt.origin_server_ts).toISOString() : '',
            };
          }
        });
        if (Object.keys(crts).length > 0) PS.courts = crts;
      }
      // Resolve submissions room for later
      return pubMatrix.resolveAlias(PUB_CONFIG.SUBMISSIONS_ROOM_ALIAS).catch(function() { return null; });
    })
    .then(function(data) {
      if (data && data.room_id) {
        PS.matrixSubmissionsRoomId = data.room_id;
        return pubMatrix.joinRoom(data.room_id).catch(function() { return null; });
      }
    });
}

function initData() {
  // Load seeds first as fallback
  var seeds = loadSeedData();
  PS.facilities = seeds.facilities;
  PS.courts = seeds.courts;
  PS.loading = false;
  pubRender();

  // Then try live Matrix data
  loadFromMatrix()
    .then(function() {
      PS.loading = false;
      pubRender();
    })
    .catch(function(err) {
      console.log('Matrix public read not available, using seed data:', err);
      PS.loading = false;
      pubRender();
    });
}

// ── Rendering ────────────────────────────────────────────────────

function pubRender() {
  var root = document.getElementById('pub-root');
  if (!root) return;

  var h = '';

  // Header
  h += '<header class="pub-header">';
  h += '<div class="pub-header-inner">';
  h += '<div class="pub-brand"><span class="pub-brand-name">Detention Directory</span><span class="pub-brand-sub">Amino Immigration</span></div>';
  h += '<a href="index.html" class="hbtn pub-login-link">Attorney Login</a>';
  h += '</div></header>';

  // Tabs
  h += '<div class="pub-container">';
  h += '<div class="pub-tabs">';
  h += '<button class="pub-tab' + (PS.tab === 'facilities' ? ' on' : '') + '" data-action="pub-tab" data-tab="facilities">Detention Facilities (' + countActive('facilities') + ')</button>';
  h += '<button class="pub-tab' + (PS.tab === 'courts' ? ' on' : '') + '" data-action="pub-tab" data-tab="courts">Federal Courts (' + countActive('courts') + ')</button>';
  h += '</div>';

  // Search + filter bar
  h += '<div class="pub-toolbar">';
  h += '<input type="text" class="pub-search" id="pub-search" placeholder="Search by name, city, or state..." value="' + esc(PS.search) + '">';
  if (PS.tab === 'facilities') {
    h += '<select class="pub-filter" id="pub-state-filter">';
    h += '<option value="">All States</option>';
    US_STATE_NAMES.forEach(function(st) {
      h += '<option value="' + esc(st) + '"' + (PS.stateFilter === st ? ' selected' : '') + '>' + esc(st) + '</option>';
    });
    h += '</select>';
  }
  h += '<button class="hbtn accent pub-submit-btn" data-action="pub-open-new">+ Submit New ' + (PS.tab === 'facilities' ? 'Facility' : 'Court') + '</button>';
  h += '</div>';

  // List
  if (PS.tab === 'facilities') {
    h += renderPublicFacilities();
  } else {
    h += renderPublicCourts();
  }

  h += '</div>'; // pub-container

  // Modal
  if (PS.modal) {
    h += renderSubmissionModal();
  }

  root.innerHTML = h;

  // Wire up search
  var searchEl = document.getElementById('pub-search');
  if (searchEl) {
    searchEl.addEventListener('input', function() {
      PS.search = this.value;
      pubRender();
      // Re-focus and restore cursor
      var el = document.getElementById('pub-search');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    });
  }
  var filterEl = document.getElementById('pub-state-filter');
  if (filterEl) {
    filterEl.addEventListener('change', function() {
      PS.stateFilter = this.value;
      pubRender();
    });
  }
}

function countActive(type) {
  return Object.keys(PS[type]).length;
}

function matchesSearch(item, type) {
  if (!PS.search) return true;
  var q = PS.search.toLowerCase();
  if (type === 'facilities') {
    return (item.name || '').toLowerCase().indexOf(q) >= 0 ||
           (item.city || '').toLowerCase().indexOf(q) >= 0 ||
           (item.state || '').toLowerCase().indexOf(q) >= 0 ||
           (item.fieldOfficeName || '').toLowerCase().indexOf(q) >= 0;
  } else {
    return (item.district || '').toLowerCase().indexOf(q) >= 0 ||
           (item.division || '').toLowerCase().indexOf(q) >= 0 ||
           (item.circuit || '').toLowerCase().indexOf(q) >= 0;
  }
}

function matchesStateFilter(item) {
  if (!PS.stateFilter) return true;
  return item.state === PS.stateFilter;
}

function renderPublicFacilities() {
  var items = Object.values(PS.facilities)
    .filter(function(f) { return matchesSearch(f, 'facilities') && matchesStateFilter(f); })
    .sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });

  if (items.length === 0) {
    return '<div class="pub-empty">No facilities match your search.</div>';
  }

  var h = '<div class="pub-list">';
  items.forEach(function(f) {
    h += '<div class="pub-card">';
    h += '<div class="pub-card-head">';
    h += '<strong>' + esc(f.name) + '</strong>';
    h += '<span class="pub-card-loc">' + esc(f.city || '') + ', ' + esc(f.state || '') + '</span>';
    h += '</div>';
    h += '<div class="pub-card-body">';
    if (f.warden) h += '<div class="pub-card-field"><span class="pub-label">Warden:</span> ' + esc(f.warden) + '</div>';
    if (f.fieldOfficeName) h += '<div class="pub-card-field"><span class="pub-label">Field Office:</span> ' + esc(f.fieldOfficeName) + '</div>';
    if (f.fieldOfficeDirector) h += '<div class="pub-card-field"><span class="pub-label">FOD:</span> ' + esc(f.fieldOfficeDirector) + '</div>';
    h += '</div>';
    h += '<div class="pub-card-actions">';
    h += '<button class="hbtn sm" data-action="pub-suggest-edit" data-id="' + esc(f.id) + '" data-type="facility">Suggest Edit</button>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function renderPublicCourts() {
  var items = Object.values(PS.courts)
    .filter(function(c) { return matchesSearch(c, 'courts'); })
    .sort(function(a, b) { return (a.district || '').localeCompare(b.district || ''); });

  if (items.length === 0) {
    return '<div class="pub-empty">No courts match your search.</div>';
  }

  var h = '<div class="pub-list">';
  items.forEach(function(c) {
    h += '<div class="pub-card">';
    h += '<div class="pub-card-head">';
    h += '<strong>' + esc(c.district) + '</strong>';
    if (c.circuit) h += '<span class="pub-card-badge">Cir. ' + esc(c.circuit) + '</span>';
    if (c.division) h += '<span class="pub-card-loc">' + esc(c.division) + '</span>';
    h += '</div>';
    h += '<div class="pub-card-body">';
    if (c.ecfUrl) h += '<a href="' + esc(c.ecfUrl) + '" target="_blank" rel="noopener" class="pub-link">CM/ECF Portal &#8599;</a>';
    if (c.pacerUrl) h += '<a href="' + esc(c.pacerUrl) + '" target="_blank" rel="noopener" class="pub-link">PACER &#8599;</a>';
    h += '</div>';
    h += '<div class="pub-card-actions">';
    h += '<button class="hbtn sm" data-action="pub-suggest-edit" data-id="' + esc(c.id) + '" data-type="court">Suggest Edit</button>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// ── Submission Modal ─────────────────────────────────────────────

function renderSubmissionModal() {
  var m = PS.modal;
  var isNew = m.type.indexOf('new-') === 0;
  var entity = m.type.indexOf('facility') >= 0 ? 'facility' : 'court';
  var title = (isNew ? 'Submit New ' : 'Suggest Edit for ') + (entity === 'facility' ? 'Facility' : 'Court');

  var h = '<div class="pub-modal-overlay" data-action="pub-close-modal">';
  h += '<div class="pub-modal" onclick="event.stopPropagation()">';
  h += '<div class="pub-modal-head"><h3>' + esc(title) + '</h3>';
  h += '<button class="pub-modal-close" data-action="pub-close-modal">&times;</button></div>';

  if (PS.modalSuccess) {
    h += '<div class="pub-modal-body">';
    h += '<div class="pub-success-msg">';
    h += '<div class="pub-success-icon">&#10003;</div>';
    h += '<p>Your submission has been received and will be reviewed by an administrator.</p>';
    h += '</div>';
    h += '<div class="pub-modal-actions"><button class="hbtn accent" data-action="pub-close-modal">Close</button></div>';
    h += '</div>';
    h += '</div></div>';
    return h;
  }

  h += '<div class="pub-modal-body">';
  if (PS.modalError) {
    h += '<div class="pub-modal-error">' + esc(PS.modalError) + '</div>';
  }

  // Submitter info
  h += '<div class="pub-form-section"><div class="pub-form-section-title">Your Information</div>';
  h += '<div class="frow"><label class="flbl">Your Name</label>';
  h += '<input class="finp" data-draft="submitterName" value="' + esc(PS.modalDraft.submitterName || '') + '" placeholder="Jane Smith"></div>';
  h += '<div class="frow"><label class="flbl">Your Email</label>';
  h += '<input class="finp" type="email" data-draft="submitterEmail" value="' + esc(PS.modalDraft.submitterEmail || '') + '" placeholder="jane@example.com"></div>';
  h += '</div>';

  if (entity === 'facility') {
    h += '<div class="pub-form-section"><div class="pub-form-section-title">Facility Details</div>';
    h += '<div class="frow"><label class="flbl">Facility Name' + (isNew ? ' *' : '') + '</label>';
    h += '<input class="finp" data-draft="name" value="' + esc(PS.modalDraft.name || '') + '" placeholder="South Louisiana ICE Processing Center"></div>';
    h += '<div class="frow"><label class="flbl">City</label>';
    h += '<input class="finp" data-draft="city" value="' + esc(PS.modalDraft.city || '') + '" placeholder="Basile"></div>';
    h += '<div class="frow"><label class="flbl">State</label>';
    h += '<select class="finp" data-draft="state"><option value="">Select state...</option>';
    US_STATE_NAMES.forEach(function(st) {
      h += '<option value="' + esc(st) + '"' + (PS.modalDraft.state === st ? ' selected' : '') + '>' + esc(st) + '</option>';
    });
    h += '</select></div>';
    h += '<div class="frow"><label class="flbl">Warden</label>';
    h += '<input class="finp" data-draft="warden" value="' + esc(PS.modalDraft.warden || '') + '" placeholder="John Smith"></div>';
    h += '<div class="frow"><label class="flbl">Field Office</label>';
    h += '<input class="finp" data-draft="fieldOfficeName" value="' + esc(PS.modalDraft.fieldOfficeName || '') + '" placeholder="New Orleans Field Office"></div>';
    h += '<div class="frow"><label class="flbl">Field Office Director</label>';
    h += '<input class="finp" data-draft="fieldOfficeDirector" value="' + esc(PS.modalDraft.fieldOfficeDirector || '') + '" placeholder="Jane Doe"></div>';
    h += '</div>';
  } else {
    h += '<div class="pub-form-section"><div class="pub-form-section-title">Court Details</div>';
    h += '<div class="frow"><label class="flbl">District' + (isNew ? ' *' : '') + '</label>';
    h += '<input class="finp" data-draft="district" value="' + esc(PS.modalDraft.district || '') + '" placeholder="Southern District of Texas"></div>';
    h += '<div class="frow"><label class="flbl">Division</label>';
    h += '<input class="finp" data-draft="division" value="' + esc(PS.modalDraft.division || '') + '" placeholder="Houston Division"></div>';
    h += '<div class="frow"><label class="flbl">Circuit</label>';
    h += '<input class="finp" data-draft="circuit" value="' + esc(PS.modalDraft.circuit || '') + '" placeholder="05"></div>';
    h += '<div class="frow"><label class="flbl">CM/ECF URL</label>';
    h += '<input class="finp" type="url" data-draft="ecfUrl" value="' + esc(PS.modalDraft.ecfUrl || '') + '" placeholder="https://ecf.txsd.uscourts.gov/"></div>';
    h += '<div class="frow"><label class="flbl">PACER URL</label>';
    h += '<input class="finp" type="url" data-draft="pacerUrl" value="' + esc(PS.modalDraft.pacerUrl || '') + '" placeholder="https://pacer.uscourts.gov/..."></div>';
    h += '</div>';
  }

  // Notes
  h += '<div class="pub-form-section">';
  h += '<div class="frow"><label class="flbl">Notes / Reason for Change</label>';
  h += '<textarea class="finp pub-textarea" data-draft="notes" placeholder="Please describe the changes or provide context...">' + esc(PS.modalDraft.notes || '') + '</textarea></div>';
  h += '</div>';

  h += '<div class="pub-modal-actions">';
  h += '<button class="hbtn" data-action="pub-close-modal">Cancel</button>';
  h += '<button class="hbtn accent" data-action="pub-submit"' + (PS.modalSubmitting ? ' disabled' : '') + '>' + (PS.modalSubmitting ? 'Submitting...' : 'Submit for Review') + '</button>';
  h += '</div>';

  h += '</div>'; // modal-body
  h += '</div></div>'; // modal + overlay
  return h;
}

// ── Event Handling ───────────────────────────────────────────────

function handleSubmission() {
  var m = PS.modal;
  if (!m) return;

  // Collect draft values from DOM
  collectDraftFromDOM();

  var entity = m.type.indexOf('facility') >= 0 ? 'facility' : 'court';
  var isNew = m.type.indexOf('new-') === 0;

  // Validate
  if (!PS.modalDraft.submitterName || !PS.modalDraft.submitterName.trim()) {
    PS.modalError = 'Please enter your name.';
    pubRender();
    return;
  }
  if (!PS.modalDraft.submitterEmail || !PS.modalDraft.submitterEmail.trim()) {
    PS.modalError = 'Please enter your email.';
    pubRender();
    return;
  }
  if (isNew) {
    if (entity === 'facility' && (!PS.modalDraft.name || !PS.modalDraft.name.trim())) {
      PS.modalError = 'Facility name is required.';
      pubRender();
      return;
    }
    if (entity === 'court' && (!PS.modalDraft.district || !PS.modalDraft.district.trim())) {
      PS.modalError = 'District name is required.';
      pubRender();
      return;
    }
  }

  PS.modalSubmitting = true;
  PS.modalError = '';
  pubRender();

  // Build submission payload
  var payload = {
    submissionType: isNew ? 'new' : 'edit',
    entity: entity,
    targetId: m.id || null,
    targetName: m.targetName || null,
    submitter: {
      name: PS.modalDraft.submitterName.trim(),
      email: PS.modalDraft.submitterEmail.trim(),
    },
    fields: {},
    notes: (PS.modalDraft.notes || '').trim(),
    submittedAt: new Date().toISOString(),
  };

  if (entity === 'facility') {
    ['name', 'city', 'state', 'warden', 'fieldOfficeName', 'fieldOfficeDirector'].forEach(function(k) {
      if (PS.modalDraft[k] && PS.modalDraft[k].trim()) payload.fields[k] = PS.modalDraft[k].trim();
    });
  } else {
    ['district', 'division', 'circuit', 'ecfUrl', 'pacerUrl'].forEach(function(k) {
      if (PS.modalDraft[k] && PS.modalDraft[k].trim()) payload.fields[k] = PS.modalDraft[k].trim();
    });
  }

  // Try to send via Matrix
  if (PS.matrixConnected && PS.matrixSubmissionsRoomId) {
    pubMatrix.sendEvent(PS.matrixSubmissionsRoomId, 'com.amino.submission', payload)
      .then(function() {
        PS.modalSubmitting = false;
        PS.modalSuccess = true;
        pubRender();
      })
      .catch(function(err) {
        console.error('Submission via Matrix failed:', err);
        // Fall back to localStorage
        saveSubmissionLocally(payload);
      });
  } else {
    // Save locally if Matrix not available
    saveSubmissionLocally(payload);
  }
}

function saveSubmissionLocally(payload) {
  try {
    var existing = JSON.parse(localStorage.getItem('amino_public_submissions') || '[]');
    existing.push(payload);
    localStorage.setItem('amino_public_submissions', JSON.stringify(existing));
  } catch (e) { /* ignore */ }
  PS.modalSubmitting = false;
  PS.modalSuccess = true;
  pubRender();
}

function collectDraftFromDOM() {
  var inputs = document.querySelectorAll('[data-draft]');
  inputs.forEach(function(el) {
    PS.modalDraft[el.dataset.draft] = el.value;
  });
}

// ── Click Delegation ─────────────────────────────────────────────

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var action = btn.dataset.action;

  if (action === 'pub-tab') {
    PS.tab = btn.dataset.tab;
    PS.search = '';
    PS.stateFilter = '';
    pubRender();
    return;
  }

  if (action === 'pub-open-new') {
    var entity = PS.tab === 'facilities' ? 'facility' : 'court';
    PS.modal = { type: 'new-' + entity };
    PS.modalDraft = {};
    PS.modalSubmitting = false;
    PS.modalSuccess = false;
    PS.modalError = '';
    pubRender();
    return;
  }

  if (action === 'pub-suggest-edit') {
    var id = btn.dataset.id;
    var type = btn.dataset.type;
    var existing = type === 'facility' ? PS.facilities[id] : PS.courts[id];
    PS.modal = { type: 'edit-' + type, id: id, targetName: existing ? (existing.name || existing.district) : '' };
    PS.modalDraft = {};
    // Pre-fill with existing values
    if (existing) {
      if (type === 'facility') {
        PS.modalDraft.name = existing.name || '';
        PS.modalDraft.city = existing.city || '';
        PS.modalDraft.state = existing.state || '';
        PS.modalDraft.warden = existing.warden || '';
        PS.modalDraft.fieldOfficeName = existing.fieldOfficeName || '';
        PS.modalDraft.fieldOfficeDirector = existing.fieldOfficeDirector || '';
      } else {
        PS.modalDraft.district = existing.district || '';
        PS.modalDraft.division = existing.division || '';
        PS.modalDraft.circuit = existing.circuit || '';
        PS.modalDraft.ecfUrl = existing.ecfUrl || '';
        PS.modalDraft.pacerUrl = existing.pacerUrl || '';
      }
    }
    PS.modalSubmitting = false;
    PS.modalSuccess = false;
    PS.modalError = '';
    pubRender();
    return;
  }

  if (action === 'pub-close-modal') {
    PS.modal = null;
    PS.modalDraft = {};
    PS.modalSubmitting = false;
    PS.modalSuccess = false;
    PS.modalError = '';
    pubRender();
    return;
  }

  if (action === 'pub-submit') {
    handleSubmission();
    return;
  }
});

// Close modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && PS.modal) {
    PS.modal = null;
    pubRender();
  }
});

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initData();
});
