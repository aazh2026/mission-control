'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Plus,
  History,
  FileText,
  Edit3,
  Check,
  X
} from 'lucide-react';

interface WeChatPublishPanelProps {
  contentId: number;
  title: string;
  content: string;
  onPublish?: () => void;
}

interface ManualPost {
  id: string;
  content_id: number;
  platform: string;
  status: 'preparing' | 'published';
  post_url?: string;
  created_at: number;
  published_at?: number;
}

export default function WeChatPublishPanel({ 
  contentId, 
  title, 
  content,
  onPublish 
}: WeChatPublishPanelProps) {
  const [posts, setPosts] = useState<ManualPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMarkPublished, setShowMarkPublished] = useState(false);
  const [postUrl, setPostUrl] = useState('');

  // 获取发布历史
  useEffect(() => {
    fetchPosts();
  }, [contentId]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/platforms/wechat?action=posts&contentId=${contentId}`);
      const data = await res.json();
      setPosts(data || []);
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    }
  };

  // 生成微信格式 HTML
  const generateWeChatHTML = useCallback(() => {
    return convertToWeChatHTML(content, title);
  }, [content, title]);

  // 复制 HTML 到剪贴板
  const handleCopyHTML = async () => {
    const html = generateWeChatHTML();
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // 记录准备状态
      await recordPreparing();
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  // 记录准备状态
  const recordPreparing = async () => {
    try {
      await fetch('/api/platforms/wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'markPreparing',
          contentId,
        }),
      });
      fetchPosts();
    } catch (e) {
      console.error('Failed to record preparing:', e);
    }
  };

  // 标记为已发布
  const handleMarkPublished = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platforms/wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'markPublished',
          contentId,
          postUrl: postUrl || undefined,
        }),
      });
      
      if (res.ok) {
        setShowMarkPublished(false);
        setPostUrl('');
        fetchPosts();
        onPublish?.();
      }
    } catch (e) {
      console.error('Failed to mark published:', e);
    } finally {
      setLoading(false);
    }
  };

  // 主界面
  return (
    <div className="space-y-4">
      {/* 提示信息 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900">个人账号手动发布</p>
            <p className="text-sm text-blue-700 mt-1">
              个人订阅号无法调用 API，请按以下步骤手动发布：
            </p>
            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
              <li>点击「复制微信格式」生成适配的 HTML</li>
              <li>登录 mp.weixin.qq.com 进入编辑器</li>
              <li>粘贴内容，调整排版</li>
              <li>发布后回来点击「标记为已发布」</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyHTML}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '已复制!' : '复制微信格式'}
        </button>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
        >
          <FileText className="w-4 h-4" />
          {showPreview ? '隐藏预览' : '预览格式'}
        </button>
        
        <button
          onClick={() => setShowMarkPublished(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <CheckCircle className="w-4 h-4" />
          标记为已发布
        </button>
      </div>

      {/* 格式预览 */}
      {showPreview && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 flex items-center justify-between">
            <span>微信格式预览</span>
            <button 
              onClick={handleCopyHTML}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              {copied ? '已复制' : '复制全部'}
            </button>
          </div>
          <div className="p-4 bg-white">
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: generateWeChatHTML() }}
            />
          </div>
        </div>
      )}

      {/* 标记为已发布对话框 */}
      {showMarkPublished && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-900">标记发布状态</h4>
            <button 
              onClick={() => setShowMarkPublished(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                文章链接（可选）
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://mp.weixin.qq.com/s/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowMarkPublished(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm"
              >
                取消
              </button>
              <button
                onClick={handleMarkPublished}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                {loading ? '保存中...' : <><Check className="w-4 h-4" /> 确认标记</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 发布历史 */}
      {posts.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            发布历史
          </h4>
          <div className="space-y-2">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {post.status === 'published' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Edit3 className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={`text-sm ${
                    post.status === 'published' ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {post.status === 'published' ? '已发布' : '准备中'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                
                {post.post_url && (
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    查看文章
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Markdown 转微信图文格式
function convertToWeChatHTML(content: string, title: string): string {
  // 先处理代码块（避免内部的 markdown 被处理）
  const codeBlocks: string[] = [];
  let html = content.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
    codeBlocks.push(code);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 处理标题
  html = html
    .replace(/^# (.+)$/gm, '<h2 style="font-size: 24px; font-weight: bold; margin: 24px 0 16px; color: #333;">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 12px; color: #333;">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size: 18px; font-weight: bold; margin: 16px 0 10px; color: #333;">$1</h4>');

  // 处理粗体和斜体
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>');

  // 处理链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #576b95; text-decoration: none;">$1</a>');

  // 处理列表
  html = html.replace(/^- (.+)$/gm, '<li style="margin: 8px 0; line-height: 1.8;">$1</li>');
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ul style="margin: 12px 0; padding-left: 20px;">$&</ul>');

  // 处理引用
  html = html.replace(/^\> (.+)$/gm, '<blockquote style="border-left: 4px solid #ddd; padding-left: 16px; margin: 16px 0; color: #666; font-style: italic;">$1</blockquote>');

  // 处理分隔线
  html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">');

  // 恢复代码块
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    const code = codeBlocks[parseInt(index)];
    return `<pre style="background: #f8f9fa; padding: 16px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.6; margin: 16px 0;"><code style="font-family: monospace;">${escapeHtml(code)}</code></pre>`;
  });

  // 处理行内代码
  html = html.replace(/`(.+?)`/g, '<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">$1</code>');

  // 处理段落和换行
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    // 如果已经是块级元素，不再包裹
    if (p.match(/^<(h[2-4]|pre|ul|blockquote|hr)/)) {
      return p;
    }
    // 处理段落内的换行
    p = p.replace(/\n/g, '<br>');
    return `<p style="margin: 12px 0; line-height: 1.8; color: #333; font-size: 16px;">${p}</p>`;
  }).join('\n\n');

  // 添加文章标题
  const titleHtml = `<h1 style="font-size: 28px; font-weight: bold; margin: 0 0 24px; color: #333; line-height: 1.4;">${escapeHtml(title)}</h1>`;

  return `<section style="padding: 20px;">\n${titleHtml}\n${html}\n</section>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
