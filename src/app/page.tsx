"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data for demo
const mockTasks = [
  { _id: "1", title: "配置 Mission Control", description: "完成所有组件", status: "done", priority: "P0", assignee: "agent", assigneeName: "Sophi2026", createdAt: Date.now(), updatedAt: Date.now() },
  { _id: "2", title: "添加 RSS 源", description: "导入 Karpathy 推荐", status: "done", priority: "P1", assignee: "agent", assigneeName: "Sophi2026", createdAt: Date.now(), updatedAt: Date.now() },
  { _id: "3", title: "配置邮件自动化", description: "需要 IMAP 配置", status: "todo", priority: "P2", assignee: "user", assigneeName: "Aaron", createdAt: Date.now(), updatedAt: Date.now() },
  { _id: "4", title: "优化 Task Board UI", description: "改进看板交互", status: "in_progress", priority: "P1", assignee: "agent", assigneeName: "Sophi2026", createdAt: Date.now(), updatedAt: Date.now() },
];

const mockPipeline = [
  { _id: "1", title: "Mission Control 教程", stage: "publish", description: "写一篇使用教程", priority: "P0", status: "done", createdAt: Date.now(), updatedAt: Date.now() },
  { _id: "2", title: "AI 编程最佳实践", stage: "script", description: "总结编程经验", priority: "P1", status: "in_progress", createdAt: Date.now(), updatedAt: Date.now() },
  { _id: "3", title: "2026 技术趋势", stage: "idea", description: "年度技术展望", priority: "P2", status: "pending", createdAt: Date.now(), updatedAt: Date.now() },
];

const mockCalendar = [
  { _id: "1", title: "心跳检查", type: "cron", schedule: "*/30 * * * *", status: "active", lastRun: Date.now() - 1800000, nextRun: Date.now() + 1800000, createdAt: Date.now() },
  { _id: "2", title: "每日简报", type: "cron", schedule: "0 9 * * *", status: "active", lastRun: null, nextRun: Date.now() + 3600000, createdAt: Date.now() },
];

const mockMemories = [
  { _id: "1", title: "采用三层记忆系统", content: "MEMORY.md + memory/YYYY-MM-DD.md + PROJECTS.md", category: "decision", tags: ["architecture", "memory"], source: "卡尔文章", createdAt: Date.now(), updatedAt: Date.now() },
  { _id: "2", title: "Aaron 偏好自主授权", content: "直接说'不用问我'而不是逐条确认", category: "preference", tags: ["user", "workflow"], source: "观察", createdAt: Date.now(), updatedAt: Date.now() },
];

const mockTeam = [
  { _id: "1", name: "Sophi2026", role: "主助手", roleType: "developer", description: "OpenClaw 主代理，负责任务执行和协调", status: "working", currentTask: "构建 Mission Control", tools: ["Next.js", "Convex", "React"], createdAt: Date.now() },
  { _id: "2", name: "Coding Assistant", role: "开发助手", roleType: "developer", description: "专注代码编写和调试", status: "idle", tools: ["TypeScript", "Python", "Node.js"], createdAt: Date.now() },
];

export default function Home() {
  const [tasks] = useState(mockTasks);
  const [pipelineItems] = useState(mockPipeline);
  const [scheduledTasks] = useState(mockCalendar);
  const [memories] = useState(mockMemories);
  const [teamMembers] = useState(mockTeam);

  const stats = [
    { label: "总任务", value: tasks.length, color: "bg-blue-500", href: "/tasks" },
    { label: "内容项目", value: pipelineItems.length, color: "bg-purple-500", href: "/pipeline" },
    { label: "定时任务", value: scheduledTasks.length, color: "bg-green-500", href: "/calendar" },
    { label: "记忆条目", value: memories.length, color: "bg-yellow-500", href: "/memory" },
    { label: "团队成员", value: teamMembers.length, color: "bg-indigo-500", href: "/team" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          🚀 Mission Control
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          OpenClaw 任务控制台 — 从对话助手升级为可运营系统
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4 flex items-center justify-center text-white text-2xl`}>
              {stat.value}
            </div>
            <p className="text-slate-600 font-medium">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">📝 最近任务</h2>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className={`w-2 h-2 rounded-full ${
                  task.status === "done" ? "bg-green-500" :
                  task.status === "in_progress" ? "bg-yellow-500" :
                  task.status === "blocked" ? "bg-red-500" : "bg-slate-300"
                }`} />
                <span className="flex-1 truncate">{task.title}</span>
                <span className="text-xs text-slate-500">{task.assigneeName}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">🔄 流水线动态</h2>
          <div className="space-y-3">
            {pipelineItems.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-lg">
                  {item.stage === "idea" && "💡"}
                  {item.stage === "script" && "📝"}
                  {item.stage === "visual" && "🎨"}
                  {item.stage === "publish" && "🚀"}
                </span>
                <span className="flex-1 truncate">{item.title}</span>
                <span className="text-xs px-2 py-1 bg-slate-200 rounded">{item.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
