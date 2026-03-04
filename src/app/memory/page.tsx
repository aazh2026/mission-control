"use client";

import { useState } from "react";

interface Memory {
  _id: string;
  title: string;
  content: string;
  category: "decision" | "preference" | "context" | "lesson";
  tags: string[];
  source?: string;
  createdAt: number;
}

const categoryConfig = {
  decision: { label: "决策", color: "bg-blue-100 text-blue-800" },
  preference: { label: "偏好", color: "bg-purple-100 text-purple-800" },
  context: { label: "上下文", color: "bg-green-100 text-green-800" },
  lesson: { label: "经验", color: "bg-orange-100 text-orange-800" },
};

const initialMemories: Memory[] = [
  { _id: "1", title: "采用三层记忆系统", content: "MEMORY.md + memory/YYYY-MM-DD.md + PROJECTS.md", category: "decision", tags: ["architecture", "memory"], source: "卡尔文章", createdAt: Date.now() },
  { _id: "2", title: "Aaron 偏好自主授权", content: "直接说'不用问我'而不是逐条确认，说明信任 AI 决策能力", category: "preference", tags: ["user", "workflow"], source: "观察", createdAt: Date.now() },
  { _id: "3", title: "Mission Control 技术栈", content: "Next.js + Convex 构建六组件系统：Tasks/Pipeline/Calendar/Memory/Team/Office", category: "context", tags: ["tech", "mission-control"], source: "TermMax", createdAt: Date.now() },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: "",
    content: "",
    category: "context" as const,
    tags: "",
    source: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const memory: Memory = {
      _id: Math.random().toString(36).substr(2, 9),
      title: newMemory.title,
      content: newMemory.content,
      category: newMemory.category,
      tags: newMemory.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source: newMemory.source,
      createdAt: Date.now(),
    };
    setMemories([memory, ...memories]);
    setShowForm(false);
    setNewMemory({ title: "", content: "", category: "context", tags: "", source: "" });
  };

  const displayedMemories = searchQuery.length > 0
    ? memories.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : memories;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">🧠 记忆库</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          + 添加记忆
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="搜索记忆..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-yellow-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <input
            type="text"
            placeholder="标题"
            value={newMemory.title}
            onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="内容"
            value={newMemory.content}
            onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
            required
          />
          <div className="flex gap-4">
            <select
              value={newMemory.category}
              onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value as any })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="decision">决策</option>
              <option value="preference">偏好</option>
              <option value="context">上下文</option>
              <option value="lesson">经验</option>
            </select>
            <input
              type="text"
              placeholder="标签 (逗号分隔)"
              value={newMemory.tags}
              onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
          </div>
          <input
            type="text"
            placeholder="来源 (可选)"
            value={newMemory.source}
            onChange={(e) => setNewMemory({ ...newMemory, source: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">取消</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {displayedMemories.map((memory) => (
          <div key={memory._id} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{memory.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${categoryConfig[memory.category].color}`}>
                  {categoryConfig[memory.category].label}
                </span>
              </div>
              <span className="text-sm text-slate-400">
                {new Date(memory.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
            
            <p className="text-slate-600 mb-4 whitespace-pre-wrap">{memory.content}</p>
            
            {memory.tags.length > 0 && (
              <div className="flex gap-2 mb-3">
                {memory.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {memory.source && (
              <p className="text-xs text-slate-400">来源: {memory.source}</p>
            )}
          </div>
        ))}
        {displayedMemories.length === 0 && (
          <p className="text-center py-8 text-slate-400">{searchQuery ? "未找到匹配的记忆" : "暂无记忆"}</p>
        )}
      </div>
    </div>
  );
}
