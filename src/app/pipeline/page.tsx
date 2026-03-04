"use client";

import { useState } from "react";

type PipelineStage = "idea" | "script" | "visual" | "publish";
type PipelineStatus = "pending" | "in_progress" | "review" | "done";

interface PipelineItem {
  _id: string;
  title: string;
  stage: PipelineStage;
  description?: string;
  priority: "P0" | "P1" | "P2";
  status: PipelineStatus;
  script?: string;
  source?: string;
}

const stageConfig: Record<PipelineStage, { label: string; icon: string; color: string }> = {
  idea: { label: "灵感池", icon: "💡", color: "bg-yellow-100" },
  script: { label: "脚本", icon: "📝", color: "bg-blue-100" },
  visual: { label: "视觉", icon: "🎨", color: "bg-purple-100" },
  publish: { label: "发布", icon: "🚀", color: "bg-green-100" },
};

const statusConfig: Record<PipelineStatus, { label: string; color: string }> = {
  pending: { label: "待处理", color: "bg-slate-200" },
  in_progress: { label: "进行中", color: "bg-yellow-200" },
  review: { label: "审核中", color: "bg-blue-200" },
  done: { label: "完成", color: "bg-green-200" },
};

const initialItems: PipelineItem[] = [
  { _id: "1", title: "Mission Control 教程", stage: "publish", description: "写一篇使用教程", priority: "P0", status: "done" },
  { _id: "2", title: "AI 编程最佳实践", stage: "script", description: "总结编程经验", priority: "P1", status: "in_progress" },
  { _id: "3", title: "2026 技术趋势", stage: "idea", description: "年度技术展望", priority: "P2", status: "pending", source: "RSS" },
  { _id: "4", title: "Convex 入门指南", stage: "script", description: "数据库使用教程", priority: "P1", status: "pending" },
];

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", source: "", priority: "P1" as const });
  const [scriptContent, setScriptContent] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const item: PipelineItem = {
      _id: Math.random().toString(36).substr(2, 9),
      ...newIdea,
      stage: "idea",
      status: "pending",
    };
    setItems([item, ...items]);
    setShowForm(false);
    setNewIdea({ title: "", description: "", source: "", priority: "P1" });
  };

  const handleAdvance = (itemId: string, currentStage: PipelineStage) => {
    const stages: PipelineStage[] = ["idea", "script", "visual", "publish"];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      setItems(items.map(i => 
        i._id === itemId 
          ? { ...i, stage: stages[currentIndex + 1], status: stages[currentIndex + 1] === "publish" ? "done" : "pending" }
          : i
      ));
    }
  };

  const handleSaveScript = (itemId: string) => {
    setItems(items.map(i => i._id === itemId ? { ...i, script: scriptContent } : i));
    setEditingScript(null);
    setScriptContent("");
  };

  const handleDelete = (itemId: string) => {
    if (confirm("确定删除？")) {
      setItems(items.filter(i => i._id !== itemId));
    }
  };

  const itemsByStage: Record<PipelineStage, PipelineItem[]> = {
    idea: items.filter((i) => i.stage === "idea"),
    script: items.filter((i) => i.stage === "script"),
    visual: items.filter((i) => i.stage === "visual"),
    publish: items.filter((i) => i.stage === "publish"),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">🔄 内容流水线</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          + 添加灵感
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <input
            type="text"
            placeholder="标题"
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="描述"
            value={newIdea.description}
            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="来源"
              value={newIdea.source}
              onChange={(e) => setNewIdea({ ...newIdea, source: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <select
              value={newIdea.priority}
              onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value as "P0" | "P1" | "P2" })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded-lg">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">取消</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(stageConfig) as PipelineStage[]).map((stage) => (
          <div key={stage} className={`${stageConfig[stage].color} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-4 font-medium">
              <span className="text-xl">{stageConfig[stage].icon}</span>
              <span>{stageConfig[stage].label} ({itemsByStage[stage]?.length ?? 0})</span>
            </div>
            <div className="space-y-3">
              {itemsByStage[stage]?.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.priority === "P0" ? "bg-red-500 text-white" :
                      item.priority === "P1" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {item.priority}
                    </span>
                    <button onClick={() => handleDelete(item._id)} className="text-slate-400 hover:text-red-500">×</button>
                  </div>
                  <h3 className="font-medium text-slate-800 mb-1">{item.title}</h3>
                  {item.description && <p className="text-sm text-slate-500 mb-2">{item.description}</p>}
                  {item.source && <p className="text-xs text-slate-400 mb-2">来源: {item.source}</p>}
                  
                  {editingScript === item._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={4}
                        placeholder="输入脚本内容..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveScript(item._id)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingScript(null)}
                          className="px-2 py-1 bg-slate-200 text-xs rounded"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : item.script ? (
                    <div className="bg-slate-50 p-2 rounded text-sm mb-2">
                      <p className="text-slate-600 line-clamp-3">{item.script}</p>
                      <button
                        onClick={() => {
                          setEditingScript(item._id);
                          setScriptContent(item.script || "");
                        }}
                        className="text-xs text-blue-500 mt-1"
                      >
                        编辑脚本
                      </button>
                    </div>
                  ) : stage === "script" ? (
                    <button
                      onClick={() => {
                        setEditingScript(item._id);
                        setScriptContent("");
                      }}
                      className="text-xs text-blue-500 mb-2"
                    >
                      + 添加脚本
                    </button>
                  ) : null}
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${statusConfig[item.status].color}`}>
                      {statusConfig[item.status].label}
                    </span>
                    {stage !== "publish" && (
                      <button
                        onClick={() => handleAdvance(item._id, stage)}
                        className="text-xs px-2 py-1 bg-slate-800 text-white rounded hover:bg-slate-700"
                      >
                        推进 →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
