# Emoji Town

A phased emoji combination system with mathematical distribution and multi-stage relationship formation, built with Unicode compliance and diversity inclusion at its core.

## Overview

Emoji Town is an interactive game where players build diverse, inclusive communities using official Unicode emoji sequences. The game emphasizes proper Unicode standards compliance and creates racially diverse, LGBTQ+ friendly families through authentic Zero Width Joiner (ZWJ) emoji combinations.

## Key Features

- **Unicode Compliance**: All emoji combinations follow official Unicode Technical Report #51 standards
- **Diversity & Inclusion**: Support for all skin tones and relationship types using RGI (Recommended for General Interchange) sequences
- **Phased Gameplay**: Five distinct phases with progressive complexity
- **Mathematical Distribution**: Precise starter pack generation with validated emoji counts
- **Cross-Platform Compatibility**: Validated emoji sequences ensure consistent rendering

## Game Phases

### 1. Starter Pack Phase
- Generate 100 emoji starter pack
- Distribution: 6 people, 15 skin tones, 64 professions, 15 wildcards
- All emojis sourced from official Unicode categories

### 2. Recruit Citizens Phase
- Combine base people emojis with skin tone modifiers
- Create citizens using validated Unicode sequences
- Must complete 3 recruitment rounds to advance

### 3. Welcome Center Phase
- Form couples and families using RGI family sequences
- Support for all relationship types (same-gender, mixed-gender)
- Proper ZWJ sequence validation for family formation

### 4. Town Building Phase
- Place families in themed buildings
- Drag-and-drop interface for town planning
- Building capacity and occupancy management

### 5. Secondary Pairing Phase
- Create workplace relationships and professional couples
- Handle adoption processes for remaining children
- Form extended family networks

## Technical Architecture

### Unicode Standards Implementation

The game implements strict Unicode compliance through:

- **RGI Family Sequences**: Official Unicode family emoji combinations
- **Fitzpatrick Skin Tone Support**: All 5 skin tone modifiers (Types 1-6)
- **ZWJ Sequence Validation**: Proper Zero Width Joiner usage
- **Professional Combinations**: Object-format ZWJ sequences for careers

### Core Components

```
shared/
  unicode-constants.ts    # Official Unicode emoji definitions
  schema.ts              # Database schema and types

client/src/lib/
  zwj-engine.ts          # Unicode ZWJ sequence engine
  starter-pack-generator.ts # Mathematical pack distribution
  types.ts               # TypeScript interfaces

server/
  storage.ts             # In-memory data persistence
  routes.ts              # API endpoints
```

## Unicode Compliance Details

### Base People Emojis
- `👨` MAN (U+1F468)
- `👩` WOMAN (U+1F469) 
- `🧑` PERSON (U+1F9D1) - Gender-neutral
- `👶` BABY (U+1F476)
- `👦` BOY (U+1F466)
- `👧` GIRL (U+1F467)

### Skin Tone Modifiers
- `🏻` Light (U+1F3FB) - Fitzpatrick Type-1-2
- `🏼` Medium-Light (U+1F3FC) - Fitzpatrick Type-3
- `🏽` Medium (U+1F3FD) - Fitzpatrick Type-4
- `🏾` Medium-Dark (U+1F3FE) - Fitzpatrick Type-5
- `🏿` Dark (U+1F3FF) - Fitzpatrick Type-6

### Family Formation Patterns
```
Couple: MAN + ZWJ + ❤️ + ZWJ + WOMAN
Same-Gender: MAN + ZWJ + ❤️ + ZWJ + MAN
Family: MAN + ZWJ + WOMAN + ZWJ + BOY
Single Parent: WOMAN + ZWJ + GIRL
```

## Installation & Setup

1. **Clone and Install**
   ```bash
   git clone [repository]
   cd emoji-town
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open browser to `http://localhost:5000`
   - Game automatically loads in starter pack phase

## API Reference

### Game State Management
- `GET /api/game-state` - Current game phase and statistics
- `POST /api/phase-transition` - Advance to next phase

### Emoji Collection
- `GET /api/emoji-collection` - Current player's emoji inventory
- `POST /api/generate-starter-pack` - Create new starter pack

### Citizens & Families
- `GET /api/citizens` - All recruited citizens
- `POST /api/citizens` - Create new citizen from base + skin tone
- `GET /api/families` - All formed families
- `POST /api/families` - Create family from citizens

### Buildings & Town
- `GET /api/buildings` - Town building layout
- `POST /api/buildings` - Place family in building
- `PATCH /api/buildings/:id` - Update building occupancy

## Development Guidelines

### Unicode Validation
All emoji combinations must pass Unicode validation:
```typescript
import { validateZWJSequence } from '@shared/unicode-constants';

const result = validateZWJSequence(emojiSequence);
if (!result.valid) {
  throw new Error(result.reason);
}
```

### Adding New Emoji
1. Verify emoji exists in Unicode standard
2. Add to appropriate category in `unicode-constants.ts`
3. Update validation sets (RGI_FAMILY_SEQUENCES, etc.)
4. Test cross-platform rendering

### Data Integrity
- No mock or placeholder data anywhere in the system
- All emoji sequences validated against Unicode database
- Proper error handling for invalid combinations

## Browser Compatibility

### Supported Browsers
- Chrome 80+ (full emoji support)
- Firefox 75+ (full emoji support)
- Safari 13+ (full emoji support)
- Edge 80+ (full emoji support)

### Emoji Rendering
The game uses Unicode-compliant emoji sequences that render consistently across:
- Desktop operating systems (Windows, macOS, Linux)
- Mobile platforms (iOS, Android)
- Web browsers with modern emoji fonts

## Contributing

### Code Standards
- Follow Unicode TR51 specifications exactly
- All emoji combinations must validate against official sequences
- TypeScript strict mode enabled
- Comprehensive error handling required

### Testing Unicode Compliance
```bash
# Validate emoji sequences
npm run test:unicode

# Check cross-platform compatibility
npm run test:rendering
```

### Adding Features
1. Research Unicode standard requirements
2. Implement validation functions first
3. Add comprehensive error handling
4. Test on multiple platforms

## License

This project implements Unicode standards and follows Unicode Consortium guidelines for emoji usage. All emoji sequences are based on official Unicode documentation.

## References

- [Unicode Technical Report #51](https://unicode.org/reports/tr51/)
- [RGI Emoji ZWJ Sequences](https://unicode.org/Public/emoji/)
- [Fitzpatrick Scale](https://en.wikipedia.org/wiki/Fitzpatrick_scale)
- [Unicode Emoji Charts](https://unicode.org/emoji/charts/)