export interface EmojiComponent {
  emoji: string;
  category: 'people' | 'skinTones' | 'professions' | 'wildcards';
  count: number;
}

export interface CitizenData {
  id?: number;
  emoji: string;
  baseEmoji: string;
  skinTone?: string;
  status: 'available' | 'in-family' | 'placed';
  buildingType?: string;
}

export interface FamilyData {
  id?: number;
  emoji: string;
  members: number[];
  familyType: 'couple' | 'family' | 'single-parent';
  buildingType?: string;
  isPlaced: boolean;
}

export interface BuildingData {
  id?: number;
  buildingType: string;
  position: number;
  capacity: number;
  currentOccupancy: number;
  occupants: number[];
}

export interface GameStateData {
  id?: number;
  currentPhase: 'starter-pack' | 'recruit-citizens' | 'welcome-center' | 'town-building' | 'secondary-pairing';
  packsOpened: number;
  totalCitizens: number;
  totalFamilies: number;
  buildingsPopulated: number;
  adoptions: number;
}

export interface StarterPackDistribution {
  people: number;
  skinTones: number;
  professions: number;
  wildcards: number;
}

export interface ZWJResult {
  valid: boolean;
  result?: string;
  error?: string;
  unicodeSequence?: string;
}

export type PhaseType = 'starter-pack' | 'recruit-citizens' | 'welcome-center' | 'town-building' | 'secondary-pairing';

export interface BuildingType {
  type: string;
  emoji: string;
  name: string;
  capacity: number;
  compatibleProfessions: string[];
}
