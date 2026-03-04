import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tasks Board
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"), v.literal("blocked")),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    assignee: v.union(v.literal("user"), v.literal("agent")),
    assigneeName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  }).index("by_status", ["status"]).index("by_assignee", ["assignee"]),

  // Content Pipeline
  pipelineItems: defineTable({
    title: v.string(),
    stage: v.union(v.literal("idea"), v.literal("script"), v.literal("visual"), v.literal("publish")),
    description: v.optional(v.string()),
    script: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2")),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
    createdAt: v.number(),
    updatedAt: v.number(),
    scheduledDate: v.optional(v.number()),
  }).index("by_stage", ["stage"]).index("by_status", ["status"]),

  // Calendar
  scheduledTasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("cron"), v.literal("one_time"), v.literal("recurring")),
    schedule: v.string(),
    lastRun: v.optional(v.number()),
    nextRun: v.number(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
    scriptPath: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_nextRun", ["nextRun"]).index("by_status", ["status"]),

  // Memory
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.union(v.literal("decision"), v.literal("preference"), v.literal("context"), v.literal("lesson")),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]).index("by_tags", ["tags"]),

  // Team
  teamMembers: defineTable({
    name: v.string(),
    role: v.string(),
    roleType: v.union(v.literal("developer"), v.literal("writer"), v.literal("designer"), v.literal("researcher")),
    description: v.string(),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked")),
    currentTask: v.optional(v.string()),
    tools: v.array(v.string()),
    memories: v.array(v.id("memories")),
    createdAt: v.number(),
  }).index("by_status", ["status"]).index("by_roleType", ["roleType"]),

  // Office - Agent Status
  agentStatus: defineTable({
    agentId: v.string(),
    name: v.string(),
    avatar: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    lastActivity: v.number(),
    workspace: v.string(),
  }).index("by_status", ["status"]),
});
