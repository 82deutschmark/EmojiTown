import { 
  users, 
  gameStates,
  emojiCollections,
  citizens,
  families,
  buildings,
  relationships,
  type User, 
  type InsertUser,
  type GameState,
  type InsertGameState,
  type EmojiCollection,
  type InsertEmojiCollection,
  type Citizen,
  type InsertCitizen,
  type Family,
  type InsertFamily,
  type Building,
  type InsertBuilding,
  type Relationship,
  type InsertRelationship
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game state methods
  getGameState(userId?: number): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: number, updates: Partial<GameState>): Promise<GameState>;
  
  // Emoji collection methods
  getEmojiCollection(gameStateId: number): Promise<EmojiCollection[]>;
  createEmojiCollectionItem(item: InsertEmojiCollection): Promise<EmojiCollection>;
  updateEmojiCollectionItem(id: number, updates: Partial<EmojiCollection>): Promise<EmojiCollection>;
  clearEmojiCollection(gameStateId: number): Promise<void>;
  
  // Citizen methods
  getCitizens(gameStateId: number): Promise<Citizen[]>;
  createCitizen(citizen: InsertCitizen): Promise<Citizen>;
  updateCitizen(id: number, updates: Partial<Citizen>): Promise<Citizen>;
  
  // Family methods
  getFamilies(gameStateId: number): Promise<Family[]>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: number, updates: Partial<Family>): Promise<Family>;
  
  // Building methods
  getBuildings(gameStateId: number): Promise<Building[]>;
  createBuilding(building: InsertBuilding): Promise<Building>;
  updateBuilding(id: number, updates: Partial<Building>): Promise<Building>;
  
  // Relationship methods
  getRelationships(gameStateId: number): Promise<Relationship[]>;
  createRelationship(relationship: InsertRelationship): Promise<Relationship>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameStates: Map<number, GameState>;
  private emojiCollections: Map<number, EmojiCollection>;
  private citizens: Map<number, Citizen>;
  private families: Map<number, Family>;
  private buildings: Map<number, Building>;
  private relationships: Map<number, Relationship>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.emojiCollections = new Map();
    this.citizens = new Map();
    this.families = new Map();
    this.buildings = new Map();
    this.relationships = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game state methods
  async getGameState(userId?: number): Promise<GameState | undefined> {
    if (userId) {
      return Array.from(this.gameStates.values()).find(gs => gs.userId === userId);
    }
    // Return the first game state if no userId provided (for demo)
    return Array.from(this.gameStates.values())[0];
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = this.currentId++;
    const gameState: GameState = {
      ...insertGameState,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.gameStates.set(id, gameState);
    return gameState;
  }

  async updateGameState(id: number, updates: Partial<GameState>): Promise<GameState> {
    const existing = this.gameStates.get(id);
    if (!existing) throw new Error('Game state not found');
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.gameStates.set(id, updated);
    return updated;
  }

  // Emoji collection methods
  async getEmojiCollection(gameStateId: number): Promise<EmojiCollection[]> {
    return Array.from(this.emojiCollections.values()).filter(ec => ec.gameStateId === gameStateId);
  }

  async createEmojiCollectionItem(insertItem: InsertEmojiCollection): Promise<EmojiCollection> {
    const id = this.currentId++;
    const item: EmojiCollection = { ...insertItem, id };
    this.emojiCollections.set(id, item);
    return item;
  }

  async updateEmojiCollectionItem(id: number, updates: Partial<EmojiCollection>): Promise<EmojiCollection> {
    const existing = this.emojiCollections.get(id);
    if (!existing) throw new Error('Emoji collection item not found');
    
    const updated = { ...existing, ...updates };
    this.emojiCollections.set(id, updated);
    return updated;
  }

  async clearEmojiCollection(gameStateId: number): Promise<void> {
    const items = Array.from(this.emojiCollections.entries())
      .filter(([_, item]) => item.gameStateId === gameStateId);
    
    items.forEach(([id]) => this.emojiCollections.delete(id));
  }

  // Citizen methods
  async getCitizens(gameStateId: number): Promise<Citizen[]> {
    return Array.from(this.citizens.values()).filter(c => c.gameStateId === gameStateId);
  }

  async createCitizen(insertCitizen: InsertCitizen): Promise<Citizen> {
    const id = this.currentId++;
    const citizen: Citizen = { ...insertCitizen, id };
    this.citizens.set(id, citizen);
    return citizen;
  }

  async updateCitizen(id: number, updates: Partial<Citizen>): Promise<Citizen> {
    const existing = this.citizens.get(id);
    if (!existing) throw new Error('Citizen not found');
    
    const updated = { ...existing, ...updates };
    this.citizens.set(id, updated);
    return updated;
  }

  // Family methods
  async getFamilies(gameStateId: number): Promise<Family[]> {
    return Array.from(this.families.values()).filter(f => f.gameStateId === gameStateId);
  }

  async createFamily(insertFamily: InsertFamily): Promise<Family> {
    const id = this.currentId++;
    const family: Family = { ...insertFamily, id };
    this.families.set(id, family);
    return family;
  }

  async updateFamily(id: number, updates: Partial<Family>): Promise<Family> {
    const existing = this.families.get(id);
    if (!existing) throw new Error('Family not found');
    
    const updated = { ...existing, ...updates };
    this.families.set(id, updated);
    return updated;
  }

  // Building methods
  async getBuildings(gameStateId: number): Promise<Building[]> {
    return Array.from(this.buildings.values()).filter(b => b.gameStateId === gameStateId);
  }

  async createBuilding(insertBuilding: InsertBuilding): Promise<Building> {
    const id = this.currentId++;
    const building: Building = { ...insertBuilding, id };
    this.buildings.set(id, building);
    return building;
  }

  async updateBuilding(id: number, updates: Partial<Building>): Promise<Building> {
    const existing = this.buildings.get(id);
    if (!existing) throw new Error('Building not found');
    
    const updated = { ...existing, ...updates };
    this.buildings.set(id, updated);
    return updated;
  }

  // Relationship methods
  async getRelationships(gameStateId: number): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter(r => r.gameStateId === gameStateId);
  }

  async createRelationship(insertRelationship: InsertRelationship): Promise<Relationship> {
    const id = this.currentId++;
    const relationship: Relationship = { ...insertRelationship, id };
    this.relationships.set(id, relationship);
    return relationship;
  }
}

export const storage = new MemStorage();
