// Mock API for development without Convex
// Replace with real Convex after running `npx convex dev`

import { useState, useEffect } from "react";

// Mock data store
const mockData = {
  tasks: [
    { _id: "1", title: "配置 Mission Control", description: "完成所有组件", status: "done", priority: "P0", assignee: "agent", assigneeName: "Sophi2026", createdAt: Date.now(), updatedAt: Date.now() },
    { _id: "2", title: "添加 RSS 源", description: "导入 Karpathy 推荐", status: "done", priority: "P1", assignee: "agent", assigneeName: "Sophi2026", createdAt: Date.now(), updatedAt: Date.now() },
    { _id: "3", title: "配置邮件自动化", description: "需要 IMAP 配置", status: "todo", priority: "P2", assignee: "user", assigneeName: "Aaron", createdAt: Date.now(), updatedAt: Date.now() },
  ],
  pipelineItems: [
    { _id: "1", title: "Mission Control 教程", stage: "publish", description: "写一篇使用教程", priority: "P0", status: "done", createdAt: Date.now(), updatedAt: Date.now() },
    { _id: "2", title: "AI 编程最佳实践", stage: "script", description: "总结编程经验", priority: "P1", status: "in_progress", createdAt: Date.now(), updatedAt: Date.now() },
    { _id: "3", title: "2026 技术趋势", stage: "idea", description: "年度技术展望", priority: "P2", status: "pending", createdAt: Date.now(), updatedAt: Date.now() },
  ],
  scheduledTasks: [
    { _id: "1", title: "心跳检查", type: "cron", schedule: "*/30 * * * *", status: "active", lastRun: Date.now() - 1800000, nextRun: Date.now() + 1800000, createdAt: Date.now() },
    { _id: "2", title: "每日简报", type: "cron", schedule: "0 9 * * *", status: "active", lastRun: null, nextRun: Date.now() + 3600000, createdAt: Date.now() },
    { _id: "3", title: "安全扫描", type: "cron", schedule: "0 2 * * 0", status: "paused", lastRun: Date.now() - 86400000, nextRun: Date.now() + 604800000, createdAt: Date.now() },
  ],
  memories: [
    { _id: "1", title: "采用三层记忆系统", content: "MEMORY.md + memory/YYYY-MM-DD.md + PROJECTS.md", category: "decision", tags: ["architecture", "memory"], source: "卡尔文章", createdAt: Date.now(), updatedAt: Date.now() },
    { _id: "2", title: "Aaron 偏好自主授权", content: "直接说'不用问我'而不是逐条确认", category: "preference", tags: ["user", "workflow"], source: "观察", createdAt: Date.now(), updatedAt: Date.now() },
    { _id: "3", title: "Mission Control 技术栈", content: "Next.js + Convex 构建六组件系统", category: "context", tags: ["tech", "mission-control"], source: "TermMax", createdAt: Date.now(), updatedAt: Date.now() },
  ],
  teamMembers: [
    { _id: "1", name: "Sophi2026", role: "主助手", roleType: "developer", description: "OpenClaw 主代理，负责任务执行和协调", status: "working", currentTask: "构建 Mission Control", tools: ["Next.js", "Convex", "React"], memories: [], createdAt: Date.now() },
    { _id: "2", name: "Coding Assistant", role: "开发助手", roleType: "developer", description: "专注代码编写和调试", status: "idle", tools: ["TypeScript", "Python", "Node.js"], memories: [], createdAt: Date.now() },
    { _id: "3", name: "Writing Assistant", role: "写作助手", roleType: "writer", description: "内容创作和编辑", status: "idle", tools: ["Markdown", "SEO", "Copywriting"], memories: [], createdAt: Date.now() },
  ],
  agentStatus: [
    { _id: "1", agentId: "sophi2026", name: "Sophi2026", avatar: "🤖", status: "online", currentTask: "构建 Mission Control", lastActivity: Date.now(), workspace: "desk-1" },
  ],
};

// Mock query hook
export function useQuery(queryFn: any, args?: any) {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      if (typeof queryFn === 'function') {
        // Extract table name from the query function
        const fnStr = queryFn.toString();
        if (fnStr.includes('tasks')) setData(mockData.tasks);
        else if (fnStr.includes('pipeline')) setData(mockData.pipelineItems);
        else if (fnStr.includes('calendar')) setData(mockData.scheduledTasks);
        else if (fnStr.includes('memory')) {
          if (args?.query) {
            const q = args.query.toLowerCase();
            setData(mockData.memories.filter(m => 
              m.title.toLowerCase().includes(q) || 
              m.content.toLowerCase().includes(q)
            ));
          } else {
            setData(mockData.memories);
          }
        }
        else if (fnStr.includes('team')) setData(mockData.teamMembers);
        else if (fnStr.includes('office')) setData(mockData.agentStatus);
        else setData([]);
      }
    }, 100);
  }, [queryFn, JSON.stringify(args)]);
  
  return data;
}

// Mock mutation hook
export function useMutation(mutationFn: any) {
  return async (args: any) => {
    console.log('Mock mutation:', args);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    return { _id: Math.random().toString(36).substr(2, 9) };
  };
}

export const api = {
  tasks: {
    getAll: () => mockData.tasks,
    getByStatus: (args: any) => mockData.tasks.filter(t => t.status === args.status),
    create: async (args: any) => ({ _id: Math.random().toString() }),
    updateStatus: async (args: any) => {},
    remove: async (args: any) => {},
  },
  pipeline: {
    getAll: () => mockData.pipelineItems,
    getByStage: (args: any) => mockData.pipelineItems.filter(p => p.stage === args.stage),
    createIdea: async (args: any) => ({ _id: Math.random().toString() }),
    advanceStage: async (args: any) => {},
    updateScript: async (args: any) => {},
    remove: async (args: any) => {},
  },
  calendar: {
    getAll: () => mockData.scheduledTasks,
    getUpcoming: (args: any) => mockData.scheduledTasks.filter(t => t.nextRun > Date.now()).slice(0, args.limit || 10),
    create: async (args: any) => ({ _id: Math.random().toString() }),
    updateStatus: async (args: any) => {},
    recordRun: async (args: any) => {},
  },
  memory: {
    getAll: () => mockData.memories,
    search: (args: any) => {
      if (!args.query) return mockData.memories;
      const q = args.query.toLowerCase();
      return mockData.memories.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.content.toLowerCase().includes(q)
      );
    },
    getByCategory: (args: any) => mockData.memories.filter(m => m.category === args.category),
    create: async (args: any) => ({ _id: Math.random().toString() }),
    update: async (args: any) => {},
  },
  team: {
    getAll: () => mockData.teamMembers,
    getByRole: (args: any) => mockData.teamMembers.filter(m => m.roleType === args.roleType),
    create: async (args: any) => ({ _id: Math.random().toString() }),
    updateStatus: async (args: any) => {},
    remove: async (args: any) => {},
  },
  office: {
    getAll: () => mockData.agentStatus,
    getOnline: () => mockData.agentStatus.filter(a => a.status === "online"),
    updateStatus: async (args: any) => {},
  },
};

// Re-export Id type for compatibility
export type Id<TableName extends string> = string;
