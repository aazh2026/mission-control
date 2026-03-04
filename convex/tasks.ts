import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 获取所有任务
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").take(100);
  },
});

// 按状态获取任务
export const getByStatus = query({
  args: { status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"), v.literal("blocked")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("tasks").withIndex("by_status", (q) => q.eq("status", args.status)).order("desc").take(50);
  },
});

// 创建任务
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"), v.literal("blocked")),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    assignee: v.union(v.literal("user"), v.literal("agent")),
    assigneeName: v.string(),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// 更新任务状态
export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// 删除任务
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
