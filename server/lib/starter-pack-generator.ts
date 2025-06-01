import type { EmojiComponent } from '../../client/src/lib/types';

export const EMOJI_CATEGORIES = {
  people: ['👨', '👩', '🧑'],
  skinTones: ['🏻', '🏼', '🏽', '🏾', '🏿'],
  professions: [
    '👮', '⚕️', '🚒', '🍳', '✈️', '🔧', '🏫', '💼', 
    '🎨', '📚', '🌾', '💻', '🔬', '🎭', '🎪', '🎯'
  ],
  wildcards: [
    '❤️', '💕', '✨', '👶', '👧', '👦', '🧒', '👴', '👵',
    '🤝', '💑', '💏', '👪', '🏠', '🎈', '🎉'
  ]
} as const;

export const PACK_DISTRIBUTION = {
  people: 6, // 2 of each base person
  skinTones: 15, // 3 of each skin tone
  professions: 25,
  wildcards: 54
} as const;

export function generateStarterPack(): EmojiComponent[] {
  const pack: EmojiComponent[] = [];
  
  // Add guaranteed base people (2 of each)
  EMOJI_CATEGORIES.people.forEach(emoji => {
    pack.push({
      emoji,
      category: 'people',
      count: 2
    });
  });

  // Add guaranteed skin tones (3 of each)
  EMOJI_CATEGORIES.skinTones.forEach(emoji => {
    pack.push({
      emoji,
      category: 'skinTones',
      count: 3
    });
  });

  // Add random professions
  for (let i = 0; i < PACK_DISTRIBUTION.professions; i++) {
    const randomProfession = EMOJI_CATEGORIES.professions[
      Math.floor(Math.random() * EMOJI_CATEGORIES.professions.length)
    ];
    
    const existing = pack.find(item => item.emoji === randomProfession && item.category === 'professions');
    if (existing) {
      existing.count++;
    } else {
      pack.push({
        emoji: randomProfession,
        category: 'professions',
        count: 1
      });
    }
  }

  // Add random wildcards
  for (let i = 0; i < PACK_DISTRIBUTION.wildcards; i++) {
    const randomWildcard = EMOJI_CATEGORIES.wildcards[
      Math.floor(Math.random() * EMOJI_CATEGORIES.wildcards.length)
    ];
    
    const existing = pack.find(item => item.emoji === randomWildcard && item.category === 'wildcards');
    if (existing) {
      existing.count++;
    } else {
      pack.push({
        emoji: randomWildcard,
        category: 'wildcards',
        count: 1
      });
    }
  }

  return pack;
}

export function validatePackDistribution(pack: EmojiComponent[]): boolean {
  const categoryCounts = {
    people: 0,
    skinTones: 0,
    professions: 0,
    wildcards: 0
  };

  pack.forEach(item => {
    categoryCounts[item.category] += item.count;
  });

  return (
    categoryCounts.people === PACK_DISTRIBUTION.people &&
    categoryCounts.skinTones === PACK_DISTRIBUTION.skinTones &&
    categoryCounts.professions === PACK_DISTRIBUTION.professions &&
    categoryCounts.wildcards === PACK_DISTRIBUTION.wildcards
  );
}
