# Unicode Specification for Emoji Town

## Unicode Technical Report #51 Compliance

This document outlines how Emoji Town implements Unicode Technical Report #51 (UTR #51) for emoji sequences, ensuring cross-platform compatibility and standards compliance.

## RGI Emoji ZWJ Sequences Implementation

### Family Sequences (Based on Official Unicode Data)

The game implements the complete set of RGI (Recommended for General Interchange) family sequences as defined in Unicode 15.0:

#### Couple Sequences
```
1F468 200D 2764 FE0F 200D 1F468  ; couple with heart: man, man
1F468 200D 2764 FE0F 200D 1F469  ; couple with heart: man, woman  
1F469 200D 2764 FE0F 200D 1F468  ; couple with heart: woman, man
1F469 200D 2764 FE0F 200D 1F469  ; couple with heart: woman, woman
```

#### Kiss Sequences
```
1F468 200D 2764 FE0F 200D 1F48B 200D 1F468  ; kiss: man, man
1F468 200D 2764 FE0F 200D 1F48B 200D 1F469  ; kiss: man, woman
1F469 200D 2764 FE0F 200D 1F48B 200D 1F468  ; kiss: woman, man
1F469 200D 2764 FE0F 200D 1F48B 200D 1F469  ; kiss: woman, woman
```

#### Family Sequences
```
1F468 200D 1F466        ; family: man, boy
1F468 200D 1F467        ; family: man, girl
1F469 200D 1F466        ; family: woman, boy
1F469 200D 1F467        ; family: woman, girl
1F468 200D 1F468 200D 1F466  ; family: man, man, boy
1F468 200D 1F469 200D 1F466  ; family: man, woman, boy
1F469 200D 1F469 200D 1F466  ; family: woman, woman, boy
```

### Emoji Modifier Base Characters

The following characters support Fitzpatrick skin tone modifiers:

```typescript
export const EMOJI_MODIFIER_BASES = new Set([
  '\u1F9D1',  // PERSON
  '\u1F468',  // MAN  
  '\u1F469',  // WOMAN
  '\u1F476',  // BABY
  '\u1F9D2',  // CHILD
  '\u1F466',  // BOY
  '\u1F467',  // GIRL
  '\u1F9D3',  // OLDER PERSON
  '\u1F474',  // OLD MAN
  '\u1F475',  // OLD WOMAN
]);
```

### Fitzpatrick Scale Implementation

Based on dermatological standards for skin tone representation:

| Code Point | Type | Description | Sample |
|------------|------|-------------|---------|
| U+1F3FB | Type-1-2 | Light skin tone | 🏻 |
| U+1F3FC | Type-3 | Medium-light skin tone | 🏼 |
| U+1F3FD | Type-4 | Medium skin tone | 🏽 |
| U+1F3FE | Type-5 | Medium-dark skin tone | 🏾 |
| U+1F3FF | Type-6 | Dark skin tone | 🏿 |

## Gender Representation

### Gender-Neutral Default

Following Unicode guidelines, the game uses gender-neutral representations as defaults:

- `🧑` PERSON (U+1F9D1) - Primary gender-neutral character
- Gender-specific variants created through ZWJ sequences
- No assumptions about default gender presentation

### Explicit Gender Sequences

When explicit gender is required, the game uses proper ZWJ sequences:

```
🧑‍⚕️  PERSON + ZWJ + MEDICAL SYMBOL (gender-neutral health worker)
👨‍⚕️  MAN + ZWJ + MEDICAL SYMBOL (male health worker)  
👩‍⚕️  WOMAN + ZWJ + MEDICAL SYMBOL (female health worker)
```

## Professional Role Sequences

### Object Format Implementation

Professional roles use the object format ZWJ sequences:

```typescript
export const PROFESSION_OBJECTS = {
  MEDICAL_SYMBOL: '\u2695\uFE0F',      // ⚕️
  FIRE_ENGINE: '\u1F692',             // 🚒
  POLICE_CAR: '\u1F693',              // 🚓
  SCHOOL: '\u1F3EB',                  // 🏫
  COOKING: '\u1F373',                 // 🍳
  AIRPLANE: '\u2708\uFE0F',           // ✈️
  WRENCH: '\u1F527',                  // 🔧
  COMPUTER: '\u1F4BB',                // 💻
  MICROSCOPE: '\u1F52C',              // 🔬
  ARTIST_PALETTE: '\u1F3A8',          // 🎨
  EAR_OF_RICE: '\u1F33E',            // 🌾
};
```

## Validation Algorithm

### ZWJ Sequence Validation Process

```typescript
function validateZWJSequence(sequence: string): ValidationResult {
  // 1. Parse Unicode code points
  const codePoints = getUnicodeCodePoints(sequence);
  
  // 2. Check against RGI family sequences
  if (RGI_FAMILY_SEQUENCES.has(sequence)) {
    return { valid: true, codePoints };
  }
  
  // 3. Validate ZWJ usage patterns
  if (sequence.includes(ZWJ)) {
    const parts = sequence.split(ZWJ);
    
    // 4. Check for valid profession sequences
    if (parts.length === 2 && VALID_PROFESSION_COMBINATIONS.has(sequence)) {
      return { valid: true, codePoints };
    }
    
    // 5. Handle skin tone variations in family sequences
    const baseSequence = sequence.replace(/[\u1F3FB-\u1F3FF]/g, '');
    if (RGI_FAMILY_SEQUENCES.has(baseSequence)) {
      return { valid: true, codePoints };
    }
  }
  
  // 6. Validate person + skin tone combinations
  if (VALID_PERSON_SKIN_COMBINATIONS.has(sequence)) {
    return { valid: true, codePoints };
  }
  
  return {
    valid: false,
    reason: 'Not a recognized Unicode emoji sequence pattern',
    codePoints
  };
}
```

## Cross-Platform Compatibility

### Rendering Requirements

To ensure consistent rendering across platforms:

1. **Variation Selectors**: Proper use of U+FE0F for emoji presentation
2. **ZWJ Handling**: Graceful degradation when ZWJ sequences aren't supported
3. **Font Fallbacks**: Clear display even with incomplete emoji fonts
4. **Platform Testing**: Validation across Windows, macOS, iOS, Android

### Browser Support Matrix

| Browser | Version | Emoji Support | ZWJ Sequences |
|---------|---------|---------------|---------------|
| Chrome | 80+ | Full | Complete |
| Firefox | 75+ | Full | Complete |
| Safari | 13+ | Full | Complete |
| Edge | 80+ | Full | Complete |

## Error Handling Specifications

### Invalid Sequence Detection

The system detects and reports various types of invalid sequences:

```typescript
interface ValidationError {
  valid: false;
  reason: string;
  codePoints: string[];
  suggestion?: string;
}
```

### Common Error Types

1. **Empty ZWJ Segments**: Sequences with empty parts between ZWJ characters
2. **Invalid Base Characters**: Using non-modifier-base characters with skin tones
3. **Unsupported Combinations**: Character combinations not in Unicode standard
4. **Malformed Sequences**: Incorrect ZWJ placement or structure

## Implementation Standards

### Code Point Representation

All Unicode characters are represented using proper code point notation:

```typescript
// Correct: Use actual Unicode characters
const MAN = '\u1F468';
const ZWJ = '\u200D';
const HEART = '\u2764\uFE0F';

// Incorrect: Don't use surrogate pairs directly
// const MAN = '\uD83D\uDC68';
```

### Sequence Construction

Family sequences follow exact Unicode patterns:

```typescript
// Couple formation: ADULT + ZWJ + HEART + ZWJ + ADULT
const couple = adult1 + ZWJ + HEART_EMOJI.RED_HEART + ZWJ + adult2;

// Family formation: ADULT + ZWJ + ADULT + ZWJ + CHILD
const family = parent1 + ZWJ + parent2 + ZWJ + child;
```

### Validation Integration

Every emoji combination must pass validation:

```typescript
const result = createCouple(man, woman);
if (!result.valid) {
  throw new Error(`Invalid couple sequence: ${result.error}`);
}
```

## Accessibility Considerations

### Screen Reader Support

Emoji sequences include proper accessibility markup:

- Alt text descriptions for complex sequences
- Logical reading order for family compositions
- Cultural context where appropriate

### Visual Accessibility

- High contrast support for emoji display
- Sufficient size for clear character recognition
- Alternative text representations where needed

## Future Unicode Versions

### Extensibility Design

The system is designed to accommodate new Unicode versions:

1. **Modular Validation**: Easy addition of new RGI sequences
2. **Backward Compatibility**: Existing sequences remain valid
3. **Progressive Enhancement**: New features without breaking changes
4. **Version Detection**: Support for multiple Unicode standards

### Update Process

When new Unicode versions are released:

1. Review new RGI emoji ZWJ sequences
2. Update validation sets in `unicode-constants.ts`
3. Test cross-platform compatibility
4. Maintain backward compatibility
5. Document changes and additions

## Compliance Verification

### Testing Procedures

1. **Unicode Database Validation**: Compare against official Unicode data
2. **Cross-Platform Testing**: Verify rendering on multiple systems
3. **Standards Compliance**: Ensure adherence to UTR #51 guidelines
4. **Accessibility Testing**: Validate screen reader compatibility

### Continuous Monitoring

- Regular updates with Unicode releases
- Platform compatibility monitoring
- User feedback integration
- Standards compliance auditing

This specification ensures Emoji Town maintains strict Unicode compliance while providing an inclusive, accessible experience for all users.