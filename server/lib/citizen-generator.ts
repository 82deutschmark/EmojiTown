import { createCitizen } from './zwj-engine';
import type { EmojiCollection } from '@shared/schema';
import { BASE_PEOPLE, SKIN_TONES } from '@shared/unicode-constants';

export interface GeneratedCitizen {
  baseEmoji: string;
  skinTone: string;
  resultEmoji: string;
  unicodeSequence: string;
}

export interface CitizenGenerationResult {
  citizens: GeneratedCitizen[];
  usedComponents: { baseEmoji: string; skinTone: string }[];
}

/**
 * Generate 3 random valid citizens from available emoji collection
 */
export function generateRandomCitizens(collection: EmojiCollection[]): CitizenGenerationResult {
  const availablePeople = collection.filter(item => 
    item.category === 'people' && item.count > 0
  );
  
  const availableSkinTones = collection.filter(item => 
    item.category === 'skinTones' && item.count > 0
  );

  if (availablePeople.length === 0 || availableSkinTones.length === 0) {
    return { citizens: [], usedComponents: [] };
  }

  const citizens: GeneratedCitizen[] = [];
  const usedComponents: { baseEmoji: string; skinTone: string }[] = [];
  const collectionCopy = [...collection];

  for (let i = 0; i < 3; i++) {
    const availablePeopleFiltered = collectionCopy.filter(item => 
      item.category === 'people' && item.count > 0
    );
    
    const availableSkinsFiltered = collectionCopy.filter(item => 
      item.category === 'skinTones' && item.count > 0
    );

    if (availablePeopleFiltered.length === 0 || availableSkinsFiltered.length === 0) {
      break;
    }

    // Random selection
    const randomPerson = availablePeopleFiltered[Math.floor(Math.random() * availablePeopleFiltered.length)];
    const randomSkin = availableSkinsFiltered[Math.floor(Math.random() * availableSkinsFiltered.length)];

    // Generate citizen using ZWJ engine
    const result = createCitizen(randomPerson.emoji, randomSkin.emoji);
    
    if (result.valid && result.result) {
      citizens.push({
        baseEmoji: randomPerson.emoji,
        skinTone: randomSkin.emoji,
        resultEmoji: result.result,
        unicodeSequence: result.unicodeSequence || ''
      });

      usedComponents.push({
        baseEmoji: randomPerson.emoji,
        skinTone: randomSkin.emoji
      });

      // Deduct from collection copy for next iteration
      const personItem = collectionCopy.find(item => 
        item.emoji === randomPerson.emoji && item.category === 'people'
      );
      const skinItem = collectionCopy.find(item => 
        item.emoji === randomSkin.emoji && item.category === 'skinTones'
      );

      if (personItem) personItem.count = Math.max(0, personItem.count - 1);
      if (skinItem) skinItem.count = Math.max(0, skinItem.count - 1);
    }
  }

  return { citizens, usedComponents };
}

/**
 * Check if we can generate at least 3 citizens from collection
 */
export function canGenerateCitizens(collection: EmojiCollection[]): boolean {
  const peopleCount = collection
    .filter(item => item.category === 'people')
    .reduce((sum, item) => sum + item.count, 0);
    
  const skinCount = collection
    .filter(item => item.category === 'skinTones')
    .reduce((sum, item) => sum + item.count, 0);

  return peopleCount >= 1 && skinCount >= 1;
}

/**
 * Validate that specific components are still available in collection
 */
export function validateComponentsAvailable(
  collection: EmojiCollection[], 
  components: { baseEmoji: string; skinTone: string }[]
): boolean {
  for (const component of components) {
    const personItem = collection.find(item => 
      item.emoji === component.baseEmoji && item.category === 'people'
    );
    const skinItem = collection.find(item => 
      item.emoji === component.skinTone && item.category === 'skinTones'
    );

    if (!personItem || personItem.count <= 0 || !skinItem || skinItem.count <= 0) {
      return false;
    }
  }
  return true;
}