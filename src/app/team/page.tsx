"use client";

import { useState } from "react";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  roleType: "developer" | "writer" | "designer" | "researcher";
  description: string;
  status: "idle" | "working" | "blocked";
  currentTask?: string;
  tools: string[];
}

const roleConfig = {
  developer: { label: "开发", color: "bg-blue-100 text-blue-800", icon: "💻" },
  writer: { label: "写作", color: "bg-green-100 text-green-800", icon: "✍️" },
  designer: { label: "设计", color: "bg-purple-100 text-purple-800", icon: "🎨" },
  researcher: { label: "研究", color: "bg-orange-100 text-orange-800", icon: "🔬" },
};

const statusConfig = {
  idle: { label: "空闲", color: "bg-slate-200" },
  working: { label: "工作中", color: "bg-green-200" },
  blocked: { label: "阻塞", color: "bg-red-200" },
};

const initialMembers: TeamMember[] = [
  { _id: "1", name: "Sophi2026", role: "主助手", roleType: "developer", description: "OpenClaw 主代理，负责任务执行和协调", status: "working", currentTask: "构建 Mission Control", tools: ["Next.js", "Convex", "React"] },
  { _id: "2", name: "Coding Assistant", role: "开发助手", roleType: "developer", description: "专注代码编写和调试", status: "idle", tools: ["TypeScript", "Python", "Node.js"] },
  { _id: "3", name: "Writing Assistant", role: "写作助手", roleType: "writer", description: "内容创作和编辑", status: "idle", tools: ["Markdown", "SEO", "Copywriting"] },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    roleType: "developer" as const,
    description: "",
    tools: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const member: TeamMember = {
      _id: Math.random().toString(36).substr(2, 9),
      ...newMember,
      status: "idle",
      tools: newMember.tools.split(",").map((t) => t.trim()).filter(Boolean),
    };
    setMembers([...members, member]);
    setShowForm(false);
    setNewMember({ name: "", role: "", roleType: "developer", description: "", tools: "" });
  };

  const handleStatusChange = (memberId: string, status: "idle" | "working" | "blocked") => {
    setMembers(members.map(m => m._id === memberId ? { ...m, status } : m));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">👥 团队结构</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          + 添加成员
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="名称"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg"
              required
            />
            <select
              value={newMember.roleType}
              onChange={(e) => setNewMember({ ...newMember, roleType: e.target.value as any })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="developer">开发</option>
              <option value="writer">写作</option>
              <option value="designer">设计</option>
              <option value="researcher">研究</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="角色/职位"
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="描述"
            value={newMember.description}
            onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
          <input
            type="text"
            placeholder="工具 (逗号分隔，如: React, Node.js, Figma)"
            value={newMember.tools}
            onChange={(e) => setNewMember({ ...newMember, tools: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">取消</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member._id} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-3xl">
                {roleConfig[member.roleType].icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${roleConfig[member.roleType].color}`}>
                    {roleConfig[member.roleType].label}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-2">{member.role}</p>
                
                {member.description && (
                  <p className="text-slate-600 text-sm mb-3">{member.description}</p>
                )}
                
                {member.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {member.tools.map((tool) => (
                      <span key={tool} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <select
                    value={member.status}
                    onChange={(e) => handleStatusChange(member._id, e.target.value as "idle" | "working" | "blocked")}
                    className={`text-xs px-2 py-1 rounded border-0 ${statusConfig[member.status].color}`}
                  >
                    <option value="idle">空闲</option>
                    <option value="working">工作中</option>
                    <option value="blocked">阻塞</option>
                  </select>
                  
                  {member.currentTask && (
                    <span className="text-xs text-slate-500 truncate max-w-[150px]">
                      {member.currentTask}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
