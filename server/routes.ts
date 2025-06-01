import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { generateStarterPack } from "./lib/starter-pack-generator";
import { createCitizen, createFamily, createCouple, addAdoptedChild } from "./lib/zwj-engine";
import { 
  insertGameStateSchema,
  insertEmojiCollectionSchema,
  insertCitizenSchema,
  insertFamilySchema,
  insertBuildingSchema,
  insertRelationshipSchema
} from "@shared/schema";

// Request validation schemas
const recruitCitizenSchema = z.object({
  baseEmoji: z.string(),
  skinTone: z.string()
});

const formFamilySchema = z.object({
  adults: z.array(z.number()),
  children: z.array(z.number()).optional()
});

const placeFamilySchema = z.object({
  familyId: z.number(),
  buildingType: z.string(),
  position: z.number()
});

const formWorkplaceCoupleSchema = z.object({
  citizen1Id: z.number(),
  citizen2Id: z.number(),
  buildingType: z.string()
});

const processAdoptionSchema = z.object({
  familyId: z.number(),
  childId: z.number()
});

const switchPhaseSchema = z.object({
  phase: z.enum(['starter-pack', 'recruit-citizens', 'welcome-center', 'town-building', 'secondary-pairing'])
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default game state if none exists
  const initializeDefaultGameState = async () => {
    const existingGameState = await storage.getGameState();
    if (!existingGameState) {
      await storage.createGameState({
        userId: null,
        currentPhase: 'starter-pack',
        packsOpened: 0,
        totalCitizens: 0,
        totalFamilies: 0,
        buildingsPopulated: 0,
        adoptions: 0
      });
    }
  };

  await initializeDefaultGameState();

  // Get game state
  app.get('/api/game-state', async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch game state' });
    }
  });

  // Get emoji collection
  app.get('/api/emoji-collection', async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }
      
      const collection = await storage.getEmojiCollection(gameState.id);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch emoji collection' });
    }
  });

  // Get citizens
  app.get('/api/citizens', async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }
      
      const citizens = await storage.getCitizens(gameState.id);
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch citizens' });
    }
  });

  // Get families
  app.get('/api/families', async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }
      
      const families = await storage.getFamilies(gameState.id);
      res.json(families);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch families' });
    }
  });

  // Get buildings
  app.get('/api/buildings', async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }
      
      const buildings = await storage.getBuildings(gameState.id);
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch buildings' });
    }
  });

  // Generate starter pack
  app.post('/api/generate-starter-pack', async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      // Clear existing emoji collection
      await storage.clearEmojiCollection(gameState.id);

      // Generate new starter pack
      const pack = generateStarterPack();
      
      // Store emoji collection items
      for (const item of pack) {
        await storage.createEmojiCollectionItem({
          gameStateId: gameState.id,
          category: item.category,
          emoji: item.emoji,
          count: item.count
        });
      }

      // Update game state
      await storage.updateGameState(gameState.id, {
        packsOpened: gameState.packsOpened + 1
      });

      res.json({ success: true, pack });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate starter pack' });
    }
  });

  // Recruit citizen
  app.post('/api/recruit-citizen', async (req, res) => {
    try {
      const data = recruitCitizenSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      // Validate ZWJ combination
      const zwjResult = createCitizen(data.baseEmoji, data.skinTone);
      if (!zwjResult.valid) {
        return res.status(400).json({ message: zwjResult.error });
      }

      // Check if components are available
      const collection = await storage.getEmojiCollection(gameState.id);
      const baseItem = collection.find(item => item.emoji === data.baseEmoji && item.category === 'people');
      const skinItem = collection.find(item => item.emoji === data.skinTone && item.category === 'skinTones');

      if (!baseItem || baseItem.count <= 0) {
        return res.status(400).json({ message: 'Base emoji not available' });
      }
      if (!skinItem || skinItem.count <= 0) {
        return res.status(400).json({ message: 'Skin tone not available' });
      }

      // Create citizen
      const citizen = await storage.createCitizen({
        gameStateId: gameState.id,
        emoji: zwjResult.result!,
        baseEmoji: data.baseEmoji,
        skinTone: data.skinTone,
        status: 'available'
      });

      // Deduct components from collection
      await storage.updateEmojiCollectionItem(baseItem.id, {
        count: baseItem.count - 1
      });
      await storage.updateEmojiCollectionItem(skinItem.id, {
        count: skinItem.count - 1
      });

      // Update game state
      await storage.updateGameState(gameState.id, {
        totalCitizens: gameState.totalCitizens + 1
      });

      res.json({ success: true, citizen });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to recruit citizen' });
    }
  });

  // Form family
  app.post('/api/form-family', async (req, res) => {
    try {
      const data = formFamilySchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      // Get citizen data
      const allCitizens = await storage.getCitizens(gameState.id);
      const adults = data.adults.map(id => allCitizens.find(c => c.id === id)).filter(Boolean);
      const children = data.children ? data.children.map(id => allCitizens.find(c => c.id === id)).filter(Boolean) : [];

      if (adults.length === 0) {
        return res.status(400).json({ message: 'At least one adult is required' });
      }

      // Create family ZWJ sequence
      const adultEmojis = adults.map(a => a!.emoji);
      const childEmojis = children.map(c => c!.emoji);
      const familyResult = createFamily(adultEmojis, childEmojis);

      if (!familyResult.valid) {
        return res.status(400).json({ message: familyResult.error });
      }

      // Determine family type
      let familyType: 'couple' | 'family' | 'single-parent' = 'family';
      if (adults.length === 2 && children.length === 0) {
        familyType = 'couple';
      } else if (adults.length === 1 && children.length > 0) {
        familyType = 'single-parent';
      }

      // Create family
      const family = await storage.createFamily({
        gameStateId: gameState.id,
        emoji: familyResult.result!,
        members: [...data.adults, ...(data.children || [])],
        familyType,
        isPlaced: 0
      });

      // Update citizen statuses
      for (const citizenId of [...data.adults, ...(data.children || [])]) {
        await storage.updateCitizen(citizenId, { status: 'in-family' });
      }

      // Update game state
      await storage.updateGameState(gameState.id, {
        totalFamilies: gameState.totalFamilies + 1
      });

      res.json({ success: true, family });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to form family' });
    }
  });

  // Place family in building
  app.post('/api/place-family', async (req, res) => {
    try {
      const data = placeFamilySchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      // Get family
      const family = await storage.getFamilies(gameState.id);
      const targetFamily = family.find(f => f.id === data.familyId);
      if (!targetFamily) {
        return res.status(404).json({ message: 'Family not found' });
      }

      // Check if building exists, create if not
      let building = (await storage.getBuildings(gameState.id))
        .find(b => b.buildingType === data.buildingType && b.position === data.position);

      if (!building) {
        // Create new building
        const buildingCapacities: Record<string, number> = {
          'fire-station': 2,
          'hospital': 3,
          'school': 4,
          'restaurant': 2,
          'police': 2,
          'airport': 3,
          'shop': 2,
          'houses': 6
        };

        building = await storage.createBuilding({
          gameStateId: gameState.id,
          buildingType: data.buildingType,
          position: data.position,
          capacity: buildingCapacities[data.buildingType] || 2,
          currentOccupancy: 0,
          occupants: []
        });
      }

      // Check capacity
      if (building.currentOccupancy >= building.capacity) {
        return res.status(400).json({ message: 'Building is at full capacity' });
      }

      // Update family
      await storage.updateFamily(data.familyId, {
        buildingType: data.buildingType,
        isPlaced: 1
      });

      // Update building
      const newOccupants = [...building.occupants, data.familyId];
      await storage.updateBuilding(building.id, {
        currentOccupancy: building.currentOccupancy + 1,
        occupants: newOccupants
      });

      // Update citizen statuses
      for (const citizenId of targetFamily.members) {
        await storage.updateCitizen(citizenId as number, {
          status: 'placed',
          buildingType: data.buildingType
        });
      }

      // Update game state if this is the first building populated
      const allBuildings = await storage.getBuildings(gameState.id);
      const populatedBuildings = allBuildings.filter(b => b.currentOccupancy > 0).length;
      await storage.updateGameState(gameState.id, {
        buildingsPopulated: populatedBuildings
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to place family' });
    }
  });

  // Form workplace couple
  app.post('/api/form-workplace-couple', async (req, res) => {
    try {
      const data = formWorkplaceCoupleSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      // Get citizens
      const citizens = await storage.getCitizens(gameState.id);
      const citizen1 = citizens.find(c => c.id === data.citizen1Id);
      const citizen2 = citizens.find(c => c.id === data.citizen2Id);

      if (!citizen1 || !citizen2) {
        return res.status(404).json({ message: 'Citizens not found' });
      }

      if (citizen1.buildingType !== data.buildingType || citizen2.buildingType !== data.buildingType) {
        return res.status(400).json({ message: 'Citizens must be at the same building' });
      }

      // Create couple ZWJ sequence
      const coupleResult = createCouple(citizen1.emoji, citizen2.emoji);
      if (!coupleResult.valid) {
        return res.status(400).json({ message: coupleResult.error });
      }

      // Create family (couple)
      const family = await storage.createFamily({
        gameStateId: gameState.id,
        emoji: coupleResult.result!,
        members: [data.citizen1Id, data.citizen2Id],
        familyType: 'couple',
        buildingType: data.buildingType,
        isPlaced: 1
      });

      // Update citizen statuses
      await storage.updateCitizen(data.citizen1Id, { status: 'in-family' });
      await storage.updateCitizen(data.citizen2Id, { status: 'in-family' });

      // Create relationship record
      await storage.createRelationship({
        gameStateId: gameState.id,
        citizen1Id: data.citizen1Id,
        citizen2Id: data.citizen2Id,
        relationshipType: 'couple',
        buildingType: data.buildingType,
        emoji: coupleResult.result!
      });

      // Update game state
      await storage.updateGameState(gameState.id, {
        totalFamilies: gameState.totalFamilies + 1
      });

      res.json({ success: true, family });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to form workplace couple' });
    }
  });

  // Process adoption
  app.post('/api/process-adoption', async (req, res) => {
    try {
      const data = processAdoptionSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      // Get family and child
      const families = await storage.getFamilies(gameState.id);
      const family = families.find(f => f.id === data.familyId);
      if (!family) {
        return res.status(404).json({ message: 'Family not found' });
      }

      const citizens = await storage.getCitizens(gameState.id);
      const child = citizens.find(c => c.id === data.childId);
      if (!child) {
        return res.status(404).json({ message: 'Child not found' });
      }

      if (child.status !== 'available') {
        return res.status(400).json({ message: 'Child is not available for adoption' });
      }

      // Add adopted child to family
      const adoptionResult = addAdoptedChild(family.emoji, child.emoji);
      if (!adoptionResult.valid) {
        return res.status(400).json({ message: adoptionResult.error });
      }

      // Update family
      const newMembers = [...family.members, data.childId];
      await storage.updateFamily(data.familyId, {
        emoji: adoptionResult.result!,
        members: newMembers,
        familyType: 'family'
      });

      // Update child status
      await storage.updateCitizen(data.childId, {
        status: 'in-family',
        buildingType: family.buildingType
      });

      // Update game state
      await storage.updateGameState(gameState.id, {
        adoptions: gameState.adoptions + 1
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to process adoption' });
    }
  });

  // Switch phase
  app.post('/api/switch-phase', async (req, res) => {
    try {
      const data = switchPhaseSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ message: 'Game state not found' });
      }

      await storage.updateGameState(gameState.id, {
        currentPhase: data.phase
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to switch phase' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
