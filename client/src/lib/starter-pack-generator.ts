import type { EmojiComponent, StarterPackDistribution } from './types';

import { BASE_PEOPLE, SKIN_TONES, PROFESSION_OBJECTS, WILDCARD_EMOJI } from '@shared/unicode-constants';

export const EMOJI_CATEGORIES = {
  people: [BASE_PEOPLE.MAN, BASE_PEOPLE.WOMAN, BASE_PEOPLE.PERSON],
  skinTones: Object.values(SKIN_TONES),
  professions: Object.values(PROFESSION_OBJECTS),
  wildcards: Object.values(WILDCARD_EMOJI)
} as const;

export const PACK_DISTRIBUTION: StarterPackDistribution = {
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

export function getPackTotalSize(pack: EmojiComponent[]): number {
  return pack.reduce((total, item) => total + item.count, 0);
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

export function expandPackToGrid(pack: EmojiComponent[]): string[] {
  const grid: string[] = [];
  
  pack.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      grid.push(item.emoji);
    }
  });

  // Shuffle the grid for random distribution
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }

  return grid;
}
