/**
 * Privacy Guardrail Utility:
 * Sanitizes user input on the client-side to redact sensitive Personally Identifiable Information (PII)
 * before sending queries to external LLM APIs (Google AI Studio / Gemini).
 */

export function sanitizeUserInput(input: string): { sanitizedText: string; redactedTypes: string[] } {
  let text = input;
  const redactedTypes: string[] = [];

  // 1. Aadhaar Card Pattern (12 digits, optional spaces/hyphens)
  const aadhaarRegex = /\b[2-9]{1}\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  if (aadhaarRegex.test(text)) {
    text = text.replace(aadhaarRegex, "[AADHAAR_REDACTED]");
    redactedTypes.push("Aadhaar Number");
  }

  // 2. Indian Phone Number Pattern (10 digits starting with 6-9, optional +91)
  const phoneRegex = /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g;
  if (phoneRegex.test(text)) {
    text = text.replace(phoneRegex, "[PHONE_REDACTED]");
    redactedTypes.push("Phone Number");
  }

  // 3. Indian PAN Card Pattern (5 letters, 4 digits, 1 letter)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
  if (panRegex.test(text)) {
    text = text.replace(panRegex, "[PAN_REDACTED]");
    redactedTypes.push("PAN Card");
  }

  return {
    sanitizedText: text,
    redactedTypes,
  };
}
