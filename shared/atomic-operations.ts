// Atomic Operations Engine for State Management
// Ensures all game actions are atomic with proper rollback capabilities

import type { IStorage } from '../server/storage';
import { validateEmojiSequence, validatePhaseTransition } from './unicode-validation';

export interface AtomicOperation<T = any> {
  execute(): Promise<T>;
  rollback(): Promise<void>;
  validate(): Promise<boolean>;
}

export interface AtomicContext {
  storage: IStorage;
  gameStateId: number;
  operations: AtomicOperation[];
}

export class AtomicTransaction {
  private operations: AtomicOperation[] = [];
  private executed: AtomicOperation[] = [];
  private storage: IStorage;
  private gameStateId: number;

  constructor(storage: IStorage, gameStateId: number) {
    this.storage = storage;
    this.gameStateId = gameStateId;
  }

  addOperation(operation: AtomicOperation): void {
    this.operations.push(operation);
  }

  async execute<T>(): Promise<T> {
    try {
      // Validate all operations first
      for (const operation of this.operations) {
        const isValid = await operation.validate();
        if (!isValid) {
          throw new Error('Operation validation failed');
        }
      }

      // Execute all operations
      let result: T | undefined;
      for (const operation of this.operations) {
        result = await operation.execute();
        this.executed.push(operation);
      }

      return result as T;
    } catch (error) {
      // Rollback executed operations in reverse order
      await this.rollback();
      throw error;
    }
  }

  private async rollback(): Promise<void> {
    const toRollback = [...this.executed].reverse();
    for (const operation of toRollback) {
      try {
        await operation.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
    this.executed = [];
  }
}

// Atomic Citizen Creation Operation
export class CreateCitizenOperation implements AtomicOperation {
  private storage: IStorage;
  private gameStateId: number;
  private baseEmoji: string;
  private skinTone: string;
  private resultingEmoji: string;
  private createdCitizenId?: number;
  private originalGameState?: any;

  constructor(
    storage: IStorage,
    gameStateId: number,
    baseEmoji: string,
    skinTone: string,
    resultingEmoji: string
  ) {
    this.storage = storage;
    this.gameStateId = gameStateId;
    this.baseEmoji = baseEmoji;
    this.skinTone = skinTone;
    this.resultingEmoji = resultingEmoji;
  }

  async validate(): Promise<boolean> {
    // Validate the emoji sequence
    const validation = validateEmojiSequence(this.resultingEmoji);
    if (!validation.valid) {
      return false;
    }

    // Validate game state exists
    const gameState = await this.storage.getGameState();
    if (!gameState || gameState.id !== this.gameStateId) {
      return false;
    }

    return true;
  }

  async execute(): Promise<any> {
    // Store original game state for rollback
    this.originalGameState = await this.storage.getGameState();

    // Create citizen
    const citizen = await this.storage.createCitizen({
      gameStateId: this.gameStateId,
      baseEmoji: this.baseEmoji,
      skinTone: this.skinTone,
      emoji: this.resultingEmoji,
      status: 'available'
    });

    this.createdCitizenId = citizen.id;

    // Update game state counters
    await this.storage.updateGameState(this.gameStateId, {
      totalCitizens: this.originalGameState.totalCitizens + 1
    });

    return citizen;
  }

  async rollback(): Promise<void> {
    if (this.createdCitizenId) {
      // Note: Would need delete methods in storage interface
      // For now, mark as deleted or inactive
      await this.storage.updateCitizen(this.createdCitizenId, {
        status: 'deleted'
      });
    }

    if (this.originalGameState) {
      await this.storage.updateGameState(this.gameStateId, {
        totalCitizens: this.originalGameState.totalCitizens
      });
    }
  }
}

// Atomic Family Creation Operation
export class CreateFamilyOperation implements AtomicOperation {
  private storage: IStorage;
  private gameStateId: number;
  private memberIds: number[];
  private familyEmoji: string;
  private familyType: string;
  private createdFamilyId?: number;
  private originalCitizenStates: Map<number, string> = new Map();
  private originalGameState?: any;

  constructor(
    storage: IStorage,
    gameStateId: number,
    memberIds: number[],
    familyEmoji: string,
    familyType: string
  ) {
    this.storage = storage;
    this.gameStateId = gameStateId;
    this.memberIds = memberIds;
    this.familyEmoji = familyEmoji;
    this.familyType = familyType;
  }

  async validate(): Promise<boolean> {
    // Validate family emoji sequence
    const validation = validateEmojiSequence(this.familyEmoji);
    if (!validation.valid) {
      return false;
    }

    // Validate all citizens exist and are available
    const citizens = await this.storage.getCitizens(this.gameStateId);
    for (const memberId of this.memberIds) {
      const citizen = citizens.find(c => c.id === memberId);
      if (!citizen || citizen.status !== 'available') {
        return false;
      }
    }

    return true;
  }

  async execute(): Promise<any> {
    // Store original states for rollback
    this.originalGameState = await this.storage.getGameState();
    
    const citizens = await this.storage.getCitizens(this.gameStateId);
    for (const memberId of this.memberIds) {
      const citizen = citizens.find(c => c.id === memberId);
      if (citizen) {
        this.originalCitizenStates.set(memberId, citizen.status);
      }
    }

    // Create family
    const family = await this.storage.createFamily({
      gameStateId: this.gameStateId,
      emoji: this.familyEmoji,
      members: this.memberIds,
      familyType: this.familyType,
      isPlaced: 0
    });

    this.createdFamilyId = family.id;

    // Update citizen statuses
    for (const memberId of this.memberIds) {
      await this.storage.updateCitizen(memberId, { status: 'in-family' });
    }

    // Update game state counters
    await this.storage.updateGameState(this.gameStateId, {
      totalFamilies: this.originalGameState.totalFamilies + 1
    });

    return family;
  }

  async rollback(): Promise<void> {
    if (this.createdFamilyId) {
      // Mark family as deleted
      await this.storage.updateFamily(this.createdFamilyId, {
        familyType: 'deleted'
      });
    }

    // Restore citizen statuses
    for (const [citizenId, originalStatus] of this.originalCitizenStates) {
      await this.storage.updateCitizen(citizenId, { status: originalStatus });
    }

    if (this.originalGameState) {
      await this.storage.updateGameState(this.gameStateId, {
        totalFamilies: this.originalGameState.totalFamilies
      });
    }
  }
}

// Atomic Phase Transition Operation
export class PhaseTransitionOperation implements AtomicOperation {
  private storage: IStorage;
  private gameStateId: number;
  private targetPhase: string;
  private originalPhase?: string;

  constructor(storage: IStorage, gameStateId: number, targetPhase: string) {
    this.storage = storage;
    this.gameStateId = gameStateId;
    this.targetPhase = targetPhase;
  }

  async validate(): Promise<boolean> {
    const gameState = await this.storage.getGameState();
    if (!gameState) {
      return false;
    }

    const validation = validatePhaseTransition(
      gameState.currentPhase,
      this.targetPhase,
      gameState
    );

    return validation.valid;
  }

  async execute(): Promise<any> {
    const gameState = await this.storage.getGameState();
    if (!gameState) {
      throw new Error('Game state not found');
    }

    this.originalPhase = gameState.currentPhase;

    const updatedState = await this.storage.updateGameState(this.gameStateId, {
      currentPhase: this.targetPhase
    });

    return updatedState;
  }

  async rollback(): Promise<void> {
    if (this.originalPhase) {
      await this.storage.updateGameState(this.gameStateId, {
        currentPhase: this.originalPhase
      });
    }
  }
}

// Atomic Building Placement Operation
export class PlaceFamilyOperation implements AtomicOperation {
  private storage: IStorage;
  private gameStateId: number;
  private familyId: number;
  private buildingType: string;
  private position: number;
  private createdBuildingId?: number;
  private updatedBuildingId?: number;
  private originalBuilding?: any;
  private originalFamily?: any;
  private originalGameState?: any;

  constructor(
    storage: IStorage,
    gameStateId: number,
    familyId: number,
    buildingType: string,
    position: number
  ) {
    this.storage = storage;
    this.gameStateId = gameStateId;
    this.familyId = familyId;
    this.buildingType = buildingType;
    this.position = position;
  }

  async validate(): Promise<boolean> {
    // Validate family exists and is not placed
    const families = await this.storage.getFamilies(this.gameStateId);
    const family = families.find(f => f.id === this.familyId);
    if (!family || family.isPlaced) {
      return false;
    }

    // Validate building capacity if exists
    const buildings = await this.storage.getBuildings(this.gameStateId);
    const existingBuilding = buildings.find(
      b => b.buildingType === this.buildingType && b.position === this.position
    );

    if (existingBuilding) {
      const memberCount = Array.isArray(family.members) ? family.members.length : 0;
      if (existingBuilding.currentOccupancy + memberCount > existingBuilding.capacity) {
        return false;
      }
    }

    return true;
  }

  async execute(): Promise<any> {
    // Store original states
    this.originalGameState = await this.storage.getGameState();
    const families = await this.storage.getFamilies(this.gameStateId);
    this.originalFamily = families.find(f => f.id === this.familyId);

    const buildings = await this.storage.getBuildings(this.gameStateId);
    const existingBuilding = buildings.find(
      b => b.buildingType === this.buildingType && b.position === this.position
    );

    const memberIds = Array.isArray(this.originalFamily.members) ? this.originalFamily.members : [];

    if (existingBuilding) {
      this.originalBuilding = { ...existingBuilding };
      this.updatedBuildingId = existingBuilding.id;

      // Update existing building
      const updatedOccupants = [...(existingBuilding.occupants as number[]), ...memberIds];
      await this.storage.updateBuilding(existingBuilding.id, {
        currentOccupancy: existingBuilding.currentOccupancy + memberIds.length,
        occupants: updatedOccupants
      });
    } else {
      // Create new building
      const capacity = this.getBuildingCapacity(this.buildingType);
      const building = await this.storage.createBuilding({
        gameStateId: this.gameStateId,
        buildingType: this.buildingType,
        position: this.position,
        capacity,
        currentOccupancy: memberIds.length,
        occupants: memberIds
      });
      this.createdBuildingId = building.id;

      // Update buildings populated counter
      await this.storage.updateGameState(this.gameStateId, {
        buildingsPopulated: this.originalGameState.buildingsPopulated + 1
      });
    }

    // Update family as placed
    await this.storage.updateFamily(this.familyId, {
      isPlaced: 1,
      buildingType: this.buildingType
    });

    return { success: true };
  }

  async rollback(): Promise<void> {
    // Restore family state
    if (this.originalFamily) {
      await this.storage.updateFamily(this.familyId, {
        isPlaced: this.originalFamily.isPlaced,
        buildingType: this.originalFamily.buildingType
      });
    }

    // Restore or remove building
    if (this.updatedBuildingId && this.originalBuilding) {
      await this.storage.updateBuilding(this.updatedBuildingId, {
        currentOccupancy: this.originalBuilding.currentOccupancy,
        occupants: this.originalBuilding.occupants
      });
    }

    if (this.createdBuildingId) {
      // Mark building as deleted (would need delete method)
      await this.storage.updateBuilding(this.createdBuildingId, {
        currentOccupancy: 0,
        occupants: []
      });

      // Restore game state counter
      if (this.originalGameState) {
        await this.storage.updateGameState(this.gameStateId, {
          buildingsPopulated: this.originalGameState.buildingsPopulated
        });
      }
    }
  }

  private getBuildingCapacity(buildingType: string): number {
    const capacities: Record<string, number> = {
      "🏥": 4, "🏫": 6, "🏢": 8, "🏠": 3, "🏭": 5, "🏪": 4, "🏨": 6, "🏦": 4
    };
    return capacities[buildingType] || 4;
  }
}

// Factory functions for creating atomic operations
export function createCitizenAtomically(
  storage: IStorage,
  gameStateId: number,
  baseEmoji: string,
  skinTone: string,
  resultingEmoji: string
): AtomicTransaction {
  const transaction = new AtomicTransaction(storage, gameStateId);
  transaction.addOperation(
    new CreateCitizenOperation(storage, gameStateId, baseEmoji, skinTone, resultingEmoji)
  );
  return transaction;
}

export function createFamilyAtomically(
  storage: IStorage,
  gameStateId: number,
  memberIds: number[],
  familyEmoji: string,
  familyType: string
): AtomicTransaction {
  const transaction = new AtomicTransaction(storage, gameStateId);
  transaction.addOperation(
    new CreateFamilyOperation(storage, gameStateId, memberIds, familyEmoji, familyType)
  );
  return transaction;
}

export function transitionPhaseAtomically(
  storage: IStorage,
  gameStateId: number,
  targetPhase: string
): AtomicTransaction {
  const transaction = new AtomicTransaction(storage, gameStateId);
  transaction.addOperation(new PhaseTransitionOperation(storage, gameStateId, targetPhase));
  return transaction;
}

export function placeFamilyAtomically(
  storage: IStorage,
  gameStateId: number,
  familyId: number,
  buildingType: string,
  position: number
): AtomicTransaction {
  const transaction = new AtomicTransaction(storage, gameStateId);
  transaction.addOperation(
    new PlaceFamilyOperation(storage, gameStateId, familyId, buildingType, position)
  );
  return transaction;
}