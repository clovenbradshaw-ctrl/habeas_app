/* ================================================================
   Amino Habeas - Plain HTML App (vanilla JS, no build step)
   Replaces React/Vite/TypeScript with plain JS + Matrix REST API
   ================================================================ */

// ── Configuration ────────────────────────────────────────────────
var CONFIG = {
  MATRIX_SERVER_URL: 'https://app.aminoimmigration.com',
  MATRIX_SERVER_NAME: 'aminoimmigration.com',
  ORG_ROOM_ALIAS: '#org:aminoimmigration.com',
  TEMPLATES_ROOM_ALIAS: '#templates:aminoimmigration.com',
};

// ── Utilities ────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }
function now() { return new Date().toISOString(); }
function ts(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch (e) { return iso; }
}
function timeAgo(iso) {
  try {
    var diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) return 'just now';
    var s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60);
    if (m < 60) return m + (m === 1 ? ' min ago' : ' mins ago');
    var hr = Math.floor(m / 60);
    if (hr < 24) return hr + (hr === 1 ? ' hour ago' : ' hours ago');
    var d = Math.floor(hr / 24);
    if (d < 7) return d + (d === 1 ? ' day ago' : ' days ago');
    var w = Math.floor(d / 7);
    if (w < 5) return w + (w === 1 ? ' week ago' : ' weeks ago');
    var mo = Math.floor(d / 30);
    if (mo < 12) return mo + (mo === 1 ? ' month ago' : ' months ago');
    var y = Math.floor(d / 365);
    return y + (y === 1 ? ' year ago' : ' years ago');
  } catch (e) { return ''; }
}
function esc(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

var STAGES = ['drafted', 'reviewed', 'submitted'];
var SM = {
  drafted:   { color: '#c9a040', bg: '#faf5e4', label: 'Drafted' },
  reviewed:  { color: '#5a9e6f', bg: '#eaf5ee', label: 'Reviewed' },
  submitted: { color: '#4a7ab5', bg: '#e8f0fa', label: 'Submitted' },
};

// ── Enumeration Option Arrays ───────────────────────────────────
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

var COUNTRIES = [
  'Mexico','Guatemala','Honduras','El Salvador','Colombia','Venezuela',
  'Ecuador','Brazil','Cuba','Haiti','Dominican Republic','Nicaragua',
  'Peru','India','China','Philippines',
  '---',
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad',
  'Chile','Comoros','Congo (Brazzaville)','Congo (DRC)','Costa Rica',
  "Cote d'Ivoire",'Croatia','Cyprus','Czech Republic','Denmark','Djibouti',
  'Dominica','East Timor','Egypt','Equatorial Guinea','Eritrea','Estonia',
  'Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia',
  'Germany','Ghana','Greece','Grenada','Guinea','Guinea-Bissau','Guyana',
  'Hungary','Iceland','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kosovo','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya',
  'Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia',
  'Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius',
  'Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique',
  'Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Niger',
  'Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau',
  'Palestine','Panama','Papua New Guinea','Paraguay','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga',
  'Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda',
  'Ukraine','United Arab Emirates','United Kingdom','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Vietnam','Yemen','Zambia','Zimbabwe'
];

var ENTRY_METHOD_OPTIONS = [
  'without inspection',
  'with inspection at a port of entry',
  'with a valid visa that has since expired',
  'through the visa waiver program'
];

var CRIMINAL_HISTORY_OPTIONS = [
  'has no criminal record',
  'has a minor criminal record',
  'has a criminal record'
];

var COMMUNITY_TIES_OPTIONS = [
  'has strong family and community ties in the United States',
  'has family in the United States',
  'has community and employment ties in the United States'
];

var ICE_TITLE_OPTIONS = ['Director', 'Acting Director', 'Deputy Director'];

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
  {n:'CNMI Department of Corrections',c:'Susupe, Saipan',s:'MP',fo:'San Francisco Field Office'},
  {n:'Coastal Bend Detention Center',c:'Robstown',s:'TX',fo:'Harlingen Field Office'},
  {n:'CoreCivic Laredo Processing Center',c:'Laredo',s:'TX',fo:'Harlingen Field Office'},
  {n:'CoreCivic Webb County Detention Center',c:'Laredo',s:'TX',fo:'Harlingen Field Office'},
  {n:'Corrections Center of Northwest Ohio (CCNO)',c:'Stryker',s:'OH',fo:'Detroit Field Office'},
  {n:'Crow Wing County Jail',c:'Brainerd',s:'MN',fo:'St. Paul Field Office'},
  {n:'Cumberland County Jail',c:'Portland',s:'ME',fo:'Boston Field Office'},
  {n:'Daviess County Detention Center',c:'Owensboro',s:'KY',fo:'Chicago Field Office'},
  {n:'Delaney Hall Detention Facility',c:'Newark',s:'NJ',fo:'Newark Field Office'},
  {n:'Denver Contract Detention Facility (Aurora)',c:'Aurora',s:'CO',fo:'Denver Field Office'},
  {n:'Desert View Annex',c:'Adelanto',s:'CA',fo:'Los Angeles Field Office'},
  {n:'Diamondback Correctional Facility',c:'Watonga',s:'OK',fo:'Dallas Field Office'},
  {n:'Dilley Immigration Processing Center',c:'Dilley',s:'TX',fo:'San Antonio Field Office'},
  {n:'Dodge Detention Facility',c:'Juneau',s:'WI',fo:'Chicago Field Office'},
  {n:'East Hidalgo Detention Center',c:'La Villa',s:'TX',fo:'Harlingen Field Office'},
  {n:'Eden Detention Center',c:'Eden',s:'TX',fo:'Dallas Field Office'},
  {n:'El Paso Service Processing Center',c:'El Paso',s:'TX',fo:'El Paso Field Office'},
  {n:'El Valle Detention Facility',c:'Raymondville',s:'TX',fo:'Harlingen Field Office'},
  {n:'Elizabeth Contract Detention Facility',c:'Elizabeth',s:'NJ',fo:'Newark Field Office'},
  {n:'Elmore County Detention Center (Elmore County Jail)',c:'Mountain Home',s:'ID',fo:'Salt Lake City Field Office'},
  {n:'Eloy Detention Center',c:'Eloy',s:'AZ',fo:'Phoenix Field Office'},
  {n:'ERO El Paso Camp East Montana',c:'El Paso',s:'TX',fo:'El Paso Field Office'},
  {n:'Farmville Detention Center',c:'Farmville',s:'VA',fo:'Washington Field Office'},
  {n:'FCI Atlanta',c:'Atlanta',s:'GA',fo:'Atlanta Field Office'},
  {n:'FCI Leavenworth',c:'Leavenworth',s:'KS',fo:'Chicago Field Office'},
  {n:'FCI Lewisburg',c:'Lewisburg',s:'PA',fo:'Philadelphia Field Office'},
  {n:'FDC Miami',c:'Miami',s:'FL',fo:'Miami Field Office'},
  {n:'FDC Philadelphia',c:'Philadelphia',s:'PA',fo:'Philadelphia Field Office'},
  {n:'Federal Correctional Institution - Berlin, NH',c:'Berlin',s:'NH',fo:'Boston Field Office'},
  {n:'Federal Detention Center, Honolulu (FDC Honolulu)',c:'Honolulu',s:'HI',fo:'San Francisco Field Office'},
  {n:'Florence Service Processing Center',c:'Florence',s:'AZ',fo:'Phoenix Field Office'},
  {n:'Folkston D Ray ICE Processing Center',c:'Folkston',s:'GA',fo:'Atlanta Field Office'},
  {n:'Folkston ICE Processing Center (Annex)',c:'Folkston',s:'GA',fo:'Atlanta Field Office'},
  {n:'Folkston ICE Processing Center (Main)',c:'Folkston',s:'GA',fo:'Atlanta Field Office'},
  {n:'Freeborn County Jail Services',c:'Albert Lea',s:'MN',fo:'St. Paul Field Office'},
  {n:'Geauga County Safety Center',c:'Chardon',s:'OH',fo:'Detroit Field Office'},
  {n:'Glades County Detention Center',c:'Moore Haven',s:'FL',fo:'Miami Field Office'},
  {n:'Golden State Annex',c:'McFarland',s:'CA',fo:'San Francisco Field Office'},
  {n:'Grand Forks County Correctional Center',c:'Grand Forks',s:'ND',fo:'St. Paul Field Office'},
  {n:'Grayson County Detention Center',c:'Leachfield',s:'KY',fo:'Chicago Field Office'},
  {n:'Greene County Jail',c:'Springfield',s:'MO',fo:'Chicago Field Office'},
  {n:'Guam Department of Corrections, Hagatna Detention Facility',c:'Hagatna',s:'GU',fo:'San Francisco Field Office'},
  {n:'Henderson Detention Center',c:'Henderson',s:'NV',fo:'Salt Lake City Field Office'},
  {n:'Hopkins County Jail',c:'Madisonville',s:'KY',fo:'Chicago Field Office'},
  {n:'Houston Contract Detention Facility',c:'Houston',s:'TX',fo:'Houston Field Office'},
  {n:'IAH Polk Adult Detention Facility',c:'Livingston',s:'TX',fo:'Houston Field Office'},
  {n:'Imperial Regional Detention Facility',c:'Calexico',s:'CA',fo:'San Diego Field Office'},
  {n:'Irwin County Detention Center',c:'Ocilla',s:'GA',fo:'Atlanta Field Office'},
  {n:'Jackson Parish Correctional Center',c:'Jonesboro',s:'LA',fo:'New Orleans Field Office'},
  {n:'Joe Corley Processing Center',c:'Conroe',s:'TX',fo:'Houston Field Office'},
  {n:'Kandiyohi County Jail',c:'Willmar',s:'MN',fo:'St. Paul Field Office'},
  {n:'Karnes County Immigration Processing Center',c:'Karnes City',s:'TX',fo:'San Antonio Field Office'},
  {n:'Kay County Detention Center',c:'Newkirk',s:'OK',fo:'Chicago Field Office'},
  {n:'Kenton County Detention Center',c:'Covington',s:'KY',fo:'Chicago Field Office'},
  {n:'Krome North Service Processing Center',c:'Miami',s:'FL',fo:'Miami Field Office'},
  {n:'La Salle County Regional Detention Center',c:'Encinal',s:'TX',fo:'San Antonio Field Office'},
  {n:'Limestone County Detention Center',c:'Groesbeck',s:'TX',fo:'Houston Field Office'},
  {n:'Lincoln County Detention Center',c:'North Platte',s:'NE',fo:'St. Paul Field Office'},
  {n:'Louisiana ICE Processing Center',c:'Angola',s:'LA',fo:'New Orleans Field Office'},
  {n:'Mahoning County Justice Center',c:'Youngstown',s:'OH',fo:'Detroit Field Office'},
  {n:'McCook Detention Center',c:'McCook',s:'NE',fo:'St. Paul Field Office'},
  {n:'MDC Brooklyn',c:'Brooklyn',s:'NY',fo:'New York City Field Office'},
  {n:'Mesa Verde ICE Processing Center',c:'Bakersfield',s:'CA',fo:'San Francisco Field Office'},
  {n:'Miami Correctional Facility (MCF)',c:'Bunker Hill',s:'IN',fo:'Chicago Field Office'},
  {n:'Monroe County Jail',c:'Monroe',s:'MI',fo:'Detroit Field Office'},
  {n:'Montgomery Processing Center',c:'Conroe',s:'TX',fo:'Houston Field Office'},
  {n:'Moshannon Valley Processing Center',c:'Philipsburg',s:'PA',fo:'Philadelphia Field Office'},
  {n:'Muscatine County Jail',c:'Muscatine',s:'IA',fo:'St. Paul Field Office'},
  {n:'Natrona County Detention Center',c:'Casper',s:'WY',fo:'Denver Field Office'},
  {n:'Naval Station Guantanamo Bay (JTF Camp Six and Migrant Ops Center Main A)',c:'',s:'',fo:'Miami Field Office'},
  {n:'Nevada Southern Detention Center',c:'Pahrump',s:'NV',fo:'Salt Lake City Field Office'},
  {n:'North Lake Processing Center',c:'Baldwin',s:'MI',fo:'Detroit Field Office'},
  {n:'Northeast Ohio Correctional Center',c:'Youngstown',s:'OH',fo:'Detroit Field Office'},
  {n:'Northwest ICE Processing Center (NWIPC)',c:'Tacoma',s:'WA',fo:'Seattle Field Office'},
  {n:'Northwest State Correctional Facility',c:'Swanton',s:'VT',fo:'Boston Field Office'},
  {n:'Oldham County Detention Center',c:'LaGrange',s:'KY',fo:'Chicago Field Office'},
  {n:'Orange County Jail',c:'Goshen',s:'NY',fo:'New York City Field Office'},
  {n:'Otay Mesa Detention Center',c:'San Diego',s:'CA',fo:'San Diego Field Office'},
  {n:'Otero County Processing Center',c:'Chaparral',s:'NM',fo:'El Paso Field Office'},
  {n:'Ozark County Jail',c:'Gainesville',s:'MO',fo:'Chicago Field Office'},
  {n:'Pennington County Jail',c:'Rapid City',s:'SD',fo:'St. Paul Field Office'},
  {n:'Phelps County Jail',c:'Holdrege',s:'NE',fo:'St. Paul Field Office'},
  {n:'Phelps County Jail',c:'Rolla',s:'MO',fo:'Chicago Field Office'},
  {n:'Pike County Correctional Facility',c:'Lords Valley',s:'PA',fo:'Philadelphia Field Office'},
  {n:'Pine Prairie ICE Processing Center',c:'Pine Prairie',s:'LA',fo:'New Orleans Field Office'},
  {n:'Plymouth County Correctional Facility',c:'Plymouth',s:'MA',fo:'Boston Field Office'},
  {n:'Polk County Jail',c:'Des Moines',s:'IA',fo:'St. Paul Field Office'},
  {n:'Port Isabel Service Processing Center',c:'Los Fresnos',s:'TX',fo:'Harlingen Field Office'},
  {n:'Pottawattamie County Jail',c:'Council Bluffs',s:'IA',fo:'St. Paul Field Office'},
  {n:'Prairieland Detention Facility',c:'Alvarado',s:'TX',fo:'Dallas Field Office'},
  {n:'Richwood Correctional Center',c:'Monroe',s:'LA',fo:'New Orleans Field Office'},
  {n:'Rio Grande Processing Center',c:'Laredo',s:'TX',fo:'Harlingen Field Office'},
  {n:'River Correctional Center',c:'Ferriday',s:'LA',fo:'New Orleans Field Office'},
  {n:'Rolling Plains Detention Center',c:'Haskell',s:'TX',fo:'Dallas Field Office'},
  {n:'San Luis Regional Detention Center',c:'San Luis',s:'AZ',fo:'San Diego Field Office'},
  {n:'Sarpy County Department of Corrections',c:'Papillion',s:'NE',fo:'St. Paul Field Office'},
  {n:'Seneca County Jail',c:'Tiffin',s:'OH',fo:'Detroit Field Office'},
  {n:'Sherburne County Jail Services',c:'Elk River',s:'MN',fo:'St. Paul Field Office'},
  {n:'Sioux County Jail',c:'Orange City',s:'IA',fo:'St. Paul Field Office'},
  {n:'South Louisiana ICE Processing Center',c:'Basile',s:'LA',fo:'New Orleans Field Office'},
  {n:'South Texas ICE Processing Center',c:'Pearsall',s:'TX',fo:'San Antonio Field Office'},
  {n:'St. Clair County Jail',c:'Port Huron',s:'MI',fo:'Detroit Field Office'},
  {n:'Ste. Genevieve County Detention Center',c:'Ste. Genevieve',s:'MO',fo:'Chicago Field Office'},
  {n:'Stewart Detention Center',c:'Lumpkin',s:'GA',fo:'Atlanta Field Office'},
  {n:'Strafford County Corrections',c:'Dover',s:'NH',fo:'Boston Field Office'},
  {n:'Sweetwater County Detention Center',c:'Rock Springs',s:'WY',fo:'Denver Field Office'},
  {n:'T. Don Hutto Detention Center',c:'Taylor',s:'TX',fo:'San Antonio Field Office'},
  {n:'Torrance County Detention Facility',c:'Estancia',s:'NM',fo:'El Paso Field Office'},
  {n:'Two Bridges Regional Jail',c:'Wiscasset',s:'ME',fo:'Boston Field Office'},
  {n:'Uinta County Detention Center',c:'Evanston',s:'WY',fo:'Salt Lake City Field Office'},
  {n:'Washoe County Jail',c:'Reno',s:'NV',fo:'Salt Lake City Field Office'},
  {n:'West Tennessee Detention Facility',c:'Mason',s:'TN',fo:'New Orleans Field Office'},
  {n:'Winn Correctional Center',c:'Winnfield',s:'LA',fo:'New Orleans Field Office'},
  {n:'Wyatt Detention Facility',c:'Central Falls',s:'RI',fo:'Boston Field Office'}
];

// ── Validators ──────────────────────────────────────────────────
var VALIDATORS = {
  email: function(v) {
    if (!v || !v.trim()) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Invalid email format';
  },
  phone: function(v) {
    if (!v || !v.trim()) return null;
    var digits = v.replace(/[^0-9]/g, '');
    return (digits.length >= 7 && digits.length <= 15) ? null : 'Enter a valid phone number';
  },
  numeric: function(v) {
    if (!v || !v.trim()) return null;
    var n = Number(v);
    return (!isNaN(n) && n >= 0 && n <= 99 && n === Math.floor(n)) ? null : 'Enter a whole number (0\u201399)';
  }
};

function toOrdinal(n) {
  var s = ['th','st','nd','rd'];
  var v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function stateAbbrToName(abbr) {
  return US_STATES[abbr] || abbr;
}

// ── Field Definitions ────────────────────────────────────────────
var FACILITY_FIELDS = [
  { key: 'name', label: 'Facility Name', ph: 'South Louisiana ICE Processing Center' },
  { key: 'city', label: 'City', ph: 'Basile' },
  { key: 'state', label: 'State', ph: 'Louisiana', type: 'enum', options: US_STATE_NAMES },
  { key: 'warden', label: 'Warden', ph: 'John Smith' },
  { key: 'fieldOfficeName', label: 'Field Office', ph: 'New Orleans Field Office' },
  { key: 'fieldOfficeDirector', label: 'Field Office Director', ph: 'Jane Doe' },
];
var COURT_FIELDS = [
  { key: 'district', label: 'District', ph: 'Middle District of Tennessee' },
  { key: 'division', label: 'Division', ph: 'Nashville Division' },
];
var NATIONAL_FIELDS = [
  { key: 'iceDirector', label: 'ICE Director', ph: 'Tom Homan' },
  { key: 'iceDirectorTitle', label: 'ICE Title', ph: 'Director', type: 'enum', options: ICE_TITLE_OPTIONS },
  { key: 'dhsSecretary', label: 'DHS Secretary', ph: 'Kristi Noem' },
  { key: 'attorneyGeneral', label: 'Attorney General', ph: 'Pam Bondi' },
];
var ATT_PROFILE_FIELDS = [
  { key: 'name', label: 'Name', ph: '' },
  { key: 'barNo', label: 'Bar No.', ph: '' },
  { key: 'firm', label: 'Firm', ph: '' },
  { key: 'address', label: 'Address', ph: '' },
  { key: 'cityStateZip', label: 'City/St/Zip', ph: '' },
  { key: 'phone', label: 'Phone', ph: '', validate: VALIDATORS.phone },
  { key: 'fax', label: 'Fax', ph: '', validate: VALIDATORS.phone },
  { key: 'email', label: 'Email', ph: '', validate: VALIDATORS.email },
  { key: 'proHacVice', label: 'Pro Hac Vice', ph: '*Pro hac vice pending' },
];
var CLIENT_FIELDS = [
  { key: 'name', label: 'Full Name', ph: 'Juan Carlos Rivera' },
  { key: 'country', label: 'Country', ph: 'Honduras', type: 'enum', options: COUNTRIES },
  { key: 'yearsInUS', label: 'Years in U.S.', ph: '12', validate: VALIDATORS.numeric },
  { key: 'entryDate', label: 'Entry Date', ph: 'approximately 2013', type: 'date' },
  { key: 'entryMethod', label: 'Entry Method', ph: 'without inspection', type: 'enum-or-custom', options: ENTRY_METHOD_OPTIONS },
  { key: 'apprehensionLocation', label: 'Arrest Location', ph: 'Nashville, Tennessee' },
  { key: 'apprehensionDate', label: 'Arrest Date', ph: 'January 15, 2026', type: 'date' },
  { key: 'criminalHistory', label: 'Criminal History', ph: 'has no criminal record', type: 'enum-or-custom', options: CRIMINAL_HISTORY_OPTIONS },
  { key: 'communityTies', label: 'Community Ties', ph: 'has strong family and community ties', type: 'enum-or-custom', options: COMMUNITY_TIES_OPTIONS },
];
var FILING_FIELDS = [
  { key: 'filingDate', label: 'Filing Date', ph: 'February 19, 2026', type: 'date-group' },
  { key: 'filingDay', label: 'Filing Day', ph: '19th' },
  { key: 'filingMonthYear', label: 'Month & Year', ph: 'February, 2026' },
];
var RESPONDENT_FIELDS = [
  { key: 'warden', label: 'Warden', ph: '' },
  { key: 'fieldOfficeDirector', label: 'FOD', ph: '' },
  { key: 'fieldOfficeName', label: 'Field Office', ph: '' },
];

function buildVarMap(c, p, a1, a2, nat) {
  c = c || {}; p = p || {}; a1 = a1 || {}; a2 = a2 || {}; nat = nat || {};
  return {
    COURT_DISTRICT: p.district || '', COURT_DIVISION: p.division || '',
    CASE_NUMBER: p.caseNumber || '',
    PETITIONER_FULL_NAME: c.name || '', PETITIONER_COUNTRY: c.country || '',
    PETITIONER_YEARS_IN_US: c.yearsInUS || '', PETITIONER_ENTRY_DATE: c.entryDate || '',
    PETITIONER_ENTRY_METHOD: c.entryMethod || '',
    PETITIONER_APPREHENSION_LOCATION: c.apprehensionLocation || '',
    PETITIONER_APPREHENSION_DATE: c.apprehensionDate || '',
    PETITIONER_CRIMINAL_HISTORY: c.criminalHistory || '',
    PETITIONER_COMMUNITY_TIES: c.communityTies || '',
    DETENTION_FACILITY_NAME: p.facilityName || '',
    DETENTION_FACILITY_CITY: p.facilityCity || '',
    DETENTION_FACILITY_STATE: p.facilityState || '',
    WARDEN_NAME: p.warden || '', FIELD_OFFICE_DIRECTOR: p.fieldOfficeDirector || '',
    FIELD_OFFICE_NAME: p.fieldOfficeName || '',
    ICE_DIRECTOR: nat.iceDirector || '', ICE_DIRECTOR_TITLE: nat.iceDirectorTitle || '',
    DHS_SECRETARY: nat.dhsSecretary || '', ATTORNEY_GENERAL: nat.attorneyGeneral || '',
    FILING_DATE: p.filingDate || '', FILING_DAY: p.filingDay || '',
    FILING_MONTH_YEAR: p.filingMonthYear || '',
    ATTORNEY1_NAME: a1.name || '', ATTORNEY1_BAR_NO: a1.barNo || '',
    ATTORNEY1_FIRM: a1.firm || '', ATTORNEY1_ADDRESS: a1.address || '',
    ATTORNEY1_CITY_STATE_ZIP: a1.cityStateZip || '',
    ATTORNEY1_PHONE: a1.phone || '', ATTORNEY1_FAX: a1.fax || '',
    ATTORNEY1_EMAIL: a1.email || '',
    ATTORNEY2_NAME: a2.name || '', ATTORNEY2_BAR_NO: a2.barNo || '',
    ATTORNEY2_FIRM: a2.firm || '', ATTORNEY2_ADDRESS: a2.address || '',
    ATTORNEY2_CITY_STATE_ZIP: a2.cityStateZip || '',
    ATTORNEY2_PHONE: a2.phone || '', ATTORNEY2_EMAIL: a2.email || '',
    ATTORNEY2_PRO_HAC: a2.proHacVice || '',
  };
}

// ── Default Template Blocks ──────────────────────────────────────
var DEFAULT_BLOCKS = [
  // Court title
  { id: 'ct-1', type: 'title', content: 'UNITED STATES DISTRICT COURT' },
  { id: 'ct-2', type: 'title', content: 'FOR THE {{COURT_DISTRICT}}' },
  { id: 'ct-3', type: 'title', content: '{{COURT_DIVISION}}' },
  // Caption
  { id: 'cap-pet', type: 'cap-name', content: '{{PETITIONER_FULL_NAME}},' },
  { id: 'cap-role', type: 'cap-center', content: 'Petitioner-Plaintiff,' },
  { id: 'cap-v', type: 'cap-center', content: 'v.' },
  { id: 'cap-r1', type: 'cap-resp', content: '{{WARDEN_NAME}}, in his official capacity as Warden of {{DETENTION_FACILITY_NAME}};' },
  { id: 'cap-r2', type: 'cap-resp', content: '{{FIELD_OFFICE_DIRECTOR}}, in his official capacity as Field Office Director of the {{FIELD_OFFICE_NAME}} of Enforcement and Removal Operations, U.S. Immigration and Customs Enforcement;' },
  { id: 'cap-r3', type: 'cap-resp', content: 'U.S. Department of Homeland Security;' },
  { id: 'cap-r4', type: 'cap-resp', content: '{{ICE_DIRECTOR}}, in his official capacity as {{ICE_DIRECTOR_TITLE}}, Immigration and Customs Enforcement, U.S. Department of Homeland Security;' },
  { id: 'cap-r5', type: 'cap-resp', content: '{{DHS_SECRETARY}}, in her official capacity as Secretary, U.S. Department of Homeland Security; and' },
  { id: 'cap-r6', type: 'cap-resp', content: '{{ATTORNEY_GENERAL}}, in her official capacity as Attorney General of the United States;\nRespondents-Defendants.' },
  { id: 'cap-case', type: 'cap-case', content: 'C/A No. {{CASE_NUMBER}}' },
  { id: 'cap-title', type: 'cap-doctitle', content: 'PETITION FOR WRIT OF HABEAS CORPUS AND COMPLAINT FOR DECLARATORY AND INJUNCTIVE RELIEF' },
  // Introduction
  { id: 'h-intro', type: 'heading', content: 'INTRODUCTION' },
  { id: 'p-1', type: 'para', content: '1. Petitioner-Plaintiff {{PETITIONER_FULL_NAME}} ("Petitioner") is a citizen of {{PETITIONER_COUNTRY}} who has resided in the U.S. for {{PETITIONER_YEARS_IN_US}} years. On information and belief, Immigration and Customs Enforcement ("ICE") officers apprehended him near his home in {{PETITIONER_APPREHENSION_LOCATION}}, on or about {{PETITIONER_APPREHENSION_DATE}}.' },
  { id: 'p-2', type: 'para', content: '2. Petitioner is currently detained at the {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}.' },
  { id: 'p-3', type: 'para', content: '3. On September 5, 2025, the Board of Immigration Appeals ("BIA") issued a precedential decision that unlawfully reinterpreted the Immigration and Nationality Act ("INA"). See <em>Matter of Yajure Hurtado</em>, 29 I&N Dec. 216 (BIA 2025). Prior to this decision, noncitizens like Petitioner who had lived in the U.S. for many years and were apprehended by ICE in the interior of the country were detained pursuant to 8 U.S.C. \u00a7 1226(a) and eligible to seek bond hearings before Immigration Judges ("IJs"). Instead, in conflict with nearly thirty years of legal precedent, Petitioner is now considered subject to mandatory detention under 8 U.S.C. \u00a7 1225(b)(2)(A) and has no opportunity for release on bond while his removal proceedings are pending.' },
  { id: 'p-4', type: 'para', content: '4. Petitioner\u2019s detention pursuant to \u00a7 1225(b)(2)(A) violates the plain language of the INA and its implementing regulations. Petitioner, who has resided in the U.S. for nearly {{PETITIONER_YEARS_IN_US}} years and who was apprehended in the interior of the U.S., should not be considered an "applicant for admission" who is "seeking admission." Rather, he should be detained pursuant to 8 U.S.C. \u00a7 1226(a), which allows for release on conditional parole or bond.' },
  { id: 'p-5', type: 'para', content: '5. Petitioner seeks declaratory relief that he is subject to detention under \u00a7 1226(a) and its implementing regulations and asks that this Court either order Respondents to release Petitioner from custody or provide him with a bond hearing.' },
  // Custody
  { id: 'h-cust', type: 'heading', content: 'CUSTODY' },
  { id: 'p-6', type: 'para', content: '6. Petitioner is currently in the custody of Immigration and Customs Enforcement ("ICE") at the {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}. He is therefore in "\u2018custody\u2019 of [the DHS] within the meaning of the habeas corpus statute." <em>Jones v. Cunningham</em>, 371 U.S. 236, 243 (1963).' },
  // Jurisdiction
  { id: 'h-jur', type: 'heading', content: 'JURISDICTION' },
  { id: 'p-7', type: 'para', content: '7. This court has jurisdiction under 28 U.S.C. \u00a7 2241 (habeas corpus), 28 U.S.C. \u00a7 1331 (federal question), Article I, \u00a7 9, cl. 2 of the United States Constitution (Suspension Clause), and the Immigration and Nationality Act ("INA"), 8 U.S.C. \u00a7 1101 et seq.' },
  { id: 'p-8', type: 'para', content: '8. This Court may grant relief under the habeas corpus statutes, 28 U.S.C. \u00a7 2241 et seq., the Declaratory Judgment Act, 28 U.S.C. \u00a7 2201 et seq., the All Writs Act, 28 U.S.C. \u00a7 1651, and the Immigration and Nationality Act, 8 U.S.C. \u00a7 1252(e)(2).' },
  { id: 'p-9', type: 'para', content: '9. Federal district courts have jurisdiction to hear habeas claims by non-citizens challenging both the lawfulness and the constitutionality of their detention. See <em>Zadvydas v. Davis</em>, 533 U.S. 678, 687 (2001).' },
  // Requirements of 28 U.S.C. 2241, 2243
  { id: 'h-req', type: 'heading', content: 'REQUIREMENTS OF 28 U.S.C. \u00a7\u00a7 2241, 2243' },
  { id: 'p-10', type: 'para', content: '10. The Court must grant the petition for writ of habeas corpus or issue an order to show cause ("OSC") to Respondents "forthwith," unless Petitioner is not entitled to relief. 28 U.S.C. \u00a7 2243. If an OSC is issued, the Court must require Respondents to file a return "within three days unless for good cause additional time, not exceeding twenty days, is allowed." Id.' },
  { id: 'p-11', type: 'para', content: '11. Petitioner is "in custody" for the purpose of \u00a7 2241 because Petitioner is arrested and detained by Respondents.' },
  // Venue
  { id: 'h-ven', type: 'heading', content: 'VENUE' },
  { id: 'p-12', type: 'para', content: '12. Venue is properly before this Court pursuant to 28 U.S.C. \u00a7 1391(e) because Respondents are employees or officers of the United States acting in their official capacity and because a substantial part of the events or omissions giving rise to the claim occurred in the {{COURT_DISTRICT}}. Petitioner is under the jurisdiction of ICE\u2019s {{FIELD_OFFICE_NAME}}, and he is currently detained at the {{DETENTION_FACILITY_NAME}} in {{DETENTION_FACILITY_CITY}}, {{DETENTION_FACILITY_STATE}}.' },
  // Exhaustion
  { id: 'h-exh', type: 'heading', content: 'EXHAUSTION OF ADMINISTRATIVE REMEDIES' },
  { id: 'p-13', type: 'para', content: '13. Administrative exhaustion is unnecessary as it would be futile. See, e.g., <em>Aguilar v. Lewis</em>, 50 F. Supp. 2d 539, 542\u201343 (E.D. Va. 1999).' },
  { id: 'p-14', type: 'para', content: '14. It would be futile for Petitioner to seek a custody redetermination hearing before an IJ due to the BIA\u2019s recent decision holding that anyone who has entered the U.S. without inspection is now considered an "applicant for admission" who is "seeking admission" and therefore subject to mandatory detention under \u00a7 1225(b)(2)(A). See <em>Matter of Yajure Hurtado</em>, 29 I&N Dec. 216 (BIA 2025); see also <em>Zaragoza Mosqueda v. Noem</em>, 2025 WL 2591530, at *7 (C.D. Cal. Sept. 8, 2025) (noting that BIA\u2019s decision in <em>Yajure Hurtado</em> renders exhaustion futile).' },
  { id: 'p-15', type: 'para', content: '15. Additionally, the agency does not have jurisdiction to review Petitioner\u2019s claim of unlawful custody in violation of his due process rights, and it would therefore be futile for him to pursue administrative remedies. <em>Reno v. Amer.-Arab Anti-Discrim. Comm.</em>, 525 U.S. 471, 119 S.Ct. 936, 142 L.Ed.2d 940 (1999) (finding exhaustion to be a "futile exercise because the agency does not have jurisdiction to review" constitutional claims).' },
  // Parties
  { id: 'h-par', type: 'heading', content: 'PARTIES' },
  { id: 'p-16', type: 'para', content: '16. Petitioner {{PETITIONER_FULL_NAME}} is from {{PETITIONER_COUNTRY}} and has resided in the U.S. since {{PETITIONER_ENTRY_DATE}}. He is currently detained in the {{DETENTION_FACILITY_NAME}}.' },
  { id: 'p-17', type: 'para', content: '17. Respondent {{WARDEN_NAME}} is sued in his official capacity as Warden of the {{DETENTION_FACILITY_NAME}}. In his official capacity, {{WARDEN_NAME}} is Petitioner\u2019s immediate custodian.' },
  { id: 'p-18', type: 'para', content: '18. Respondent {{FIELD_OFFICE_DIRECTOR}} is sued in his official capacity as Field Office Director, {{FIELD_OFFICE_NAME}}, Enforcement and Removal Operations, U.S. Immigration & Customs Enforcement ("ICE"). In his official capacity, Respondent {{FIELD_OFFICE_DIRECTOR}} is the legal custodian of Petitioner.' },
  { id: 'p-19', type: 'para', content: '19. Respondent {{ICE_DIRECTOR}} is sued in his official capacity as {{ICE_DIRECTOR_TITLE}} of ICE. As the {{ICE_DIRECTOR_TITLE}} of ICE, Respondent {{ICE_DIRECTOR}} is a legal custodian of Petitioner.' },
  { id: 'p-20', type: 'para', content: '20. Respondent {{DHS_SECRETARY}} is sued in her official capacity as Secretary of Homeland Security. As the head of the Department of Homeland Security, the agency tasked with enforcing immigration laws, Secretary {{DHS_SECRETARY}} is Petitioner\u2019s ultimate legal custodian.' },
  { id: 'p-21', type: 'para', content: '21. Respondent {{ATTORNEY_GENERAL}} is sued in her official capacity as the Attorney General of the United States. As Attorney General, she has authority over the Department of Justice and is charged with faithfully administering the immigration laws of the United States.' },
  // Legal Background and Argument
  { id: 'h-leg', type: 'heading', content: 'LEGAL BACKGROUND AND ARGUMENT' },
  { id: 'p-22', type: 'para', content: '22. The INA prescribes three basic forms of detention for noncitizens in removal proceedings.' },
  { id: 'p-23', type: 'para', content: '23. First, individuals detained pursuant to 8 U.S.C. \u00a7 1226(a) are generally entitled to a bond hearing, unless they have been arrested, charged with, or convicted of certain crimes and are subject to mandatory detention. See 8 U.S.C. \u00a7\u00a7 1226(a), 1226(c) (listing grounds for mandatory detention); see also 8 C.F.R. \u00a7\u00a7 1003.19(a) (immigration judges may review custody determinations made by DHS), 1236.1(d) (same).' },
  { id: 'p-24', type: 'para', content: '24. Second, the INA provides for mandatory detention of noncitizens subject to expedited removal under 8 U.S.C. \u00a7 1225(b)(1) as well as other recent arrivals deemed to be "seeking admission" under \u00a7 1225(b)(2).' },
  { id: 'p-25', type: 'para', content: '25. Third, the INA authorizes detention of noncitizens who have received a final order of removal, including those in withholding-only proceedings. See 8 U.S.C. \u00a7 1231(a)\u2013(b).' },
  { id: 'p-26', type: 'para', content: '26. Thus, in the decades that followed, most people who entered without inspection and were thereafter detained and placed in standard removal proceedings were considered for release on bond and received bond hearings before an IJ, unless their criminal history rendered them ineligible.' },
  { id: 'p-27', type: 'para', content: '27. For decades, long-term residents of the U.S. who entered without inspection and were subsequently apprehended by ICE in the interior of the country have been detained pursuant to \u00a7 1226 and entitled to bond hearings before an IJ, unless barred from doing so due to their criminal history.' },
  { id: 'p-28', type: 'para', content: '28. In July 2025, however, ICE began asserting that all individuals who entered without inspection should be considered "seeking admission" and therefore subject to mandatory detention under 8 U.S.C. \u00a7 1225(b)(2)(A).' },
  { id: 'p-29', type: 'para', content: '29. On September 5, 2025, the BIA issued a precedential decision adopting this interpretation, despite its departure from the INA\u2019s text, federal precedent, and existing regulations. <em>Matter of Yajure Hurtado</em>, 29 I&N Dec. 216 (BIA 2025).' },
  { id: 'p-30', type: 'para', content: '30. Respondents\u2019 new legal interpretation is contrary to the statutory framework and its implementing regulations.' },
  { id: 'p-31', type: 'para', content: '31. Courts across the country, including this Court, have rejected this interpretation and instead have consistently found that \u00a7 1226, not \u00a7 1225(b)(2), authorizes detention of noncitizens who entered without inspection and were later apprehended in the interior of the country. See, e.g., <em>Hasan v. Crawford</em>, No. 1:25-CV-1408 (LMB/IDD), 2025 WL 2682255 (E.D. Va. Sept. 19, 2025); <em>Quispe Ardiles v. Noem</em>, No. 1:25-cv-01382 (E.D. Va. Sept. 30, 2025); <em>Venancio v. Hyde et al</em>, No. 1:25-cv-12616 (D. Mass. Oct. 9, 2025); <em>Artiga v. Genalo</em>, No. 2:25-cv-05208 (E.D.N.Y. Oct. 7, 2025); <em>Sampiao v. Hyde</em>, 2025 WL 2607924 (D. Mass. Sept. 9, 2025); <em>Leal-Hernandez v. Noem</em>, 2025 WL 2430025 (D. Md. Aug. 24, 2025); <em>Lopez Benitez v. Francis</em>, 2025 WL 2371588 (S.D.N.Y. Aug. 13, 2025); <em>Jimenez v. FCI Berlin, Warden</em>, No. 25-cv-326-LM-AJ (D.N.H. Sept. 8, 2025); <em>Kostak v. Trump</em>, 2025 WL 2472136 (W.D. La. Aug. 27, 2025); <em>Cuevas Guzman v. Andrews</em>, 2025 WL 2617256, at *3 n.4 (E.D. Cal. Sept. 9, 2025).' },
  { id: 'p-32', type: 'para', content: '32. Under the Supreme Court\u2019s recent decision in <em>Loper Bright v. Raimondo</em>, this Court should independently interpret the statute and give the BIA\u2019s expansive interpretation of \u00a7 1225(b)(2) no weight, as it conflicts with the statute, regulations, and precedent. 603 U.S. 369 (2024).' },
  { id: 'p-33', type: 'para', content: '33. The detention provisions at \u00a7 1226(a) and \u00a7 1225(b)(2) were enacted as part of the Illegal Immigration Reform and Immigrant Responsibility Act ("IIRIRA") of 1996, Pub. L. No. 104-208, Div. C, \u00a7\u00a7 302\u201303, 110 Stat. 3009-546, 3009\u2013582 to 3009\u2013583, 3009\u2013585. Following IIRIRA, the Executive Office for Immigration Review ("EOIR") issued regulations clarifying that individuals who entered the country without inspection were not considered detained under \u00a7 1225, but rather under \u00a7 1226(a). See Inspection and Expedited Removal of Aliens; Detention and Removal of Aliens; Conduct of Removal Proceedings; Asylum Procedures, 62 Fed. Reg. 10312, 10323 (Mar. 6, 1997) ("[d]espite being applicants for admission, aliens who are present without having been admitted or paroled (formerly referred to as aliens who entered without inspection) will be eligible for bond and bond redetermination").' },
  { id: 'p-34', type: 'para', content: '34. The statutory context and structure also make clear that \u00a7 1226 applies to individuals who have not been admitted and entered without inspection. In 2025, Congress added new mandatory detention grounds to \u00a7 1226(c) that apply only to noncitizens who have not been admitted. By specifically referencing inadmissibility for entry without inspection under 8 U.S.C. \u00a7 1182(6)(A), Congress made clear that such individuals are otherwise covered by \u00a7 1226(a). Thus, \u00a7 1226 plainly applies to noncitizens charged as inadmissible, including those present without admission or parole.' },
  { id: 'p-35', type: 'para', content: '35. The Supreme Court has explained that \u00a7 1225(b) is concerned "primarily [with those] seeking entry," and is generally imposed "at the Nation\u2019s borders and ports of entry, where the Government must determine whether [a noncitizen] seeking to enter the country is admissible." <em>Jennings v. Rodriguez</em>, 583 U.S. 281, 297, 298 (2018). In contrast, Section 1226 "authorizes the Government to detain certain aliens already in the country pending the outcome of removal proceedings." Id. at 289 (emphases added).' },
  { id: 'p-36', type: 'para', content: '36. Furthermore, \u00a7 1225(b)(2) specifically applies only to those "seeking admission." Similarly, the implementing regulations at 8 C.F.R. \u00a7 1.2 addresses noncitizens who are "coming or attempting to come into the United States." The use of the present progressive tense would exclude noncitizens like Petitioner who are apprehended in the interior years after they entered, as they are no longer "seeking admission" or "coming [...] into the United States." See <em>Martinez v. Hyde</em>, 2025 WL 2084238 at *6 (D. Mass. July 24, 2025) (citing the use of present and present progressive tense to support conclusion that INA \u00a7 1225(b)(2) does not apply to individuals apprehended in the interior); see also <em>Al Otro Lado v. McAleenan</em>, 394 F. Supp. 3d 1168, 1200 (S.D. Cal. 2019) (construing "is arriving" in INA \u00a7 235(b)(1)(A)(i) and observing that "[t]he use of the present progressive, like use of the present participle, denotes an ongoing process").' },
  { id: 'p-37', type: 'para', content: '37. Accordingly, the mandatory detention provision of \u00a7 1225(b)(2) does not apply to Petitioner, who entered the U.S. years before he was apprehended.' },
  // Statement of Facts
  { id: 'h-facts', type: 'heading', content: 'STATEMENT OF FACTS' },
  { id: 'p-38', type: 'para', content: '38. Petitioner is a citizen of {{PETITIONER_COUNTRY}}.' },
  { id: 'p-39', type: 'para', content: '39. On information and belief, Petitioner entered the U.S. {{PETITIONER_ENTRY_METHOD}} in {{PETITIONER_ENTRY_DATE}}, and he has resided in the U.S. since then.' },
  { id: 'p-40', type: 'para', content: '40. On information and belief, Petitioner {{PETITIONER_CRIMINAL_HISTORY}}.' },
  { id: 'p-41', type: 'para', content: '41. On information and belief, Petitioner was arrested by immigration authorities in {{PETITIONER_APPREHENSION_LOCATION}} on {{PETITIONER_APPREHENSION_DATE}}.' },
  { id: 'p-42', type: 'para', content: '42. He is now detained at the {{DETENTION_FACILITY_NAME}}.' },
  { id: 'p-43', type: 'para', content: '43. Without relief from this Court, he faces the prospect of continued detention without any access to a bond hearing.' },
  // Count I
  { id: 'h-c1', type: 'heading', content: 'COUNT I' },
  { id: 'p-c1-sub', type: 'para', content: 'Violation of 8 U.S.C. \u00a7 1226(a) Unlawful Denial of Release on Bond' },
  { id: 'p-44', type: 'para', content: '44. Petitioner restates and realleges all paragraphs as if fully set forth here.' },
  { id: 'p-45', type: 'para', content: '45. Petitioner may be detained, if at all, pursuant to 8 U.S.C. \u00a7 1226(a).' },
  { id: 'p-46', type: 'para', content: '46. Under \u00a7 1226(a) and its associated regulations, Petitioner is entitled to a bond hearing. See 8 C.F.R. 236.1(d) & 1003.19(a)-(f).' },
  { id: 'p-47', type: 'para', content: '47. Petitioner has not been, and will not be, provided with a bond hearing as required by law.' },
  { id: 'p-48', type: 'para', content: '48. Petitioner\u2019s continuing detention is therefore unlawful.' },
  // Count II
  { id: 'h-c2', type: 'heading', content: 'COUNT II' },
  { id: 'p-c2-sub', type: 'para', content: 'Violation of the Bond Regulations, 8 C.F.R. \u00a7\u00a7 236.1, 1236.1 and 1003.19 Unlawful Denial of Release on Bond' },
  { id: 'p-49', type: 'para', content: '49. Petitioner restates and realleges all paragraphs as if fully set forth here.' },
  { id: 'p-50', type: 'para', content: '50. In 1997, after Congress amended the INA through IIRIRA, EOIR and the then-Immigration and Naturalization Service issued an interim rule to interpret and apply IIRIRA. Specifically, under the heading of "Apprehension, Custody, and Detention of [Noncitizens]," the agencies explained that "[d]espite being applicants for admission, [noncitizens] who are present without having been admitted or paroled (formerly referred to as [noncitizens] who entered without inspection) will be eligible for bond and bond redetermination." 62 Fed. Reg. at 10323. The agencies thus made clear that individuals who had entered without inspection were eligible for consideration for bond and bond hearings before IJs under 8 U.S.C. \u00a7 1226 and its implementing regulations.' },
  { id: 'p-51', type: 'para', content: '51. The application of \u00a7 1225(b)(2) to Petitioner unlawfully mandates his continued detention and violates 8 C.F.R. \u00a7\u00a7 236.1, 1236.1, and 1003.19.' },
  // Count III
  { id: 'h-c3', type: 'heading', content: 'COUNT III' },
  { id: 'p-c3-sub', type: 'para', content: 'Violation of Fifth Amendment Right to Due Process' },
  { id: 'p-52', type: 'para', content: '52. Petitioner restates and realleges all paragraphs as if fully set forth here.' },
  { id: 'p-53', type: 'para', content: '53. The Fifth Amendment\u2019s Due Process Clause prohibits the federal government from depriving any person of "life, liberty, or property, without due process of law." U.S. Const. Amend. V.' },
  { id: 'p-54', type: 'para', content: '54. The Supreme Court has repeatedly emphasized that the Constitution generally requires a hearing before the government deprives a person of liberty or property. <em>Zinermon v. Burch</em>, 494 U.S. 113, 127 (1990).' },
  { id: 'p-55', type: 'para', content: '55. Under the <em>Mathews v. Eldridge</em> framework, the balance of interests strongly favors Petitioner\u2019s release.' },
  { id: 'p-56', type: 'para', content: '56. Petitioner\u2019s private interest in freedom from detention is profound. The interest in being free from physical detention is "the most elemental of liberty interests." <em>Hamdi v. Rumsfeld</em>, 542 U.S. 507, 529 (2004); see also <em>Zadvydas v. Davis</em>, 533 U.S. 678, 690 (2001) ("Freedom from imprisonment\u2014from government custody, detention, or other forms of physical restraint\u2014lies at the heart of the liberty that [the Due Process] Clause protects.").' },
  { id: 'p-57', type: 'para', content: '57. The risk of erroneous deprivation is exceptionally high. Petitioner {{PETITIONER_CRIMINAL_HISTORY}} and {{PETITIONER_COMMUNITY_TIES}}.' },
  { id: 'p-58', type: 'para', content: '58. The government\u2019s interest in detaining Petitioner without due process is minimal. Immigration detention is civil, not punitive, and may only be used to prevent danger to the community or ensure appearance at immigration proceedings. See <em>Zadvydas</em>, 533 U.S. at 690.' },
  { id: 'p-59', type: 'para', content: '59. Furthermore, the "fiscal and administrative burdens" of providing Petitioner with a bond hearing are minimal, particularly when weighed against the significant liberty interests at stake. See <em>Mathews</em>, 424 U.S. at 334\u201335.' },
  { id: 'p-60', type: 'para', content: '60. Considering these factors, Petitioner respectfully requests that this Court order his immediate release from custody or provide him with a bond hearing.' },
  // Prayer for Relief
  { id: 'h-pray', type: 'heading', content: 'PRAYER FOR RELIEF' },
  { id: 'p-pray', type: 'para', content: 'WHEREFORE, Petitioner prays that this Court will: (1) Assume jurisdiction over this matter; (2) Set this matter for expedited consideration; (3) Order that Petitioner not be transferred outside of this District; (4) Issue an Order to Show Cause ordering Respondents to show cause why this Petition should not be granted within three days; (5) Declare that Petitioner\u2019s detention is unlawful; (6) Issue a Writ of Habeas Corpus ordering Respondents to release Petitioner from custody or provide him with a bond hearing pursuant to 8 U.S.C. \u00a7 1226(a) or the Due Process Clause within seven days; (7) Award Petitioner attorney\u2019s fees and costs under the Equal Access to Justice Act, and on any other basis justified under law; and (8) Grant any further relief this Court deems just and proper.' },
  // Signature
  { id: 'sig-date', type: 'sig', content: 'Date: {{FILING_DATE}}' },
  { id: 'sig-sub', type: 'sig', content: 'Respectfully Submitted,' },
  { id: 'sig-a1', type: 'sig', content: '/s/ {{ATTORNEY1_NAME}}\n{{ATTORNEY1_NAME}}\n{{ATTORNEY1_BAR_NO}}\n{{ATTORNEY1_FIRM}}\n{{ATTORNEY1_ADDRESS}}\n{{ATTORNEY1_CITY_STATE_ZIP}}\n{{ATTORNEY1_PHONE}} \u00b7 {{ATTORNEY1_FAX}}\n{{ATTORNEY1_EMAIL}}' },
  { id: 'sig-a2', type: 'sig', content: '/s/ {{ATTORNEY2_NAME}}\n{{ATTORNEY2_NAME}}\n{{ATTORNEY2_BAR_NO}}*\n{{ATTORNEY2_FIRM}}\n{{ATTORNEY2_ADDRESS}}\n{{ATTORNEY2_CITY_STATE_ZIP}}\n{{ATTORNEY2_PHONE}}\n{{ATTORNEY2_EMAIL}}\n{{ATTORNEY2_PRO_HAC}}' },
  { id: 'sig-role', type: 'sig-label', content: 'Attorneys for Petitioner' },
  // Verification
  { id: 'h-ver', type: 'heading', content: 'VERIFICATION PURSUANT TO 28 U.S.C. \u00a7 2242' },
  { id: 'p-ver', type: 'para', content: 'I represent Petitioner, {{PETITIONER_FULL_NAME}}, and submit this verification on his behalf. I hereby verify that the factual statements made in the foregoing Petition for Writ of Habeas Corpus are true and correct to the best of my knowledge. Dated this {{FILING_DAY}} day of {{FILING_MONTH_YEAR}}.' },
  { id: 'sig-ver', type: 'sig', content: '/s/ {{ATTORNEY2_NAME}}\n{{ATTORNEY2_NAME}}\nAttorney for Petitioner Appearing Pro Hac Vice' },
];

// ── Matrix Event Types ───────────────────────────────────────────
var EVT_NATIONAL = 'com.amino.config.national';
var EVT_FACILITY = 'com.amino.facility';
var EVT_COURT    = 'com.amino.court';
var EVT_ATTORNEY = 'com.amino.attorney';
var EVT_USER     = 'com.amino.user';
var EVT_TEMPLATE = 'com.amino.template';
var EVT_CLIENT   = 'com.amino.client';
var EVT_PETITION = 'com.amino.petition';
var EVT_PETITION_BLOCKS = 'com.amino.petition.blocks';
var EVT_OP       = 'com.amino.op';

// ── Matrix REST Client ───────────────────────────────────────────
var matrix = {
  baseUrl: '', accessToken: '', userId: '', deviceId: '',
  rooms: {},       // roomId -> { stateEvents: { eventType: { stateKey: {content,sender,origin_server_ts} } } }
  orgRoomId: null,
  templatesRoomId: null,
  _txnId: 0,

  _headers: function() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken,
    };
  },

  _api: function(method, path, body) {
    var opts = { method: method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);
    // Abort fetch after 15 seconds to avoid hanging on unreachable servers
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 15000);
    opts.signal = controller.signal;
    return fetch(this.baseUrl + '/_matrix/client/v3' + path, opts)
      .then(function(r) {
        clearTimeout(timeoutId);
        if (!r.ok) {
          var httpStatus = r.status;
          return r.text().then(function(text) {
            try {
              var parsed = JSON.parse(text);
              // Always include HTTP status on error objects
              if (!parsed.status) parsed.status = httpStatus;
              throw parsed;
            } catch(e) {
              if (e instanceof SyntaxError) {
                throw { errcode: 'M_UNKNOWN', error: 'Server returned ' + httpStatus + ' ' + r.statusText, status: httpStatus };
              }
              throw e;
            }
          });
        }
        return r.json();
      })
      .catch(function(e) {
        clearTimeout(timeoutId);
        if (e && e.errcode) throw e;
        if (e && e.name === 'AbortError') {
          throw { errcode: 'M_NETWORK', error: 'Request timed out', status: 0 };
        }
        throw { errcode: 'M_NETWORK', error: e.message || 'Network error', status: 0 };
      });
  },

  login: function(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 15000);
    return fetch(baseUrl + '/_matrix/client/v3/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'm.login.password',
        identifier: { type: 'm.id.user', user: username },
        password: password,
        initial_device_display_name: 'Amino Habeas App',
      }),
      signal: controller.signal,
    })
    .then(function(r) {
      clearTimeout(timeoutId);
      if (!r.ok) {
        return r.text().then(function(text) {
          try {
            throw JSON.parse(text);
          } catch(e) {
            if (e instanceof SyntaxError) {
              throw { errcode: 'M_UNKNOWN', error: 'Server returned ' + r.status + ' ' + r.statusText, status: r.status };
            }
            if (!e.status) e.status = r.status;
            throw e;
          }
        });
      }
      return r.json();
    })
    .then(function(data) {
      matrix.accessToken = data.access_token;
      matrix.userId = data.user_id;
      matrix.deviceId = data.device_id;
      matrix.saveSession();
      return data;
    })
    .catch(function(e) {
      clearTimeout(timeoutId);
      if (e && e.name === 'AbortError') {
        throw { errcode: 'M_NETWORK', error: 'Request timed out', status: 0 };
      }
      throw e;
    });
  },

  initialSync: function() {
    var filter = JSON.stringify({
      room: {
        state: { lazy_load_members: true },
        timeline: { limit: 0 },
      }
    });
    return this._api('GET', '/sync?timeout=0&filter=' + encodeURIComponent(filter))
      .then(function(data) {
        var joinedRooms = data.rooms && data.rooms.join ? data.rooms.join : {};
        Object.keys(joinedRooms).forEach(function(roomId) {
          var room = joinedRooms[roomId];
          var stateEvents = {};
          var events = (room.state && room.state.events) || [];
          events.forEach(function(evt) {
            if (!stateEvents[evt.type]) stateEvents[evt.type] = {};
            stateEvents[evt.type][evt.state_key] = {
              content: evt.content,
              sender: evt.sender,
              origin_server_ts: evt.origin_server_ts,
            };
          });
          matrix.rooms[roomId] = { stateEvents: stateEvents };
        });
        return data;
      });
  },

  resolveAlias: function(alias) {
    return this._api('GET', '/directory/room/' + encodeURIComponent(alias))
      .then(function(data) { return data.room_id; });
  },

  getStateEvents: function(roomId, eventType) {
    var room = this.rooms[roomId];
    if (!room || !room.stateEvents[eventType]) return {};
    return room.stateEvents[eventType];
  },

  getStateEvent: function(roomId, eventType, stateKey) {
    var room = this.rooms[roomId];
    if (!room || !room.stateEvents[eventType]) return null;
    return room.stateEvents[eventType][stateKey] || null;
  },

  sendStateEvent: function(roomId, eventType, content, stateKey) {
    var sk = encodeURIComponent(stateKey);
    var self = this;
    return this._api('PUT', '/rooms/' + encodeURIComponent(roomId) + '/state/' + encodeURIComponent(eventType) + '/' + sk, content)
      .then(function(data) {
        // Update local cache
        if (!self.rooms[roomId]) self.rooms[roomId] = { stateEvents: {} };
        if (!self.rooms[roomId].stateEvents[eventType]) self.rooms[roomId].stateEvents[eventType] = {};
        self.rooms[roomId].stateEvents[eventType][stateKey] = {
          content: content, sender: self.userId, origin_server_ts: Date.now(),
        };
        return data;
      });
  },

  sendEvent: function(roomId, eventType, content) {
    var txnId = 'm' + Date.now() + '.' + (this._txnId++);
    return this._api('PUT', '/rooms/' + encodeURIComponent(roomId) + '/send/' + encodeURIComponent(eventType) + '/' + txnId, content);
  },

  createRoom: function(options) {
    return this._api('POST', '/createRoom', options);
  },

  adminApi: function(method, path, body) {
    var opts = { method: method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);
    return fetch(this.baseUrl + '/_synapse/admin' + path, opts)
      .then(function(r) {
        if (!r.ok) {
          return r.text().then(function(text) {
            try { throw JSON.parse(text); }
            catch(e) {
              if (e instanceof SyntaxError) {
                throw { errcode: 'M_UNKNOWN', error: 'Admin API returned ' + r.status, status: r.status };
              }
              if (!e.status) e.status = r.status;
              throw e;
            }
          });
        }
        return r.json();
      })
      .catch(function(e) {
        if (e && e.errcode) throw e;
        throw { errcode: 'M_NETWORK', error: e.message || 'Network error', status: 0 };
      });
  },

  inviteUser: function(roomId, userId) {
    return this._api('POST', '/rooms/' + encodeURIComponent(roomId) + '/invite', { user_id: userId });
  },

  setPowerLevel: function(roomId, userId, level) {
    var self = this;
    return this._api('GET', '/rooms/' + encodeURIComponent(roomId) + '/state/m.room.power_levels/')
      .then(function(content) {
        if (!content.users) content.users = {};
        content.users[userId] = level;
        return self._api('PUT', '/rooms/' + encodeURIComponent(roomId) + '/state/m.room.power_levels/', content);
      });
  },

  isReady: function() {
    return !!this.accessToken;
  },

  // Verify the stored token is still valid by calling /whoami
  whoami: function() {
    return this._api('GET', '/account/whoami')
      .then(function(data) {
        return data; // { user_id: "@user:server" }
      });
  },

  saveSession: function() {
    try {
      sessionStorage.setItem('amino_matrix_session', JSON.stringify({
        baseUrl: this.baseUrl, userId: this.userId,
        accessToken: this.accessToken, deviceId: this.deviceId,
      }));
    } catch(e) {}
  },

  loadSession: function() {
    try {
      var raw = sessionStorage.getItem('amino_matrix_session');
      if (!raw) return false;
      var s = JSON.parse(raw);
      this.baseUrl = s.baseUrl;
      this.userId = s.userId;
      this.accessToken = s.accessToken;
      this.deviceId = s.deviceId;
      return true;
    } catch(e) { return false; }
  },

  clearSession: function() {
    sessionStorage.removeItem('amino_matrix_session');
    this.accessToken = '';
    this.userId = '';
    this.rooms = {};
    this.orgRoomId = null;
    this.templatesRoomId = null;
  },
};

// ── App State ────────────────────────────────────────────────────
var S = {
  authenticated: false,
  loading: true,
  syncError: '',
  facilities: {},
  courts: {},
  attProfiles: {},
  national: { iceDirector: '', iceDirectorTitle: '', dhsSecretary: '', attorneyGeneral: '' },
  clients: {},
  petitions: {},
  users: {},
  log: [],
  role: null,
  adminEditUserId: null,
  adminDraft: {},
  currentUser: '',
  currentView: 'board',
  selectedClientId: null,
  selectedPetitionId: null,
  editorTab: 'client',
  dirTab: 'facilities',
  editId: null,
  draft: {},
  boardMode: 'kanban',
  boardTableGroup: 'stage',
  boardAddingMatter: false,
  _rendering: false,
};

var _collapsedGroups = {};
var _prevView = null;
function setState(updates) {
  Object.assign(S, updates);
  if (!S._rendering) {
    S._rendering = true;
    requestAnimationFrame(function() {
      S._rendering = false;
      render();
    });
  }
}

// ── Room discovery from synced data ──────────────────────────────
function discoverRoomByAlias(alias) {
  var roomIds = Object.keys(matrix.rooms);
  // Extract the local part from the alias (e.g., "#org:server" -> "org")
  var localPart = alias.replace(/^#/, '').split(':')[0];
  for (var i = 0; i < roomIds.length; i++) {
    var roomId = roomIds[i];
    var room = matrix.rooms[roomId];
    if (!room || !room.stateEvents) continue;
    // Check m.room.canonical_alias
    var canonical = room.stateEvents['m.room.canonical_alias'];
    if (canonical && canonical[''] && canonical[''].content) {
      if (canonical[''].content.alias === alias) return roomId;
      var alts = canonical[''].content.alt_aliases || [];
      if (alts.indexOf(alias) >= 0) return roomId;
    }
    // Fallback: check m.room.name (e.g., room named "Amino Org" for #org)
    var nameEvt = room.stateEvents['m.room.name'];
    if (nameEvt && nameEvt[''] && nameEvt[''].content && nameEvt[''].content.name) {
      var rname = nameEvt[''].content.name.toLowerCase();
      if (localPart === 'org' && (rname === 'amino org' || rname === 'org')) return roomId;
      if (localPart === 'templates' && (rname === 'templates' || rname === 'amino templates')) return roomId;
    }
  }
  return null;
}

// ── Room auto-creation ───────────────────────────────────────────
function ensureRoom(alias, name) {
  // 1. Check synced data
  var id = discoverRoomByAlias(alias);
  if (id) return Promise.resolve(id);
  // 2. Try alias resolution API
  return matrix.resolveAlias(alias)
    .catch(function() {
      // 3. Room not found — create it
      var localAlias = alias.replace(/^#/, '').split(':')[0];
      return matrix.createRoom({
        name: name,
        room_alias_name: localAlias,
        visibility: 'private',
        preset: 'private_chat',
      }).then(function(data) {
        // Cache the new room locally so getStateEvents works immediately
        if (!matrix.rooms[data.room_id]) {
          matrix.rooms[data.room_id] = { stateEvents: {} };
        }
        return data.room_id;
      }).catch(function(createErr) {
        // If alias already taken (race condition), try resolving again
        if (createErr && createErr.errcode === 'M_ROOM_IN_USE') {
          return matrix.resolveAlias(alias).catch(function() { return null; });
        }
        // If alias creation is restricted, try creating without alias
        if (createErr && (createErr.errcode === 'M_UNKNOWN' || createErr.errcode === 'M_FORBIDDEN')) {
          return matrix.createRoom({
            name: name,
            visibility: 'private',
            preset: 'private_chat',
          }).then(function(data) {
            if (!matrix.rooms[data.room_id]) {
              matrix.rooms[data.room_id] = { stateEvents: {} };
            }
            return data.room_id;
          }).catch(function() { return null; });
        }
        console.warn('Could not create room ' + alias + ':', createErr);
        return null;
      });
    });
}

// ── Hydration from Matrix ────────────────────────────────────────
function hydrateFromMatrix() {
  // Discover or auto-create org and templates rooms
  var orgPromise = ensureRoom(CONFIG.ORG_ROOM_ALIAS, 'Amino Org');
  var tmplPromise = ensureRoom(CONFIG.TEMPLATES_ROOM_ALIAS, 'Templates');

  return orgPromise
    .then(function(resolvedOrgId) {
      matrix.orgRoomId = resolvedOrgId;
      return tmplPromise;
    })
    .then(function(resolvedTmplId) {
      matrix.templatesRoomId = resolvedTmplId;

      // Facilities
      var facEvents = matrix.getStateEvents(matrix.orgRoomId, EVT_FACILITY);
      var facilities = {};
      Object.keys(facEvents).forEach(function(k) {
        var e = facEvents[k];
        if (k && e.content && e.content.name && !e.content.deleted) {
          facilities[k] = Object.assign({ id: k, createdBy: e.sender, updatedAt: new Date(e.origin_server_ts).toISOString() }, e.content);
        }
      });

      // Courts
      var crtEvents = matrix.getStateEvents(matrix.orgRoomId, EVT_COURT);
      var courts = {};
      Object.keys(crtEvents).forEach(function(k) {
        var e = crtEvents[k];
        if (k && e.content && e.content.district && !e.content.deleted) {
          courts[k] = Object.assign({ id: k, createdBy: e.sender, updatedAt: new Date(e.origin_server_ts).toISOString() }, e.content);
        }
      });

      // Attorney profiles
      var attEvents = matrix.getStateEvents(matrix.orgRoomId, EVT_ATTORNEY);
      var attProfiles = {};
      Object.keys(attEvents).forEach(function(k) {
        var e = attEvents[k];
        if (k && e.content && e.content.name && !e.content.deleted) {
          attProfiles[k] = Object.assign({ id: k, createdBy: e.sender, updatedAt: new Date(e.origin_server_ts).toISOString() }, e.content);
        }
      });

      // National defaults
      var natEvt = matrix.getStateEvent(matrix.orgRoomId, EVT_NATIONAL, '');
      var national = { iceDirector: '', iceDirectorTitle: '', dhsSecretary: '', attorneyGeneral: '' };
      if (natEvt && natEvt.content) {
        national = {
          iceDirector: natEvt.content.iceDirector || '',
          iceDirectorTitle: natEvt.content.iceDirectorTitle || '',
          dhsSecretary: natEvt.content.dhsSecretary || '',
          attorneyGeneral: natEvt.content.attorneyGeneral || '',
          createdBy: natEvt.sender,
          updatedAt: new Date(natEvt.origin_server_ts).toISOString(),
        };
      }

      // Users
      var userEvents = matrix.getStateEvents(matrix.orgRoomId, EVT_USER);
      var users = {};
      Object.keys(userEvents).forEach(function(k) {
        var e = userEvents[k];
        if (k && e.content && !e.content.deleted) {
          users[k] = {
            mxid: k,
            displayName: e.content.displayName || k.replace(/@(.+):.*/, '$1'),
            role: e.content.role || 'attorney',
            active: e.content.active !== false,
            createdBy: e.sender,
            updatedAt: new Date(e.origin_server_ts).toISOString(),
          };
        }
      });

      // Client rooms + petitions
      var clients = {};
      var petitions = {};
      Object.keys(matrix.rooms).forEach(function(roomId) {
        var clientEvt = matrix.getStateEvent(roomId, EVT_CLIENT, '');
        if (!clientEvt || !clientEvt.content || clientEvt.content.deleted) return;
        var cc = clientEvt.content;
        var cid = cc.id || roomId;
        clients[cid] = {
          id: cid, name: cc.name || '', country: cc.country || '',
          yearsInUS: cc.yearsInUS || '', entryDate: cc.entryDate || '',
          entryMethod: cc.entryMethod || 'without inspection',
          apprehensionLocation: cc.apprehensionLocation || '',
          apprehensionDate: cc.apprehensionDate || '',
          criminalHistory: cc.criminalHistory || '',
          communityTies: cc.communityTies || '',
          createdAt: new Date(clientEvt.origin_server_ts).toISOString(),
          roomId: roomId,
        };

        // Petitions in this room
        var petEvents = matrix.getStateEvents(roomId, EVT_PETITION);
        Object.keys(petEvents).forEach(function(petId) {
          var pe = petEvents[petId];
          if (!petId || !pe.content || pe.content.deleted) return;
          var pc = pe.content;
          var blocksEvt = matrix.getStateEvent(roomId, EVT_PETITION_BLOCKS, petId);
          var blocks = (blocksEvt && blocksEvt.content && blocksEvt.content.blocks) || [];
          petitions[petId] = {
            id: petId, clientId: pc.clientId || cid, createdBy: pe.sender || '',
            stage: pc.stage || 'drafted',
            stageHistory: pc.stageHistory || [{ stage: 'drafted', at: new Date(pe.origin_server_ts).toISOString() }],
            blocks: blocks,
            district: pc.district || '', division: pc.division || '',
            caseNumber: pc.caseNumber || '',
            facilityName: pc.facilityName || '', facilityCity: pc.facilityCity || '',
            facilityState: pc.facilityState || '', warden: pc.warden || '',
            fieldOfficeDirector: pc.fieldOfficeDirector || '',
            fieldOfficeName: pc.fieldOfficeName || '',
            filingDate: pc.filingDate || '', filingDay: pc.filingDay || '',
            filingMonthYear: pc.filingMonthYear || '',
            templateId: pc.templateId, att1Id: pc.att1Id, att2Id: pc.att2Id,
            _facilityId: pc._facilityId, _courtId: pc._courtId,
            _att1Id: pc._att1Id, _att2Id: pc._att2Id,
            createdAt: new Date(pe.origin_server_ts).toISOString(),
            roomId: roomId,
          };
        });
      });

      // Role
      var role = 'attorney';
      if (matrix.orgRoomId) {
        var plEvt = matrix.getStateEvent(matrix.orgRoomId, 'm.room.power_levels', '');
        if (plEvt && plEvt.content && plEvt.content.users) {
          var myPl = plEvt.content.users[matrix.userId] || 0;
          if (myPl >= 50) role = 'admin';
        }
      }

      var syncError = '';
      if (!matrix.orgRoomId) {
        syncError = 'Could not connect to the organization room. Directory data may be unavailable. Check that the Matrix server is running.';
      }

      setState({
        facilities: facilities, courts: courts, attProfiles: attProfiles,
        national: national, clients: clients, petitions: petitions,
        users: users, role: role, currentUser: matrix.userId, syncError: syncError,
      });
    });
}

// ── Export Functions ─────────────────────────────────────────────
var TITLE_IDS = { 'ct-1': 1, 'ct-2': 1, 'ct-3': 1 };
var CAP_L = ['cap-pet','cap-role','cap-v','cap-r1','cap-r2','cap-r3','cap-r4','cap-r5','cap-r6'];
var CAP_R = ['cap-case','cap-title'];
var CAP_ALL = {};
Object.keys(TITLE_IDS).forEach(function(k) { CAP_ALL[k] = 1; });
CAP_L.forEach(function(k) { CAP_ALL[k] = 1; });
CAP_R.forEach(function(k) { CAP_ALL[k] = 1; });

function subVars(s, vars) {
  return s.replace(/\{\{(\w+)\}\}/g, function(_, k) {
    return (vars[k] && vars[k].trim()) ? vars[k] : '[' + k + ']';
  });
}
function capSub(s, vars) {
  return subVars(s, vars).replace(/\n/g, '<br>');
}

function buildDocHTML(blocks, vars) {
  var titles = blocks.filter(function(b) { return TITLE_IDS[b.id]; })
    .map(function(b) { return '<div class="title">' + capSub(b.content, vars) + '</div>'; }).join('');
  var capLeft = blocks.filter(function(b) { return CAP_L.indexOf(b.id) >= 0; })
    .map(function(b) {
      var cls = b.type === 'cap-name' ? 'cn' : b.type === 'cap-center' ? 'cc' : 'rr';
      return '<div class="' + cls + '">' + capSub(b.content, vars) + '</div>';
    }).join('');
  var capRight = blocks.filter(function(b) { return CAP_R.indexOf(b.id) >= 0; })
    .map(function(b) {
      var cls = b.type === 'cap-case' ? 'ck' : 'cd';
      return '<div class="' + cls + '">' + capSub(b.content, vars) + '</div>';
    }).join('');
  var body = blocks.filter(function(b) { return !CAP_ALL[b.id]; })
    .map(function(b) {
      var cls = b.type === 'heading' ? 'heading' : b.type === 'sig' ? 'sig' : b.type === 'sig-label' ? 'sig-label' : 'para';
      var text = b.type === 'heading' ? capSub(b.content, vars).toUpperCase() : capSub(b.content, vars);
      return '<div class="' + cls + '">' + text + '</div>';
    }).join('');
  var parens = Array(24).fill(')').join('<br>');
  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head>' +
    '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>' +
    '<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->' +
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
    '<style>@page WordSection1{size:8.5in 11in;margin:1in;mso-header-margin:.5in;mso-footer-margin:.5in;mso-paper-source:0}div.WordSection1{page:WordSection1}body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.35}.title{text-align:center;font-weight:bold;margin:0}.heading{font-weight:bold;text-transform:uppercase;margin:18pt 0 6pt}.para{margin:0 0 10pt;text-align:justify}.sig{white-space:pre-line;margin:0 0 10pt}.sig-label{font-style:italic}table.c{width:100%;border-collapse:collapse;margin:18pt 0}table.c td{vertical-align:top;padding:0 4pt}.cl{width:55%}.cm{width:5%;text-align:center}.cr{width:40%}.cn{text-align:center;font-weight:bold}.cc{text-align:center;margin:10pt 0}.rr{margin:0 0 8pt}.ck{margin:0 0 12pt}.cd{font-weight:bold}</style></head><body><div class="WordSection1">' + titles + '<table class="c"><tr><td class="cl">' + capLeft + '</td><td class="cm">' + parens + '</td><td class="cr">' + capRight + '</td></tr></table>' + body + '</div></body></html>';
}

function doExportDoc(blocks, vars, name) {
  var html = buildDocHTML(blocks, vars);
  var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'habeas-' + (name || 'matter').replace(/\s+/g, '-').toLowerCase() + '-' + new Date().toISOString().slice(0, 10) + '.doc';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function doExportPDF(blocks, vars) {
  var w = window.open('', '_blank', 'width=850,height=1100');
  if (!w) { alert('Allow popups for PDF export'); return; }
  w.document.write(buildDocHTML(blocks, vars));
  w.document.close();
  setTimeout(function() { w.focus(); w.print(); }, 500);
}

// ── Template-based export (uses template.html) ─────────────────
function buildExportFromTemplate(vars, forWord) {
  return fetch('template.html')
    .then(function(r) {
      if (!r.ok) throw new Error('Template fetch failed: ' + r.status);
      return r.text();
    })
    .then(function(html) {
      // Replace <span class="ph">{{VAR}}</span> with value or [VAR]
      html = html.replace(/<span class="ph">\{\{(\w+)\}\}<\/span>/g, function(_, k) {
        return (vars[k] && vars[k].trim()) ? esc(vars[k]) : '[' + k + ']';
      });
      // Replace bare {{VAR}} (e.g. inside <h2> headings)
      html = html.replace(/\{\{(\w+)\}\}/g, function(_, k) {
        return (vars[k] && vars[k].trim()) ? vars[k] : '[' + k + ']';
      });
      // Override .ph styling for export (no red color)
      html = html.replace('.ph {', '.ph-disabled {');
      if (forWord) {
        // Add Word XML namespaces for .doc compatibility
        html = html.replace('<!doctype html>', '');
        html = html.replace('<html lang="en">', '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">');
        // Replace HTML5 meta charset with http-equiv form Word understands
        html = html.replace('<meta charset="utf-8" />', '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">');
        // Remove viewport meta tag which Word doesn't understand
        html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1" />', '');
        // Inject Word XML document settings after <head>
        var wordXml = '<!--[if gte mso 9]><xml>' +
          '<o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>' +
          '</xml><xml>' +
          '<w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument>' +
          '</xml><![endif]-->';
        html = html.replace('<head>', '<head>\n' + wordXml);
        // Add Word-specific page setup CSS
        var msoCss = '\n  @page WordSection1 { size: 8.5in 11in; margin: 1in; mso-header-margin: 0.5in; mso-footer-margin: 0.5in; mso-paper-source: 0; }' +
          '\n  div.WordSection1 { page: WordSection1; }';
        html = html.replace('</style>', msoCss + '\n</style>');
        // Wrap body content in a WordSection1 div
        html = html.replace('<body>', '<body><div class="WordSection1">');
        html = html.replace('</body>', '</div></body>');
      }
      return html;
    });
}

// ── Matrix sync helpers ─────────────────────────────────────────
var _syncTimers = {};
function debouncedSync(key, fn) {
  if (_syncTimers[key]) clearTimeout(_syncTimers[key]);
  _syncTimers[key] = setTimeout(fn, 1000);
}

function syncClientToMatrix(client) {
  if (!matrix.isReady() || !client.roomId) return Promise.resolve();
  return matrix.sendStateEvent(client.roomId, EVT_CLIENT, {
    id: client.id, name: client.name, country: client.country,
    yearsInUS: client.yearsInUS, entryDate: client.entryDate,
    entryMethod: client.entryMethod,
    apprehensionLocation: client.apprehensionLocation,
    apprehensionDate: client.apprehensionDate,
    criminalHistory: client.criminalHistory,
    communityTies: client.communityTies,
  }, '').catch(function(e) { console.error('Client sync failed:', e); });
}

// Create a Matrix room for a client and sync initial data
var _pendingRoomCreations = {};
function createClientRoom(clientId) {
  if (!matrix.isReady()) return Promise.resolve();
  var client = S.clients[clientId];
  if (!client) return Promise.resolve();
  // Already has a room
  if (client.roomId) return Promise.resolve(client.roomId);
  // Room creation already in flight for this client
  if (_pendingRoomCreations[clientId]) return _pendingRoomCreations[clientId];
  var roomName = 'client:' + (client.name || client.id);
  _pendingRoomCreations[clientId] = matrix.createRoom({
    name: roomName,
    visibility: 'private',
    preset: 'private_chat',
    initial_state: [
      {
        type: EVT_CLIENT,
        state_key: '',
        content: {
          id: client.id, name: client.name, country: client.country,
          yearsInUS: client.yearsInUS, entryDate: client.entryDate,
          entryMethod: client.entryMethod,
          apprehensionLocation: client.apprehensionLocation,
          apprehensionDate: client.apprehensionDate,
          criminalHistory: client.criminalHistory,
          communityTies: client.communityTies,
        },
      },
    ],
  }).then(function(data) {
    var roomId = data.room_id;
    // Update local cache
    if (!matrix.rooms[roomId]) matrix.rooms[roomId] = { stateEvents: {} };
    if (!matrix.rooms[roomId].stateEvents[EVT_CLIENT]) matrix.rooms[roomId].stateEvents[EVT_CLIENT] = {};
    matrix.rooms[roomId].stateEvents[EVT_CLIENT][''] = {
      content: {
        id: client.id, name: client.name, country: client.country,
        yearsInUS: client.yearsInUS, entryDate: client.entryDate,
        entryMethod: client.entryMethod,
        apprehensionLocation: client.apprehensionLocation,
        apprehensionDate: client.apprehensionDate,
        criminalHistory: client.criminalHistory,
        communityTies: client.communityTies,
      },
      sender: matrix.userId,
      origin_server_ts: Date.now(),
    };
    // Update client's roomId in state
    client.roomId = roomId;
    S.clients[clientId] = client;
    // Also update roomId on any petitions for this client
    Object.values(S.petitions).forEach(function(p) {
      if (p.clientId === clientId && !p.roomId) {
        p.roomId = roomId;
        // Sync any pending petitions now that we have a roomId
        syncPetitionToMatrix(p);
        if (p.blocks && p.blocks.length > 0) {
          matrix.sendStateEvent(roomId, EVT_PETITION_BLOCKS, { blocks: p.blocks }, p.id)
            .catch(function(e) { console.error('Block sync failed:', e); });
        }
      }
    });
    console.log('Created Matrix room for client', clientId, '→', roomId);
    delete _pendingRoomCreations[clientId];
    return roomId;
  }).catch(function(e) {
    console.error('Failed to create client room:', e);
    delete _pendingRoomCreations[clientId];
  });
  return _pendingRoomCreations[clientId];
}

function syncPetitionToMatrix(pet) {
  if (!matrix.isReady() || !pet.roomId) return Promise.resolve();
  return matrix.sendStateEvent(pet.roomId, EVT_PETITION, {
    clientId: pet.clientId, stage: pet.stage, stageHistory: pet.stageHistory,
    district: pet.district, division: pet.division, caseNumber: pet.caseNumber,
    facilityName: pet.facilityName, facilityCity: pet.facilityCity,
    facilityState: pet.facilityState, warden: pet.warden,
    fieldOfficeDirector: pet.fieldOfficeDirector, fieldOfficeName: pet.fieldOfficeName,
    filingDate: pet.filingDate, filingDay: pet.filingDay,
    filingMonthYear: pet.filingMonthYear,
    _facilityId: pet._facilityId, _courtId: pet._courtId,
    _att1Id: pet._att1Id, _att2Id: pet._att2Id,
    templateId: pet.templateId,
  }, pet.id).catch(function(e) { console.error('Petition sync failed:', e); });
}

// ── Block / Variable HTML helpers ────────────────────────────────
var CLS_MAP = {
  title: 'blk-title', heading: 'blk-heading', para: 'blk-para',
  'cap-name': 'blk-cap-name', 'cap-center': 'blk-cap-center',
  'cap-resp': 'blk-cap-resp', 'cap-case': 'blk-cap-case',
  'cap-doctitle': 'blk-cap-doctitle', sig: 'blk-sig', 'sig-label': 'blk-sig-label',
};

function blockToHtml(content, vars) {
  var h = content.replace(/\n/g, '<br/>');
  return h.replace(/\{\{(\w+)\}\}/g, function(_, k) {
    var v = vars[k] ? vars[k].trim() : '';
    return v
      ? '<span data-var="' + k + '" contenteditable="false" class="vf">' + esc(v) + '</span>'
      : '<span data-var="' + k + '" contenteditable="false" class="ve">\u27E8' + k + '\u27E9</span>';
  });
}

function extractBlockContent(el) {
  var c = el.cloneNode(true);
  c.querySelectorAll('br').forEach(function(b) {
    b.replaceWith('\n');
  });
  c.querySelectorAll('[data-var]').forEach(function(s) {
    s.replaceWith('{{' + s.dataset.var + '}}');
  });
  return c.textContent || '';
}

// ── Component Renderers ──────────────────────────────────────────
function htmlFieldGroup(title, fields, data, onChangePrefix) {
  var h = '<div class="fg">';
  if (title) h += '<div class="fg-title">' + esc(title) + '</div>';
  fields.forEach(function(f) {
    if (f.type === 'date-group' && f.key === 'filingDate') {
      h += htmlDateGroupField(fields, data, onChangePrefix);
      return;
    }
    if (f.key === 'filingDay' || f.key === 'filingMonthYear') return; // rendered by date-group
    var val = (data && data[f.key]) || '';
    var chk = val && val.trim() ? '<span class="fchk">&#10003;</span>' : '';
    var vErr = '';
    if (f.validate && val && val.trim()) {
      var err = f.validate(val);
      if (err) {
        vErr = '<span class="fval-err">' + esc(err) + '</span>';
        chk = '<span class="fval-warn">&#9888;</span>';
      }
    }
    h += '<div class="frow"><label class="flbl">' + esc(f.label) + chk + '</label>';
    h += htmlFieldInput(f, val, onChangePrefix);
    h += vErr + '</div>';
  });
  h += '</div>';
  return h;
}

function htmlFieldInput(f, val, onChangePrefix) {
  if (f.type === 'enum') return htmlEnumSelect(f, val, onChangePrefix);
  if (f.type === 'enum-or-custom') return htmlEnumOrCustom(f, val, onChangePrefix);
  if (f.type === 'date') return htmlDateField(f, val, onChangePrefix);
  return '<input type="text" class="finp" value="' + esc(val) + '" placeholder="' + esc(f.ph || '') + '" data-field-key="' + f.key + '" data-change="' + onChangePrefix + '">';
}

function htmlEnumSelect(f, val, onChangePrefix) {
  var h = '<select class="finp" data-field-key="' + f.key + '" data-change="' + onChangePrefix + '">';
  h += '<option value="">\u2014 Select \u2014</option>';
  var foundVal = false;
  for (var i = 0; i < f.options.length; i++) {
    var opt = f.options[i];
    if (opt === '---') {
      h += '<option disabled>\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</option>';
      continue;
    }
    var sel = (opt === val) ? ' selected' : '';
    if (opt === val) foundVal = true;
    h += '<option value="' + esc(opt) + '"' + sel + '>' + esc(opt) + '</option>';
  }
  if (val && val.trim() && !foundVal) {
    h += '<option value="' + esc(val) + '" selected>' + esc(val) + ' (custom)</option>';
  }
  h += '</select>';
  return h;
}

function htmlEnumOrCustom(f, val, onChangePrefix) {
  var isPreset = false;
  for (var i = 0; i < f.options.length; i++) {
    if (f.options[i] === val) { isPreset = true; break; }
  }
  var isEmpty = !val || !val.trim();
  var isCustom = !isEmpty && !isPreset;

  var h = '<select class="finp enum-custom-sel" data-field-key="' + f.key + '" data-change="' + onChangePrefix + '-enum">';
  for (var i = 0; i < f.options.length; i++) {
    var opt = f.options[i];
    var sel = (opt === val) ? ' selected' : '';
    h += '<option value="' + esc(opt) + '"' + sel + '>' + esc(opt) + '</option>';
  }
  h += '<option value="__custom__"' + (isCustom ? ' selected' : '') + '>Other (custom)</option>';
  h += '</select>';
  var display = isCustom ? '' : ' style="display:none"';
  h += '<input type="text" class="finp enum-custom-inp" value="' + (isCustom ? esc(val) : '') + '"' +
       ' placeholder="Enter custom value..." data-field-key="' + f.key + '" data-change="' + onChangePrefix + '-custom"' + display + '>';
  return h;
}

function htmlDateField(f, val, onChangePrefix) {
  return '<input type="text" class="finp date-pick" value="' + esc(val) + '" placeholder="' + esc(f.ph || '') + '" data-field-key="' + f.key + '" data-change="' + onChangePrefix + '" data-flatpickr="1">';
}

function htmlDateGroupField(fields, data, onChangePrefix) {
  var filingDate = (data && data.filingDate) || '';
  var filingDay = (data && data.filingDay) || '';
  var filingMonthYear = (data && data.filingMonthYear) || '';
  var chk = filingDate && filingDate.trim() ? '<span class="fchk">&#10003;</span>' : '';
  var h = '<div class="frow"><label class="flbl">Filing Date' + chk + '</label>';
  h += '<input type="text" class="finp date-pick" value="' + esc(filingDate) + '" placeholder="February 19, 2026" data-field-key="filingDate" data-change="' + onChangePrefix + '" data-flatpickr="filing-group">';
  if (filingDate && filingDate.trim()) {
    h += '<div class="date-group-preview">';
    h += 'Day: <strong>' + esc(filingDay) + '</strong> &nbsp; Month/Year: <strong>' + esc(filingMonthYear) + '</strong>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

function htmlFacilityAutocomplete() {
  return '<div class="fac-ac-wrap"><label class="flbl">Search ICE Facilities</label>' +
    '<input type="text" class="finp" id="fac-ac-input" placeholder="Type facility name or city..." data-change="fac-ac">' +
    '<div class="fac-ac-list" id="fac-ac-list" style="display:none"></div></div>';
}

function htmlPicker(label, items, displayFn, value, onChangeAction, onNewAction) {
  var h = '<div class="picker"><label class="flbl">' + esc(label) + '</label><div class="picker-row">';
  h += '<select class="finp picker-sel" data-change="' + onChangeAction + '">';
  h += '<option value="">\u2014 Select \u2014</option>';
  items.forEach(function(it) {
    var sel = it.id === value ? ' selected' : '';
    h += '<option value="' + esc(it.id) + '"' + sel + '>' + esc(displayFn(it)) + '</option>';
  });
  h += '</select>';
  if (onNewAction) {
    h += '<button class="hbtn sm" data-action="' + onNewAction + '">+</button>';
  }
  h += '</div></div>';
  return h;
}

function petAttorneyNames(p) {
  var names = [];
  if (p._att1Id && S.attProfiles[p._att1Id]) names.push(S.attProfiles[p._att1Id].name);
  if (p._att2Id && S.attProfiles[p._att2Id]) names.push(S.attProfiles[p._att2Id].name);
  return names.length > 0 ? names.join(', ') : '';
}

function htmlProvenanceBadge(record) {
  if (!record || !record.createdBy) return '';
  var h = '<div class="prov"><span class="prov-item">Created by <strong>' + esc(record.createdBy) + '</strong> ';
  if (record.createdAt) h += ts(record.createdAt);
  h += '</span>';
  if (record.updatedAt && record.updatedAt !== record.createdAt) {
    h += '<span class="prov-item">Updated by <strong>' + esc(record.updatedBy || '') + '</strong> ' + ts(record.updatedAt) + '</span>';
  }
  h += '</div>';
  return h;
}

// ── View Renderers ───────────────────────────────────────────────
function renderLogin() {
  return '<div class="login-wrap"><form class="login-box" id="login-form">' +
    '<div class="login-brand">Habeas</div>' +
    '<div class="login-sub">Amino Immigration</div>' +
    '<div id="login-error" class="login-error" style="display:none"></div>' +
    '<div class="frow"><label class="flbl">Username</label>' +
    '<input class="finp" type="text" id="login-user" placeholder="attorney" autofocus></div>' +
    '<div class="frow"><label class="flbl">Password</label>' +
    '<input class="finp" type="password" id="login-pass" placeholder="password"></div>' +
    '<button type="submit" class="hbtn accent login-btn" id="login-btn">Sign In</button>' +
    '<div class="login-server">Server: ' + CONFIG.MATRIX_SERVER_URL.replace('https://', '') + '</div>' +
    '</form></div>';
}

function renderHeader() {
  var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
  var petClient = pet ? S.clients[pet.clientId] : null;
  var h = '<header class="hdr"><div class="hdr-left">';
  h += '<span class="hdr-brand">Habeas</span><nav class="hdr-nav">';
  var tabs = [['board','Board'],['clients','Clients'],['directory','Directory']];
  if (S.role === 'admin') tabs.push(['admin','Admin']);
  if (pet) tabs.push(['editor','Editor']);
  tabs.forEach(function(t) {
    h += '<button class="nav-btn' + (S.currentView === t[0] ? ' on' : '') + '" data-action="nav" data-view="' + t[0] + '">' + t[1] + '</button>';
  });
  h += '</nav></div><div class="hdr-right">';
  h += '<span class="role-badge" style="color:' + (S.role === 'admin' ? '#a08540' : '#8a8a9a') + '">' + (S.role === 'admin' ? 'Admin' : 'Attorney') + '</span>';
  if (pet) {
    var sm = SM[pet.stage] || SM.drafted;
    h += '<span class="stage-badge" style="background:' + sm.color + '">' + pet.stage + '</span>';
    h += '<button class="hbtn export" data-action="export-word">Word</button>';
    h += '<button class="hbtn export" data-action="export-pdf">PDF</button>';
  }
  h += '<button class="hbtn" data-action="logout">Sign Out</button>';
  h += '</div></header>';
  return h;
}

function renderBoard() {
  var all = Object.values(S.petitions);
  var vis = S.role === 'admin' ? all : all.filter(function(p) { return p.createdBy === S.currentUser; });

  var h = '<div class="board-view">';

  // Toggle bar
  h += '<div class="board-toggle-bar">';
  h += '<div class="board-toggle">';
  h += '<button class="board-toggle-btn' + (S.boardMode === 'kanban' ? ' on' : '') + '" data-action="board-mode" data-mode="kanban">Kanban</button>';
  h += '<button class="board-toggle-btn' + (S.boardMode === 'table' ? ' on' : '') + '" data-action="board-mode" data-mode="table">Table</button>';
  h += '</div>';

  if (S.boardMode === 'table') {
    h += '<div class="board-group-sel">';
    h += '<label class="board-group-label">Group by</label>';
    h += '<select class="finp board-group-input" data-change="board-table-group">';
    ['stage', 'attorney', 'facility', 'court'].forEach(function(g) {
      h += '<option value="' + g + '"' + (S.boardTableGroup === g ? ' selected' : '') + '>' + g.charAt(0).toUpperCase() + g.slice(1) + '</option>';
    });
    h += '</select>';
    h += '</div>';
  }

  // Add Matter button / inline client picker
  var clientList = Object.values(S.clients);
  if (S.boardAddingMatter && clientList.length > 0) {
    h += '<div class="board-add-matter">';
    h += '<select class="finp board-add-matter-sel" data-change="board-create-matter">';
    h += '<option value="">Select client\u2026</option>';
    clientList.forEach(function(c) {
      h += '<option value="' + c.id + '">' + esc(c.name || 'Unnamed') + '</option>';
    });
    h += '</select>';
    h += '<button class="hbtn" data-action="board-cancel-add-matter">Cancel</button>';
    h += '</div>';
  } else {
    h += '<button class="hbtn accent" data-action="board-add-matter">+ Add Matter</button>';
  }

  h += '</div>';

  if (S.boardMode === 'table') {
    h += renderBoardTable(vis);
  } else {
    h += renderBoardKanban(vis);
  }

  if (vis.length === 0) {
    h += '<div class="board-empty"><p>No matters yet. Click <strong>+ Add Matter</strong> above, or go to <strong>Clients</strong> to get started.</p></div>';
  }

  h += '</div>';
  return h;
}

function renderBoardKanban(vis) {
  var h = '<div class="kanban">';
  STAGES.forEach(function(stage) {
    var items = vis.filter(function(p) { return p.stage === stage; })
      .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var m = SM[stage];
    h += '<div class="kb-col"><div class="kb-col-head" style="border-bottom-color:' + m.color + '">';
    h += '<span class="kb-col-title">' + m.label + '</span>';
    h += '<span class="kb-col-count" style="background:' + m.color + '">' + items.length + '</span>';
    h += '</div><div class="kb-col-body">';
    if (items.length === 0) {
      h += '<div class="kb-empty">None</div>';
    }
    items.forEach(function(p) {
      var cl = S.clients[p.clientId];
      var si = STAGES.indexOf(p.stage);
      var attNames = petAttorneyNames(p);
      h += '<div class="kb-card" style="border-left-color:' + m.color + '" data-action="open-petition" data-id="' + p.id + '">';
      h += '<div class="kb-card-name">' + esc(cl ? cl.name || 'Unnamed' : 'Unnamed') + '</div>';
      h += '<div class="kb-card-meta">' + esc(p.caseNumber || 'No case no.') + (p.district ? ' \u00b7 ' + esc(p.district) : '') + '</div>';
      h += '<div class="kb-card-meta">' + esc(p.facilityName || '') + '</div>';
      if (attNames) {
        h += '<div class="kb-card-meta kb-card-att">' + esc(attNames) + '</div>';
      }
      h += '<div class="kb-card-date">' + new Date(p.createdAt).toLocaleDateString() + ' <span class="kb-card-ago">(' + timeAgo(p.createdAt) + ')</span></div>';
      if (p.stageHistory && p.stageHistory.length > 1) {
        h += '<div class="kb-dots">';
        p.stageHistory.forEach(function(sh) {
          var sc = SM[sh.stage] ? SM[sh.stage].color : '#ccc';
          h += '<span class="kb-dot" style="background:' + sc + '" title="' + sh.stage + ' ' + ts(sh.at) + '"></span>';
        });
        h += '</div>';
      }
      h += '<div class="kb-card-actions">';
      if (si > 0) h += '<button class="kb-btn" data-action="stage-change" data-id="' + p.id + '" data-dir="revert">&larr; ' + STAGES[si - 1] + '</button>';
      if (si < STAGES.length - 1) h += '<button class="kb-btn accent" data-action="stage-change" data-id="' + p.id + '" data-dir="advance">' + STAGES[si + 1] + ' &rarr;</button>';
      h += '</div></div>';
    });
    h += '</div></div>';
  });
  h += '</div>';
  return h;
}

function renderBoardTable(vis) {
  var groupKey = S.boardTableGroup;
  var groups = {};

  vis.forEach(function(p) {
    var key;
    if (groupKey === 'stage') {
      key = p.stage || 'drafted';
    } else if (groupKey === 'attorney') {
      key = petAttorneyNames(p) || 'Unassigned';
    } else if (groupKey === 'facility') {
      key = p.facilityName || 'No Facility';
    } else if (groupKey === 'court') {
      key = p.district || 'No Court';
    } else {
      key = 'All';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  var groupKeys;
  if (groupKey === 'stage') {
    groupKeys = STAGES.filter(function(s) { return groups[s]; });
  } else {
    groupKeys = Object.keys(groups).sort();
  }

  var h = '<div class="board-table-wrap"><table class="board-table">';
  h += '<thead><tr>';
  h += '<th>Client</th><th>Case No.</th><th>Stage</th><th>District</th>';
  h += '<th>Facility</th><th>Attorney(s)</th><th>Created</th><th>Age</th>';
  h += '</tr></thead>';
  h += '<tbody>';

  groupKeys.forEach(function(gk) {
    var items = groups[gk];
    items.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var collapsed = _collapsedGroups[groupKey + ':' + gk];
    var sm = (groupKey === 'stage' && SM[gk]) ? SM[gk] : null;
    var colorDot = sm ? '<span class="kb-dot" style="background:' + sm.color + ';display:inline-block;vertical-align:middle;margin-right:6px"></span>' : '';

    h += '<tr class="board-table-group-hdr" data-action="toggle-group" data-group="' + esc(groupKey + ':' + gk) + '">';
    h += '<td colspan="8">';
    h += '<span class="group-arrow">' + (collapsed ? '&#9654;' : '&#9660;') + '</span> ';
    h += colorDot + '<strong>' + esc(gk) + '</strong> <span class="group-count">(' + items.length + ')</span>';
    h += '</td></tr>';

    if (!collapsed) {
      items.forEach(function(p) {
        var cl = S.clients[p.clientId];
        var attNames = petAttorneyNames(p);
        var stm = SM[p.stage] || SM.drafted;
        h += '<tr class="board-table-row" data-action="open-petition" data-id="' + p.id + '">';
        h += '<td class="bt-client">' + esc(cl ? cl.name || 'Unnamed' : 'Unnamed') + '</td>';
        h += '<td>' + esc(p.caseNumber || '\u2014') + '</td>';
        h += '<td><span class="stage-badge sm" style="background:' + stm.color + '">' + esc(p.stage) + '</span></td>';
        h += '<td>' + esc(p.district || '\u2014') + '</td>';
        h += '<td>' + esc(p.facilityName || '\u2014') + '</td>';
        h += '<td>' + esc(attNames || '\u2014') + '</td>';
        h += '<td class="bt-date">' + new Date(p.createdAt).toLocaleDateString() + '</td>';
        h += '<td class="bt-age">' + timeAgo(p.createdAt) + '</td>';
        h += '</tr>';
      });
    }
  });

  h += '</tbody></table></div>';
  return h;
}

function renderClients() {
  var allClients = Object.values(S.clients);
  var clientList;
  if (S.role === 'admin') {
    clientList = allClients;
  } else {
    var myClientIds = {};
    Object.values(S.petitions).forEach(function(p) {
      if (p.createdBy === S.currentUser) myClientIds[p.clientId] = true;
    });
    clientList = allClients.filter(function(c) { return myClientIds[c.id]; });
  }
  var client = S.selectedClientId ? S.clients[S.selectedClientId] : null;
  var clientPets = client ? Object.values(S.petitions).filter(function(p) { return p.clientId === client.id; }) : [];
  var h = '<div class="clients-view"><div class="cv-sidebar"><div class="cv-head">';
  h += '<span class="cv-title">Clients</span>';
  h += '<button class="hbtn accent" data-action="create-client">+ New</button></div>';
  h += '<div class="cv-list">';
  if (clientList.length === 0) {
    h += '<div class="cv-empty">No clients yet.</div>';
  }
  clientList.forEach(function(c) {
    var pets = Object.values(S.petitions).filter(function(p) { return p.clientId === c.id; });
    h += '<div class="cv-item' + (S.selectedClientId === c.id ? ' on' : '') + '" data-action="select-client" data-id="' + c.id + '">';
    h += '<div class="cv-item-name">' + esc(c.name || 'Unnamed') + '</div>';
    h += '<div class="cv-item-meta">' + esc(c.country || '') + (pets.length > 0 ? ' \u00b7 ' + pets.length + ' matter' + (pets.length !== 1 ? 's' : '') : '') + '</div>';
    pets.forEach(function(p) {
      var sc = SM[p.stage] ? SM[p.stage].color : '#ccc';
      h += '<span class="stage-badge sm" style="background:' + sc + '">' + p.stage + '</span>';
    });
    h += '</div>';
  });
  h += '</div></div>';
  h += '<div class="cv-detail">';
  if (client) {
    h += '<div class="cv-detail-head"><h2>' + esc(client.name || 'New Client') + '</h2>';
    h += '<button class="hbtn accent" data-action="create-petition" data-client-id="' + client.id + '">+ New Matter</button></div>';
    h += htmlFieldGroup('Client Information', CLIENT_FIELDS, client, 'client-field');
    if (clientPets.length > 0) {
      h += '<div class="fg"><div class="fg-title">Matters</div>';
      clientPets.forEach(function(p) {
        var sc = SM[p.stage] ? SM[p.stage].color : '#ccc';
        h += '<div class="pet-row" data-action="open-petition" data-id="' + p.id + '">';
        h += '<span class="stage-badge" style="background:' + sc + '">' + p.stage + '</span>';
        h += '<span style="flex:1;font-size:12px">' + esc(p.caseNumber || 'No case no.') + '</span>';
        h += '<span style="font-size:11px;color:#aaa">' + new Date(p.createdAt).toLocaleDateString() + '</span>';
        h += '</div>';
      });
      h += '</div>';
    }
  } else {
    h += '<div class="cv-empty-detail"><div style="font-size:48px;opacity:.3;margin-bottom:16px">&#9878;</div><p>Select or create a client.</p></div>';
  }
  h += '</div></div>';
  return h;
}

function renderDirectory() {
  var tab = S.dirTab;
  var isAdmin = S.role === 'admin';
  var h = '<div class="dir-view"><div class="dir-tabs">';
  [['facilities', 'Facilities (' + Object.keys(S.facilities).length + ')'],
   ['courts', 'Courts (' + Object.keys(S.courts).length + ')'],
   ['attorneys', 'Attorney Profiles (' + Object.keys(S.attProfiles).length + ')'],
   ['national', 'National Defaults']].forEach(function(t) {
    h += '<button class="dir-tab' + (tab === t[0] ? ' on' : '') + '" data-action="dir-tab" data-tab="' + t[0] + '">' + t[1] + '</button>';
  });
  h += '</div><div class="dir-body">';

  if (tab === 'facilities') {
    h += '<div class="dir-section"><div class="dir-head"><h3>Detention Facilities</h3>';
    if (isAdmin) h += '<button class="hbtn accent" data-action="add-facility">+ Add Facility</button>';
    h += '</div>';
    h += '<p class="dir-desc">Each facility bundles its warden, location, and linked field office. Selecting a facility on a matter auto-fills all six fields.</p>';
    h += '<div class="dir-list">';
    Object.values(S.facilities).forEach(function(f) {
      h += '<div class="dir-card' + (S.editId === f.id ? ' editing' : '') + '">';
      if (S.editId === f.id && isAdmin) {
        h += htmlFacilityAutocomplete();
        FACILITY_FIELDS.forEach(function(ff) {
          var val = (S.draft[ff.key]) || '';
          var chk = val && val.trim() ? '<span class="fchk">&#10003;</span>' : '';
          var vErr = '';
          if (ff.validate && val && val.trim()) { var err = ff.validate(val); if (err) { vErr = '<span class="fval-err">' + esc(err) + '</span>'; chk = '<span class="fval-warn">&#9888;</span>'; } }
          h += '<div class="frow"><label class="flbl">' + esc(ff.label) + chk + '</label>';
          h += htmlFieldInput(ff, val, 'draft-field');
          h += vErr + '</div>';
        });
        h += '<div class="dir-card-actions"><button class="hbtn accent" data-action="save-facility">Save</button>';
        h += '<button class="hbtn" data-action="cancel-edit">Cancel</button>';
        h += '<button class="hbtn danger" data-action="del-facility" data-id="' + f.id + '">Delete</button></div>';
      } else {
        if (isAdmin) {
          h += '<div class="dir-card-head" data-action="edit-record" data-id="' + f.id + '" data-type="facility">';
        } else {
          h += '<div class="dir-card-head" style="cursor:default">';
        }
        h += '<strong>' + esc(f.name || 'Unnamed Facility') + '</strong>';
        h += '<span class="dir-card-sub">' + esc(f.city || '') + ', ' + esc(f.state || '') + '</span></div>';
        h += '<div class="dir-card-detail">Warden: ' + esc(f.warden || '\u2014') + ' \u00b7 FO: ' + esc(f.fieldOfficeName || '\u2014') + ' \u00b7 FOD: ' + esc(f.fieldOfficeDirector || '\u2014') + '</div>';
        h += htmlProvenanceBadge(f);
      }
      h += '</div>';
    });
    if (Object.keys(S.facilities).length === 0) h += '<div class="dir-empty">No facilities yet.' + (isAdmin ? ' Add one to get started.' : '') + '</div>';
    h += '</div></div>';
  }

  if (tab === 'courts') {
    h += '<div class="dir-section"><div class="dir-head"><h3>Courts</h3>';
    if (isAdmin) h += '<button class="hbtn accent" data-action="add-court">+ Add Court</button>';
    h += '</div>';
    h += '<p class="dir-desc">District + division combos. Selecting a court on a matter fills both fields.</p>';
    h += '<div class="dir-list">';
    Object.values(S.courts).forEach(function(c) {
      h += '<div class="dir-card' + (S.editId === c.id ? ' editing' : '') + '">';
      if (S.editId === c.id && isAdmin) {
        COURT_FIELDS.forEach(function(ff) {
          var val = (S.draft[ff.key]) || '';
          var chk = val && val.trim() ? '<span class="fchk">&#10003;</span>' : '';
          h += '<div class="frow"><label class="flbl">' + esc(ff.label) + chk + '</label>';
          h += htmlFieldInput(ff, val, 'draft-field');
          h += '</div>';
        });
        h += '<div class="dir-card-actions"><button class="hbtn accent" data-action="save-court">Save</button>';
        h += '<button class="hbtn" data-action="cancel-edit">Cancel</button>';
        h += '<button class="hbtn danger" data-action="del-court" data-id="' + c.id + '">Delete</button></div>';
      } else {
        if (isAdmin) {
          h += '<div class="dir-card-head" data-action="edit-record" data-id="' + c.id + '" data-type="court">';
        } else {
          h += '<div class="dir-card-head" style="cursor:default">';
        }
        h += '<strong>' + esc(c.district || 'Unnamed') + '</strong>';
        h += '<span class="dir-card-sub">' + esc(c.division || '') + '</span></div>';
        h += htmlProvenanceBadge(c);
      }
      h += '</div>';
    });
    if (Object.keys(S.courts).length === 0) h += '<div class="dir-empty">No courts yet.</div>';
    h += '</div></div>';
  }

  if (tab === 'attorneys') {
    h += '<div class="dir-section"><div class="dir-head"><h3>Attorney Profiles</h3>';
    if (isAdmin) h += '<button class="hbtn accent" data-action="add-attorney">+ Add Attorney</button>';
    h += '</div>';
    h += '<p class="dir-desc">Reusable attorney profiles. Select as Attorney 1 or 2 on any matter.</p>';
    h += '<div class="dir-list">';
    Object.values(S.attProfiles).forEach(function(a) {
      h += '<div class="dir-card' + (S.editId === a.id ? ' editing' : '') + '">';
      if (S.editId === a.id && isAdmin) {
        ATT_PROFILE_FIELDS.forEach(function(ff) {
          var val = (S.draft[ff.key]) || '';
          var chk = val && val.trim() ? '<span class="fchk">&#10003;</span>' : '';
          var vErr = '';
          if (ff.validate && val && val.trim()) { var err = ff.validate(val); if (err) { vErr = '<span class="fval-err">' + esc(err) + '</span>'; chk = '<span class="fval-warn">&#9888;</span>'; } }
          h += '<div class="frow"><label class="flbl">' + esc(ff.label) + chk + '</label>';
          h += htmlFieldInput(ff, val, 'draft-field');
          h += vErr + '</div>';
        });
        h += '<div class="dir-card-actions"><button class="hbtn accent" data-action="save-attorney">Save</button>';
        h += '<button class="hbtn" data-action="cancel-edit">Cancel</button>';
        h += '<button class="hbtn danger" data-action="del-attorney" data-id="' + a.id + '">Delete</button></div>';
      } else {
        if (isAdmin) {
          h += '<div class="dir-card-head" data-action="edit-record" data-id="' + a.id + '" data-type="attorney">';
        } else {
          h += '<div class="dir-card-head" style="cursor:default">';
        }
        h += '<strong>' + esc(a.name || 'Unnamed') + '</strong>';
        h += '<span class="dir-card-sub">' + esc(a.firm || '') + ' \u00b7 ' + esc(a.barNo || '') + '</span></div>';
        h += '<div class="dir-card-detail">' + esc(a.email || '') + ' \u00b7 ' + esc(a.phone || '') + '</div>';
        h += htmlProvenanceBadge(a);
      }
      h += '</div>';
    });
    if (Object.keys(S.attProfiles).length === 0) h += '<div class="dir-empty">No attorney profiles yet.</div>';
    h += '</div></div>';
  }

  if (tab === 'national') {
    h += '<div class="dir-section"><div class="dir-head"><h3>National Defaults</h3></div>';
    h += '<p class="dir-desc">These auto-fill on every matter.' + (isAdmin ? ' Update when officials change.' : '') + '</p>';
    h += '<div class="dir-card editing">';
    NATIONAL_FIELDS.forEach(function(f) {
      var val = (S.national[f.key]) || '';
      var chk = val && val.trim() ? '<span class="fchk">&#10003;</span>' : '';
      h += '<div class="frow"><label class="flbl">' + esc(f.label) + chk + '</label>';
      if (isAdmin) {
        h += htmlFieldInput(f, val, 'national-field');
      } else {
        h += '<input class="finp" value="' + esc(val) + '" disabled style="background:#f5f2ec;color:var(--muted)">';
      }
      h += '</div>';
    });
    h += htmlProvenanceBadge(S.national);
    h += '</div></div>';
  }

  h += '</div></div>';
  return h;
}

function renderAdmin() {
  if (S.role !== 'admin') {
    return '<div class="dir-view"><div class="dir-body" style="text-align:center;padding:60px"><p style="color:var(--muted)">Admin access required.</p></div></div>';
  }

  var h = '<div class="dir-view"><div class="dir-tabs">';
  h += '<button class="dir-tab on">User Management</button>';
  h += '</div><div class="dir-body"><div class="dir-section">';

  // Header with create button
  h += '<div class="dir-head"><h3>Users</h3>';
  h += '<button class="hbtn accent" data-action="admin-show-create">+ Create User</button></div>';
  h += '<p class="dir-desc">Manage user accounts. Creating a user registers them on the Matrix server, sets their role, and invites them to the required rooms.</p>';

  // Inline create form
  if (S.adminEditUserId === 'new') {
    h += '<div class="dir-card editing" style="margin-bottom:16px">';
    h += '<div class="fg-title" style="margin-bottom:12px;font-weight:600">New User</div>';
    h += '<div class="frow"><label class="flbl">Username</label>';
    h += '<input class="finp" value="' + esc(S.adminDraft.username || '') + '" placeholder="e.g. jsmith" data-field-key="username" data-change="admin-draft-field"></div>';
    h += '<div class="frow"><label class="flbl">Display Name</label>';
    h += '<input class="finp" value="' + esc(S.adminDraft.displayName || '') + '" placeholder="Jane Smith" data-field-key="displayName" data-change="admin-draft-field"></div>';
    h += '<div class="frow"><label class="flbl">Password</label>';
    h += '<input class="finp" type="password" value="' + esc(S.adminDraft.password || '') + '" placeholder="Temporary password" data-field-key="password" data-change="admin-draft-field"></div>';
    h += '<div class="frow"><label class="flbl">Role</label>';
    h += '<select class="finp" data-change="admin-draft-role">';
    h += '<option value="attorney"' + (S.adminDraft.role !== 'admin' ? ' selected' : '') + '>Attorney</option>';
    h += '<option value="admin"' + (S.adminDraft.role === 'admin' ? ' selected' : '') + '>Admin</option>';
    h += '</select></div>';
    h += '<div id="admin-create-error" class="login-error" style="display:none;margin-top:8px"></div>';
    h += '<div class="dir-card-actions">';
    h += '<button class="hbtn accent" data-action="admin-create-user" id="admin-create-btn">Create Account</button>';
    h += '<button class="hbtn" data-action="admin-cancel-create">Cancel</button></div>';
    h += '</div>';
  }

  // User list
  h += '<div class="dir-list">';
  var userList = Object.values(S.users);
  if (userList.length === 0) {
    h += '<div class="dir-empty">No managed users yet. Users created through this panel will appear here.</div>';
  }
  userList.forEach(function(u) {
    var isEditing = S.adminEditUserId === u.mxid;
    h += '<div class="dir-card' + (isEditing ? ' editing' : '') + '">';
    if (isEditing) {
      h += '<div class="fg-title" style="margin-bottom:12px;font-weight:600">Edit User</div>';
      h += '<div class="frow"><label class="flbl">Display Name</label>';
      h += '<input class="finp" value="' + esc(S.adminDraft.displayName || '') + '" data-field-key="displayName" data-change="admin-draft-field"></div>';
      h += '<div class="frow"><label class="flbl">Role</label>';
      h += '<select class="finp" data-change="admin-draft-role">';
      h += '<option value="attorney"' + (S.adminDraft.role !== 'admin' ? ' selected' : '') + '>Attorney</option>';
      h += '<option value="admin"' + (S.adminDraft.role === 'admin' ? ' selected' : '') + '>Admin</option>';
      h += '</select></div>';
      h += '<div class="frow"><label class="flbl">Reset Password</label>';
      h += '<input class="finp" type="password" value="' + esc(S.adminDraft.password || '') + '" placeholder="Leave blank to keep current" data-field-key="password" data-change="admin-draft-field"></div>';
      h += '<div id="admin-edit-error" class="login-error" style="display:none;margin-top:8px"></div>';
      h += '<div class="dir-card-actions">';
      h += '<button class="hbtn accent" data-action="admin-save-user">Save Changes</button>';
      h += '<button class="hbtn" data-action="admin-cancel-edit">Cancel</button>';
      if (u.mxid !== S.currentUser) {
        h += '<button class="hbtn danger" data-action="admin-deactivate-user" data-mxid="' + esc(u.mxid) + '">Deactivate</button>';
      }
      h += '</div>';
    } else {
      var roleBadgeColor = u.role === 'admin' ? '#a08540' : '#8a8a9a';
      h += '<div class="dir-card-head" data-action="admin-edit-user" data-mxid="' + esc(u.mxid) + '">';
      h += '<strong>' + esc(u.displayName) + '</strong>';
      h += '<span class="dir-card-sub" style="color:' + roleBadgeColor + ';font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">' + esc(u.role) + '</span></div>';
      h += '<div class="dir-card-detail">' + esc(u.mxid) + '</div>';
      if (!u.active) {
        h += '<div class="dir-card-detail" style="color:#b91c1c;font-weight:600">DEACTIVATED</div>';
      }
      h += htmlProvenanceBadge(u);
    }
    h += '</div>';
  });
  h += '</div></div></div></div>';
  return h;
}

function renderEditor() {
  var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
  if (!pet) {
    return '<div class="editor-view"><div style="flex:1;display:flex;align-items:center;justify-content:center;color:#aaa">No matter selected.</div></div>';
  }
  var client = S.clients[pet.clientId] || null;
  var att1 = pet._att1Id ? S.attProfiles[pet._att1Id] : null;
  var att2 = pet._att2Id ? S.attProfiles[pet._att2Id] : null;
  var vars = buildVarMap(client || {}, pet, att1 || {}, att2 || {}, S.national);
  var caseNo = (pet.caseNumber && pet.caseNumber.trim()) ? 'C/A No. ' + pet.caseNumber : '';

  var h = '<div class="editor-view"><div class="ed-sidebar"><div class="ed-tabs">';
  [['client','Client'],['court','Court + Facility'],['atty','Attorneys'],['filing','Filing'],['log','Log (' + S.log.length + ')']].forEach(function(t) {
    h += '<button class="ed-tab' + (S.editorTab === t[0] ? ' on' : '') + '" data-action="ed-tab" data-tab="' + t[0] + '">' + t[1] + '</button>';
  });
  h += '</div><div class="ed-fields">';

  if (S.editorTab === 'client' && client) {
    h += htmlFieldGroup('Client (shared)', CLIENT_FIELDS, client, 'editor-client-field');
  }

  if (S.editorTab === 'court') {
    h += htmlPicker('Select Court', Object.values(S.courts), function(c) { return c.district + ' \u2014 ' + c.division; }, pet._courtId || '', 'apply-court', 'goto-directory');
    h += htmlFieldGroup('Court (manual override)', COURT_FIELDS, pet, 'editor-pet-field');
    h += '<div style="height:8px"></div>';
    h += htmlPicker('Select Facility', Object.values(S.facilities), function(f) { return f.name + ' \u2014 ' + f.city + ', ' + f.state; }, pet._facilityId || '', 'apply-facility', 'goto-directory');
    h += htmlFieldGroup('Facility (manual override)', FACILITY_FIELDS, pet, 'editor-pet-field');
    h += htmlFieldGroup('Respondents (manual override)', RESPONDENT_FIELDS, pet, 'editor-pet-field');
  }

  if (S.editorTab === 'atty') {
    var attList = Object.values(S.attProfiles);
    h += htmlPicker('Attorney 1', attList, function(a) { return a.name + ' \u2014 ' + a.firm; }, pet._att1Id || '', 'apply-att1', 'goto-directory');
    h += htmlPicker('Attorney 2', attList, function(a) { return a.name + ' \u2014 ' + a.firm; }, pet._att2Id || '', 'apply-att2', 'goto-directory');
    if (!pet._att1Id && !pet._att2Id) {
      h += '<p style="font-size:11px;color:#aaa;margin-top:8px">Select attorney profiles from the Directory, or add new ones with +</p>';
    }
  }

  if (S.editorTab === 'filing') {
    h += htmlFieldGroup('Filing', FILING_FIELDS, pet, 'editor-pet-field');
  }

  if (S.editorTab === 'log') {
    h += '<div class="lscroll">';
    if (S.log.length === 0) h += '<div class="lempty">No operations yet.</div>';
    var logColors = { FILL:'#5aa06f', REVISE:'#c9a040', CREATE:'#7a70c0', STAGE:'#4a7ab5', APPLY:'#60a0d0', UPDATE:'#a08540', DELETE:'#c05050' };
    S.log.forEach(function(e, i) {
      h += '<div class="lentry"><span class="lts">' + new Date(e.frame.t).toLocaleTimeString('en-US', {hour12:false}) + '</span> ';
      h += '<span style="color:' + (logColors[e.op] || '#888') + ';font-weight:600">' + e.op + '</span>';
      h += '<span class="ld">(</span><span class="lt">' + esc(e.target) + '</span>';
      if (e.payload != null) {
        var pStr = typeof e.payload === 'string' ? '"' + e.payload.slice(0, 25) + (e.payload.length > 25 ? '\u2026' : '') + '"' : '\u2026';
        h += '<span class="ld">, </span><span class="lp">' + esc(pStr) + '</span>';
      }
      h += '<span class="ld">)</span></div>';
    });
    h += '</div>';
  }

  h += '</div></div>';

  // Document area
  h += '<div class="doc-scroll" id="doc-scroll">';
  h += renderPaginatedDoc(pet.blocks, vars, caseNo);
  h += '<div style="height:60px;flex-shrink:0"></div>';
  h += '</div></div>';
  return h;
}

function renderPaginatedDoc(blocks, vars, caseNo) {
  var body = blocks.filter(function(b) { return !CAP_ALL[b.id]; });
  var capBlocks = blocks.filter(function(b) { return TITLE_IDS[b.id]; });
  var capLBlocks = blocks.filter(function(b) { return CAP_L.indexOf(b.id) >= 0; });
  var capRBlocks = blocks.filter(function(b) { return CAP_R.indexOf(b.id) >= 0; });

  var PAGE_W = 816, PAGE_H = 1056, MG = 96;

  function renderBlock(b, editable) {
    var cls = CLS_MAP[b.type] || 'blk-para';
    var ce = editable ? ' contenteditable="true"' : '';
    return '<div class="blk ' + cls + '" data-block-id="' + b.id + '"' + ce + '>' + blockToHtml(b.content, vars) + '</div>';
  }

  function renderCaption(editable) {
    var c = '';
    capBlocks.forEach(function(b) { c += renderBlock(b, editable); });
    c += '<div class="caption-grid"><div class="cap-left-col">';
    capLBlocks.forEach(function(b) { c += renderBlock(b, editable); });
    c += '</div><div class="cap-mid-col">';
    for (var i = 0; i < 24; i++) c += '<div>)</div>';
    c += '</div><div class="cap-right-col">';
    capRBlocks.forEach(function(b) { c += renderBlock(b, editable); });
    c += '</div></div>';
    return c;
  }

  // Measurement pass (offscreen) + page shells
  // We do a simple approach: render all blocks then paginate after mount
  var USABLE_H = PAGE_H - 2 * MG - 28;

  var h = '<div class="measure-box" id="measure-box" style="width:' + (PAGE_W - 2 * MG) + 'px" aria-hidden="true">';
  h += '<div data-mr="cap">' + renderCaption(false) + '</div>';
  h += '<div data-mr="body">';
  body.forEach(function(b) { h += renderBlock(b, false); });
  h += '</div></div>';

  // Initial single page - will be repaginated by initPagination()
  h += '<div id="pages-container">';
  h += '<div class="page-shell"><div class="page-paper" style="width:' + PAGE_W + 'px;height:' + PAGE_H + 'px">';
  h += '<div class="page-margin" style="padding:' + MG + 'px;padding-bottom:0">';
  h += renderCaption(true);
  body.forEach(function(b) { h += renderBlock(b, true); });
  h += '</div><div class="page-foot" style="height:' + MG + 'px;padding:12px ' + MG + 'px 0"><span>' + esc(caseNo) + '</span><span>Page 1 of 1</span></div>';
  h += '</div></div>';
  h += '</div>';

  return h;
}

// ── Pagination after mount ───────────────────────────────────────
function initPagination() {
  var mb = document.getElementById('measure-box');
  var pc = document.getElementById('pages-container');
  if (!mb || !pc) return;

  var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
  if (!pet) return;
  var client = S.clients[pet.clientId] || null;
  var att1 = pet._att1Id ? S.attProfiles[pet._att1Id] : null;
  var att2 = pet._att2Id ? S.attProfiles[pet._att2Id] : null;
  var vars = buildVarMap(client || {}, pet, att1 || {}, att2 || {}, S.national);
  var caseNo = (pet.caseNumber && pet.caseNumber.trim()) ? 'C/A No. ' + pet.caseNumber : '';
  var blocks = pet.blocks;
  var body = blocks.filter(function(b) { return !CAP_ALL[b.id]; });

  var PAGE_W = 816, PAGE_H = 1056, MG = 96, USABLE_H = PAGE_H - 2 * MG - 28;

  var capEl = mb.querySelector('[data-mr="cap"]');
  var capH = capEl ? capEl.offsetHeight : 0;
  var blockEls = Array.from(mb.querySelectorAll('[data-mr="body"]>[data-block-id]'));
  var hs = blockEls.map(function(e) { return { id: e.dataset.blockId, h: e.offsetHeight }; });

  var pages = [];
  var cur = [];
  var rem = USABLE_H - capH;
  var pi = 0;
  hs.forEach(function(item) {
    if (item.h > rem && cur.length > 0) {
      pages.push({ ids: cur, first: pi === 0 });
      cur = [];
      rem = USABLE_H;
      pi++;
    }
    cur.push(item.id);
    rem -= item.h;
  });
  if (cur.length > 0 || pages.length === 0) {
    pages.push({ ids: cur, first: pi === 0 });
  }

  var bm = {};
  blocks.forEach(function(b) { bm[b.id] = b; });
  var total = pages.length || 1;

  function renderBlock(b, editable) {
    var cls = CLS_MAP[b.type] || 'blk-para';
    var ce = editable ? ' contenteditable="true"' : '';
    return '<div class="blk ' + cls + '" data-block-id="' + b.id + '"' + ce + '>' + blockToHtml(b.content, vars) + '</div>';
  }

  function renderCaption(editable) {
    var capBlocks = blocks.filter(function(b) { return TITLE_IDS[b.id]; });
    var capLBlocks = blocks.filter(function(b) { return CAP_L.indexOf(b.id) >= 0; });
    var capRBlocks = blocks.filter(function(b) { return CAP_R.indexOf(b.id) >= 0; });
    var c = '';
    capBlocks.forEach(function(b) { c += renderBlock(b, editable); });
    c += '<div class="caption-grid"><div class="cap-left-col">';
    capLBlocks.forEach(function(b) { c += renderBlock(b, editable); });
    c += '</div><div class="cap-mid-col">';
    for (var i = 0; i < 24; i++) c += '<div>)</div>';
    c += '</div><div class="cap-right-col">';
    capRBlocks.forEach(function(b) { c += renderBlock(b, editable); });
    c += '</div></div>';
    return c;
  }

  var html = '';
  pages.forEach(function(pg, idx) {
    html += '<div class="page-shell"><div class="page-paper" style="width:' + PAGE_W + 'px;height:' + PAGE_H + 'px">';
    html += '<div class="page-margin" style="padding:' + MG + 'px;padding-bottom:0">';
    if (pg.first) html += renderCaption(true);
    pg.ids.forEach(function(id) {
      var b = bm[id];
      if (b) html += renderBlock(b, true);
    });
    html += '</div><div class="page-foot" style="height:' + MG + 'px;padding:12px ' + MG + 'px 0"><span>' + esc(caseNo) + '</span><span>Page ' + (idx + 1) + ' of ' + total + '</span></div>';
    html += '</div></div>';
  });

  pc.innerHTML = html;
  attachBlockListeners();
}

function attachBlockListeners() {
  var pc = document.getElementById('pages-container');
  if (!pc) return;
  var editingBlocks = {};

  pc.querySelectorAll('.blk[contenteditable="true"]').forEach(function(el) {
    el.addEventListener('focus', function() {
      editingBlocks[el.dataset.blockId] = true;
    });
    el.addEventListener('blur', function() {
      delete editingBlocks[el.dataset.blockId];
      var bid = el.dataset.blockId;
      var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
      if (!pet) return;
      var block = pet.blocks.find(function(b) { return b.id === bid; });
      if (!block) return;
      var nc = extractBlockContent(el);
      var norm = function(s) { return s.replace(/\s+/g, ' ').trim(); };
      if (norm(nc) !== norm(block.content)) {
        var newBlocks = pet.blocks.map(function(b) {
          return b.id === bid ? { id: b.id, type: b.type, content: nc } : b;
        });
        S.petitions[pet.id] = Object.assign({}, pet, { blocks: newBlocks });
        S.log.push({ op: 'REVISE', target: bid, payload: nc, frame: { t: now(), prior: block.content, petition: pet.id } });
        // Sync to matrix
        if (matrix.isReady() && pet.roomId) {
          matrix.sendStateEvent(pet.roomId, EVT_PETITION_BLOCKS, { blocks: newBlocks }, pet.id).catch(function(e) { console.error('Block sync failed:', e); });
        }
      }
      // Re-render the HTML with vars
      var client = S.clients[pet.clientId] || {};
      var att1 = pet._att1Id ? S.attProfiles[pet._att1Id] : null;
      var att2 = pet._att2Id ? S.attProfiles[pet._att2Id] : null;
      var vars = buildVarMap(client, pet, att1 || {}, att2 || {}, S.national);
      var actualBlock = S.petitions[pet.id].blocks.find(function(b) { return b.id === bid; });
      if (actualBlock) el.innerHTML = blockToHtml(actualBlock.content, vars);
    });
  });
}

// ── Main Render ──────────────────────────────────────────────────
function render() {
  var root = document.getElementById('root');
  if (!root) return;

  if (S.loading) {
    root.innerHTML = '<div class="loading-wrap"><div class="loading-text">Connecting...</div></div>';
    return;
  }

  if (!S.authenticated) {
    root.innerHTML = renderLogin();
    var form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
      });
    }
    return;
  }

  var h = '<div class="root">';
  if (S.syncError) {
    h += '<div class="sync-banner">' + esc(S.syncError) + '<button data-action="dismiss-error" style="margin-left:12px;background:none;border:1px solid rgba(255,255,255,.4);color:#fff;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:11px">Dismiss</button></div>';
  }
  h += renderHeader();
  if (S.currentView === 'board') h += renderBoard();
  else if (S.currentView === 'clients') h += renderClients();
  else if (S.currentView === 'directory') h += renderDirectory();
  else if (S.currentView === 'admin') h += renderAdmin();
  else if (S.currentView === 'editor') h += renderEditor();
  h += '</div>';
  root.innerHTML = h;

  // Post-render: pagination for editor
  if (S.currentView === 'editor') {
    requestAnimationFrame(function() { initPagination(); });
  }
  // Post-render: initialize flatpickr date pickers and facility autocomplete
  requestAnimationFrame(function() { initDatePickers(); initFacilityAC(); });
}

// ── Post-render Initializers ────────────────────────────────────
function initDatePickers() {
  if (typeof flatpickr === 'undefined') return;
  document.querySelectorAll('[data-flatpickr]').forEach(function(el) {
    if (el._flatpickr) return;
    var isFilingGroup = el.dataset.flatpickr === 'filing-group';
    flatpickr(el, {
      dateFormat: 'F j, Y',
      allowInput: true,
      onChange: function(dates, dateStr) {
        if (!dates.length) return;
        var d = dates[0];
        var formatted = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        el.value = formatted;
        var key = el.dataset.fieldKey;
        var action = el.dataset.change;
        dispatchFieldChange(action, key, formatted);
        if (isFilingGroup) {
          var day = d.getDate();
          var ordDay = toOrdinal(day);
          var monthYear = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          dispatchFieldChange(action, 'filingDay', ordDay);
          dispatchFieldChange(action, 'filingMonthYear', monthYear);
          render();
        }
      }
    });
  });
}

function initFacilityAC() {
  var input = document.getElementById('fac-ac-input');
  var list = document.getElementById('fac-ac-list');
  if (!input || !list) return;
  if (input._acBound) return;
  input._acBound = true;

  input.addEventListener('input', function() {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) { list.style.display = 'none'; return; }
    var matches = ICE_FACILITY_SEEDS.filter(function(f) {
      return f.n.toLowerCase().indexOf(q) !== -1 ||
             f.c.toLowerCase().indexOf(q) !== -1 ||
             (stateAbbrToName(f.s)).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 10);
    if (matches.length === 0) { list.style.display = 'none'; return; }
    var h = '';
    matches.forEach(function(f, i) {
      h += '<div class="fac-ac-item" data-fac-idx="' + i + '" data-fac-n="' + esc(f.n) + '" data-fac-c="' + esc(f.c) + '" data-fac-s="' + esc(f.s) + '" data-fac-fo="' + esc(f.fo) + '">';
      h += '<div>' + esc(f.n) + '</div>';
      h += '<div class="fac-ac-sub">' + esc(f.c) + ', ' + esc(stateAbbrToName(f.s)) + ' \u00b7 ' + esc(f.fo) + '</div>';
      h += '</div>';
    });
    list.innerHTML = h;
    list.style.display = '';
  });

  list.addEventListener('click', function(e) {
    var item = e.target.closest('.fac-ac-item');
    if (!item) return;
    S.draft.name = item.dataset.facN;
    S.draft.city = item.dataset.facC;
    S.draft.state = stateAbbrToName(item.dataset.facS);
    S.draft.fieldOfficeName = item.dataset.facFo;
    list.style.display = 'none';
    input.value = '';
    render();
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.style.display = 'none';
    }
  });
}

// ── Event Handling (delegation) ──────────────────────────────────
function handleLogin() {
  var userEl = document.getElementById('login-user');
  var passEl = document.getElementById('login-pass');
  var errEl = document.getElementById('login-error');
  var btnEl = document.getElementById('login-btn');
  if (!userEl || !passEl) return;
  var username = userEl.value.trim();
  var password = passEl.value;
  if (!username || !password) return;

  btnEl.disabled = true;
  btnEl.textContent = 'Signing in...';
  errEl.style.display = 'none';

  matrix.login(CONFIG.MATRIX_SERVER_URL, username, password)
    .then(function() { return matrix.initialSync(); })
    .then(function() {
      S.authenticated = true;
      S.loading = false;
      return hydrateFromMatrix();
    })
    .then(function() { render(); })
    .catch(function(err) {
      var status = (err && err.status) || 0;
      var msg;
      if (status === 502 || status === 503 || status === 504) {
        msg = 'Matrix server is unavailable (HTTP ' + status + '). Please try again later or check server status.';
      } else if (status === 0 || (err && err.errcode === 'M_NETWORK')) {
        msg = 'Cannot reach the Matrix server. Check your network connection and that the server is running.';
      } else {
        msg = (err && err.error) || (err && err.message) || 'Login failed. Check your credentials.';
      }
      errEl.textContent = msg;
      errEl.style.display = 'block';
      btnEl.disabled = false;
      btnEl.textContent = 'Sign In';
    });
}

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var action = btn.dataset.action;

  if (action === 'nav') { setState({ currentView: btn.dataset.view, boardAddingMatter: false }); return; }
  if (action === 'logout') { matrix.clearSession(); setState({ authenticated: false, syncError: '' }); return; }
  if (action === 'dismiss-error') { setState({ syncError: '' }); return; }

  // Board
  if (action === 'board-mode') { setState({ boardMode: btn.dataset.mode }); return; }
  if (action === 'board-add-matter') {
    var clientList = Object.values(S.clients);
    if (clientList.length === 0) {
      setState({ currentView: 'clients' });
    } else {
      setState({ boardAddingMatter: true });
    }
    return;
  }
  if (action === 'board-cancel-add-matter') { setState({ boardAddingMatter: false }); return; }
  if (action === 'toggle-group') {
    var gKey = btn.dataset.group || (btn.closest('[data-group]') && btn.closest('[data-group]').dataset.group);
    if (gKey) { _collapsedGroups[gKey] = !_collapsedGroups[gKey]; render(); }
    return;
  }
  if (action === 'open-petition') {
    if (e.target.closest('.kb-card-actions')) return;
    setState({ selectedPetitionId: btn.dataset.id, currentView: 'editor' });
    return;
  }
  if (action === 'stage-change') {
    var pet = S.petitions[btn.dataset.id];
    if (!pet) return;
    var idx = STAGES.indexOf(pet.stage);
    var ni = btn.dataset.dir === 'advance' ? idx + 1 : idx - 1;
    if (ni < 0 || ni >= STAGES.length) return;
    var next = STAGES[ni];
    var t = now();
    S.log.push({ op: 'STAGE', target: btn.dataset.id, payload: next, frame: { t: t, prior: pet.stage } });
    S.petitions[pet.id] = Object.assign({}, pet, { stage: next, stageHistory: pet.stageHistory.concat([{ stage: next, at: t }]) });
    if (matrix.isReady() && pet.roomId) {
      matrix.sendStateEvent(pet.roomId, EVT_PETITION, Object.assign({}, pet, { stage: next, stageHistory: S.petitions[pet.id].stageHistory }), pet.id).catch(function(e) { console.error(e); });
    }
    render();
    return;
  }

  // Clients
  if (action === 'select-client') { setState({ selectedClientId: btn.dataset.id }); return; }
  if (action === 'create-client') {
    var id = uid();
    S.clients[id] = { id: id, name: '', country: '', yearsInUS: '', entryDate: '', entryMethod: 'without inspection', apprehensionLocation: '', apprehensionDate: '', criminalHistory: 'has no criminal record', communityTies: '', createdAt: now(), roomId: '' };
    S.log.push({ op: 'CREATE', target: id, payload: null, frame: { t: now(), entity: 'client' } });
    setState({ selectedClientId: id });
    // Create a Matrix room for the client in the background
    createClientRoom(id);
    return;
  }
  if (action === 'create-petition') {
    var cid = btn.dataset.clientId;
    var pid = uid();
    var clientRoomId = (S.clients[cid] && S.clients[cid].roomId) || '';
    S.petitions[pid] = {
      id: pid, clientId: cid, createdBy: S.currentUser, stage: 'drafted',
      stageHistory: [{ stage: 'drafted', at: now() }],
      blocks: DEFAULT_BLOCKS.map(function(b) { return { id: b.id, type: b.type, content: b.content }; }),
      district: '', division: '', caseNumber: '', facilityName: '', facilityCity: '',
      facilityState: '', warden: '', fieldOfficeDirector: '', fieldOfficeName: '',
      filingDate: '', filingDay: '', filingMonthYear: '',
      createdAt: now(), roomId: clientRoomId,
    };
    S.log.push({ op: 'CREATE', target: pid, payload: null, frame: { t: now(), entity: 'petition', clientId: cid } });
    setState({ selectedPetitionId: pid, editorTab: 'court', currentView: 'editor' });
    // Sync petition to Matrix (will be picked up by createClientRoom if roomId is empty)
    var pet = S.petitions[pid];
    if (pet.roomId && matrix.isReady()) {
      syncPetitionToMatrix(pet);
      matrix.sendStateEvent(pet.roomId, EVT_PETITION_BLOCKS, { blocks: pet.blocks }, pet.id)
        .catch(function(e) { console.error('Block sync failed:', e); });
    }
    return;
  }

  // Export
  if (action === 'export-word' || action === 'export-pdf') {
    var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
    if (!pet) return;
    var cl = S.clients[pet.clientId] || {};
    var a1 = pet._att1Id ? S.attProfiles[pet._att1Id] : null;
    var a2 = pet._att2Id ? S.attProfiles[pet._att2Id] : null;
    var vars = buildVarMap(cl, pet, a1 || {}, a2 || {}, S.national);
    var isWord = action === 'export-word';
    buildExportFromTemplate(vars, isWord)
      .then(function(html) {
        if (isWord) {
          var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'habeas-' + (cl.name || 'matter').replace(/\s+/g, '-').toLowerCase() + '-' + new Date().toISOString().slice(0, 10) + '.doc';
          document.body.appendChild(a);
          a.click();
          setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        } else {
          var w = window.open('', '_blank', 'width=850,height=1100');
          if (!w) { alert('Allow popups for PDF export'); return; }
          w.document.write(html);
          w.document.close();
          setTimeout(function() { w.focus(); w.print(); }, 500);
        }
      })
      .catch(function(err) {
        console.error('Template export failed, falling back to block export:', err);
        if (isWord) doExportDoc(pet.blocks, vars, cl.name);
        else doExportPDF(pet.blocks, vars);
      });
    return;
  }

  // Directory
  if (action === 'dir-tab') { setState({ dirTab: btn.dataset.tab, editId: null, draft: {} }); return; }
  if (action === 'cancel-edit') { setState({ editId: null, draft: {} }); return; }
  if (action === 'edit-record') {
    if (S.role !== 'admin') return;
    var type = btn.dataset.type;
    var id = btn.dataset.id;
    var record = type === 'facility' ? S.facilities[id] : type === 'court' ? S.courts[id] : S.attProfiles[id];
    if (record) setState({ editId: id, draft: Object.assign({}, record) });
    return;
  }
  if (action === 'add-facility') {
    if (S.role !== 'admin') return;
    var id = uid();
    var f = { id: id, name: '', city: '', state: '', warden: '', fieldOfficeName: '', fieldOfficeDirector: '', createdBy: S.currentUser, createdAt: now(), updatedBy: S.currentUser, updatedAt: now() };
    S.facilities[id] = f;
    S.log.push({ op: 'CREATE', target: id, payload: null, frame: { t: now(), entity: 'facility' } });
    setState({ editId: id, draft: Object.assign({}, f) });
    return;
  }
  if (action === 'save-facility') {
    if (S.role !== 'admin') return;
    var f = Object.assign({}, S.draft, { updatedBy: S.currentUser, updatedAt: now() });
    S.facilities[f.id] = f;
    S.log.push({ op: 'UPDATE', target: f.id, payload: f.name, frame: { t: now(), entity: 'facility' } });
    if (matrix.isReady() && matrix.orgRoomId) {
      matrix.sendStateEvent(matrix.orgRoomId, EVT_FACILITY, { name: f.name, city: f.city, state: f.state, warden: f.warden, fieldOfficeName: f.fieldOfficeName, fieldOfficeDirector: f.fieldOfficeDirector }, f.id).catch(function(e) { console.error(e); });
    }
    setState({ editId: null, draft: {} });
    return;
  }
  if (action === 'del-facility') {
    if (S.role !== 'admin') return;
    var id = btn.dataset.id;
    delete S.facilities[id];
    S.log.push({ op: 'DELETE', target: id, payload: null, frame: { t: now(), entity: 'facility' } });
    if (matrix.isReady() && matrix.orgRoomId) {
      matrix.sendStateEvent(matrix.orgRoomId, EVT_FACILITY, { deleted: true }, id).catch(function(e) { console.error(e); });
    }
    setState({ editId: null, draft: {} });
    return;
  }
  if (action === 'add-court') {
    if (S.role !== 'admin') return;
    var id = uid();
    var c = { id: id, district: '', division: '', createdBy: S.currentUser, createdAt: now(), updatedBy: S.currentUser, updatedAt: now() };
    S.courts[id] = c;
    S.log.push({ op: 'CREATE', target: id, payload: null, frame: { t: now(), entity: 'court' } });
    setState({ editId: id, draft: Object.assign({}, c) });
    return;
  }
  if (action === 'save-court') {
    if (S.role !== 'admin') return;
    var c = Object.assign({}, S.draft, { updatedBy: S.currentUser, updatedAt: now() });
    S.courts[c.id] = c;
    S.log.push({ op: 'UPDATE', target: c.id, payload: c.district, frame: { t: now(), entity: 'court' } });
    if (matrix.isReady() && matrix.orgRoomId) {
      matrix.sendStateEvent(matrix.orgRoomId, EVT_COURT, { district: c.district, division: c.division }, c.id).catch(function(e) { console.error(e); });
    }
    setState({ editId: null, draft: {} });
    return;
  }
  if (action === 'del-court') {
    if (S.role !== 'admin') return;
    var id = btn.dataset.id;
    delete S.courts[id];
    S.log.push({ op: 'DELETE', target: id, payload: null, frame: { t: now(), entity: 'court' } });
    if (matrix.isReady() && matrix.orgRoomId) {
      matrix.sendStateEvent(matrix.orgRoomId, EVT_COURT, { deleted: true }, id).catch(function(e) { console.error(e); });
    }
    setState({ editId: null, draft: {} });
    return;
  }
  if (action === 'add-attorney') {
    if (S.role !== 'admin') return;
    var id = uid();
    var a = { id: id, name: '', barNo: '', firm: '', address: '', cityStateZip: '', phone: '', fax: '', email: '', proHacVice: '', createdBy: S.currentUser, createdAt: now(), updatedBy: S.currentUser, updatedAt: now() };
    S.attProfiles[id] = a;
    S.log.push({ op: 'CREATE', target: id, payload: null, frame: { t: now(), entity: 'attorney_profile' } });
    setState({ editId: id, draft: Object.assign({}, a) });
    return;
  }
  if (action === 'save-attorney') {
    if (S.role !== 'admin') return;
    var a = Object.assign({}, S.draft, { updatedBy: S.currentUser, updatedAt: now() });
    S.attProfiles[a.id] = a;
    S.log.push({ op: 'UPDATE', target: a.id, payload: a.name, frame: { t: now(), entity: 'attorney_profile' } });
    if (matrix.isReady() && matrix.orgRoomId) {
      matrix.sendStateEvent(matrix.orgRoomId, EVT_ATTORNEY, { name: a.name, barNo: a.barNo, firm: a.firm, address: a.address, cityStateZip: a.cityStateZip, phone: a.phone, fax: a.fax, email: a.email, proHacVice: a.proHacVice }, a.id).catch(function(e) { console.error(e); });
    }
    setState({ editId: null, draft: {} });
    return;
  }
  if (action === 'del-attorney') {
    if (S.role !== 'admin') return;
    var id = btn.dataset.id;
    delete S.attProfiles[id];
    S.log.push({ op: 'DELETE', target: id, payload: null, frame: { t: now(), entity: 'attorney_profile' } });
    if (matrix.isReady() && matrix.orgRoomId) {
      matrix.sendStateEvent(matrix.orgRoomId, EVT_ATTORNEY, { deleted: true }, id).catch(function(e) { console.error(e); });
    }
    setState({ editId: null, draft: {} });
    return;
  }

  // Admin view actions
  if (action === 'admin-show-create') {
    if (S.role !== 'admin') return;
    setState({ adminEditUserId: 'new', adminDraft: { username: '', displayName: '', password: '', role: 'attorney' } });
    return;
  }
  if (action === 'admin-cancel-create' || action === 'admin-cancel-edit') {
    setState({ adminEditUserId: null, adminDraft: {} });
    return;
  }
  if (action === 'admin-edit-user') {
    if (S.role !== 'admin') return;
    var mxid = btn.dataset.mxid;
    var user = S.users[mxid];
    if (user) {
      setState({ adminEditUserId: mxid, adminDraft: { displayName: user.displayName, role: user.role, password: '' } });
    }
    return;
  }
  if (action === 'admin-create-user') {
    if (S.role !== 'admin') return;
    handleAdminCreateUser();
    return;
  }
  if (action === 'admin-save-user') {
    if (S.role !== 'admin') return;
    handleAdminSaveUser();
    return;
  }
  if (action === 'admin-deactivate-user') {
    if (S.role !== 'admin') return;
    var mxid = btn.dataset.mxid;
    if (mxid && confirm('Deactivate user ' + mxid + '? This cannot be undone.')) {
      handleAdminDeactivateUser(mxid);
    }
    return;
  }

  // Editor tabs
  if (action === 'ed-tab') { setState({ editorTab: btn.dataset.tab }); return; }
  if (action === 'goto-directory') { setState({ currentView: 'directory' }); return; }
});

// ── Input/Change Event Handling ──────────────────────────────────
function dispatchFieldChange(action, key, val) {
  if (action === 'draft-field') {
    S.draft[key] = val;
    return;
  }

  if (action === 'admin-draft-field') {
    S.adminDraft[key] = val;
    return;
  }

  if (action === 'national-field') {
    if (S.role !== 'admin') return;
    S.national[key] = val;
    S.national.updatedBy = S.currentUser;
    S.national.updatedAt = now();
    S.log.push({ op: 'UPDATE', target: 'national', payload: val, frame: { t: now(), field: key } });
    if (matrix.isReady() && matrix.orgRoomId) {
      var full = { iceDirector: S.national.iceDirector, iceDirectorTitle: S.national.iceDirectorTitle, dhsSecretary: S.national.dhsSecretary, attorneyGeneral: S.national.attorneyGeneral };
      matrix.sendStateEvent(matrix.orgRoomId, EVT_NATIONAL, full, '').catch(function(e) { console.error(e); });
    }
    return;
  }
  if (action === 'client-field') {
    var client = S.selectedClientId ? S.clients[S.selectedClientId] : null;
    if (!client) return;
    client[key] = val;
    S.log.push({ op: 'FILL', target: 'client.' + key, payload: val, frame: { t: now(), entity: 'client', id: client.id } });
    debouncedSync('client-' + client.id, function() {
      if (client.roomId) {
        syncClientToMatrix(client);
      } else if (matrix.isReady()) {
        // Room hasn't been created yet — create it now (includes initial sync)
        createClientRoom(client.id);
      }
    });
    return;
  }
  if (action === 'editor-client-field') {
    var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
    if (!pet) return;
    var client = S.clients[pet.clientId];
    if (!client) return;
    client[key] = val;
    S.log.push({ op: 'FILL', target: 'client.' + key, payload: val, frame: { t: now(), entity: 'client', id: client.id } });
    debouncedSync('client-' + client.id, function() {
      if (client.roomId) {
        syncClientToMatrix(client);
      } else if (matrix.isReady()) {
        createClientRoom(client.id);
      }
    });
    return;
  }
  if (action === 'editor-pet-field') {
    var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
    if (!pet) return;
    pet[key] = val;
    S.log.push({ op: 'FILL', target: 'petition.' + key, payload: val, frame: { t: now(), entity: 'petition', id: pet.id } });
    debouncedSync('petition-' + pet.id, function() { syncPetitionToMatrix(pet); });
    return;
  }
}

document.addEventListener('input', function(e) {
  var el = e.target;
  if (!el.dataset || !el.dataset.change) return;
  var action = el.dataset.change;
  var key = el.dataset.fieldKey;
  var val = el.value;
  if (action.match(/-custom$/)) {
    dispatchFieldChange(action.replace(/-custom$/, ''), key, val);
    return;
  }
  dispatchFieldChange(action, key, val);
});

document.addEventListener('change', function(e) {
  var el = e.target;
  if (!el.dataset || !el.dataset.change) return;
  var action = el.dataset.change;
  var val = el.value;

  // Enum-or-custom dropdown changed
  if (action.match(/-enum$/)) {
    var baseAction = action.replace(/-enum$/, '');
    var key = el.dataset.fieldKey;
    if (val === '__custom__') {
      var customInp = el.parentNode.querySelector('.enum-custom-inp');
      if (customInp) { customInp.style.display = ''; customInp.focus(); }
      return;
    } else {
      var customInp = el.parentNode.querySelector('.enum-custom-inp');
      if (customInp) customInp.style.display = 'none';
      dispatchFieldChange(baseAction, key, val);
      return;
    }
  }

  // Pure enum selects (type: 'enum') and date pickers fire 'change'
  if (el.tagName === 'SELECT' && el.dataset.fieldKey && !action.match(/^apply-/)) {
    dispatchFieldChange(action, el.dataset.fieldKey, val);
    return;
  }

  if (action === 'admin-draft-role') {
    S.adminDraft.role = val;
    return;
  }

  if (action === 'board-table-group') {
    setState({ boardTableGroup: val });
    return;
  }

  if (action === 'board-create-matter') {
    var cid = val;
    if (!cid) return;
    var pid = uid();
    var clientRoomId = (S.clients[cid] && S.clients[cid].roomId) || '';
    S.petitions[pid] = {
      id: pid, clientId: cid, createdBy: S.currentUser, stage: 'drafted',
      stageHistory: [{ stage: 'drafted', at: now() }],
      blocks: DEFAULT_BLOCKS.map(function(b) { return { id: b.id, type: b.type, content: b.content }; }),
      district: '', division: '', caseNumber: '', facilityName: '', facilityCity: '',
      facilityState: '', warden: '', fieldOfficeDirector: '', fieldOfficeName: '',
      filingDate: '', filingDay: '', filingMonthYear: '',
      createdAt: now(), roomId: clientRoomId,
    };
    S.log.push({ op: 'CREATE', target: pid, payload: null, frame: { t: now(), entity: 'petition', clientId: cid } });
    setState({ selectedPetitionId: pid, editorTab: 'court', currentView: 'editor', boardAddingMatter: false });
    var newPet = S.petitions[pid];
    if (newPet.roomId && matrix.isReady()) {
      syncPetitionToMatrix(newPet);
      matrix.sendStateEvent(newPet.roomId, EVT_PETITION_BLOCKS, { blocks: newPet.blocks }, newPet.id)
        .catch(function(e) { console.error('Block sync failed:', e); });
    }
    return;
  }

  var pet = S.selectedPetitionId ? S.petitions[S.selectedPetitionId] : null;
  if (!pet) return;

  if (action === 'apply-court') {
    var c = S.courts[val];
    if (c) {
      Object.assign(pet, { district: c.district, division: c.division, _courtId: val });
      S.log.push({ op: 'APPLY', target: 'court', payload: val, frame: { t: now(), petition: pet.id } });
      syncPetitionToMatrix(pet);
      render();
    }
    return;
  }
  if (action === 'apply-facility') {
    var f = S.facilities[val];
    if (f) {
      Object.assign(pet, { facilityName: f.name, facilityCity: f.city, facilityState: f.state, warden: f.warden, fieldOfficeName: f.fieldOfficeName, fieldOfficeDirector: f.fieldOfficeDirector, _facilityId: val });
      S.log.push({ op: 'APPLY', target: 'facility', payload: val, frame: { t: now(), petition: pet.id } });
      syncPetitionToMatrix(pet);
      render();
    }
    return;
  }
  if (action === 'apply-att1') {
    pet._att1Id = val;
    S.log.push({ op: 'APPLY', target: 'att1', payload: val, frame: { t: now(), petition: pet.id } });
    syncPetitionToMatrix(pet);
    render();
    return;
  }
  if (action === 'apply-att2') {
    pet._att2Id = val;
    S.log.push({ op: 'APPLY', target: 'att2', payload: val, frame: { t: now(), petition: pet.id } });
    syncPetitionToMatrix(pet);
    render();
    return;
  }
});

// ── Admin Business Logic ─────────────────────────────────────────
function showAdminError(elementId, msg) {
  var el = document.getElementById(elementId);
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function handleAdminCreateUser() {
  var d = S.adminDraft;
  if (!d.username || !d.password) {
    showAdminError('admin-create-error', 'Username and password are required.');
    return;
  }

  var mxid = '@' + d.username.trim() + ':' + CONFIG.MATRIX_SERVER_NAME;
  var displayName = d.displayName || d.username;
  var role = d.role || 'attorney';
  var powerLevel = role === 'admin' ? 50 : 0;

  var createBtn = document.getElementById('admin-create-btn');
  if (createBtn) { createBtn.disabled = true; createBtn.textContent = 'Creating...'; }

  // Step 1: Create account via Synapse admin API
  matrix.adminApi('PUT', '/v2/users/' + encodeURIComponent(mxid), {
    password: d.password,
    displayname: displayName,
    admin: false,
    deactivated: false,
  })
  .then(function() {
    // Step 2: Store role in !org room as EVT_USER state event
    return matrix.sendStateEvent(matrix.orgRoomId, EVT_USER, {
      displayName: displayName,
      role: role,
      active: true,
    }, mxid);
  })
  .then(function() {
    // Step 3: Invite user to !org room
    return matrix.inviteUser(matrix.orgRoomId, mxid).catch(function(e) {
      if (e.errcode === 'M_FORBIDDEN') return;
      console.warn('Invite to org room failed:', e);
    });
  })
  .then(function() {
    // Step 4: Invite user to !templates room
    if (matrix.templatesRoomId) {
      return matrix.inviteUser(matrix.templatesRoomId, mxid).catch(function(e) {
        if (e.errcode === 'M_FORBIDDEN') return;
        console.warn('Invite to templates room failed:', e);
      });
    }
  })
  .then(function() {
    // Step 5: Set power levels in !org room
    return matrix.setPowerLevel(matrix.orgRoomId, mxid, powerLevel).catch(function(e) {
      console.warn('Set org power level failed:', e);
    });
  })
  .then(function() {
    // Step 6: Set power levels in !templates room
    if (matrix.templatesRoomId) {
      return matrix.setPowerLevel(matrix.templatesRoomId, mxid, powerLevel).catch(function(e) {
        console.warn('Set templates power level failed:', e);
      });
    }
  })
  .then(function() {
    // Update local state
    S.users[mxid] = {
      mxid: mxid,
      displayName: displayName,
      role: role,
      active: true,
      createdBy: S.currentUser,
      updatedAt: now(),
    };
    S.log.push({ op: 'CREATE', target: mxid, payload: displayName, frame: { t: now(), entity: 'user' } });
    setState({ adminEditUserId: null, adminDraft: {} });
  })
  .catch(function(err) {
    var msg = (err && err.error) || (err && err.message) || 'Failed to create user.';
    if (err && err.status === 403) {
      msg = 'Access denied. Your account may not have Synapse server admin privileges. Create users via command line instead.';
    }
    showAdminError('admin-create-error', msg);
    if (createBtn) { createBtn.disabled = false; createBtn.textContent = 'Create Account'; }
  });
}

function handleAdminSaveUser() {
  var mxid = S.adminEditUserId;
  if (!mxid || mxid === 'new') return;
  var d = S.adminDraft;
  var displayName = d.displayName || mxid.replace(/@(.+):.*/, '$1');
  var role = d.role || 'attorney';
  var powerLevel = role === 'admin' ? 50 : 0;

  // Update EVT_USER state event
  var chain = matrix.sendStateEvent(matrix.orgRoomId, EVT_USER, {
    displayName: displayName,
    role: role,
    active: S.users[mxid] ? S.users[mxid].active : true,
  }, mxid);

  // Update power levels in both rooms
  chain = chain.then(function() {
    return matrix.setPowerLevel(matrix.orgRoomId, mxid, powerLevel).catch(function(e) {
      console.warn('Set org PL failed:', e);
    });
  })
  .then(function() {
    if (matrix.templatesRoomId) {
      return matrix.setPowerLevel(matrix.templatesRoomId, mxid, powerLevel).catch(function(e) {
        console.warn('Set templates PL failed:', e);
      });
    }
  });

  // Optionally reset password
  if (d.password && d.password.trim()) {
    chain = chain.then(function() {
      return matrix.adminApi('PUT', '/v2/users/' + encodeURIComponent(mxid), {
        password: d.password,
      });
    });
  }

  chain.then(function() {
    S.users[mxid] = Object.assign({}, S.users[mxid], {
      displayName: displayName,
      role: role,
      updatedAt: now(),
    });
    S.log.push({ op: 'UPDATE', target: mxid, payload: role, frame: { t: now(), entity: 'user' } });
    setState({ adminEditUserId: null, adminDraft: {} });
  })
  .catch(function(err) {
    var msg = (err && err.error) || 'Failed to update user.';
    showAdminError('admin-edit-error', msg);
  });
}

function handleAdminDeactivateUser(mxid) {
  matrix.adminApi('POST', '/v1/deactivate/' + encodeURIComponent(mxid), { erase: false })
    .then(function() {
      return matrix.sendStateEvent(matrix.orgRoomId, EVT_USER, {
        displayName: S.users[mxid] ? S.users[mxid].displayName : mxid,
        role: S.users[mxid] ? S.users[mxid].role : 'attorney',
        active: false,
      }, mxid);
    })
    .then(function() {
      if (S.users[mxid]) {
        S.users[mxid].active = false;
        S.users[mxid].updatedAt = now();
      }
      S.log.push({ op: 'DELETE', target: mxid, payload: null, frame: { t: now(), entity: 'user' } });
      setState({ adminEditUserId: null, adminDraft: {} });
    })
    .catch(function(err) {
      alert('Deactivation failed: ' + ((err && err.error) || 'unknown error'));
    });
}

// ── Flush pending syncs on visibility change / page unload ──────
// When the user switches tabs or is about to leave, immediately fire
// any pending debounced syncs (best-effort — fetch may be cancelled)
function flushPendingSyncs() {
  var keys = Object.keys(_syncTimers);
  if (keys.length === 0) return;
  keys.forEach(function(key) {
    // clearTimeout returns undefined; we need to re-invoke the sync
    clearTimeout(_syncTimers[key]);
    delete _syncTimers[key];
  });
  // Re-sync all clients and petitions that have room IDs
  if (!matrix.isReady()) return;
  Object.values(S.clients).forEach(function(client) {
    if (client.roomId) syncClientToMatrix(client);
  });
  Object.values(S.petitions).forEach(function(pet) {
    if (pet.roomId) syncPetitionToMatrix(pet);
  });
}

document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') flushPendingSyncs();
});
window.addEventListener('beforeunload', flushPendingSyncs);

// ── Initialization ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  render(); // Show loading state immediately
  if (matrix.loadSession()) {
    // First verify the token is still valid with /whoami
    matrix.whoami()
      .then(function(whoamiData) {
        console.log('Session verified for:', whoamiData.user_id);
        // Ensure userId matches what we have stored
        if (whoamiData.user_id) matrix.userId = whoamiData.user_id;
        return matrix.initialSync();
      })
      .then(function() {
        S.authenticated = true;
        S.loading = false;
        return hydrateFromMatrix();
      })
      .then(function() { render(); })
      .catch(function(err) {
        console.error('Session restore failed:', err);
        var status = (err && err.status) || 0;
        // On 401/403 (invalid token), clear session and show login
        if (status === 401 || status === 403) {
          console.warn('Token invalid or expired, clearing session');
          matrix.clearSession();
          S.loading = false;
          render();
          return;
        }
        // On network errors or 502/503/504, enter offline mode
        // Keep session so user can retry, but let them work locally
        S.authenticated = true;
        S.loading = false;
        S.syncError = 'Could not reach the Matrix server (' + ((err && err.error) || 'network error') + '). Working in local-only mode \u2014 changes will not sync.';
        S.currentUser = matrix.userId || 'local';
        S.role = 'attorney';
        render();
      });
  } else {
    S.loading = false;
    render();
  }
});
