import { Scheme, PresetSample } from '../types';

export const INDIAN_SCHEMES: Scheme[] = [
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
      maxLandholding: 5.0, // Typically small/marginal farmers
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
    id: 'post-matric-obc',
    name: 'Post-Matric Scholarship for OBC / EBC Students',
    hindiName: 'अन्य पिछड़ा वर्ग (OBC) के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
    sector: 'education',
    level: 'Central',
    sponsoringMinistry: 'Ministry of Social Justice and Empowerment',
    description: 'Scholarship scheme providing financial aid to students belonging to OBC and Economically Backward Classes pursuing higher studies after Class 10.',
    benefits: 'Tuition fee coverage + monthly maintenance stipend based on course tier',
    officialUrl: 'https://scholarships.gov.in',
    requiredDocuments: ['Aadhaar Card', 'OBC Non-Creamy Layer Certificate', 'Income Certificate (< ₹2.5 Lakh)', 'Previous Exam Marksheet', 'Bank Passbook'],
    eligibilityRules: {
      minAge: 14,
      maxAge: 35,
      allowedOccupations: ['student'],
      allowedCategories: ['OBC'],
      maxIncome: 250000
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

export const PRESET_SAMPLES: PresetSample[] = [
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
  }
];
