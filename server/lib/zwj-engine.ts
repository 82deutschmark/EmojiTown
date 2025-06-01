// Zero Width Joiner character
const ZWJ = '\u200D';

// Known valid ZWJ sequences for people + skin tones
const VALID_PERSON_COMBINATIONS = new Set([
  '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿',
  '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿',
  '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿'
]);

export interface ZWJResult {
  valid: boolean;
  result?: string;
  error?: string;
  unicodeSequence?: string;
}

export function createCitizen(baseEmoji: string, skinTone: string): ZWJResult {
  try {
    if (!baseEmoji || !skinTone) {
      return {
        valid: false,
        error: 'Both base emoji and skin tone are required'
      };
    }

    const result = baseEmoji + skinTone;
    
    if (!VALID_PERSON_COMBINATIONS.has(result)) {
      return {
        valid: false,
        error: 'Invalid person + skin tone combination'
      };
    }

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
    
    if (adults.length === 2) {
      result += ZWJ + adults[1];
    }

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

function getUnicodeSequence(emoji: string): string {
  try {
    return [...emoji]
      .map(char => `U+${char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}`)
      .join(' ');
  } catch {
    return 'Invalid sequence';
  }
}
