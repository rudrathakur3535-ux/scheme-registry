import json

def evaluate_scheme_eligibility(user_profile: dict, scheme: dict) -> dict:
    """
    Neuro-Symbolic Eligibility Matcher:
    Compares extracted user_profile against scheme rules deterministically.
    Generates exact match score, failed conditions, and counterfactual suggestions.
    """
    rules = scheme.get("eligibility_rules", {})
    failed_conditions = []
    counterfactual_suggestions = []
    passed_rules = 0
    total_rules = 0

    # 1. Age Verification
    user_age = user_profile.get("age")
    min_age = rules.get("min_age")
    max_age = rules.get("max_age")
    
    if min_age is not None:
        total_rules += 1
        if user_age is not None and user_age >= min_age:
            passed_rules += 1
        else:
            failed_conditions.append(f"Age {user_age} is below minimum requirement of {min_age} years.")
            counterfactual_suggestions.append(f"Wait until turning {min_age} years old or apply under minor guardian category.")
            
    if max_age is not None:
        total_rules += 1
        if user_age is not None and user_age <= max_age:
            passed_rules += 1
        else:
            failed_conditions.append(f"Age {user_age} exceeds maximum limit of {max_age} years.")

    # 2. Income Threshold Verification
    user_income = user_profile.get("annual_income_inr")
    max_income = rules.get("max_annual_income_inr")
    if max_income is not None:
        total_rules += 1
        if user_income is not None and user_income <= max_income:
            passed_rules += 1
        else:
            diff = user_income - max_income if user_income else 0
            failed_conditions.append(f"Annual income ₹{user_income:,} exceeds maximum limit of ₹{max_income:,}.")
            counterfactual_suggestions.append(f"Reduce certified household income by ₹{diff:,} to meet the ₹{max_income:,} ceiling.")

    # 3. Gender Verification
    user_gender = user_profile.get("gender")
    allowed_genders = rules.get("gender_allowed", ["all"])
    if allowed_genders and "all" not in allowed_genders:
        total_rules += 1
        if user_gender and user_gender.lower() in allowed_genders:
            passed_rules += 1
        else:
            failed_conditions.append(f"Gender '{user_gender}' does not match scheme target: {allowed_genders}.")

    # 4. Landholding Verification
    user_land = user_profile.get("landholding_acres")
    max_land = rules.get("max_landholding_acres")
    if max_land is not None:
        total_rules += 1
        if user_land is not None and user_land <= max_land:
            passed_rules += 1
        else:
            failed_conditions.append(f"Landholding ({user_land} acres) exceeds maximum allowed limit ({max_land} acres).")

    # Final Evaluation Summary
    is_eligible = len(failed_conditions) == 0
    match_score = round((passed_rules / total_rules * 100)) if total_rules > 0 else 100

    return {
        "scheme_id": scheme.get("scheme_id"),
        "scheme_name": scheme.get("scheme_name"),
        "is_eligible": is_eligible,
        "match_score_percent": match_score,
        "failed_conditions": failed_conditions,
        "counterfactual_suggestions": counterfactual_suggestions,
        "required_documents": scheme.get("required_documents", []),
        "official_apply_url": scheme.get("official_apply_url", "")
    }


# Quick Test Runner
if __name__ == "__main__":
    # Sample Output from Step 1 (AI Studio Profile Extractor)
    sample_user_profile = {
        "age": 22,
        "gender": "male",
        "annual_income_inr": 250000,
        "landholding_acres": 1.5,
        "occupation": "farmer"
    }

    # Sample Scheme from Step 2 (schemes.json)
    sample_scheme = {
        "scheme_id": "SCH_PM_KISAN",
        "scheme_name": "PM-Kisan Samman Nidhi",
        "eligibility_rules": {
            "min_age": 18,
            "max_annual_income_inr": 200000,
            "gender_allowed": ["all"],
            "max_landholding_acres": 5.0
        },
        "required_documents": ["Aadhaar", "Land Record (Khasra)", "Bank Passbook"],
        "official_apply_url": "https://pmkisan.gov.in"
    }

    evaluation_result = evaluate_scheme_eligibility(sample_user_profile, sample_scheme)
    print(json.dumps(evaluation_result, indent=2))
