import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 获取所有 Agent 状态
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agentStatus").take(50);
  },
});

// 获取在线 Agent
export const getOnline = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agentStatus")
      .withIndex("by_status", (q) => q.eq("status", "online"))
      .take(20);
  },
});

// 更新或创建 Agent 状态
export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    name: v.string(),
    avatar: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    workspace: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("agentStatus")
      .filter((q) => q.eq(q.field("agentId"), args.agentId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastActivity: Date.now(),
      });
    } else {
      await ctx.db.insert("agentStatus", {
        ...args,
        lastActivity: Date.now(),
      });
    }
  },
});
