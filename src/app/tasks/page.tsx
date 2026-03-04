"use client";

import { useState } from "react";

type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
type Priority = "P0" | "P1" | "P2" | "P3";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee: "user" | "agent";
  assigneeName: string;
}

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "待办", color: "bg-slate-200" },
  in_progress: { label: "进行中", color: "bg-yellow-200" },
  done: { label: "已完成", color: "bg-green-200" },
  blocked: { label: "阻塞", color: "bg-red-200" },
};

const priorityColors: Record<Priority, string> = {
  P0: "bg-red-500 text-white",
  P1: "bg-orange-500 text-white",
  P2: "bg-blue-500 text-white",
  P3: "bg-slate-400 text-white",
};

const initialTasks: Task[] = [
  { _id: "1", title: "配置 Mission Control", description: "完成所有组件", status: "done", priority: "P0", assignee: "agent", assigneeName: "Sophi2026" },
  { _id: "2", title: "添加 RSS 源", description: "导入 Karpathy 推荐", status: "done", priority: "P1", assignee: "agent", assigneeName: "Sophi2026" },
  { _id: "3", title: "配置邮件自动化", description: "需要 IMAP 配置", status: "todo", priority: "P2", assignee: "user", assigneeName: "Aaron" },
  { _id: "4", title: "优化 Task Board UI", description: "改进看板交互", status: "in_progress", priority: "P1", assignee: "agent", assigneeName: "Sophi2026" },
  { _id: "5", title: "修复 Pipeline Bug", status: "blocked", priority: "P0", assignee: "agent", assigneeName: "Sophi2026" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "P1" as Priority,
    assignee: "agent" as "user" | "agent",
    assigneeName: "Sophi2026",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      _id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: "todo",
    };
    setTasks([task, ...tasks]);
    setShowForm(false);
    setNewTask({ title: "", description: "", priority: "P1", assignee: "agent", assigneeName: "Sophi2026" });
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
  };

  const handleDelete = (taskId: string) => {
    if (confirm("确定删除此任务？")) {
      setTasks(tasks.filter(t => t._id !== taskId));
    }
  };

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
    blocked: tasks.filter((t) => t.status === "blocked"),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">📝 任务看板</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + 新建任务
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">任务标题</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="P0">P0 - 最高</option>
                <option value="P1">P1 - 高</option>
                <option value="P2">P2 - 中</option>
                <option value="P3">P3 - 低</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">负责人</label>
              <select
                value={newTask.assignee}
                onChange={(e) => {
                  const assignee = e.target.value as "user" | "agent";
                  setNewTask({
                    ...newTask,
                    assignee,
                    assigneeName: assignee === "user" ? "Aaron" : "Sophi2026",
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="user">Aaron</option>
                <option value="agent">Sophi2026</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              创建
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(statusConfig) as TaskStatus[]).map((status) => (
          <div key={status} className="bg-slate-100 rounded-xl p-4">
            <div className={`${statusConfig[status].color} px-3 py-2 rounded-lg mb-4 font-medium`}>
              {statusConfig[status].label} ({tasksByStatus[status]?.length ?? 0})
            </div>
            <div className="space-y-3">
              {tasksByStatus[status]?.map((task) => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                  <h3 className="font-medium text-slate-800 mb-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-slate-500 mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{task.assigneeName}</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="todo">待办</option>
                      <option value="in_progress">进行中</option>
                      <option value="done">已完成</option>
                      <option value="blocked">阻塞</option>
                    </select>
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
