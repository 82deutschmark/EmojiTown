# Emoji Town - Game Design Document

## Executive Summary

Emoji Town is a Unicode-compliant emoji combination game that creates diverse, inclusive communities through proper Zero Width Joiner (ZWJ) sequences. The game emphasizes mathematical precision, Unicode standards compliance, and authentic cross-platform emoji rendering.

## Core Design Principles

### 1. Unicode Standards Compliance
- All emoji combinations must follow Unicode Technical Report #51 exactly
- Use only RGI (Recommended for General Interchange) emoji sequences
- Validate all ZWJ sequences against official Unicode database
- Ensure cross-platform compatibility through standards adherence

### 2. Diversity and Inclusion
- Support all Fitzpatrick skin tone modifiers (Types 1-6)
- Include LGBTQ+ friendly family formation options
- Use gender-neutral base emojis where appropriate
- Represent all relationship types equally

### 3. Mathematical Precision
- Exact starter pack distribution: 6 people + 15 skin tones + 64 professions + 15 wildcards = 100 total
- Validated emoji counts across all categories
- Deterministic progression requirements between phases

### 4. Authentic Data Only
- No placeholder or mock emoji sequences
- All combinations validated against Unicode standards
- Real-time validation prevents invalid sequences
- Clear error messages for unsupported combinations

## Game Flow Architecture

### Phase Progression System
```
Starter Pack → Recruit Citizens → Welcome Center → Town Building → Secondary Pairing
     ↓              ↓                ↓               ↓              ↓
  Generate 100    Combine base     Form couples    Place in       Create workplace
  emoji pack     + skin tones     and families    buildings      relationships
```

### Phase Transition Requirements
- **Starter Pack → Recruit Citizens**: Pack generated successfully
- **Recruit Citizens → Welcome Center**: 3 recruitment rounds completed
- **Welcome Center → Town Building**: At least 1 family formed
- **Town Building → Secondary Pairing**: Families placed in buildings
- **Secondary Pairing → Complete**: All citizens processed

## Detailed Phase Design

### 1. Starter Pack Phase

**Objective**: Generate mathematically precise emoji distribution

**Components**:
- 6 base people emoji (2 each: MAN, WOMAN, PERSON)
- 15 skin tone modifiers (3 each: 🏻🏼🏽🏾🏿)
- 64 profession objects (medical, emergency, education, etc.)
- 15 wildcard emoji (hearts, families, buildings)

**Validation**:
- Total count must equal exactly 100
- Each category must meet minimum distribution
- All emoji must exist in Unicode standard

**Technical Implementation**:
```typescript
export const PACK_DISTRIBUTION = {
  people: 6,      // BASE_PEOPLE values
  skinTones: 15,  // SKIN_TONES values  
  professions: 64, // PROFESSION_OBJECTS values
  wildcards: 15   // WILDCARD_EMOJI values
}
```

### 2. Recruit Citizens Phase

**Objective**: Create diverse citizens through valid Unicode combinations

**Mechanics**:
- Select base person emoji (👨👩🧑)
- Choose skin tone modifier (🏻🏼🏽🏾🏿)
- Validate combination against VALID_PERSON_SKIN_COMBINATIONS
- Must complete 3 recruitment rounds to advance

**Unicode Validation**:
```
Valid: 👨 + 🏽 = 👨🏽 (MAN + MEDIUM_SKIN)
Valid: 👩 + 🏻 = 👩🏻 (WOMAN + LIGHT_SKIN)
Invalid: 👶 + ⚕️ (incompatible combination)
```

**Progression Logic**:
- Each recruitment consumes 1 base person + 1 skin tone
- Citizens added to available pool for family formation
- Diversity encouraged through UI feedback

### 3. Welcome Center Phase

**Objective**: Form families using official RGI family sequences

**Family Types Supported**:
- **Couples**: Adult + ZWJ + ❤️ + ZWJ + Adult
- **Single Parent**: Adult + ZWJ + Child
- **Nuclear Family**: Adult + ZWJ + Adult + ZWJ + Child(ren)
- **Same-Gender Families**: All combinations supported

**RGI Sequence Examples**:
```
👨‍❤️‍👨 (Man + Heart + Man)
👩‍❤️‍👩 (Woman + Heart + Woman)  
👨‍👩‍👧 (Man + Woman + Girl)
👨‍👨‍👦 (Man + Man + Boy)
👩‍👧 (Woman + Girl - Single Parent)
```

**Validation Process**:
1. Check if sequence exists in RGI_FAMILY_SEQUENCES
2. Validate skin tone combinations if mixed
3. Ensure family size limits (max 4 members)
4. Update citizen status to 'in-family'

### 4. Town Building Phase

**Objective**: Place families in themed buildings with capacity management

**Building Types**:
- Hospital (🏥) - Capacity: 4 families
- School (🏫) - Capacity: 6 families  
- Office Building (🏢) - Capacity: 8 families
- Residential (🏠) - Capacity: 3 families
- Factory (🏭) - Capacity: 5 families

**Placement Mechanics**:
- Drag-and-drop interface for family placement
- Visual capacity indicators per building
- Automatic occupancy tracking
- Cannot exceed building capacity

**Professional Matching**:
- Healthcare workers prefer Hospital placement
- Teachers prefer School placement
- Generic workers fit any building type

### 5. Secondary Pairing Phase

**Objective**: Handle remaining citizens and create extended relationships

**Processes**:
- **Workplace Couples**: Form relationships between compatible professionals
- **Adoption System**: Place remaining children with existing families
- **Extended Networks**: Create connections between related families

**Workplace Pairing Rules**:
```
👨‍⚕️ + 👩‍⚕️ = Medical couple
👨‍🏫 + 👩‍🏫 = Teacher couple
👨‍🍳 + 👩‍🍳 = Chef couple
```

**Adoption Validation**:
- Families must have capacity for additional children
- Maintain Unicode compliance in extended family sequences
- Update building occupancy after adoptions

## Technical Architecture

### Unicode Engine Design

**ZWJ Sequence Creation**:
```typescript
function createFamily(adults: string[], children: string[]): ZWJResult {
  // 1. Validate inputs against Unicode base sets
  // 2. Construct ZWJ sequence: adult1 + ZWJ + adult2 + ZWJ + child1...
  // 3. Check against RGI_FAMILY_SEQUENCES
  // 4. Return validated sequence or error
}
```

**Validation Pipeline**:
1. **Input Validation**: Check emoji exists in Unicode
2. **Combination Validation**: Verify compatibility 
3. **Sequence Validation**: Confirm RGI compliance
4. **Cross-Platform Testing**: Ensure rendering consistency

### Data Flow Architecture

**State Management**:
```
GameState → EmojiCollection → Citizens → Families → Buildings → Relationships
    ↓            ↓             ↓         ↓          ↓           ↓
  Phase      Starter Pack   Recruited  Formed    Placed    Workplace
 Tracking    Distribution   Citizens   Families Buildings  Couples
```

**API Design**:
- RESTful endpoints for each game entity
- Atomic operations for emoji combinations
- Rollback support for invalid sequences
- Real-time validation responses

## User Experience Design

### Visual Design Principles

**Emoji-First Interface**:
- Large, clear emoji display (minimum 32px)
- High contrast backgrounds for accessibility
- Consistent spacing and alignment
- Mobile-responsive grid layouts

**Feedback Systems**:
- Immediate validation feedback for combinations
- Progress indicators for phase completion
- Success animations for valid sequences
- Clear error messages for invalid attempts

**Accessibility Features**:
- Screen reader support for emoji sequences
- Keyboard navigation for all interactions
- High contrast mode support
- Alt text for complex emoji combinations

### Progression Feedback

**Achievement System**:
- "First Family" - Create first valid family sequence
- "Diversity Champion" - Use all skin tone combinations
- "Community Builder" - Fill all building types
- "Unicode Master" - Create 10+ valid ZWJ sequences

**Statistics Tracking**:
- Total citizens recruited
- Families created by type
- Buildings populated
- Unicode sequences generated

## Error Handling & Edge Cases

### Invalid Sequence Handling
```typescript
// Example error responses
{
  valid: false,
  error: "Invalid person + skin tone combination",
  unicodeSequence: "U+1F468 U+1F3FB",
  suggestion: "Try using a valid modifier base emoji"
}
```

### Platform Compatibility Issues
- Graceful degradation for unsupported emoji
- Fallback display for incomplete font support
- Clear messaging about browser requirements
- Progressive enhancement for modern browsers

### Data Consistency
- Atomic updates for multi-step operations
- Rollback mechanisms for failed transactions
- Validation at multiple system layers
- Consistent state across client/server

## Future Expansion Possibilities

### Additional Unicode Features
- Emoji 16.0 sequences when standardized
- Regional indicator sequences for flags
- Keycap sequences for numbers/symbols
- Tag sequences for subdivisions

### Gameplay Extensions
- Multi-player town building
- Import/export town configurations
- Custom building creation tools
- Advanced family tree visualization

### Educational Features
- Unicode learning mode with explanations
- Cultural context for emoji usage
- Accessibility testing playground
- Standards compliance verification tools

## Performance Considerations

### Optimization Strategies
- Lazy loading for large emoji sets
- Memoization for validation functions
- Efficient Unicode sequence caching
- Minimal re-renders for state updates

### Scalability Requirements
- Support for 1000+ citizen communities
- Real-time collaboration features
- Cloud save/sync capabilities
- Cross-device progression tracking

## Compliance & Standards

### Unicode Consortium Guidelines
- Follow official emoji usage recommendations
- Respect cultural sensitivity guidelines
- Implement accessibility best practices
- Maintain compatibility with updates

### Privacy & Data Protection
- No personal data collection
- Local storage for game progress
- Optional cloud backup with consent
- Transparent data usage policies

---

This design document serves as the authoritative reference for Emoji Town's implementation, ensuring consistent Unicode compliance and inclusive community building through authentic emoji sequences.