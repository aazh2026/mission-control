import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 获取所有 Pipeline 项目
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pipelineItems").order("desc").take(100);
  },
});

// 按阶段获取
export const getByStage = query({
  args: { stage: v.union(v.literal("idea"), v.literal("script"), v.literal("visual"), v.literal("publish")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("pipelineItems")
      .withIndex("by_stage", (q) => q.eq("stage", args.stage))
      .order("desc")
      .take(50);
  },
});

// 创建 Idea
export const createIdea = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    source: v.optional(v.string()),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("pipelineItems", {
      ...args,
      stage: "idea",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// 推进到下一阶段
export const advanceStage = mutation({
  args: {
    itemId: v.id("pipelineItems"),
    newStage: v.union(v.literal("idea"), v.literal("script"), v.literal("visual"), v.literal("publish")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      stage: args.newStage,
      status: args.newStage === "publish" ? "done" : "pending",
      updatedAt: Date.now(),
    });
  },
});

// 更新脚本
export const updateScript = mutation({
  args: {
    itemId: v.id("pipelineItems"),
    script: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      script: args.script,
      updatedAt: Date.now(),
    });
  },
});

// 删除项目
export const remove = mutation({
  args: { itemId: v.id("pipelineItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});
