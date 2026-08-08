import { UserProfile, UserIntent, Scheme, SchemeMatch } from '../types';
import { INDIAN_SCHEMES } from '../data/schemes';

export function matchSchemes(profile: UserProfile, intent: UserIntent, schemesList: Scheme[] = INDIAN_SCHEMES): SchemeMatch[] {
  return schemesList.map(scheme => calculateMatch(profile, intent, scheme))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function calculateMatch(profile: UserProfile, intent: UserIntent, scheme: Scheme): SchemeMatch {
  const rules = scheme.eligibilityRules;
  const metCriteria: string[] = [];
  const unmetCriteria: string[] = [];
  const missingDataWarnings: string[] = [];
  const counterfactualSuggestions: string[] = [];
  let scorePoints = 100;
  let totalRulesChecked = 0;

  // 1. Sector Relevance check
  if (intent.target_sector !== 'all' && intent.target_sector !== scheme.sector) {
    // Slight penalty if sector doesn't match target_sector, but still evaluate criteria
    scorePoints -= 15;
  }

  // 2. Occupation Check
  if (rules.allowedOccupations && rules.allowedOccupations.length > 0) {
    totalRulesChecked++;
    if (profile.occupation === null) {
      missingDataWarnings.push(`Occupation is unspecified (Requires: ${rules.allowedOccupations.join(', ')})`);
      scorePoints -= 15;
    } else if (rules.allowedOccupations.includes(profile.occupation)) {
      metCriteria.push(`Occupation matched: ${profile.occupation}`);
    } else {
      unmetCriteria.push(`Occupation mismatch: ${profile.occupation} (Required: ${rules.allowedOccupations.join(', ')})`);
      scorePoints -= 40;
    }
  }

  // 3. Age Check
  if (rules.minAge !== undefined || rules.maxAge !== undefined) {
    totalRulesChecked++;
    if (profile.age === null) {
      missingDataWarnings.push('Age not specified');
      scorePoints -= 10;
    } else {
      const minAge = rules.minAge ?? 0;
      const maxAge = rules.maxAge ?? 120;
      if (profile.age >= minAge && profile.age <= maxAge) {
        metCriteria.push(`Age (${profile.age} yrs) is within eligible range [${minAge}-${maxAge}]`);
      } else {
        unmetCriteria.push(`Age (${profile.age} yrs) outside range [${minAge}-${maxAge}]`);
        scorePoints -= 50;
        if (profile.age < minAge) {
          counterfactualSuggestions.push(`Wait until turning ${minAge} years old or apply under minor guardian category.`);
        }
      }
    }
  }

  // 4. Gender Check
  if (rules.gender && rules.gender.length > 0) {
    totalRulesChecked++;
    if (profile.gender === null) {
      missingDataWarnings.push(`Gender not specified (Scheme targets: ${rules.gender.join(', ')})`);
      scorePoints -= 15;
    } else if (rules.gender.includes(profile.gender)) {
      metCriteria.push(`Gender matched: ${profile.gender}`);
    } else {
      unmetCriteria.push(`Gender (${profile.gender}) not eligible for this scheme`);
      scorePoints -= 60;
    }
  }

  // 5. Income Check
  if (rules.maxIncome !== undefined) {
    totalRulesChecked++;
    if (profile.annual_income_inr === null) {
      missingDataWarnings.push(`Annual Income not specified (Max limit: ₹${rules.maxIncome.toLocaleString('en-IN')})`);
      scorePoints -= 10;
    } else if (profile.annual_income_inr <= rules.maxIncome) {
      metCriteria.push(`Annual income ₹${profile.annual_income_inr.toLocaleString('en-IN')} ≤ limit ₹${rules.maxIncome.toLocaleString('en-IN')}`);
    } else {
      const diff = profile.annual_income_inr - rules.maxIncome;
      unmetCriteria.push(`Annual income ₹${profile.annual_income_inr.toLocaleString('en-IN')} exceeds limit ₹${rules.maxIncome.toLocaleString('en-IN')}`);
      scorePoints -= 45;
      counterfactualSuggestions.push(`Reduce certified household income by ₹${diff.toLocaleString('en-IN')} to meet the ₹${rules.maxIncome.toLocaleString('en-IN')} ceiling.`);
    }
  }

  // 6. Landholding Check
  if (rules.maxLandholding !== undefined) {
    totalRulesChecked++;
    if (profile.landholding_acres === null) {
      missingDataWarnings.push(`Landholding not specified (Max limit: ${rules.maxLandholding} acres)`);
      scorePoints -= 10;
    } else if (profile.landholding_acres <= rules.maxLandholding) {
      metCriteria.push(`Landholding ${profile.landholding_acres} acres ≤ limit ${rules.maxLandholding} acres`);
    } else {
      unmetCriteria.push(`Landholding ${profile.landholding_acres} acres exceeds max ${rules.maxLandholding} acres`);
      scorePoints -= 35;
      counterfactualSuggestions.push(`Landholding of ${profile.landholding_acres} acres exceeds maximum ${rules.maxLandholding} acres allowed.`);
    }
  }

  // 7. Area Type Check
  if (rules.allowedAreaTypes && rules.allowedAreaTypes.length > 0) {
    totalRulesChecked++;
    if (profile.area_type === null) {
      missingDataWarnings.push(`Area type unspecified (Requires: ${rules.allowedAreaTypes.join(', ')})`);
      scorePoints -= 10;
    } else if (rules.allowedAreaTypes.includes(profile.area_type)) {
      metCriteria.push(`Area type matched: ${profile.area_type}`);
    } else {
      unmetCriteria.push(`Area type ${profile.area_type} does not match ${rules.allowedAreaTypes.join(', ')}`);
      scorePoints -= 30;
    }
  }

  // 8. BPL / Category Check
  if (rules.requiresBpl) {
    totalRulesChecked++;
    if (profile.is_bpl === true) {
      metCriteria.push('BPL status confirmed');
    } else if (profile.is_bpl === false) {
      unmetCriteria.push('BPL card required');
      scorePoints -= 35;
      counterfactualSuggestions.push('Obtain a verified BPL / SECC ration card to qualify.');
    } else {
      missingDataWarnings.push('BPL card status unspecified');
      scorePoints -= 15;
    }
  }

  if (rules.allowedCategories && rules.allowedCategories.length > 0) {
    totalRulesChecked++;
    if (profile.category === null) {
      missingDataWarnings.push(`Social Category unspecified (Targets: ${rules.allowedCategories.join(', ')})`);
      scorePoints -= 5;
    } else if (rules.allowedCategories.includes(profile.category)) {
      metCriteria.push(`Category matched: ${profile.category}`);
    } else {
      unmetCriteria.push(`Category ${profile.category} not targeted`);
      scorePoints -= 30;
    }
  }

  // Ensure score is clamped between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(scorePoints)));

  let status: 'eligible' | 'conditional' | 'ineligible';
  if (unmetCriteria.length === 0 && missingDataWarnings.length === 0) {
    status = 'eligible';
  } else if (unmetCriteria.length === 0 || finalScore >= 60) {
    status = 'conditional';
  } else {
    status = 'ineligible';
  }

  return {
    scheme,
    status,
    matchScore: finalScore,
    metCriteria,
    unmetCriteria,
    missingDataWarnings,
    counterfactualSuggestions
  };
}
