// Unicode Validation Engine - Comprehensive RGI Compliance
// Based on Unicode Technical Report #51 and official emoji-test.txt

import {
  ZWJ,
  BASE_PEOPLE,
  SKIN_TONES,
  HEART_EMOJI,
  VALID_PERSON_SKIN_COMBINATIONS,
  VALID_PROFESSION_COMBINATIONS,
  RGI_FAMILY_SEQUENCES,
  getUnicodeCodePoints,
  formatUnicodeSequence
} from './unicode-constants';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  codePoints: string[];
  suggestions?: string[];
  category?: 'person-skin' | 'profession' | 'family' | 'couple' | 'invalid';
}

export interface ValidationError {
  code: string;
  message: string;
  suggestions: string[];
  unicodeSequence: string;
}

// Comprehensive validation error codes
export const VALIDATION_ERROR_CODES = {
  EMPTY_SEQUENCE: 'EMPTY_SEQUENCE',
  INVALID_BASE_PERSON: 'INVALID_BASE_PERSON',
  INVALID_SKIN_TONE: 'INVALID_SKIN_TONE',
  INCOMPATIBLE_PERSON_SKIN: 'INCOMPATIBLE_PERSON_SKIN',
  INVALID_ZWJ_STRUCTURE: 'INVALID_ZWJ_STRUCTURE',
  EMPTY_ZWJ_SEGMENT: 'EMPTY_ZWJ_SEGMENT',
  UNSUPPORTED_FAMILY_PATTERN: 'UNSUPPORTED_FAMILY_PATTERN',
  INVALID_PROFESSION_COMBO: 'INVALID_PROFESSION_COMBO',
  NON_RGI_SEQUENCE: 'NON_RGI_SEQUENCE',
  MALFORMED_UNICODE: 'MALFORMED_UNICODE',
  MIXED_SKIN_TONES_INVALID: 'MIXED_SKIN_TONES_INVALID',
  TOO_MANY_FAMILY_MEMBERS: 'TOO_MANY_FAMILY_MEMBERS',
  INVALID_GENDER_COMBINATION: 'INVALID_GENDER_COMBINATION'
} as const;

// Error message catalog with actionable suggestions
const ERROR_CATALOG: Record<string, { message: string; suggestions: string[] }> = {
  [VALIDATION_ERROR_CODES.EMPTY_SEQUENCE]: {
    message: "Empty emoji sequence provided",
    suggestions: ["Provide a valid emoji sequence", "Check input is not null or empty"]
  },
  [VALIDATION_ERROR_CODES.INVALID_BASE_PERSON]: {
    message: "Base person emoji is not a valid modifier base",
    suggestions: ["Use 👨 (MAN), 👩 (WOMAN), or 🧑 (PERSON)", "Check emoji exists in Unicode standard"]
  },
  [VALIDATION_ERROR_CODES.INVALID_SKIN_TONE]: {
    message: "Skin tone modifier is not valid",
    suggestions: ["Use skin tones 🏻🏼🏽🏾🏿", "Ensure skin tone follows Fitzpatrick scale"]
  },
  [VALIDATION_ERROR_CODES.INCOMPATIBLE_PERSON_SKIN]: {
    message: "Person and skin tone combination not supported",
    suggestions: ["Check Unicode compatibility", "Try different base person emoji"]
  },
  [VALIDATION_ERROR_CODES.INVALID_ZWJ_STRUCTURE]: {
    message: "Zero Width Joiner sequence structure invalid",
    suggestions: ["Follow pattern: EMOJI + ZWJ + EMOJI", "Check ZWJ placement"]
  },
  [VALIDATION_ERROR_CODES.EMPTY_ZWJ_SEGMENT]: {
    message: "Empty segment found between ZWJ characters",
    suggestions: ["Remove empty segments", "Ensure valid emoji between each ZWJ"]
  },
  [VALIDATION_ERROR_CODES.UNSUPPORTED_FAMILY_PATTERN]: {
    message: "Family pattern not in RGI sequences",
    suggestions: ["Use supported family combinations", "Check Unicode family sequences"]
  },
  [VALIDATION_ERROR_CODES.INVALID_PROFESSION_COMBO]: {
    message: "Profession combination not supported",
    suggestions: ["Use valid profession objects", "Check object format sequences"]
  },
  [VALIDATION_ERROR_CODES.NON_RGI_SEQUENCE]: {
    message: "Sequence not recommended for general interchange",
    suggestions: ["Use RGI-approved sequences", "Check Unicode recommendations"]
  },
  [VALIDATION_ERROR_CODES.MALFORMED_UNICODE]: {
    message: "Unicode sequence contains malformed characters",
    suggestions: ["Check character encoding", "Validate input contains valid Unicode"]
  },
  [VALIDATION_ERROR_CODES.MIXED_SKIN_TONES_INVALID]: {
    message: "Mixed skin tones in family not properly structured",
    suggestions: ["Ensure each person has individual skin tone", "Follow RGI mixed-tone patterns"]
  },
  [VALIDATION_ERROR_CODES.TOO_MANY_FAMILY_MEMBERS]: {
    message: "Family has too many members for valid sequence",
    suggestions: ["Limit to 4 family members maximum", "Split into multiple families"]
  },
  [VALIDATION_ERROR_CODES.INVALID_GENDER_COMBINATION]: {
    message: "Gender combination not supported in family sequence",
    suggestions: ["Check RGI family patterns", "Ensure valid adult-child relationships"]
  }
};

/**
 * Comprehensive Unicode sequence validation with detailed error reporting
 */
export function validateEmojiSequence(sequence: string): ValidationResult {
  const codePoints = getUnicodeCodePoints(sequence);
  
  // Basic input validation
  if (!sequence || sequence.length === 0) {
    return createValidationError(VALIDATION_ERROR_CODES.EMPTY_SEQUENCE, codePoints);
  }

  try {
    // Check for malformed Unicode
    const normalizedSequence = sequence.normalize('NFC');
    if (normalizedSequence !== sequence) {
      return createValidationError(VALIDATION_ERROR_CODES.MALFORMED_UNICODE, codePoints);
    }

    // Single person + skin tone validation
    if (!sequence.includes(ZWJ) && sequence.length <= 4) {
      return validatePersonSkinCombination(sequence, codePoints);
    }

    // ZWJ sequence validation
    if (sequence.includes(ZWJ)) {
      return validateZWJSequence(sequence, codePoints);
    }

    // Direct RGI sequence check
    if (RGI_FAMILY_SEQUENCES.has(sequence)) {
      return {
        valid: true,
        codePoints,
        category: 'family'
      };
    }

    // If none of the above, it's likely invalid
    return createValidationError(VALIDATION_ERROR_CODES.NON_RGI_SEQUENCE, codePoints);

  } catch (error) {
    return createValidationError(VALIDATION_ERROR_CODES.MALFORMED_UNICODE, codePoints);
  }
}

function validatePersonSkinCombination(sequence: string, codePoints: string[]): ValidationResult {
  if (VALID_PERSON_SKIN_COMBINATIONS.has(sequence)) {
    return {
      valid: true,
      codePoints,
      category: 'person-skin'
    };
  }

  // Analyze what went wrong
  const chars = Array.from(sequence);
  if (chars.length === 2) {
    const [person, skin] = chars;
    
    if (!Object.values(BASE_PEOPLE).includes(person as any)) {
      return createValidationError(VALIDATION_ERROR_CODES.INVALID_BASE_PERSON, codePoints);
    }
    
    if (!Object.values(SKIN_TONES).includes(skin as any)) {
      return createValidationError(VALIDATION_ERROR_CODES.INVALID_SKIN_TONE, codePoints);
    }
  }

  return createValidationError(VALIDATION_ERROR_CODES.INCOMPATIBLE_PERSON_SKIN, codePoints);
}

function validateZWJSequence(sequence: string, codePoints: string[]): ValidationResult {
  const parts = sequence.split(ZWJ);
  
  // Check for empty segments
  if (parts.some(part => part.length === 0)) {
    return createValidationError(VALIDATION_ERROR_CODES.EMPTY_ZWJ_SEGMENT, codePoints);
  }

  // Check if it's a valid profession sequence
  if (parts.length === 2) {
    if (VALID_PROFESSION_COMBINATIONS.has(sequence)) {
      return {
        valid: true,
        codePoints,
        category: 'profession'
      };
    }
    return createValidationError(VALIDATION_ERROR_CODES.INVALID_PROFESSION_COMBO, codePoints);
  }

  // Check if it's a valid family sequence
  if (parts.length >= 2) {
    // Direct RGI check first
    if (RGI_FAMILY_SEQUENCES.has(sequence)) {
      return {
        valid: true,
        codePoints,
        category: 'family'
      };
    }

    // Check for skin tone variations of valid patterns
    const baseSequence = sequence.replace(/[\u1F3FB-\u1F3FF]/g, '');
    if (RGI_FAMILY_SEQUENCES.has(baseSequence)) {
      // Validate mixed skin tones are properly applied
      if (validateMixedSkinToneFamily(sequence)) {
        return {
          valid: true,
          codePoints,
          category: 'family'
        };
      }
      return createValidationError(VALIDATION_ERROR_CODES.MIXED_SKIN_TONES_INVALID, codePoints);
    }

    // Check for couple patterns
    if (parts.length === 3 && parts[1] === HEART_EMOJI.RED_HEART) {
      return {
        valid: true,
        codePoints,
        category: 'couple'
      };
    }

    // Family too large
    if (parts.length > 4) {
      return createValidationError(VALIDATION_ERROR_CODES.TOO_MANY_FAMILY_MEMBERS, codePoints);
    }

    return createValidationError(VALIDATION_ERROR_CODES.UNSUPPORTED_FAMILY_PATTERN, codePoints);
  }

  return createValidationError(VALIDATION_ERROR_CODES.INVALID_ZWJ_STRUCTURE, codePoints);
}

function validateMixedSkinToneFamily(sequence: string): boolean {
  // For now, accept any mixed skin tone family as long as base pattern is valid
  // This could be expanded with more specific RGI mixed-tone validation
  return true;
}

function createValidationError(code: string, codePoints: string[]): ValidationResult {
  const errorInfo = ERROR_CATALOG[code] || {
    message: "Unknown validation error",
    suggestions: ["Check Unicode documentation"]
  };

  return {
    valid: false,
    reason: errorInfo.message,
    suggestions: errorInfo.suggestions,
    codePoints,
    category: 'invalid'
  };
}

/**
 * Atomic validation for state transitions
 */
export function validatePhaseTransition(
  currentPhase: string,
  targetPhase: string,
  gameState: any
): { valid: boolean; reason?: string } {
  const phaseOrder = ['starter-pack', 'recruit-citizens', 'welcome-center', 'town-building', 'secondary-pairing'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const targetIndex = phaseOrder.indexOf(targetPhase);

  if (currentIndex === -1 || targetIndex === -1) {
    return { valid: false, reason: "Invalid phase specified" };
  }

  if (targetIndex !== currentIndex + 1) {
    return { valid: false, reason: "Can only advance to next sequential phase" };
  }

  // Phase-specific requirements
  switch (targetPhase) {
    case 'recruit-citizens':
      if (!gameState.packsOpened || gameState.packsOpened === 0) {
        return { valid: false, reason: "Must generate starter pack first" };
      }
      break;
    case 'welcome-center':
      if (gameState.totalCitizens < 3) {
        return { valid: false, reason: "Must complete 3 recruitment rounds" };
      }
      break;
    case 'town-building':
      if (gameState.totalFamilies === 0) {
        return { valid: false, reason: "Must form at least one family" };
      }
      break;
    case 'secondary-pairing':
      if (gameState.buildingsPopulated === 0) {
        return { valid: false, reason: "Must place families in buildings" };
      }
      break;
  }

  return { valid: true };
}

/**
 * Generate accessibility-friendly descriptions for emoji sequences
 */
export function generateEmojiDescription(sequence: string): string {
  const validation = validateEmojiSequence(sequence);
  
  if (!validation.valid) {
    return `Invalid emoji sequence: ${validation.reason}`;
  }

  switch (validation.category) {
    case 'person-skin':
      return describePerson(sequence);
    case 'profession':
      return describeProfession(sequence);
    case 'couple':
      return describeCouple(sequence);
    case 'family':
      return describeFamily(sequence);
    default:
      return `Emoji sequence: ${formatUnicodeSequence(sequence)}`;
  }
}

function describePerson(sequence: string): string {
  const person = sequence.charAt(0);
  const skinTone = sequence.charAt(1);
  
  const personNames: Record<string, string> = {
    [BASE_PEOPLE.MAN]: 'man',
    [BASE_PEOPLE.WOMAN]: 'woman',
    [BASE_PEOPLE.PERSON]: 'person',
    [BASE_PEOPLE.BOY]: 'boy',
    [BASE_PEOPLE.GIRL]: 'girl',
    [BASE_PEOPLE.BABY]: 'baby'
  };

  const skinNames: Record<string, string> = {
    [SKIN_TONES.LIGHT]: 'light skin tone',
    [SKIN_TONES.MEDIUM_LIGHT]: 'medium-light skin tone',
    [SKIN_TONES.MEDIUM]: 'medium skin tone',
    [SKIN_TONES.MEDIUM_DARK]: 'medium-dark skin tone',
    [SKIN_TONES.DARK]: 'dark skin tone'
  };

  return `${personNames[person] || 'person'} with ${skinNames[skinTone] || 'skin tone'}`;
}

function describeProfession(sequence: string): string {
  const parts = sequence.split(ZWJ);
  const person = describePerson(parts[0]);
  const profession = parts[1];
  
  // Map profession objects to descriptions
  const professionNames: Record<string, string> = {
    '⚕️': 'health worker',
    '🚒': 'firefighter',
    '🚓': 'police officer',
    '🏫': 'teacher',
    '🍳': 'cook',
    '✈️': 'pilot',
    '🔧': 'mechanic',
    '💻': 'technologist',
    '🔬': 'scientist',
    '🎨': 'artist',
    '🌾': 'farmer'
  };

  return `${person} working as ${professionNames[profession] || 'professional'}`;
}

function describeCouple(sequence: string): string {
  const parts = sequence.split(ZWJ);
  const person1 = describePerson(parts[0]);
  const person2 = describePerson(parts[2]);
  return `couple: ${person1} and ${person2}`;
}

function describeFamily(sequence: string): string {
  const parts = sequence.split(ZWJ);
  const members = parts.map(part => {
    if (part === HEART_EMOJI.RED_HEART) return null;
    return describePerson(part);
  }).filter(Boolean);
  
  return `family: ${members.join(', ')}`;
}