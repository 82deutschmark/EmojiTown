import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  currentPhase: text("current_phase").notNull().default("starter-pack"),
  packsOpened: integer("packs_opened").notNull().default(0),
  totalCitizens: integer("total_citizens").notNull().default(0),
  totalFamilies: integer("total_families").notNull().default(0),
  buildingsPopulated: integer("buildings_populated").notNull().default(0),
  adoptions: integer("adoptions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emojiCollections = pgTable("emoji_collections", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  category: text("category").notNull(), // 'people', 'skinTones', 'professions', 'wildcards'
  emoji: text("emoji").notNull(),
  count: integer("count").notNull().default(0),
});

export const citizens = pgTable("citizens", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  emoji: text("emoji").notNull(), // ZWJ sequence
  baseEmoji: text("base_emoji").notNull(),
  skinTone: text("skin_tone"),
  status: text("status").notNull().default("available"), // 'available', 'in-family', 'placed'
  buildingType: text("building_type"),
});

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  emoji: text("emoji").notNull(), // ZWJ family sequence
  members: jsonb("members").notNull(), // Array of citizen IDs
  familyType: text("family_type").notNull(), // 'couple', 'family', 'single-parent'
  buildingType: text("building_type"),
  isPlaced: integer("is_placed").notNull().default(0), // 0 or 1 (boolean)
});

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  buildingType: text("building_type").notNull(),
  position: integer("position").notNull(), // Grid position
  capacity: integer("capacity").notNull(),
  currentOccupancy: integer("current_occupancy").notNull().default(0),
  occupants: jsonb("occupants").notNull(), // Array of family/citizen IDs
});

export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  citizen1Id: integer("citizen1_id").references(() => citizens.id),
  citizen2Id: integer("citizen2_id").references(() => citizens.id),
  relationshipType: text("relationship_type").notNull(), // 'couple', 'parent-child'
  buildingType: text("building_type"), // Where they met/formed
  emoji: text("emoji").notNull(), // ZWJ sequence
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmojiCollectionSchema = createInsertSchema(emojiCollections).omit({
  id: true,
});

export const insertCitizenSchema = createInsertSchema(citizens).omit({
  id: true,
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
});

export const insertBuildingSchema = createInsertSchema(buildings).omit({
  id: true,
});

export const insertRelationshipSchema = createInsertSchema(relationships).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;

export type InsertEmojiCollection = z.infer<typeof insertEmojiCollectionSchema>;
export type EmojiCollection = typeof emojiCollections.$inferSelect;

export type InsertCitizen = z.infer<typeof insertCitizenSchema>;
export type Citizen = typeof citizens.$inferSelect;

export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

export type InsertBuilding = z.infer<typeof insertBuildingSchema>;
export type Building = typeof buildings.$inferSelect;

export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;
export type Relationship = typeof relationships.$inferSelect;
