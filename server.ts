import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client getter
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Strictly structured JSON schema for Gemini response
const parsingResponseSchema = {
  type: Type.OBJECT,
  properties: {
    user_profile: {
      type: Type.OBJECT,
      properties: {
        age: { type: Type.NUMBER, description: 'Age in years as a number, or null if unknown' },
        gender: { type: Type.STRING, description: 'male, female, transgender, or null' },
        state: { type: Type.STRING, description: 'Indian State name in English e.g. Uttar Pradesh, Bihar, Rajasthan, or null' },
        district: { type: Type.STRING, description: 'Indian District name e.g. Samastipur, Kanpur, or null' },
        area_type: { type: Type.STRING, description: 'rural or urban or null' },
        category: { type: Type.STRING, description: 'General, OBC, SC, ST or null' },
        annual_income_inr: { type: Type.NUMBER, description: 'Total annual household income in INR as a number e.g. 120000, or null' },
        occupation: { type: Type.STRING, description: 'farmer, student, unemployed, artisan, entrepreneur, or other' },
        landholding_acres: { type: Type.NUMBER, description: 'Agricultural land owned in acres as a number, or null' },
        is_disabled: { type: Type.BOOLEAN, description: 'true if physically/mentally disabled/divyang, else false or null' },
        is_bpl: { type: Type.BOOLEAN, description: 'true if BPL/ration card holder, else false or null' },
        minority_status: { type: Type.BOOLEAN, description: 'true if belonging to religious/linguistic minority, else false or null' },
        existing_schemes_enrolled: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of schemes currently enrolled in'
        }
      },
      required: ['existing_schemes_enrolled']
    },
    intent: {
      type: Type.OBJECT,
      properties: {
        query_type: { type: Type.STRING, description: 'general_eligibility, specific_scheme_search, or document_inquiry' },
        target_sector: { type: Type.STRING, description: 'agriculture, education, housing, health, finance, or all' }
      },
      required: ['query_type', 'target_sector']
    }
  },
  required: ['user_profile', 'intent']
};

// Fallback rule-based parser in case API key is missing or offline
function fallbackRuleBasedParser(text: string) {
  const lower = text.toLowerCase();
  
  // Extract Age
  let age: number | null = null;
  const ageMatch = lower.match(/(\d{1,2})\s*(saal|years|year|yrs|umar)/i) || lower.match(/(age|umar|umr)\s*(\d{1,2})/i);
  if (ageMatch) {
    const parsed = parseInt(ageMatch[1] || ageMatch[2]);
    if (parsed > 0 && parsed < 120) age = parsed;
  }

  // Extract Gender
  let gender: 'male' | 'female' | 'transgender' | null = null;
  if (/female|mahila|aurat|woman|girl|stree|ladki|bihan/i.test(lower)) gender = 'female';
  else if (/male|purush|man|boy|ladka|admi/i.test(lower)) gender = 'male';

  // Extract Category
  let category: 'General' | 'OBC' | 'SC' | 'ST' | null = null;
  if (/\b(sc)\b|scheduled caste|dalit/i.test(lower)) category = 'SC';
  else if (/\b(st)\b|scheduled tribe|adivasi/i.test(lower)) category = 'ST';
  else if (/\b(obc)\b|other backward/i.test(lower)) category = 'OBC';
  else if (/\b(general|gen|unreserved)\b/i.test(lower)) category = 'General';

  // Extract Occupation
  let occupation: 'farmer' | 'student' | 'unemployed' | 'artisan' | 'entrepreneur' | 'other' | null = null;
  if (/kisan|farmer|kheti|agri|krishi/i.test(lower)) occupation = 'farmer';
  else if (/student|chhatra|padhai|college|school|vidyarthi/i.test(lower)) occupation = 'student';
  else if (/artisan|karigar|craftsman|weaver|bunakar|potter|blacksmith/i.test(lower)) occupation = 'artisan';
  else if (/unemployed|beroazgar|berojgar|jobless|no job/i.test(lower)) occupation = 'unemployed';
  else if (/business|dukan|vendor|entrepreneur|stall|dukan/i.test(lower)) occupation = 'entrepreneur';
  else occupation = 'other';

  // Extract Income
  let annual_income_inr: number | null = null;
  const lakhMatch = lower.match(/(\d+(\.\d+)?)\s*(lakh|lacs|lac)/i);
  if (lakhMatch) {
    annual_income_inr = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const kMatch = lower.match(/(\d+)\s*(k|thousand|hazar|hazaaar)/i);
    if (kMatch) {
      annual_income_inr = parseInt(kMatch[1]) * 1000;
    } else {
      const numMatch = lower.match(/(aamdani|income|salana|annual)\s*([₹\s]*\d+[\d,]*)/i);
      if (numMatch) {
        const rawNum = numMatch[2].replace(/[^\d]/g, '');
        if (rawNum) annual_income_inr = parseInt(rawNum);
      }
    }
  }

  // Extract Landholding
  let landholding_acres: number | null = null;
  const landMatch = lower.match(/(\d+(\.\d+)?)\s*(acre|acres|ekad)/i);
  if (landMatch) {
    landholding_acres = parseFloat(landMatch[1]);
  } else if (/no land|landless|bhoomiheen|0 acre/i.test(lower)) {
    landholding_acres = 0;
  }

  // BPL & Disabled
  const is_bpl = /bpl|ration card|garib|below poverty/i.test(lower) ? true : null;
  const is_disabled = /disabled|handicapped|divyang|viklang/i.test(lower) ? true : null;

  // State Detection
  let state: string | null = null;
  const states = ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Delhi', 'Maharashtra', 'West Bengal', 'Punjab', 'Haryana', 'Gujarat', 'Tamil Nadu', 'Karnataka'];
  for (const st of states) {
    if (lower.includes(st.toLowerCase())) {
      state = st;
      break;
    }
  }
  if (!state) {
    if (lower.includes('up') || lower.includes('u.p.')) state = 'Uttar Pradesh';
    else if (lower.includes('mp') || lower.includes('m.p.')) state = 'Madhya Pradesh';
  }

  // District Detection
  let district: string | null = null;
  if (lower.includes('samastipur')) district = 'Samastipur';
  else if (lower.includes('kanpur')) district = 'Kanpur';
  else if (lower.includes('jaipur')) district = 'Jaipur';
  else if (lower.includes('bhopal')) district = 'Bhopal';

  // Area type
  let area_type: 'rural' | 'urban' | null = null;
  if (/rural|gaon|gramin|village/i.test(lower)) area_type = 'rural';
  else if (/urban|shehar|city|nagar/i.test(lower)) area_type = 'urban';

  // Target Sector
  let target_sector: 'agriculture' | 'education' | 'housing' | 'health' | 'finance' | 'all' = 'all';
  if (/kisan|farmer|kheti|agri/i.test(lower)) target_sector = 'agriculture';
  else if (/scholarship|padhai|student|education/i.test(lower)) target_sector = 'education';
  else if (/house|makan|awas|housing|kutcha/i.test(lower)) target_sector = 'housing';
  else if (/health|ilaj|hospital|ayushman/i.test(lower)) target_sector = 'health';
  else if (/loan|credit|business|money|paisa|finance/i.test(lower)) target_sector = 'finance';

  return {
    user_profile: {
      age,
      gender,
      state,
      district,
      area_type,
      category,
      annual_income_inr,
      occupation,
      landholding_acres,
      is_disabled,
      is_bpl,
      minority_status: null,
      existing_schemes_enrolled: []
    },
    intent: {
      query_type: 'general_eligibility',
      target_sector
    }
  };
}

// =========================================================================
// Live Government Scheme & Preset Metadata Repository for Periodic Sync
// =========================================================================
let SERVER_SCHEMES_DB = [
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi (PM-KISAN)',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    sector: 'agriculture',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Agriculture and Farmers Welfare',
    description: 'Provides financial support of ₹6,000 per year in three equal installments directly to landholding farmer families across India.',
    benefits: '₹6,000 / year direct bank transfer in 3 equal tranches of ₹2,000',
    officialUrl: 'https://pmkisan.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Land Holding Record (Khasra/Khatauni)', 'Bank Account Passbook', 'Mobile Number linked to Aadhaar'],
    eligibilityRules: {
      allowedOccupations: ['farmer'],
      maxLandholding: 5.0,
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'pmay-g',
    name: 'Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)',
    hindiName: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    sector: 'housing',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Rural Development',
    description: 'Financial assistance to rural homeless and households living in kutcha or dilapidated houses to construct a pucca house with basic amenities.',
    benefits: 'Financial assistance of ₹1.20 Lakh (plain areas) to ₹1.30 Lakh (hilly/difficult areas) + 90/95 days MGNREGA employment wages',
    officialUrl: 'https://pmayg.nic.in',
    requiredDocuments: ['Aadhaar Card', 'Job Card / MGNREGA Card', 'Swachh Bharat Mission Registration Number', 'BPL / SECC Card', 'Bank Passbook'],
    eligibilityRules: {
      allowedAreaTypes: ['rural'],
      requiresBpl: true,
      maxIncome: 300000,
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'pmay-u',
    name: 'Pradhan Mantri Awaas Yojana - Urban (PMAY-U)',
    hindiName: 'प्रधानमंत्री आवास योजना - शहरी',
    sector: 'housing',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Housing and Urban Affairs',
    description: 'Housing for All in urban areas providing interest subsidy on home loans and direct financial assistance for Economically Weaker Sections (EWS) and LIG.',
    benefits: 'Credit Linked Subsidy Scheme (CLSS) up to ₹2.67 Lakh or direct grant of ₹1.5 Lakh for house construction',
    officialUrl: 'https://pmaymis.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Urban Domicile / Address Proof', 'Income Certificate', 'Bank Passbook', 'Affidavit of No Pucca House'],
    eligibilityRules: {
      allowedAreaTypes: ['urban'],
      maxIncome: 600000,
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    hindiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    sector: 'health',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Health and Family Welfare',
    description: 'World\'s largest health assurance scheme providing health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    benefits: 'Cashless hospital treatment up to ₹5 Lakh/family/year across empanelled public & private hospitals',
    officialUrl: 'https://pmjay.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Ration Card / BPL Card', 'Ayushman Golden Card / PM-JAY Letter'],
    eligibilityRules: {
      requiresBpl: true,
      maxIncome: 250000,
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma Yojana',
    hindiName: 'पीएम विश्वकर्मा योजना',
    sector: 'finance',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Micro, Small and Medium Enterprises',
    description: 'Comprehensive support to traditional artisans and craftspeople including skill verification, toolkit incentive, and collateral-free loans at concessional interest rate.',
    benefits: '₹15,000 Toolkit E-Voucher + Collateral-free loan up to ₹3 Lakh at 5% interest + ₹500/day training stipend',
    officialUrl: 'https://pmvishwakarma.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Skill / Trade Certificate', 'Bank Account Passbook', 'Caste Certificate if applicable'],
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ['artisan'],
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'post-matric-sc-st',
    name: 'Post-Matric Scholarship for SC/ST Students',
    hindiName: 'अनुसूचित जाति/जनजाति के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
    sector: 'education',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Social Justice and Empowerment',
    description: 'Financial assistance to SC and ST students studying at post-matriculation or post-secondary stage to enable them to complete higher education.',
    benefits: '100% tuition fee reimbursement + monthly maintenance allowance (₹550 to ₹1200/month)',
    officialUrl: 'https://scholarships.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate (SC/ST)', 'Income Certificate (< ₹2.5 Lakh/year)', '10th/12th Marksheet', 'Institute Fee Receipt', 'Bank Passbook'],
    eligibilityRules: {
      minAge: 14,
      maxAge: 35,
      allowedOccupations: ['student'],
      allowedCategories: ['SC', 'ST'],
      maxIncome: 250000
    }
  },
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    hindiName: 'पीएम सूर्य घर: मुफ्त बिजली योजना',
    sector: 'finance',
    level: 'Central',
    sponsoringMinistry: 'Ministry of New and Renewable Energy',
    description: 'Rooftop solar scheme offering up to 300 units of free solar electricity per month for households with direct central subsidies.',
    benefits: 'Up to ₹78,000 solar installation subsidy + 300 units free monthly electricity + net metering surplus income',
    officialUrl: 'https://pmsuryaghar.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Electricity Bill of Residence', 'Property Ownership Proof / NOC', 'Bank Passbook'],
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ['farmer', 'entrepreneur', 'artisan', 'unemployed', 'other'],
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'lakhpati-didi',
    name: 'Lakhpati Didi Yojana',
    hindiName: 'लखपति दीदी योजना',
    sector: 'finance',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Rural Development',
    description: 'Empowers rural women in Self Help Groups (SHGs) through micro-entrepreneurship, financial literacy, and market linkage to earn ₹1 Lakh+ annually.',
    benefits: 'Skill training + micro-credit support up to ₹5 Lakh at subsidized interest + digital marketing toolkit',
    officialUrl: 'https://aajeevika.gov.in',
    requiredDocuments: ['Aadhaar Card', 'SHG Membership ID / Passbook', 'Bank Passbook', 'Residential Proof'],
    eligibilityRules: {
      minAge: 18,
      maxAge: 60,
      gender: ['female'],
      allowedAreaTypes: ['rural'],
      allowedCategories: ['General', 'OBC', 'SC', 'ST']
    }
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    hindiName: 'प्रधानमंत्री मुद्रा योजना',
    sector: 'finance',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Finance',
    description: 'Loans up to ₹10 Lakh to non-corporate, non-farm small/micro enterprises for setup or business expansion without collateral requirement.',
    benefits: 'Collateral-free business loan: Shishu (up to ₹50,000), Kishore (₹50k to ₹5 Lakh), Tarun (₹5 Lakh to ₹10 Lakh)',
    officialUrl: 'https://www.mudra.org.in',
    requiredDocuments: ['Aadhaar Card & PAN Card', 'Business Proof / Enterprise Plan', 'Bank Statement (6 months)', 'Address Proof'],
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ['entrepreneur', 'unemployed', 'artisan', 'farmer', 'other']
    }
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    hindiName: 'सुकन्या समृद्धि योजना',
    sector: 'finance',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Finance / Women & Child Development',
    description: 'Government-backed small deposit savings scheme targeted at parents of girl children for future education and marriage expenses.',
    benefits: 'High interest rate (8.2% p.a.), tax savings under Section 80C, guaranteed government return',
    officialUrl: 'https://www.indiapost.gov.in',
    requiredDocuments: ['Girl Child Birth Certificate', 'Parent/Guardian Aadhaar & PAN Card', 'Address Proof', 'Passport Photo'],
    eligibilityRules: {
      maxAge: 10,
      gender: ['female']
    }
  },
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    hindiName: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स आत्मनिर्भर निधि)',
    sector: 'finance',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Housing and Urban Affairs',
    description: 'Micro-credit facility for urban street vendors to resume their livelihood through affordable working capital loans.',
    benefits: 'Working capital loan up to ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) with 7% interest subsidy',
    officialUrl: 'https://pmsvanidhi.mohua.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Vending Certificate / Urban Local Body ID Card', 'Bank Passbook'],
    eligibilityRules: {
      minAge: 18,
      allowedAreaTypes: ['urban'],
      allowedOccupations: ['entrepreneur', 'artisan', 'unemployed', 'other']
    }
  },
  {
    id: 'mgnrega',
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    hindiName: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
    sector: 'agriculture',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Rural Development',
    description: 'Guarantees 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.',
    benefits: 'Guaranteed 100 days paid manual work at state statutory daily wage rate directly credited to bank account',
    officialUrl: 'https://nrega.nic.in',
    requiredDocuments: ['Job Card', 'Aadhaar Card', 'Bank / Post Office Account Passbook'],
    eligibilityRules: {
      minAge: 18,
      allowedAreaTypes: ['rural'],
      allowedOccupations: ['farmer', 'unemployed', 'artisan', 'other']
    }
  },
  {
    id: 'ladli-behna',
    name: 'Mukhyamantri Ladli Behna Yojana / Women Welfare State Support',
    hindiName: 'मुख्यमंत्री लाडली बहना योजना',
    sector: 'finance',
    level: 'State',
    sponsoringMinistry: 'Department of Women and Child Development',
    description: 'Direct cash transfer scheme for women from low-income households to promote economic self-reliance and nutrition security.',
    benefits: 'Direct financial transfer of ₹1,250 per month into bank account',
    officialUrl: 'https://cmladlibehna.mp.gov.in',
    requiredDocuments: ['Aadhaar Card', 'Samagra ID / State Domicile Certificate', 'Bank Passbook linked with Aadhaar NPCI', 'Self Declaration of Income'],
    eligibilityRules: {
      minAge: 21,
      maxAge: 60,
      gender: ['female'],
      maxIncome: 250000
    }
  }
];

let SERVER_PRESETS_DB = [
  {
    id: 'preset-1',
    title: 'Farmer with Small Land (Hindi)',
    hindiTitle: 'छोटा किसान (हिन्दी)',
    description: 'Ramesh, 32 years old farmer from Samastipur Bihar with 1.5 acres land and ₹75,000 annual income.',
    rawInput: 'Mera naam Ramesh hai. Meri umar 32 saal hai, Bihar ke Samastipur zila se hoon. Main ek kisan hoon aur mere paas 1.5 acre zameen hai. Hamari saalana aamdani lagbhag 75,000 rupaye hai. Meri category OBC hai. Mujhe sarkari yojanao ke baare me bataiye.',
    language: 'Hinglish',
    icon: 'Tractor'
  },
  {
    id: 'preset-2',
    title: 'SC College Student (English)',
    hindiTitle: 'अनुसूचित जाति का छात्र',
    description: '20 year old SC male student from Kanpur UP living in urban area, family income ₹1.2 Lakh/year.',
    rawInput: 'I am a 20-year-old male student belonging to SC category from Kanpur, Uttar Pradesh (Urban area). My family\'s annual income is around ₹1,20,000 per year. I am studying in college and looking for higher education scholarships and hostel schemes.',
    language: 'English',
    icon: 'GraduationCap'
  },
  {
    id: 'preset-3',
    title: 'Rural Artisan Women (Hindi Devanagari)',
    hindiTitle: 'ग्रामीण महिला कारीगर (देवनागरी)',
    description: 'Sunita, 38 years old female weaver from Jaipur Rajasthan, BPL card holder, rural artisan.',
    rawInput: 'मेरा नाम सुनीता देवी है, उम्र 38 वर्ष है। मैं जयपुर राजस्थान के एक ग्रामीण क्षेत्र की रहने वाली हूँ। मैं हाथ से बुनाई (हस्तशिल्प कारीगर) का काम करती हूँ। मेरे पास BPL राशन कार्ड है और सालाना आय 60,000 रुपये है। परिवार में 2 बेटियां हैं।',
    language: 'Hindi',
    icon: 'Palette'
  },
  {
    id: 'preset-4',
    title: 'Urban Street Vendor / Youth (Hinglish)',
    hindiTitle: 'शहरी छोटे व्यापारी',
    description: '26 year old unemployed/street vendor youth in Delhi urban area seeking loan/setup assistance.',
    rawInput: 'Mera age 26 saal hai, main Delhi urban area me rehta hoon. Pehle job nahi mil rahi thi abhi street fast food stall shuru karne ka plan hai. Annual income null ya around 50,000 inr hai. General category se hoon, koi business loan ya micro credit scheme batao.',
    language: 'Hinglish',
    icon: 'Store'
  },
  {
    id: 'preset-5',
    title: 'Disabled BPL Single Mother (English)',
    hindiTitle: 'दिव्यांग महिला',
    description: '42 year old female with 50% physical disability from Bhopal MP, BPL card holder with no land.',
    rawInput: 'I am 42 years old female living in Bhopal Madhya Pradesh. I am physically disabled and have a BPL card. I am unemployed with zero landholding and my annual household income is less than ₹45,000. Which government healthcare and financial assistance schemes am I eligible for?',
    language: 'English',
    icon: 'HeartHandshake'
  },
  {
    id: 'preset-6',
    title: 'Rooftop Solar Applicant (Hindi/Hinglish)',
    hindiTitle: 'सूर्य घर मुफ्त बिजली आवेदक',
    description: '35 year old homeowner from Varanasi UP looking for rooftop solar subsidy & free electricity.',
    rawInput: 'Mera naam Vikas hai, umar 35 saal, Varanasi Uttar Pradesh se. Meri monthly electricity bill heavy aati hai. Main PM Surya Ghar Muft Bijli Yojana me solar panel lagwana chahta hoon. Meri annual family income ₹2,50,000 hai. Eligibility bataiye.',
    language: 'Hinglish',
    icon: 'Sparkles'
  }
];

// External Registry Sync Configuration (Option b: Curated External GitHub Raw JSON Dataset)
// Configure via EXTERNAL_SCHEMES_JSON_URL in .env or replace the placeholder URL below with your team's GitHub repository raw JSON URL.
const DEFAULT_EXTERNAL_REGISTRY_URL = 'https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/schemes-registry.json';
const EXTERNAL_REGISTRY_URL = process.env.EXTERNAL_SCHEMES_JSON_URL || DEFAULT_EXTERNAL_REGISTRY_URL;

let lastServerSyncTimestamp = new Date().toISOString();
let lastSuccessfulExternalSyncTime: string | null = null;
let lastFetchAttemptTime = new Date().toISOString();
let lastSyncError: string | null = null;
let isCachedFallback = true; // Default to true until external source responds
let currentSyncSource = 'Local Cached Scheme Registry (Offline Baseline)';
let syncVersionCounter = 1;
let lastChangeReport = {
  addedSchemes: 0,
  updatedSchemes: 0,
  totalSchemes: SERVER_SCHEMES_DB.length,
  summary: 'Initialized with baseline local cached dataset'
};

/**
 * Synchronizes local server memory with external hosted JSON scheme registry
 * Performs change detection (added vs updated) and gracefully falls back to local cache if offline.
 */
async function syncFromExternalSource(customUrl?: string) {
  const targetUrl = customUrl || EXTERNAL_REGISTRY_URL;
  lastFetchAttemptTime = new Date().toISOString();
  let addedCount = 0;
  let updatedCount = 0;

  // Check if placeholder URL is still unconfigured
  if (targetUrl.includes('YOUR_GITHUB_USERNAME') || targetUrl.includes('YOUR_REPO_NAME')) {
    lastSyncError = 'Please configure EXTERNAL_SCHEMES_JSON_URL in .env with your GitHub raw JSON URL';
    isCachedFallback = true;
    currentSyncSource = 'Local Cached Scheme Registry (Awaiting GitHub Repo Config)';
    lastChangeReport = {
      addedSchemes: 0,
      updatedSchemes: 0,
      totalSchemes: SERVER_SCHEMES_DB.length,
      summary: 'Awaiting team GitHub repo raw URL (configure EXTERNAL_SCHEMES_JSON_URL in .env)'
    };
    return { success: false, isCachedFallback: true, error: lastSyncError, report: lastChangeReport };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const externalData = await response.json();
    const incomingSchemes = Array.isArray(externalData?.schemes) ? externalData.schemes : [];
    const incomingPresets = Array.isArray(externalData?.presetSamples) ? externalData.presetSamples : [];

    if (incomingSchemes.length === 0) {
      throw new Error('External endpoint returned empty scheme dataset');
    }

    // Change Detection Algorithm
    incomingSchemes.forEach((remoteScheme: any) => {
      if (!remoteScheme.id || !remoteScheme.name) return;
      const existingIdx = SERVER_SCHEMES_DB.findIndex(s => s.id === remoteScheme.id);

      if (existingIdx === -1) {
        // New scheme found!
        SERVER_SCHEMES_DB.unshift(remoteScheme);
        addedCount++;
      } else {
        // Check if any fields changed
        const existingJSON = JSON.stringify(SERVER_SCHEMES_DB[existingIdx]);
        const remoteJSON = JSON.stringify({ ...SERVER_SCHEMES_DB[existingIdx], ...remoteScheme });
        if (existingJSON !== remoteJSON) {
          SERVER_SCHEMES_DB[existingIdx] = { ...SERVER_SCHEMES_DB[existingIdx], ...remoteScheme };
          updatedCount++;
        }
      }
    });

    // Merge incoming presets if present
    incomingPresets.forEach((remotePreset: any) => {
      if (!remotePreset.id || !remotePreset.title) return;
      const existingIdx = SERVER_PRESETS_DB.findIndex(p => p.id === remotePreset.id);
      if (existingIdx === -1) {
        SERVER_PRESETS_DB.push(remotePreset);
      }
    });

    if (addedCount > 0 || updatedCount > 0) {
      syncVersionCounter++;
      lastServerSyncTimestamp = new Date().toISOString();
    }

    lastSuccessfulExternalSyncTime = new Date().toISOString();
    isCachedFallback = false;
    lastSyncError = null;
    currentSyncSource = `External Hosted Registry (${new URL(targetUrl).hostname})`;
    
    lastChangeReport = {
      addedSchemes: addedCount,
      updatedSchemes: updatedCount,
      totalSchemes: SERVER_SCHEMES_DB.length,
      summary: addedCount > 0 || updatedCount > 0
        ? `External sync applied: ${addedCount} new schemes, ${updatedCount} updated`
        : `External sync verified: All ${SERVER_SCHEMES_DB.length} schemes up-to-date`
    };

    console.log(`[External Registry Sync] Success from ${targetUrl} - ${lastChangeReport.summary}`);
    return { success: true, isCachedFallback: false, report: lastChangeReport };

  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' ? 'External fetch timed out (4s limit)' : err.message || 'Network fetch error';
    lastSyncError = errorMsg;
    isCachedFallback = true;
    currentSyncSource = 'Local Cached Scheme Registry (Offline Fallback)';

    lastChangeReport = {
      addedSchemes: 0,
      updatedSchemes: 0,
      totalSchemes: SERVER_SCHEMES_DB.length,
      summary: `Using local cached snapshot. External fetch notice: ${errorMsg}`
    };

    console.warn(`[External Registry Sync] Notice: ${errorMsg}. Falling back to cached local dataset.`);
    return { success: false, isCachedFallback: true, error: errorMsg, report: lastChangeReport };
  }
}

// GET /api/schemes/sync - Periodic sync endpoint returning latest scheme & sample metadata
app.get('/api/schemes/sync', async (req, res) => {
  // Trigger background external check on fetch
  const forceRefresh = req.query.force === 'true';
  const customUrl = typeof req.query.url === 'string' ? req.query.url : undefined;

  // Perform external sync attempt
  await syncFromExternalSource(customUrl);

  res.json({
    timestamp: new Date().toISOString(),
    version: syncVersionCounter,
    source: currentSyncSource,
    externalSourceUrl: EXTERNAL_REGISTRY_URL,
    isCachedFallback,
    lastSuccessfulExternalSyncTime,
    lastFetchAttemptTime,
    lastSyncError,
    changeReport: lastChangeReport,
    totalSchemes: SERVER_SCHEMES_DB.length,
    totalPresets: SERVER_PRESETS_DB.length,
    schemes: SERVER_SCHEMES_DB,
    presetSamples: SERVER_PRESETS_DB,
    lastUpdated: lastServerSyncTimestamp,
    syncStatus: isCachedFallback ? 'cached_fallback' : 'live_external'
  });
});

// POST /api/schemes/add - Endpoint to push/add a new scheme dynamically into the live repository
app.post('/api/schemes/add', (req, res) => {
  try {
    const { scheme, preset } = req.body;
    let addedCount = 0;
    if (scheme && scheme.id && scheme.name) {
      const exists = SERVER_SCHEMES_DB.some(s => s.id === scheme.id);
      if (!exists) {
        SERVER_SCHEMES_DB.unshift(scheme);
        addedCount++;
      }
    }
    if (preset && preset.id && preset.title) {
      const exists = SERVER_PRESETS_DB.some(p => p.id === preset.id);
      if (!exists) {
        SERVER_PRESETS_DB.push(preset);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      syncVersionCounter++;
      lastServerSyncTimestamp = new Date().toISOString();
      lastChangeReport = {
        addedSchemes: addedCount,
        updatedSchemes: 0,
        totalSchemes: SERVER_SCHEMES_DB.length,
        summary: `Manually added ${addedCount} new custom item(s) to registry`
      };
    }
    return res.json({
      success: true,
      message: `Sync repository updated (${addedCount} new items)`,
      version: syncVersionCounter,
      totalSchemes: SERVER_SCHEMES_DB.length,
      totalPresets: SERVER_PRESETS_DB.length,
      changeReport: lastChangeReport
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to add scheme' });
  }
});

// API Endpoint: /api/parse-profile
app.post('/api/parse-profile', async (req, res) => {
  try {
    const { input_text } = req.body;
    if (!input_text || typeof input_text !== 'string' || input_text.trim() === '') {
      return res.status(400).json({ error: 'input_text string is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.log('No GEMINI_API_KEY found, using rule-based parser fallback');
      const fallbackResult = fallbackRuleBasedParser(input_text);
      return res.json({
        ...fallbackResult,
        _parsed_by: 'rule_engine_fallback'
      });
    }

    const systemInstruction = `You are an expert AI Eligibility Parsing Engine for Indian Government Welfare Schemes (Yojanas).
Your job is to analyze unstructured user inputs (text or speech transcript in Hindi, Devanagari, Hinglish, or English) and extract a strictly formatted JSON object representing the user's demographic and socio-economic profile.

RULES:
1. Extract all explicit and implicit demographic attributes.
- Occupation mapping: 'kisan' / 'farmer' -> 'farmer', 'padhai' / 'scholarship' -> 'student', 'berojgar' -> 'unemployed', 'karigar' -> 'artisan', 'dukan' / 'vendor' -> 'entrepreneur'.
- Income mapping: '1.2 lakh' -> 120000, '75k' -> 75000, '50 hazaar' -> 50000.
- State / District: map location names to official English names (e.g. 'Samastipur Bihar' -> State: 'Bihar', District: 'Samastipur').
- Area type: 'gramin' / 'village' -> 'rural', 'shehar' / 'urban' -> 'urban'.
- Category: 'SC' -> 'SC', 'ST' -> 'ST', 'OBC' -> 'OBC', 'General' -> 'General'.
- BPL: 'BPL card', 'ration card', 'garibi' -> is_bpl: true.
- Disabled: 'divyang', 'handicapped', 'viklang' -> is_disabled: true.
2. If an attribute is missing or unknown, set its value to null (or empty array for existing_schemes_enrolled).
3. Output MUST be strictly valid JSON according to the schema provided. No markdown wrapping or extra text.`;

    let responseData: any = null;
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash'];

    modelLoop: for (const modelName of modelsToTry) {
      let retries = 2;
      let delayMs = 600;

      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: `User Input: "${input_text.trim()}"`,
            config: {
              systemInstruction,
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema: parsingResponseSchema
            }
          });

          const jsonText = response.text || '';
          const parsedData = JSON.parse(jsonText);
          responseData = {
            ...parsedData,
            _parsed_by: modelName
          };
          break modelLoop; // Successfully parsed!
        } catch (geminiErr: any) {
          retries--;
          const isTransient = geminiErr?.status === 503 || 
                              geminiErr?.code === 503 || 
                              geminiErr?.status === 429 || 
                              geminiErr?.code === 429 ||
                              (geminiErr?.message && (geminiErr.message.includes('503') || geminiErr.message.includes('UNAVAILABLE') || geminiErr.message.includes('429')));
          
          if (retries > 0 && isTransient) {
            await new Promise(res => setTimeout(res, delayMs));
            delayMs *= 2;
          }
        }
      }
    }

    if (responseData) {
      return res.json(responseData);
    } else {
      throw new Error('AI models unavailable, using rule fallback');
    }

  } catch (err: any) {
    console.warn('Notice: Gemini API fallback activated for /api/parse-profile:', err?.message || err);
    // Graceful fallback to rule engine
    const fallbackResult = fallbackRuleBasedParser(req.body.input_text || '');
    return res.json({
      ...fallbackResult,
      _parsed_by: 'rule_engine_fallback',
      _notice: 'Used rule-based extraction engine during high AI API load.'
    });
  }
});

// Strict Raw Endpoint (for dev/API inspection)
app.post('/api/parse-raw', async (req, res) => {
  try {
    const { input_text } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResult = fallbackRuleBasedParser(input_text || '');
      return res.type('application/json').send(JSON.stringify(fallbackResult, null, 2));
    }

    let rawText = '';
    let retries = 3;
    let delayMs = 500;

    while (retries > 0) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Extract the profile JSON for: "${input_text}"`,
          config: {
            systemInstruction: `Analyze unstructured input (Hindi/Hinglish/English) and output strictly formatted valid JSON matching schema.`,
            responseMimeType: 'application/json',
            responseSchema: parsingResponseSchema
          }
        });
        rawText = response.text || '';
        break;
      } catch (geminiErr: any) {
        retries--;
        const isTransient = geminiErr?.status === 503 || geminiErr?.code === 503 || geminiErr?.status === 429;
        if (retries > 0 && isTransient) {
          await new Promise(r => setTimeout(r, delayMs));
          delayMs *= 2;
        } else {
          throw geminiErr;
        }
      }
    }

    return res.type('application/json').send(rawText);
  } catch (err) {
    const fallbackResult = fallbackRuleBasedParser(req.body?.input_text || '');
    return res.type('application/json').send(JSON.stringify(fallbackResult, null, 2));
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Yojana Eligibility Engine running on http://localhost:${PORT}`);
  });
}

startServer();
