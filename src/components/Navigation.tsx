"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "🏠 首页", color: "bg-gray-500" },
  { href: "/tasks", label: "📝 任务看板", color: "bg-blue-500" },
  { href: "/pipeline", label: "🔄 内容流水线", color: "bg-purple-500" },
  { href: "/creator", label: "🎯 创作者", color: "bg-orange-500" },
  { href: "/calendar", label: "📅 日历", color: "bg-green-500" },
  { href: "/memory", label: "🧠 记忆库", color: "bg-yellow-500" },
  { href: "/team", label: "👥 团队", color: "bg-indigo-500" },
  { href: "/office", label: "🏢 数字办公室", color: "bg-pink-500" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span>Mission Control</span>
        </Link>
        <div className="flex gap-2 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                pathname === item.href
                  ? `${item.color} text-white`
                  : "hover:bg-slate-700 text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
