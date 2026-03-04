"use client";

import { useState } from "react";

interface ScheduledTask {
  _id: string;
  title: string;
  description?: string;
  type: "cron" | "one_time" | "recurring";
  schedule: string;
  status: "active" | "paused" | "completed";
  lastRun?: number;
  nextRun: number;
}

const typeConfig = {
  cron: { label: "定时", color: "bg-blue-100 text-blue-800" },
  one_time: { label: "单次", color: "bg-green-100 text-green-800" },
  recurring: { label: "重复", color: "bg-purple-100 text-purple-800" },
};

const statusConfig = {
  active: { label: "运行中", color: "bg-green-500" },
  paused: { label: "已暂停", color: "bg-yellow-500" },
  completed: { label: "已完成", color: "bg-slate-400" },
};

const initialTasks: ScheduledTask[] = [
  { _id: "1", title: "心跳检查", type: "cron", schedule: "*/30 * * * *", status: "active", lastRun: Date.now() - 1800000, nextRun: Date.now() + 1800000 },
  { _id: "2", title: "每日简报", type: "cron", schedule: "0 9 * * *", status: "active", nextRun: Date.now() + 3600000 },
  { _id: "3", title: "安全扫描", type: "cron", schedule: "0 2 * * 0", status: "paused", lastRun: Date.now() - 86400000, nextRun: Date.now() + 604800000 },
];

export default function CalendarPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "cron" as const,
    schedule: "",
    nextRun: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const task: ScheduledTask = {
      _id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: "active",
      nextRun: new Date(newTask.nextRun).getTime(),
    };
    setTasks([...tasks, task]);
    setShowForm(false);
    setNewTask({ title: "", description: "", type: "cron", schedule: "", nextRun: "" });
  };

  const handleStatusChange = (taskId: string, status: "active" | "paused" | "completed") => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">📅 日历</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          + 新建定时任务
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <input
            type="text"
            placeholder="任务名称"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="描述"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
          <div className="flex gap-4">
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value as "cron" | "one_time" | "recurring" })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="cron">定时 (Cron)</option>
              <option value="one_time">单次</option>
              <option value="recurring">重复</option>
            </select>
            <input
              type="text"
              placeholder="Schedule (如: 0 9 * * *)"
              value={newTask.schedule}
              onChange={(e) => setNewTask({ ...newTask, schedule: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <input
            type="datetime-local"
            value={newTask.nextRun}
            onChange={(e) => setNewTask({ ...newTask, nextRun: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">取消</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">任务</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Schedule</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">上次执行</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">下次执行</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${statusConfig[task.status].color}`} />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{task.title}</div>
                  {task.description && <div className="text-sm text-slate-500">{task.description}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${typeConfig[task.type].color}`}>
                    {typeConfig[task.type].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">{task.schedule}</td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {task.lastRun ? formatDate(task.lastRun) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">{formatDate(task.nextRun)}</td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value as "active" | "paused" | "completed")}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="active">运行中</option>
                    <option value="paused">暂停</option>
                    <option value="completed">完成</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
