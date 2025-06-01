import type { ZWJResult } from './types';

// Zero Width Joiner character
const ZWJ = '\u200D';

// Known valid ZWJ sequences for people + skin tones
const VALID_PERSON_COMBINATIONS = new Set([
  '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿',
  '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿',
  '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿'
]);

// Known profession modifiers
const PROFESSION_MODIFIERS = new Set([
  '👮', '⚕️', '🚒', '🍳', '✈️', '🔧', '🏫', '💼'
]);

// Family relationship emojis
const FAMILY_CONNECTORS = new Set(['❤️', '💕']);

export function createCitizen(baseEmoji: string, skinTone: string): ZWJResult {
  try {
    // Validate inputs
    if (!baseEmoji || !skinTone) {
      return {
        valid: false,
        error: 'Both base emoji and skin tone are required'
      };
    }

    // Create the combination
    const result = baseEmoji + skinTone;
    
    // Validate against known combinations
    if (!VALID_PERSON_COMBINATIONS.has(result)) {
      return {
        valid: false,
        error: 'Invalid person + skin tone combination'
      };
    }

    // Get Unicode sequence for debugging
    const unicodeSequence = getUnicodeSequence(result);

    return {
      valid: true,
      result,
      unicodeSequence
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error in citizen creation'
    };
  }
}

export function createProfessionalCitizen(citizen: string, profession: string): ZWJResult {
  try {
    if (!citizen || !profession) {
      return {
        valid: false,
        error: 'Both citizen and profession are required'
      };
    }

    if (!PROFESSION_MODIFIERS.has(profession)) {
      return {
        valid: false,
        error: 'Invalid profession modifier'
      };
    }

    const result = citizen + ZWJ + profession;
    const unicodeSequence = getUnicodeSequence(result);

    return {
      valid: true,
      result,
      unicodeSequence
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error in professional creation'
    };
  }
}

export function createCouple(adult1: string, adult2: string): ZWJResult {
  try {
    if (!adult1 || !adult2) {
      return {
        valid: false,
        error: 'Both adults are required for couple formation'
      };
    }

    const result = adult1 + ZWJ + '❤️' + ZWJ + adult2;
    const unicodeSequence = getUnicodeSequence(result);

    return {
      valid: true,
      result,
      unicodeSequence
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error in couple creation'
    };
  }
}

export function createFamily(adults: string[], children: string[] = []): ZWJResult {
  try {
    if (adults.length === 0) {
      return {
        valid: false,
        error: 'At least one adult is required for family formation'
      };
    }

    if (adults.length > 2) {
      return {
        valid: false,
        error: 'Maximum 2 adults allowed in family'
      };
    }

    let result = adults[0];
    
    // Add second adult if present
    if (adults.length === 2) {
      result += ZWJ + adults[1];
    }

    // Add children
    children.forEach(child => {
      result += ZWJ + child;
    });

    const unicodeSequence = getUnicodeSequence(result);

    return {
      valid: true,
      result,
      unicodeSequence
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error in family creation'
    };
  }
}

export function addAdoptedChild(family: string, child: string): ZWJResult {
  try {
    if (!family || !child) {
      return {
        valid: false,
        error: 'Both family and child are required for adoption'
      };
    }

    const result = family + ZWJ + child;
    const unicodeSequence = getUnicodeSequence(result);

    return {
      valid: true,
      result,
      unicodeSequence
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error in adoption'
    };
  }
}

export function validateZWJSequence(sequence: string): boolean {
  try {
    // Basic validation - check if sequence contains valid Unicode characters
    const codePoints = [...sequence].map(char => char.codePointAt(0));
    return codePoints.every(cp => cp !== undefined && cp >= 0x1F000);
  } catch {
    return false;
  }
}

export function getUnicodeSequence(emoji: string): string {
  try {
    return [...emoji]
      .map(char => `U+${char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}`)
      .join(' ');
  } catch {
    return 'Invalid sequence';
  }
}

export function decomposeFamily(familyEmoji: string): string[] {
  try {
    // Split by ZWJ character to get individual components
    return familyEmoji.split(ZWJ).filter(component => component.length > 0);
  } catch {
    return [];
  }
}

export function getFamilyType(familyEmoji: string): string {
  const components = decomposeFamily(familyEmoji);
  
  if (components.length === 1) return 'single';
  if (components.length === 2) {
    if (components.includes('❤️')) return 'couple';
    return 'parent-child';
  }
  if (components.length >= 3) {
    if (components.includes('❤️')) return 'couple-with-children';
    return 'family';
  }
  
  return 'unknown';
}
