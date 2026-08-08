export type Gender = 'male' | 'female' | 'transgender' | null;
export type AreaType = 'rural' | 'urban' | null;
export type Category = 'General' | 'OBC' | 'SC' | 'ST' | null;
export type Occupation = 'farmer' | 'student' | 'unemployed' | 'artisan' | 'entrepreneur' | 'other' | null;
export type QueryType = 'general_eligibility' | 'specific_scheme_search' | 'document_inquiry';
export type TargetSector = 'agriculture' | 'education' | 'housing' | 'health' | 'finance' | 'all';

export interface UserProfile {
  age: number | null;
  gender: Gender;
  state: string | null;
  district: string | null;
  area_type: AreaType;
  category: Category;
  annual_income_inr: number | null;
  occupation: Occupation;
  landholding_acres: number | null;
  is_disabled: boolean | null;
  is_bpl: boolean | null;
  minority_status: boolean | null;
  existing_schemes_enrolled: string[];
}

export interface UserIntent {
  query_type: QueryType;
  target_sector: TargetSector;
}

export interface ParsingResult {
  user_profile: UserProfile;
  intent: UserIntent;
  confidence_score?: number;
  extracted_highlights?: {
    raw_text: string;
    language_detected?: string;
  };
}

export interface Scheme {
  id: string;
  name: string;
  hindiName: string;
  sector: 'agriculture' | 'education' | 'housing' | 'health' | 'finance';
  level: 'Central' | 'State';
  sponsoringMinistry: string;
  description: string;
  benefits: string;
  officialUrl: string;
  requiredDocuments: string[];
  eligibilityRules: {
    minAge?: number;
    maxAge?: number;
    gender?: ('male' | 'female' | 'transgender')[];
    allowedOccupations?: ('farmer' | 'student' | 'unemployed' | 'artisan' | 'entrepreneur' | 'other')[];
    maxIncome?: number;
    maxLandholding?: number;
    requiresBpl?: boolean;
    requiresDisability?: boolean;
    requiresMinority?: boolean;
    allowedCategories?: ('General' | 'OBC' | 'SC' | 'ST')[];
    allowedAreaTypes?: ('rural' | 'urban')[];
    states?: string[];
  };
}

export interface SchemeMatch {
  scheme: Scheme;
  status: 'eligible' | 'conditional' | 'ineligible';
  matchScore: number; // 0 to 100
  metCriteria: string[];
  unmetCriteria: string[];
  missingDataWarnings: string[];
  counterfactualSuggestions?: string[];
}

export interface PresetSample {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  rawInput: string;
  language: 'English' | 'Hindi' | 'Hinglish';
  icon: string;
}
