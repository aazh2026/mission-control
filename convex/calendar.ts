import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 获取所有定时任务
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scheduledTasks").order("asc", "nextRun").take(100);
  },
});

// 获取即将执行的任务
export const getUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.query("scheduledTasks")
      .withIndex("by_nextRun", (q) => q.gt("nextRun", now))
      .order("asc", "nextRun")
      .take(args.limit ?? 10);
  },
});

// 创建定时任务
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("cron"), v.literal("one_time"), v.literal("recurring")),
    schedule: v.string(),
    scriptPath: v.optional(v.string()),
    nextRun: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledTasks", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

// 更新任务状态
export const updateStatus = mutation({
  args: {
    taskId: v.id("scheduledTasks"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: args.status });
  },
});

// 记录执行
export const recordRun = mutation({
  args: { taskId: v.id("scheduledTasks"), nextRun: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      lastRun: Date.now(),
      nextRun: args.nextRun,
    });
  },
});
