"use client";

import { useState } from "react";

// 基于 Dan Koe 理念的增强版内容流水线
// 新增：素材库、内容变体、影响追踪、永恒市场分类

type PipelineStage = "idea" | "research" | "script" | "visual" | "repurpose" | "publish";
type PipelineStatus = "pending" | "in_progress" | "review" | "done";
type EternalMarket = "health" | "wealth" | "relationship" | "happiness" | null;

interface ContentVariant {
  platform: string;
  format: string;
  content: string;
  status: PipelineStatus;
}

interface PipelineItem {
  _id: string;
  title: string;
  stage: PipelineStage;
  description?: string;
  priority: "P0" | "P1" | "P2";
  status: PipelineStatus;
  script?: string;
  source?: string;
  eternalMarket?: EternalMarket;
  coreIdea?: string;           // 核心观点（用于重复表达）
  variants?: ContentVariant[]; // 内容变体
  impact?: {
    views?: number;
    likes?: number;
    comments?: number;
    conversions?: number;
  };
  createdAt: number;
  publishedAt?: number;
}

const stageConfig: Record<PipelineStage, { label: string; icon: string; color: string; description: string }> = {
  idea: { 
    label: "灵感池", 
    icon: "💡", 
    color: "bg-yellow-100",
    description: "收集想法，建立素材库"
  },
  research: { 
    label: "研究", 
    icon: "🔍", 
    color: "bg-indigo-100",
    description: "深度学习，建立想法密度"
  },
  script: { 
    label: "创作", 
    icon: "✍️", 
    color: "bg-blue-100",
    description: "撰写核心内容"
  },
  visual: { 
    label: "视觉", 
    icon: "🎨", 
    color: "bg-purple-100",
    description: "设计配图、封面"
  },
  repurpose: { 
    label: "变体", 
    icon: "🔄", 
    color: "bg-orange-100",
    description: "用1000种方式表达同一个想法"
  },
  publish: { 
    label: "发布", 
    icon: "🚀", 
    color: "bg-green-100",
    description: "发布并追踪影响"
  },
};

const eternalMarketConfig: Record<EternalMarket, { label: string; icon: string; color: string }> = {
  health: { label: "健康", icon: "💪", color: "bg-green-100 text-green-800" },
  wealth: { label: "财富", icon: "💰", color: "bg-yellow-100 text-yellow-800" },
  relationship: { label: "关系", icon: "❤️", color: "bg-pink-100 text-pink-800" },
  happiness: { label: "幸福", icon: "😊", color: "bg-blue-100 text-blue-800" },
  null: { label: "未分类", icon: "📌", color: "bg-slate-100 text-slate-600" },
};

const initialItems: PipelineItem[] = [
  { 
    _id: "1", 
    title: "Mission Control 创作者操作系统", 
    stage: "publish", 
    description: "基于 Dan Koe + TermMax 的创作者工作流",
    priority: "P0", 
    status: "done",
    eternalMarket: "wealth",
    coreIdea: "系统化个人工作流，把兴趣变成生意",
    impact: { views: 120, likes: 15, comments: 3 }
  },
  { 
    _id: "2", 
    title: "AI 技能进化实践", 
    stage: "script", 
    description: "记录我如何基于 Dan Koe 理念进化",
    priority: "P1", 
    status: "in_progress",
    eternalMarket: "happiness",
    coreIdea: "AI 也要自我教育、自我利益、自给自足"
  },
  // ===== 新增选题（基于用户画像组织）=====
  {
    _id: "10",
    title: "我如何用 OpenClaw 构建创作者操作系统",
    stage: "idea",
    description: "实战案例：从0到1构建 Mission Control 的完整过程",
    priority: "P0",
    status: "pending",
    eternalMarket: "wealth",
    coreIdea: "AI 不是替代你，而是放大你",
    source: "今日实践",
    variants: [
      { platform: "公众号", format: "长文教程", content: "", status: "pending" },
      { platform: "小红书", format: "3图说清楚", content: "", status: "pending" },
      { platform: "Twitter", format: "10条线程", content: "", status: "pending" }
    ],
    createdAt: Date.now()
  },
  {
    _id: "11",
    title: "Dan Koe 的多兴趣理论，我实践了30天",
    stage: "idea",
    description: "验证报告：多兴趣融合是否真的可行？",
    priority: "P0",
    status: "pending",
    eternalMarket: "happiness",
    coreIdea: "不要 niche down，要兴趣融合",
    source: "Skill Evolution 系统",
    createdAt: Date.now()
  },
  {
    _id: "12",
    title: "AI Agent 正在变成你的第二大脑",
    stage: "research",
    description: "趋势分析：从使用 AI 到与 AI 共生",
    priority: "P1",
    status: "pending",
    eternalMarket: "wealth",
    coreIdea: "AI Agent 是思维的外延",
    source: "Karpathy RSS 源",
    createdAt: Date.now()
  },
  {
    _id: "13",
    title: "一人企业的技术栈 2025",
    stage: "idea",
    description: "完整工具链：内容创作 → 分发 → 自动化",
    priority: "P1",
    status: "pending",
    eternalMarket: "wealth",
    coreIdea: "用最简单的工具构建一人公司",
    createdAt: Date.now()
  },
  {
    _id: "14",
    title: "从国学经典到 AI 自动化：我的知识管理进化",
    stage: "idea",
    description: "个人故事：传统智慧 × 现代工具的融合",
    priority: "P1",
    status: "pending",
    eternalMarket: "happiness",
    coreIdea: "悟道修行与效率工具并不矛盾",
    createdAt: Date.now()
  },
  {
    _id: "15",
    title: "为什么我不再追求 work-life balance",
    stage: "idea",
    description: "观点文章：追求融合而非平衡",
    priority: "P2",
    status: "pending",
    eternalMarket: "happiness",
    coreIdea: "work-life integration > work-life balance",
    createdAt: Date.now()
  },
  {
    _id: "16",
    title: "AI 时代的通才生存指南",
    stage: "idea",
    description: "深度长文：第二次文艺复兴的通才优势",
    priority: "P2",
    status: "pending",
    eternalMarket: "wealth",
    coreIdea: "AI 时代，通才 > 专才",
    source: "Dan Koe, Naval, Paul Graham",
    createdAt: Date.now()
  },
  {
    _id: "17",
    title: "我追踪了100个创作者，发现的成功模式",
    stage: "idea",
    description: "数据分析：从 RSS 源中提取创作者规律",
    priority: "P2",
    status: "pending",
    eternalMarket: "wealth",
    coreIdea: "成功创作者的共同特征",
    createdAt: Date.now()
  },
  { 
    _id: "3", 
    title: "如何把多种兴趣融合成生意", 
    stage: "repurpose", 
    description: "Dan Koe 文章的读书笔记",
    priority: "P1", 
    status: "in_progress",
    source: "Dan Koe",
    eternalMarket: "wealth",
    coreIdea: "做自己，把自己成为客户画像",
    variants: [
      { platform: "公众号", format: "长文", content: "原文深度解析", status: "done" },
      { platform: "小红书", format: "图文", content: "5点核心提炼", status: "in_progress" },
      { platform: "Twitter", format: "线程", content: "核心金句串", status: "pending" }
    ]
  },
  { 
    _id: "4", 
    title: "想法博物馆实践指南", 
    stage: "idea", 
    description: "如何建立个人素材库",
    priority: "P2", 
    status: "pending",
    eternalMarket: "happiness"
  },
];

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [showVariants, setShowVariants] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState<{
    title: string;
    description: string;
    source: string;
    priority: "P0" | "P1" | "P2";
    eternalMarket: EternalMarket;
    coreIdea: string;
  }>({ 
    title: "", 
    description: "", 
    source: "", 
    priority: "P1",
    eternalMarket: null,
    coreIdea: ""
  });
  const [scriptContent, setScriptContent] = useState("");
  const [filter, setFilter] = useState<EternalMarket | "all">("all");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const item: PipelineItem = {
      _id: Math.random().toString(36).substr(2, 9),
      ...newIdea,
      stage: "idea",
      status: "pending",
      createdAt: Date.now(),
    };
    setItems([item, ...items]);
    setShowForm(false);
    setNewIdea({ title: "", description: "", source: "", priority: "P1", eternalMarket: null, coreIdea: "" });
  };

  const handleAdvance = (itemId: string, currentStage: PipelineStage) => {
    const stages: PipelineStage[] = ["idea", "research", "script", "visual", "repurpose", "publish"];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setItems(items.map(i => 
        i._id === itemId 
          ? { 
              ...i, 
              stage: nextStage, 
              status: nextStage === "publish" ? "done" : "pending",
              publishedAt: nextStage === "publish" ? Date.now() : i.publishedAt
            }
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

  const addVariant = (itemId: string, platform: string, format: string) => {
    setItems(items.map(i => {
      if (i._id === itemId) {
        const variants = i.variants || [];
        return {
          ...i,
          variants: [...variants, { platform, format, content: "", status: "pending" }]
        };
      }
      return i;
    }));
  };

  const filteredItems = filter === "all" ? items : items.filter(i => i.eternalMarket === filter);

  const itemsByStage: Record<PipelineStage, PipelineItem[]> = {
    idea: filteredItems.filter((i) => i.stage === "idea"),
    research: filteredItems.filter((i) => i.stage === "research"),
    script: filteredItems.filter((i) => i.stage === "script"),
    visual: filteredItems.filter((i) => i.stage === "visual"),
    repurpose: filteredItems.filter((i) => i.stage === "repurpose"),
    publish: filteredItems.filter((i) => i.stage === "publish"),
  };

  const stats = {
    total: items.length,
    published: items.filter(i => i.stage === "publish").length,
    byMarket: {
      health: items.filter(i => i.eternalMarket === "health").length,
      wealth: items.filter(i => i.eternalMarket === "wealth").length,
      relationship: items.filter(i => i.eternalMarket === "relationship").length,
      happiness: items.filter(i => i.eternalMarket === "happiness").length,
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部统计 - Dan Koe 永恒市场 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-xl">
        <h2 className="text-lg font-bold mb-4">🎯 创作者仪表盘 (Dan Koe 模式)</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-slate-300">总项目</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.published}</div>
            <div className="text-xs text-slate-300">已发布</div>
          </div>
          <div className="bg-green-500/20 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.byMarket.health}</div>
            <div className="text-xs">💪 健康</div>
          </div>
          <div className="bg-yellow-500/20 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.byMarket.wealth}</div>
            <div className="text-xs">💰 财富</div>
          </div>
          <div className="bg-pink-500/20 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.byMarket.relationship}</div>
            <div className="text-xs">❤️ 关系</div>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.byMarket.happiness}</div>
            <div className="text-xs">😊 幸福</div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm ${filter === "all" ? "bg-slate-800 text-white" : "bg-slate-200"}`}
        >
          全部
        </button>
        {(["health", "wealth", "relationship", "happiness"] as EternalMarket[]).map((market) => (
          <button
            key={market}
            onClick={() => setFilter(market)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === market ? eternalMarketConfig[market].color : "bg-slate-200"
            }`}
          >
            {eternalMarketConfig[market].icon} {eternalMarketConfig[market].label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">🔄 内容流水线</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          + 添加灵感
        </button>
      </div>

      {/* 新增表单 - 包含 Dan Koe 理念 */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="标题"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <select
              value={newIdea.priority}
              onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value as "P0" | "P1" | "P2" })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="P0">P0 - 核心</option>
              <option value="P1">P1 - 重要</option>
              <option value="P2">P2 - 补充</option>
            </select>
          </div>
          
          <textarea
            placeholder="描述"
            value={newIdea.description}
            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
          
          {/* 核心观点 - Dan Koe "1000种方式表达同一个想法" */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">💡 核心观点（用于重复表达）</label>
            <input
              type="text"
              placeholder="一句话概括这个内容的核心理念"
              value={newIdea.coreIdea}
              onChange={(e) => setNewIdea({ ...newIdea, coreIdea: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">📚 来源</label>
              <input
                type="text"
                placeholder="如：Dan Koe, RSS, 书籍..."
                value={newIdea.source}
                onChange={(e) => setNewIdea({ ...newIdea, source: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">🎯 永恒市场</label>
              <select
                value={newIdea.eternalMarket || ""}
                onChange={(e) => setNewIdea({ ...newIdea, eternalMarket: e.target.value as EternalMarket || null })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">未分类</option>
                <option value="health">💪 健康</option>
                <option value="wealth">💰 财富</option>
                <option value="relationship">❤️ 关系</option>
                <option value="happiness">😊 幸福</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded-lg">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">取消</button>
          </div>
        </form>
      )}

      {/* 六阶段流水线 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {(Object.keys(stageConfig) as PipelineStage[]).map((stage) => (
          <div key={stage} className={`${stageConfig[stage].color} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-2 font-medium text-sm">
              <span className="text-lg">{stageConfig[stage].icon}</span>
              <div>
                <div>{stageConfig[stage].label}</div>
                <div className="text-xs text-slate-500">{itemsByStage[stage]?.length ?? 0} 项</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 mb-2">{stageConfig[stage].description}</div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {itemsByStage[stage]?.map((item) => (
                <div key={item._id} className="bg-white p-3 rounded-lg shadow-sm text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      item.priority === "P0" ? "bg-red-500 text-white" :
                      item.priority === "P1" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {item.priority}
                    </span>
                    <button onClick={() => handleDelete(item._id)} className="text-slate-400 hover:text-red-500">×</button>
                  </div>
                  
                  <h3 className="font-medium text-slate-800 mb-1">{item.title}</h3>
                  
                  {/* 永恒市场标签 */}
                  {item.eternalMarket && (
                    <span className={`inline-block text-xs px-1.5 py-0.5 rounded mb-1 ${eternalMarketConfig[item.eternalMarket].color}`}>
                      {eternalMarketConfig[item.eternalMarket].icon} {eternalMarketConfig[item.eternalMarket].label}
                    </span>
                  )}
                  
                  {/* 核心观点 */}
                  {item.coreIdea && (
                    <p className="text-xs text-slate-500 mb-1 italic">"{item.coreIdea}"</p>
                  )}
                  
                  {item.description && <p className="text-xs text-slate-500 mb-1">{item.description}</p>}
                  {item.source && <p className="text-xs text-slate-400">来源: {item.source}</p>}
                  
                  {/* 内容变体 - Dan Koe "1000种方式" */}
                  {item.variants && item.variants.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-600 mb-1">🔄 内容变体:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.variants.map((v, idx) => (
                          <span key={idx} className={`text-xs px-1.5 py-0.5 rounded ${
                            v.status === "done" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {v.platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 影响数据 */}
                  {item.impact && item.stage === "publish" && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 text-xs text-slate-600">
                      {item.impact.views && <span>👁 {item.impact.views}</span>}
                      {item.impact.likes && <span>❤️ {item.impact.likes}</span>}
                      {item.impact.comments && <span>💬 {item.impact.comments}</span>}
                    </div>
                  )}
                  
                  {/* 脚本编辑 */}
                  {editingScript === item._id ? (
                    <div className="mt-2 space-y-1">
                      <textarea
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                        rows={3}
                        placeholder="输入内容..."
                      />
                      <div className="flex gap-1">
                        <button onClick={() => handleSaveScript(item._id)} className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">保存</button>
                        <button onClick={() => setEditingScript(null)} className="px-2 py-0.5 bg-slate-200 text-xs rounded">取消</button>
                      </div>
                    </div>
                  ) : item.script ? (
                    <div className="mt-2 bg-slate-50 p-1.5 rounded text-xs">
                      <p className="text-slate-600 line-clamp-2">{item.script}</p>
                      <button onClick={() => { setEditingScript(item._id); setScriptContent(item.script || ""); }} className="text-blue-500 mt-0.5">编辑</button>
                    </div>
                  ) : (stage === "script" || stage === "repurpose") ? (
                    <button onClick={() => { setEditingScript(item._id); setScriptContent(""); }} className="mt-1 text-xs text-blue-500">+ 添加内容</button>
                  ) : null}
                  
                  {/* 推进按钮 */}
                  {stage !== "publish" && (
                    <button
                      onClick={() => handleAdvance(item._id, stage)}
                      className="mt-2 w-full text-xs px-2 py-1 bg-slate-800 text-white rounded hover:bg-slate-700"
                    >
                      推进 → {stageConfig[stage === "idea" ? "research" : stage === "research" ? "script" : stage === "script" ? "visual" : stage === "visual" ? "repurpose" : "publish"].label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
