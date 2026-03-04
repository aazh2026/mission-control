"use client";

import { useState } from "react";

// 内容创作项目追踪系统
// 基于 Dan Koe 的创作者经济理念

interface ContentProject {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  startDate: string;
  targetAudience: string;
  corePromise: string;      // 品牌承诺：读者能获得什么转变
  contentPillars: string[]; // 核心支柱（Dan Koe 的 5-10 个最强论点）
  platforms: Platform[];
  metrics: ProjectMetrics;
  ideas: Idea[];
}

interface Platform {
  name: string;
  handle: string;
  followers: number;
  postingFrequency: string;
  status: "active" | "planning";
}

interface ProjectMetrics {
  totalContent: number;
  publishedThisMonth: number;
  totalViews: number;
  totalRevenue: number;
  growthRate: number;
}

interface Idea {
  id: string;
  title: string;
  source: string;
  usedIn: string[];
  dateAdded: string;
}

const initialProjects: ContentProject[] = [
  {
    id: "1",
    name: "哲思之光",
    description: "学习经典，悟道修行，做热爱的事，实现意识、财富、时间的自由",
    status: "active",
    startDate: "2024-01",
    targetAudience: "追求个人成长、想要找到人生意义的人",
    corePromise: "帮助你获得深层的幸福感和生命自由",
    contentPillars: [
      "国学经典智慧",
      "悟道修行方法",
      "个人成长实践",
      "自由生活方式",
      "AI 时代生存技能"
    ],
    platforms: [
      { name: "公众号", handle: "哲思之光", followers: 0, postingFrequency: "每周1-2篇长文", status: "active" },
      { name: "小红书", handle: "自由的旅程", followers: 0, postingFrequency: "每日短文", status: "planning" },
      { name: "Twitter/X", handle: "@aazh2026", followers: 0, postingFrequency: "每日金句", status: "planning" }
    ],
    metrics: {
      totalContent: 3,
      publishedThisMonth: 2,
      totalViews: 150,
      totalRevenue: 0,
      growthRate: 15
    },
    ideas: [
      { id: "1", title: "Dan Koe 多兴趣融合生意", source: "公众号文章", usedIn: ["内容流水线"], dateAdded: "2026-03-04" },
      { id: "2", title: "Mission Control 创作者操作系统", source: "实践总结", usedIn: ["GitHub"], dateAdded: "2026-03-04" }
    ]
  }
];

export default function CreatorProjectPage() {
  const [projects, setProjects] = useState<ContentProject[]>(initialProjects);
  const [activeProject, setActiveProject] = useState<ContentProject | null>(initialProjects[0]);
  const [showNewProject, setShowNewProject] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // 简化版，实际应该收集表单数据
    setShowNewProject(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">🎯 内容创作项目</h1>
          <p className="text-slate-600">基于 Dan Koe 理念的创作者经济追踪</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          + 新项目
        </button>
      </div>

      {/* 项目选择器 */}
      <div className="flex gap-2">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p)}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeProject?.id === p.id 
                ? "bg-slate-800 text-white" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {p.name}
            <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
              p.status === "active" ? "bg-green-400" : 
              p.status === "paused" ? "bg-yellow-400" : "bg-slate-400"
            }`} />
          </button>
        ))}
      </div>

      {activeProject && (
        <div className="space-y-6">
          {/* 项目概览卡片 */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* 品牌承诺 */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-xl">
              <div className="text-sm opacity-80 mb-2">💎 品牌承诺</div>
              <div className="text-lg font-bold">{activeProject.corePromise}</div>
              <div className="mt-4 text-sm opacity-80">目标受众: {activeProject.targetAudience}</div>
            </div>

            {/* 核心支柱 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-sm text-slate-500 mb-3">🎯 内容支柱 (Dan Koe 理念)</div>
              <div className="space-y-2">
                {activeProject.contentPillars.map((pillar, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700">{pillar}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 数据指标 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-sm text-slate-500 mb-3">📊 项目数据</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{activeProject.metrics.totalContent}</div>
                  <div className="text-xs text-slate-500">总内容</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{activeProject.metrics.publishedThisMonth}</div>
                  <div className="text-xs text-slate-500">本月发布</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{activeProject.metrics.totalViews}</div>
                  <div className="text-xs text-slate-500">总阅读</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{activeProject.metrics.growthRate}%</div>
                  <div className="text-xs text-slate-500">增长率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 平台矩阵 */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">🌐 平台矩阵</h3>
              <button className="text-sm text-blue-500">+ 添加平台</button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {activeProject.platforms.map((platform) => (
                <div key={platform.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{platform.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      platform.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {platform.status === "active" ? "运营中" : "规划中"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-1">@{platform.handle}</div>
                  <div className="text-xs text-slate-500 mb-2">
                    {platform.followers > 0 ? `${platform.followers} 粉丝` : "暂无数据"}
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    📅 {platform.postingFrequency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 想法博物馆关联 */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">💡 想法博物馆</h3>
              <button className="text-sm text-blue-500">查看全部</button>
            </div>
            
            <div className="space-y-2">
              {activeProject.ideas.map((idea) => (
                <div key={idea.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{idea.title}</div>
                    <div className="text-xs text-slate-500">
                      来源: {idea.source} · 已用于: {idea.usedIn.join(", ")}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {idea.dateAdded}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 行动清单 - Dan Koe 实践 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">🎯 Dan Koe 实践清单</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">自我成功三要素</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="rounded" />
                  <span className="text-sm">主导自己的学习（AI 辅助）</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="rounded" />
                  <span className="text-sm">用无私利人的方式利益自己</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">承担自己的判断和行动力</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">品牌建设</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly className="rounded" />
                  <span className="text-sm">定义品牌承诺（帮助获得深层幸福）</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">整理 5-10 个核心论点</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">用故事建立品牌</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
