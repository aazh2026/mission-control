"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, GitBranch, BarChart3, Rocket, Download, Command } from "lucide-react";

const navItems = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/export", label: "导出", icon: Download },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg">Mission Control</span>
            <span className="text-xs text-slate-400 ml-2">v3.0</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            
            <button
              onClick={() => {
                alert(`快捷键列表：

导航：
⌘/Ctrl + 1 - Inbox
⌘/Ctrl + 2 - Pipeline
⌘/Ctrl + 3 - Insights
⌘/Ctrl + 4 - 导出

Inbox：
⌘/Ctrl + K - 聚焦输入框
N - 新建选题

全局：
? - 显示此帮助
ESC - 关闭弹窗`);
              }}
              className="flex items-center gap-1 px-2 py-2 text-slate-400 hover:text-white transition-colors"
              title="快捷键帮助"
            >
              <Command className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
