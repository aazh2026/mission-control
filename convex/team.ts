import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 获取所有团队成员
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teamMembers").order("desc").take(50);
  },
});

// 按角色类型获取
export const getByRole = query({
  args: { roleType: v.union(v.literal("developer"), v.literal("writer"), v.literal("designer"), v.literal("researcher")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("teamMembers")
      .withIndex("by_roleType", (q) => q.eq("roleType", args.roleType))
      .take(20);
  },
});

// 创建团队成员
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    roleType: v.union(v.literal("developer"), v.literal("writer"), v.literal("designer"), v.literal("researcher")),
    description: v.string(),
    avatar: v.optional(v.string()),
    tools: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teamMembers", {
      ...args,
      status: "idle",
      memories: [],
      createdAt: Date.now(),
    });
  },
});

// 更新状态
export const updateStatus = mutation({
  args: {
    memberId: v.id("teamMembers"),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { memberId, ...updates } = args;
    await ctx.db.patch(memberId, updates);
  },
});

// 删除成员
export const remove = mutation({
  args: { memberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memberId);
  },
});
