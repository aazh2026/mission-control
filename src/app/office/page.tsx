"use client";

import { useState } from "react";

interface Agent {
  agentId: string;
  name: string;
  avatar: string;
  status: "online" | "busy" | "offline";
  currentTask?: string;
  workspace: string;
}

const statusConfig = {
  online: { label: "在线", color: "bg-green-500", dot: "🟢" },
  busy: { label: "忙碌", color: "bg-yellow-500", dot: "🟡" },
  offline: { label: "离线", color: "bg-slate-400", dot: "⚫" },
};

const workspaces = [
  { id: "desk-1", name: "主工作站", x: 10, y: 20 },
  { id: "desk-2", name: "开发区", x: 40, y: 20 },
  { id: "desk-3", name: "写作区", x: 70, y: 20 },
  { id: "desk-4", name: "会议区", x: 25, y: 60 },
  { id: "desk-5", name: "休息区", x: 55, y: 60 },
];

const initialAgents: Agent[] = [
  { agentId: "sophi2026", name: "Sophi2026", avatar: "🤖", status: "online", currentTask: "构建 Mission Control", workspace: "desk-1" },
];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  const updateStatus = (agentId: string, status: "online" | "busy" | "offline") => {
    setAgents(agents.map(a => a.agentId === agentId ? { ...a, status } : a));
  };

  const addAgent = () => {
    const emptyWorkspace = workspaces.find(w => !agents.some(a => a.workspace === w.id));
    if (emptyWorkspace) {
      setAgents([...agents, {
        agentId: `agent-${Date.now()}`,
        name: "New Agent",
        avatar: "👤",
        status: "online",
        workspace: emptyWorkspace.id,
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">🏢 数字办公室</h1>

      <div className="bg-slate-800 rounded-2xl p-8 relative min-h-[500px]">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #fff 1px, transparent 1px),
              linear-gradient(to bottom, #fff 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
          />
        </div>

        {workspaces.map((desk) => {
          const agent = agents.find((a) => a.workspace === desk.id);
          return (
            <div
              key={desk.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${desk.x}%`, top: `${desk.y}%` }}
            >
              <div className="bg-slate-700 rounded-xl p-4 w-40 shadow-lg border-2 border-slate-600">
                <div className="text-xs text-slate-400 mb-2">{desk.name}</div>
                
                {agent ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-slate-600 flex items-center justify-center text-3xl">
                      {agent.avatar}
                    </div>
                    <div className="font-medium text-white text-sm truncate">{agent.name}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span>{statusConfig[agent.status].dot}</span>
                      <span className="text-xs text-slate-300">{statusConfig[agent.status].label}</span>
                    </div>
                    
                    {agent.currentTask && (
                      <div className="mt-2 px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 truncate">
                        {agent.currentTask}
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-center gap-1">
                      {(["online", "busy", "offline"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(agent.agentId, s)}
                          className={`w-3 h-3 rounded-full ${statusConfig[s].color} ${
                            agent.status === s ? "ring-2 ring-white" : "opacity-50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                      💺
                    </div>
                    <div className="text-xs text-slate-500">空闲</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">团队状态</span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">🟢 在线: {agents.filter((a) => a.status === "online").length}</span>
                <span className="text-yellow-400">🟡 忙碌: {agents.filter((a) => a.status === "busy").length}</span>
                <span className="text-slate-400">⚫ 离线: {agents.filter((a) => a.status === "offline").length}</span>
              </div>
            </div>
            <button
              onClick={addAgent}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              + 添加 Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
