import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertGameStateSchema, insertCitizenSchema, insertFamilySchema, insertBuildingSchema, insertRelationshipSchema } from "@shared/schema";
import { generateStarterPack } from "./lib/starter-pack-generator";
import { createCitizen, createCouple, createFamily, addAdoptedChild } from "./lib/zwj-engine";
import { generateRandomCitizens, canGenerateCitizens, validateComponentsAvailable } from "./lib/citizen-generator";
import { validateEmojiSequence, generateEmojiDescription } from "@shared/unicode-validation";
import { 
  createCitizenAtomically, 
  createFamilyAtomically, 
  transitionPhaseAtomically, 
  placeFamilyAtomically 
} from "@shared/atomic-operations";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ GAME STATE ROUTES ============
  
  // Get current game state
  app.get("/api/game-state", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        // Create initial game state
        const newState = await storage.createGameState({
          currentPhase: "starter-pack",
          packsOpened: 0,
          totalCitizens: 0,
          totalFamilies: 0,
          buildingsPopulated: 0,
          adoptions: 0
        });
        return res.json(newState);
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  // Advance to next phase
  const phaseTransitionSchema = z.object({
    phase: z.enum(["starter-pack", "recruit-citizens", "welcome-center", "town-building", "secondary-pairing"])
  });

  app.post("/api/phase-transition", async (req, res) => {
    try {
      const { phase } = phaseTransitionSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const updatedState = await storage.updateGameState(gameState.id, {
        currentPhase: phase
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to transition phase" });
    }
  });

  // ============ STARTER PACK ROUTES ============
  
  // Generate new starter pack
  app.post("/api/generate-starter-pack", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      // Clear existing emoji collection
      await storage.clearEmojiCollection(gameState.id);

      // Generate new pack using engine
      const pack = generateStarterPack();

      // Save pack to storage
      for (const item of pack) {
        await storage.createEmojiCollectionItem({
          gameStateId: gameState.id,
          category: item.category,
          emoji: item.emoji,
          count: item.count
        });
      }

      // Update pack counter
      await storage.updateGameState(gameState.id, {
        packsOpened: gameState.packsOpened + 1
      });

      res.json({ success: true, pack });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate starter pack" });
    }
  });

  // Get current emoji collection
  app.get("/api/emoji-collection", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const collection = await storage.getEmojiCollection(gameState.id);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to get emoji collection" });
    }
  });

  // ============ CITIZEN RECRUITMENT ROUTES ============
  
  // Generate 3 random citizens from collection (for recruitment phase)
  app.post("/api/generate-citizens", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      if (gameState.currentPhase !== "recruit-citizens") {
        return res.status(400).json({ error: "Not in recruitment phase" });
      }

      const collection = await storage.getEmojiCollection(gameState.id);
      
      if (!canGenerateCitizens(collection)) {
        return res.status(400).json({ error: "Insufficient emoji components for citizen generation" });
      }

      const result = generateRandomCitizens(collection);
      
      if (result.citizens.length === 0) {
        return res.status(400).json({ error: "Could not generate any valid citizens" });
      }

      res.json({
        citizens: result.citizens,
        usedComponents: result.usedComponents,
        canGenerateMore: result.citizens.length === 3
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate citizens" });
    }
  });

  // Accept generated citizens (debit collection, create citizens)
  const acceptCitizensSchema = z.object({
    citizens: z.array(z.object({
      baseEmoji: z.string(),
      skinTone: z.string(),
      resultEmoji: z.string(),
      unicodeSequence: z.string()
    })),
    usedComponents: z.array(z.object({
      baseEmoji: z.string(),
      skinTone: z.string()
    }))
  });

  app.post("/api/accept-citizens", async (req, res) => {
    try {
      const { citizens, usedComponents } = acceptCitizensSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const collection = await storage.getEmojiCollection(gameState.id);
      
      // Validate components are still available
      if (!validateComponentsAvailable(collection, usedComponents)) {
        return res.status(400).json({ error: "Components no longer available" });
      }

      // Validate all citizen emoji sequences
      for (const citizen of citizens) {
        const validation = validateEmojiSequence(citizen.resultEmoji);
        if (!validation.valid) {
          return res.status(400).json({ error: `Invalid citizen sequence: ${validation.reason}` });
        }
      }

      // Debit components from collection
      for (const component of usedComponents) {
        const personItem = collection.find(item => 
          item.emoji === component.baseEmoji && item.category === 'people'
        );
        const skinItem = collection.find(item => 
          item.emoji === component.skinTone && item.category === 'skinTones'
        );

        if (personItem && personItem.id) {
          await storage.updateEmojiCollectionItem(personItem.id, {
            count: Math.max(0, personItem.count - 1)
          });
        }

        if (skinItem && skinItem.id) {
          await storage.updateEmojiCollectionItem(skinItem.id, {
            count: Math.max(0, skinItem.count - 1)
          });
        }
      }

      // Create citizens in storage
      const createdCitizens = [];
      for (const citizen of citizens) {
        const newCitizen = await storage.createCitizen({
          gameStateId: gameState.id,
          baseEmoji: citizen.baseEmoji,
          skinTone: citizen.skinTone,
          emoji: citizen.resultEmoji,
          status: "available"
        });
        createdCitizens.push(newCitizen);
      }

      // Update game state counters
      await storage.updateGameState(gameState.id, {
        totalCitizens: gameState.totalCitizens + citizens.length
      });

      res.json({
        success: true,
        citizens: createdCitizens,
        totalCitizens: gameState.totalCitizens + citizens.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to accept citizens" });
    }
  });

  // Get all citizens
  app.get("/api/citizens", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const citizens = await storage.getCitizens(gameState.id);
      res.json(citizens);
    } catch (error) {
      res.status(500).json({ error: "Failed to get citizens" });
    }
  });

  // ============ FAMILY ROUTES ============
  
  // Create new family from citizens
  const createFamilySchema = z.object({
    memberIds: z.array(z.number()).min(1).max(4),
    familyType: z.enum(["couple", "family", "single-parent"])
  });

  app.post("/api/families", async (req, res) => {
    try {
      const { memberIds, familyType } = createFamilySchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      // Get all citizens to validate they exist and are available
      const allCitizens = await storage.getCitizens(gameState.id);
      const selectedCitizens = memberIds.map(id => {
        const citizen = allCitizens.find(c => c.id === id);
        if (!citizen) throw new Error(`Citizen ${id} not found`);
        if (citizen.status !== "available") throw new Error(`Citizen ${id} not available`);
        return citizen;
      });

      // Use ZWJ engine to create family emoji
      const adults = selectedCitizens.filter(c => !c.baseEmoji.includes('👶') && !c.baseEmoji.includes('👧') && !c.baseEmoji.includes('👦'));
      const children = selectedCitizens.filter(c => c.baseEmoji.includes('👶') || c.baseEmoji.includes('👧') || c.baseEmoji.includes('👦'));
      
      let familyResult;
      if (familyType === "couple" && adults.length === 2) {
        familyResult = createCouple(adults[0].emoji, adults[1].emoji);
      } else {
        familyResult = createFamily(adults.map(a => a.emoji), children.map(c => c.emoji));
      }

      if (!familyResult.valid) {
        return res.status(400).json({ error: familyResult.error });
      }

      // Create family in storage
      const family = await storage.createFamily({
        gameStateId: gameState.id,
        emoji: familyResult.result!,
        members: memberIds,
        familyType,
        isPlaced: 0
      });

      // Update citizen statuses
      for (const citizen of selectedCitizens) {
        await storage.updateCitizen(citizen.id, { status: "in-family" });
      }

      // Update family counter
      await storage.updateGameState(gameState.id, {
        totalFamilies: gameState.totalFamilies + 1
      });

      res.json(family);
    } catch (error) {
      res.status(500).json({ error: "Failed to create family" });
    }
  });

  // Get all families
  app.get("/api/families", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const families = await storage.getFamilies(gameState.id);
      res.json(families);
    } catch (error) {
      res.status(500).json({ error: "Failed to get families" });
    }
  });

  // ============ BUILDING ROUTES ============
  
  // Place family in building
  const placeFamilySchema = z.object({
    familyId: z.number(),
    buildingType: z.string(),
    position: z.number()
  });

  app.post("/api/buildings", async (req, res) => {
    try {
      const { familyId, buildingType, position } = placeFamilySchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      // Validate family exists and is not placed
      const families = await storage.getFamilies(gameState.id);
      const family = families.find(f => f.id === familyId);
      if (!family) {
        return res.status(404).json({ error: "Family not found" });
      }
      if (family.isPlaced) {
        return res.status(400).json({ error: "Family already placed" });
      }

      // Check building capacity
      const buildings = await storage.getBuildings(gameState.id);
      const existingBuilding = buildings.find(b => b.buildingType === buildingType && b.position === position);
      
      if (existingBuilding) {
        if (existingBuilding.currentOccupancy >= existingBuilding.capacity) {
          return res.status(400).json({ error: "Building at capacity" });
        }
        // Update existing building
        const memberIds = Array.isArray(family.members) ? family.members : [];
        const updatedOccupants = [...(existingBuilding.occupants as number[]), ...memberIds];
        await storage.updateBuilding(existingBuilding.id, {
          currentOccupancy: existingBuilding.currentOccupancy + memberIds.length,
          occupants: updatedOccupants
        });
      } else {
        // Create new building
        const capacity = getBuildingCapacity(buildingType);
        const memberIds = Array.isArray(family.members) ? family.members : [];
        await storage.createBuilding({
          gameStateId: gameState.id,
          buildingType,
          position,
          capacity,
          currentOccupancy: memberIds.length,
          occupants: memberIds
        });
      }

      // Update family as placed
      await storage.updateFamily(familyId, { 
        isPlaced: 1,
        buildingType 
      });

      // Update building counter if new building
      if (!existingBuilding) {
        await storage.updateGameState(gameState.id, {
          buildingsPopulated: gameState.buildingsPopulated + 1
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to place family" });
    }
  });

  // Get all buildings
  app.get("/api/buildings", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const buildings = await storage.getBuildings(gameState.id);
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get buildings" });
    }
  });

  // ============ RELATIONSHIP ROUTES ============
  
  // Create workplace relationship
  const createRelationshipSchema = z.object({
    citizen1Id: z.number(),
    citizen2Id: z.number(),
    relationshipType: z.enum(["couple", "colleagues", "friends"]),
    buildingType: z.string().optional()
  });

  app.post("/api/relationships", async (req, res) => {
    try {
      const { citizen1Id, citizen2Id, relationshipType, buildingType } = createRelationshipSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      // Validate citizens exist
      const citizens = await storage.getCitizens(gameState.id);
      const citizen1 = citizens.find(c => c.id === citizen1Id);
      const citizen2 = citizens.find(c => c.id === citizen2Id);
      
      if (!citizen1 || !citizen2) {
        return res.status(404).json({ error: "Citizen not found" });
      }

      // Create relationship emoji if it's a couple
      let relationshipEmoji = "";
      if (relationshipType === "couple") {
        const result = createCouple(citizen1.emoji, citizen2.emoji);
        if (!result.valid) {
          return res.status(400).json({ error: result.error });
        }
        relationshipEmoji = result.result!;
      }

      // Save relationship
      const relationship = await storage.createRelationship({
        gameStateId: gameState.id,
        citizen1Id,
        citizen2Id,
        relationshipType,
        emoji: relationshipEmoji,
        buildingType: buildingType || null
      });

      res.json(relationship);
    } catch (error) {
      res.status(500).json({ error: "Failed to create relationship" });
    }
  });

  // ============ ADOPTION ROUTES ============
  
  // Add child to existing family
  const adoptChildSchema = z.object({
    familyId: z.number(),
    childId: z.number()
  });

  app.post("/api/adopt", async (req, res) => {
    try {
      const { familyId, childId } = adoptChildSchema.parse(req.body);
      const gameState = await storage.getGameState();
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      // Validate family and child exist
      const families = await storage.getFamilies(gameState.id);
      const citizens = await storage.getCitizens(gameState.id);
      
      const family = families.find(f => f.id === familyId);
      const child = citizens.find(c => c.id === childId);
      
      if (!family || !child) {
        return res.status(404).json({ error: "Family or child not found" });
      }
      
      if (child.status !== "available") {
        return res.status(400).json({ error: "Child not available for adoption" });
      }

      // Use ZWJ engine to add child to family
      const result = addAdoptedChild(family.emoji, child.emoji);
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }

      // Update family with new emoji and members
      const currentMembers = Array.isArray(family.members) ? family.members : [];
      await storage.updateFamily(familyId, {
        emoji: result.result!,
        members: [...currentMembers, childId]
      });

      // Update child status
      await storage.updateCitizen(childId, { status: "in-family" });

      // Update adoption counter
      await storage.updateGameState(gameState.id, {
        adoptions: gameState.adoptions + 1
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to adopt child" });
    }
  });

  const server = createServer(app);
  return server;
}

// Helper function to determine building capacity
function getBuildingCapacity(buildingType: string): number {
  const capacities: Record<string, number> = {
    "🏥": 4,  // Hospital
    "🏫": 6,  // School
    "🏢": 8,  // Office
    "🏠": 3,  // House
    "🏭": 5,  // Factory
    "🏪": 4,  // Store
    "🏨": 6,  // Hotel
    "🏦": 4   // Bank
  };
  return capacities[buildingType] || 4;
}