import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 获取所有记忆
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories").order("desc").take(100);
  },
});

// 搜索记忆（按标题和内容）
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allMemories = await ctx.db.query("memories").take(200);
    const lowerQuery = args.query.toLowerCase();
    return allMemories.filter(m => 
      m.title.toLowerCase().includes(lowerQuery) || 
      m.content.toLowerCase().includes(lowerQuery) ||
      m.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
});

// 按分类获取
export const getByCategory = query({
  args: { category: v.union(v.literal("decision"), v.literal("preference"), v.literal("context"), v.literal("lesson")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("memories")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .take(50);
  },
});

// 创建记忆
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(v.literal("decision"), v.literal("preference"), v.literal("context"), v.literal("lesson")),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("memories", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// 更新记忆
export const update = mutation({
  args: {
    memoryId: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { memoryId, ...updates } = args;
    await ctx.db.patch(memoryId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
