// Unicode Constants for Emoji Town
// Based on Unicode Technical Report #51 and official emoji sequences

// Zero Width Joiner
export const ZWJ = '\u200D';

// Variation Selectors
export const EMOJI_VARIATION_SELECTOR = '\uFE0F';
export const TEXT_VARIATION_SELECTOR = '\uFE0E';

// Gender Signs
export const MALE_SIGN = '\u2642';
export const FEMALE_SIGN = '\u2640';

// Base Human Emoji (Unicode 15.0)
export const BASE_PEOPLE = {
  // Gender-neutral base
  PERSON: '\u1F9D1',
  
  // Explicit gender
  MAN: '\u1F468',
  WOMAN: '\u1F469',
  
  // Age variants
  BABY: '\u1F476',
  CHILD: '\u1F9D2',
  BOY: '\u1F466',
  GIRL: '\u1F467',
  OLDER_PERSON: '\u1F9D3',
  OLD_MAN: '\u1F474',
  OLD_WOMAN: '\u1F475',
} as const;

// Fitzpatrick Skin Tone Modifiers (Unicode 8.0)
export const SKIN_TONES = {
  LIGHT: '\u1F3FB',          // Type-1-2
  MEDIUM_LIGHT: '\u1F3FC',   // Type-3
  MEDIUM: '\u1F3FD',         // Type-4
  MEDIUM_DARK: '\u1F3FE',    // Type-5
  DARK: '\u1F3FF',           // Type-6
} as const;

// Profession Objects for ZWJ sequences
export const PROFESSION_OBJECTS = {
  // Healthcare
  MEDICAL_SYMBOL: '\u2695\uFE0F',
  STETHOSCOPE: '\u1FA7A',
  
  // Emergency Services
  FIRE_ENGINE: '\u1F692',
  POLICE_CAR: '\u1F693',
  
  // Education
  SCHOOL: '\u1F3EB',
  GRADUATION_CAP: '\u1F393',
  
  // Food Service
  COOKING: '\u1F373',
  
  // Transportation
  AIRPLANE: '\u2708\uFE0F',
  
  // Tools
  WRENCH: '\u1F527',
  HAMMER: '\u1F528',
  
  // Technology
  COMPUTER: '\u1F4BB',
  MICROSCOPE: '\u1F52C',
  
  // Arts
  ARTIST_PALETTE: '\u1F3A8',
  MICROPHONE: '\u1F3A4',
  
  // Justice
  BALANCE_SCALE: '\u2696\uFE0F',
  
  // Agriculture
  EAR_OF_RICE: '\u1F33E',
} as const;

// Valid Emoji Modifier Base Characters
// Characters that can be modified with skin tone modifiers
export const EMOJI_MODIFIER_BASES = new Set([
  BASE_PEOPLE.PERSON,
  BASE_PEOPLE.MAN,
  BASE_PEOPLE.WOMAN,
  BASE_PEOPLE.BABY,
  BASE_PEOPLE.CHILD,
  BASE_PEOPLE.BOY,
  BASE_PEOPLE.GIRL,
  BASE_PEOPLE.OLDER_PERSON,
  BASE_PEOPLE.OLD_MAN,
  BASE_PEOPLE.OLD_WOMAN,
  // Add more modifier bases as needed
]);

// Family relationship heart emoji
export const HEART_EMOJI = {
  RED_HEART: '\u2764\uFE0F',
  KISS_MARK: '\u1F48B',
} as const;

// Complete list of valid person + skin tone combinations
export const VALID_PERSON_SKIN_COMBINATIONS = new Set([
  // PERSON combinations
  BASE_PEOPLE.PERSON + SKIN_TONES.LIGHT,
  BASE_PEOPLE.PERSON + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.PERSON + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.PERSON + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.PERSON + SKIN_TONES.DARK,
  
  // MAN combinations
  BASE_PEOPLE.MAN + SKIN_TONES.LIGHT,
  BASE_PEOPLE.MAN + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.MAN + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.MAN + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.MAN + SKIN_TONES.DARK,
  
  // WOMAN combinations
  BASE_PEOPLE.WOMAN + SKIN_TONES.LIGHT,
  BASE_PEOPLE.WOMAN + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.WOMAN + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.WOMAN + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.WOMAN + SKIN_TONES.DARK,
  
  // BABY combinations
  BASE_PEOPLE.BABY + SKIN_TONES.LIGHT,
  BASE_PEOPLE.BABY + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.BABY + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.BABY + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.BABY + SKIN_TONES.DARK,
  
  // CHILD combinations
  BASE_PEOPLE.CHILD + SKIN_TONES.LIGHT,
  BASE_PEOPLE.CHILD + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.CHILD + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.CHILD + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.CHILD + SKIN_TONES.DARK,
  
  // BOY combinations
  BASE_PEOPLE.BOY + SKIN_TONES.LIGHT,
  BASE_PEOPLE.BOY + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.BOY + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.BOY + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.BOY + SKIN_TONES.DARK,
  
  // GIRL combinations
  BASE_PEOPLE.GIRL + SKIN_TONES.LIGHT,
  BASE_PEOPLE.GIRL + SKIN_TONES.MEDIUM_LIGHT,
  BASE_PEOPLE.GIRL + SKIN_TONES.MEDIUM,
  BASE_PEOPLE.GIRL + SKIN_TONES.MEDIUM_DARK,
  BASE_PEOPLE.GIRL + SKIN_TONES.DARK,
]);

// RGI Emoji ZWJ Sequences for Families (based on Unicode TR51)
// These are the official Unicode family sequences
export const RGI_FAMILY_SEQUENCES = new Set([
  // Couples with heart
  BASE_PEOPLE.MAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + BASE_PEOPLE.MAN,
  BASE_PEOPLE.MAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + BASE_PEOPLE.WOMAN,
  BASE_PEOPLE.WOMAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + BASE_PEOPLE.MAN,
  BASE_PEOPLE.WOMAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + BASE_PEOPLE.WOMAN,
  
  // Kiss sequences
  BASE_PEOPLE.MAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + HEART_EMOJI.KISS_MARK + ZWJ + BASE_PEOPLE.MAN,
  BASE_PEOPLE.MAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + HEART_EMOJI.KISS_MARK + ZWJ + BASE_PEOPLE.WOMAN,
  BASE_PEOPLE.WOMAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + HEART_EMOJI.KISS_MARK + ZWJ + BASE_PEOPLE.MAN,
  BASE_PEOPLE.WOMAN + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + HEART_EMOJI.KISS_MARK + ZWJ + BASE_PEOPLE.WOMAN,
  
  // Single parent families
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL,
  
  // Single parent with multiple children
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.BOY + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.BOY + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.GIRL,
  
  // Two-parent families
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL,
  
  // Two-parent families with multiple children
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.BOY + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.BOY + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.BOY + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.MAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.GIRL,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.BOY + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.BOY,
  BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.WOMAN + ZWJ + BASE_PEOPLE.GIRL + ZWJ + BASE_PEOPLE.GIRL,
]);

// Professional ZWJ sequences using object format
// Pattern: PERSON/MAN/WOMAN + ZWJ + PROFESSION_OBJECT
export const VALID_PROFESSION_COMBINATIONS = new Set([
  // Health Worker
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.MEDICAL_SYMBOL,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.MEDICAL_SYMBOL,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.MEDICAL_SYMBOL,
  
  // Firefighter
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.FIRE_ENGINE,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.FIRE_ENGINE,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.FIRE_ENGINE,
  
  // Police Officer
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.POLICE_CAR,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.POLICE_CAR,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.POLICE_CAR,
  
  // Teacher
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.SCHOOL,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.SCHOOL,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.SCHOOL,
  
  // Cook
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.COOKING,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.COOKING,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.COOKING,
  
  // Pilot
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.AIRPLANE,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.AIRPLANE,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.AIRPLANE,
  
  // Mechanic
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.WRENCH,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.WRENCH,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.WRENCH,
  
  // Technologist
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.COMPUTER,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.COMPUTER,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.COMPUTER,
  
  // Scientist
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.MICROSCOPE,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.MICROSCOPE,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.MICROSCOPE,
  
  // Artist
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.ARTIST_PALETTE,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.ARTIST_PALETTE,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.ARTIST_PALETTE,
  
  // Farmer
  BASE_PEOPLE.PERSON + ZWJ + PROFESSION_OBJECTS.EAR_OF_RICE,
  BASE_PEOPLE.MAN + ZWJ + PROFESSION_OBJECTS.EAR_OF_RICE,
  BASE_PEOPLE.WOMAN + ZWJ + PROFESSION_OBJECTS.EAR_OF_RICE,
]);

// Wildcard emoji for relationships and family building
export const WILDCARD_EMOJI = {
  // Hearts and love
  RED_HEART: HEART_EMOJI.RED_HEART,
  ORANGE_HEART: '\u1F9E1',
  YELLOW_HEART: '\u1F49B',
  GREEN_HEART: '\u1F49A',
  BLUE_HEART: '\u1F499',
  PURPLE_HEART: '\u1F49C',
  BROWN_HEART: '\u1F90E',
  BLACK_HEART: '\u1F5A4',
  WHITE_HEART: '\u1F90D',
  PINK_HEART: '\u1F489',
  SPARKLING_HEART: '\u1F496',
  GROWING_HEART: '\u1F497',
  BEATING_HEART: '\u1F493',
  REVOLVING_HEARTS: '\u1F49E',
  TWO_HEARTS: '\u1F495',
  HEART_DECORATION: '\u1F49F',
  HEART_EXCLAMATION: '\u2763\uFE0F',
  BROKEN_HEART: '\u1F494',
  KISS_MARK: HEART_EMOJI.KISS_MARK,
  
  // Family symbols
  FAMILY: '\u1F46A',
  COUPLE_WITH_HEART: '\u1F491',
  KISS: '\u1F48F',
  
  // Houses and buildings
  HOUSE: '\u1F3E0',
  HOUSE_WITH_GARDEN: '\u1F3E1',
  BUILDINGS: '\u1F3E2',
  
  // Other relationship symbols
  HANDSHAKE: '\u1F91D',
  HUGGING_FACE: '\u1F917',
  SMILING_FACE_WITH_HEARTS: '\u1F970',
  WEDDING: '\u1F492',
  BOUQUET: '\u1F490',
  RING: '\u1F48D',
} as const;

// Building types with their corresponding emoji
export const BUILDING_TYPES = {
  HOSPITAL: '\u1F3E5',
  SCHOOL: '\u1F3EB',
  FIRE_STATION: '\u1F692',
  POLICE_STATION: '\u1F693',
  OFFICE_BUILDING: '\u1F3E2',
  FACTORY: '\u1F3ED',
  BANK: '\u1F3E6',
  HOTEL: '\u1F3E8',
  CONVENIENCE_STORE: '\u1F3EA',
  DEPARTMENT_STORE: '\u1F3EC',
  RESTAURANT: '\u1F37D\uFE0F',
  CHURCH: '\u26EA',
  MOSQUE: '\u1F54C',
  SYNAGOGUE: '\u1F54D',
  HINDU_TEMPLE: '\u1F6D5',
  KAABA: '\u1F54B',
} as const;

// Helper function to validate Unicode sequences
export function isValidEmojiModifierBase(emoji: string): boolean {
  return EMOJI_MODIFIER_BASES.has(emoji);
}

export function isValidSkinTone(modifier: string): boolean {
  return Object.values(SKIN_TONES).includes(modifier as any);
}

export function isValidPersonSkinCombination(sequence: string): boolean {
  return VALID_PERSON_SKIN_COMBINATIONS.has(sequence);
}

export function isValidProfessionCombination(sequence: string): boolean {
  return VALID_PROFESSION_COMBINATIONS.has(sequence);
}

export function isValidFamilySequence(sequence: string): boolean {
  return RGI_FAMILY_SEQUENCES.has(sequence);
}

// Unicode sequence utilities
export function getUnicodeCodePoints(str: string): string[] {
  const codePoints: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const codePoint = str.codePointAt(i);
    if (codePoint) {
      codePoints.push(`U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`);
      // Skip the next character if this is a surrogate pair
      if (codePoint > 0xFFFF) {
        i++;
      }
    }
  }
  return codePoints;
}

export function formatUnicodeSequence(str: string): string {
  return getUnicodeCodePoints(str).join(' ');
}

// Validate that a sequence follows Unicode standards
export function validateZWJSequence(sequence: string): {
  valid: boolean;
  reason?: string;
  codePoints: string[];
} {
  const codePoints = getUnicodeCodePoints(sequence);
  
  // Check if it's a valid RGI family sequence
  if (RGI_FAMILY_SEQUENCES.has(sequence)) {
    return { valid: true, codePoints };
  }
  
  // Check for proper ZWJ usage
  if (sequence.includes(ZWJ)) {
    const parts = sequence.split(ZWJ);
    
    // Ensure no empty parts
    if (parts.some(part => part.length === 0)) {
      return {
        valid: false,
        reason: 'Empty segments in ZWJ sequence',
        codePoints
      };
    }
    
    // Check if it's a valid profession sequence
    if (parts.length === 2) {
      const [person, object] = parts;
      if (VALID_PROFESSION_COMBINATIONS.has(sequence)) {
        return { valid: true, codePoints };
      }
    }
    
    // Check if it's a family sequence with skin tone variations
    // This handles the base pattern even if skin tones differ
    const baseSequence = sequence.replace(/[\u1F3FB-\u1F3FF]/g, '');
    if (RGI_FAMILY_SEQUENCES.has(baseSequence)) {
      return { valid: true, codePoints };
    }
  }
  
  // Check if it's a valid person + skin tone combination
  if (VALID_PERSON_SKIN_COMBINATIONS.has(sequence)) {
    return { valid: true, codePoints };
  }
  
  return {
    valid: false,
    reason: 'Not a recognized Unicode emoji sequence pattern',
    codePoints
  };
}