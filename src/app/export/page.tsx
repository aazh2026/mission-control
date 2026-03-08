'use client';

import { useState } from 'react';
import { Download, Upload, FileJson, FileText } from 'lucide-react';

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 导出 JSON
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export?format=json');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mission-control-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  // 导出 Markdown
  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export?format=markdown');
      const text = await res.text();
      
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mission-control-export-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  // 导入
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        alert('导入成功！');
        window.location.reload();
      } else {
        alert('导入失败');
      }
    } catch (e) {
      alert('文件解析失败');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">导入 / 导出</h1>
        <p className="text-slate-500 mt-1">备份和迁移你的数据</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 导出 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            导出数据
          </h2>
          
          <p className="text-slate-500 text-sm mb-4">
            将所有内容导出为文件，方便备份或迁移。
          </p>

          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileJson className="w-5 h-5 text-slate-600" />
              <div className="text-left">
                <div className="font-medium">导出为 JSON</div>
                <div className="text-xs text-slate-500">包含完整数据结构</div>
              </div>
            </button>

            <button
              onClick={handleExportMarkdown}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 text-slate-600" />
              <div className="text-left">
                <div className="font-medium">导出为 Markdown</div>
                <div className="text-xs text-slate-500">纯文本，适合阅读</div>
              </div>
            </button>
          </div>
        </div>

        {/* 导入 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-500" />
            导入数据
          </h2>
          
          <p className="text-slate-500 text-sm mb-4">
            从之前导出的 JSON 文件恢复数据。
          </p>

          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
            >
              <FileJson className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-700">{isImporting ? '导入中...' : '选择 JSON 文件'}</div>
                <div className="text-xs text-green-600">点击上传</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">💡 提示</p>
        <ul className="list-disc list-inside space-y-1">
          <li>JSON 格式包含完整数据，适合备份和恢复</li>
          <li>Markdown 格式仅包含已发布内容，适合阅读和分享</li>
          <li>数据库文件位于项目根目录的 mission-control.db</li>
        </ul>
      </div>
    </div>
  );
}
