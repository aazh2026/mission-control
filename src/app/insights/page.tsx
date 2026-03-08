'use client';

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/useApi';
import { BarChart3, TrendingUp, TrendingDown, Search, Sparkles, Calendar, Clock, Target, BookOpen, Zap, Activity, MessageCircle, Share2 } from 'lucide-react';

export default function InsightsPage() {
  const { data: contents } = useApiQuery<any[]>('/api/contents');
  const { data: memories } = useApiQuery<any[]>('/api/memories');
  const { data: platformPosts } = useApiQuery<any[]>('/api/platforms/wechat?action=posts');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // 计算真实统计数据
  const stats = useMemo(() => {
    if (!contents) return null;

    const now = Date.now();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };
    const cutoff = now - ranges[timeRange];

    const filtered = contents.filter((c) => c.created_at >= cutoff);

    // 状态分布
    const byStatus: Record<string, number> = {
      idea: 0,
      research: 0,
      writing: 0,
      editing: 0,
      scheduled: 0,
      published: 0,
    };
    filtered.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });

    // 本周vs上周
    const thisWeekStart = now - 7 * 24 * 60 * 60 * 1000;
    const lastWeekStart = now - 14 * 24 * 60 * 60 * 1000;
    
    const thisWeekCount = contents.filter((c) => c.created_at >= thisWeekStart).length;
    const lastWeekCount = contents.filter(
      (c) => c.created_at >= lastWeekStart && c.created_at < thisWeekStart
    ).length;
    
    const weekGrowth = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : 0;

    // 发布统计
    const publishedCount = contents.filter((c) => c.status === 'published').length;
    const publishedThisWeek = contents.filter(
      (c) => c.status === 'published' && c.created_at >= thisWeekStart
    ).length;

    // 平均相关度
    const avgRelevance = filtered.length > 0
      ? Math.round(filtered.reduce((sum, c) => sum + (c.ai_relevance || 0), 0) / filtered.length)
      : 0;

    // 来源分布
    const bySource: Record<string, number> = {};
    filtered.forEach((c) => {
      if (c.source) {
        try {
          const hostname = new URL(c.source).hostname;
          bySource[hostname] = (bySource[hostname] || 0) + 1;
        } catch {}
      }
    });

    // 标签统计
    const tagCounts: Record<string, number> = {};
    filtered.forEach((c) => {
      if (c.ai_tags) {
        try {
          JSON.parse(c.ai_tags).forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        } catch {}
      }
    });

    // 创作效率：平均每个阶段停留时间（简化估算）
    const inProgressCount = 
      (byStatus.research || 0) + 
      (byStatus.writing || 0) + 
      (byStatus.editing || 0);

    // 平台发布统计
    const platformStats: Record<string, { draft: number; published: number }> = {};
    if (platformPosts) {
      platformPosts.forEach((post: any) => {
        if (!platformStats[post.platform]) {
          platformStats[post.platform] = { draft: 0, published: 0 };
        }
        if (post.status === 'published') {
          platformStats[post.platform].published++;
        } else {
          platformStats[post.platform].draft++;
        }
      });
    }

    return {
      total: filtered.length,
      byStatus,
      weekGrowth,
      publishedCount,
      publishedThisWeek,
      avgRelevance,
      bySource: Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 10),
      tagCounts: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20),
      inProgressCount,
      completionRate: filtered.length > 0 
        ? Math.round((byStatus.published / filtered.length) * 100) 
        : 0,
      platformPosts: platformStats,
      totalPublished: publishedCount,
    };
  }, [contents, timeRange, platformPosts]);

  // 生成AI周报
  const weeklyReport = useMemo(() => {
    if (!stats) return null;

    const highlights: string[] = [];
    const suggestions: string[] = [];

    if (stats.weekGrowth > 0) {
      highlights.push(`本周新增 ${stats.weekGrowth}% 内容，创作节奏良好`);
    }

    if (stats.byStatus.idea > 20) {
      highlights.push(`Inbox 积压 ${stats.byStatus.idea} 篇，建议清理筛选`);
    }

    if (stats.avgRelevance >= 7) {
      highlights.push(`平均相关度 ${stats.avgRelevance}/10，选题质量优秀`);
    }

    if (stats.completionRate < 20) {
      suggestions.push('完成率偏低，建议将高相关度文章推进到写作阶段');
    }

    if (stats.byStatus.writing > 5) {
      suggestions.push(`Writing 阶段积压 ${stats.byStatus.writing} 篇，建议集中时间完成`);
    }

    if (stats.bySource[0]) {
      suggestions.push(`${stats.bySource[0][0]} 是主要灵感来源，可以拓展类似信源`);
    }

    return {
      summary: `共 ${stats.total} 篇内容，${stats.completionRate}% 已发布，平均相关度 ${stats.avgRelevance}/10`,
      highlights: highlights.slice(0, 3),
      suggestions: suggestions.slice(0, 3),
    };
  }, [stats]);

  // 过滤记忆
  const filteredMemories = useMemo(() => {
    if (!memories || !searchQuery) return memories?.slice(0, 5) || [];
    return memories.filter(
      (m) =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [memories, searchQuery]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Insights
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range === '7d' && '7天'}
              {range === '30d' && '30天'}
              {range === '90d' && '90天'}
              {range === 'all' && '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* AI Weekly Report */}
      {weeklyReport && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold">AI 数据周报</h2>
            <span className="ml-auto text-sm text-white/70">
              {new Date().toLocaleDateString('zh-CN')}
            </span>
          </div>
          
          <p className="text-blue-100 mb-4 text-lg">{weeklyReport.summary}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                本周亮点
              </h3>
              <ul className="space-y-2 text-sm text-blue-100">
                {weeklyReport.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
                {weeklyReport.highlights.length === 0 && (
                  <li className="text-white/50">暂无突出亮点</li>
                )}
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                优化建议
              </h3>
              <ul className="space-y-2 text-sm text-blue-100">
                {weeklyReport.suggestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>→</span>
                    <span>{item}</span>
                  </li>
                ))}
                {weeklyReport.suggestions.length === 0 && (
                  <li className="text-white/50">保持当前节奏即可</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4" />
            总内容
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {stats.weekGrowth >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500">+{stats.weekGrowth}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500">{stats.weekGrowth}%</span>
              </>
            )}
            <span className="text-slate-400">本周</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Target className="w-4 h-4" />
            平均相关度
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{stats.avgRelevance}/10</div>
          <div className="mt-2">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${stats.avgRelevance * 10}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="w-4 h-4" />
            完成率
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{stats.completionRate}%</div>
          <div className="text-sm text-slate-400 mt-2">
            {stats.publishedCount} 篇已发布
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            进行中
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{stats.inProgressCount}</div>
          <div className="text-sm text-slate-400 mt-2">
            创作pipeline中
          </div>
        </div>
      </div>

      {/* Pipeline Status Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Pipeline 状态分布
        </h2>
        
        <div className="flex items-end gap-4 h-40">
          {[
            { key: 'idea', label: 'Idea', color: 'bg-slate-400' },
            { key: 'research', label: 'Research', color: 'bg-purple-500' },
            { key: 'writing', label: 'Writing', color: 'bg-blue-500' },
            { key: 'editing', label: 'Editing', color: 'bg-amber-500' },
            { key: 'scheduled', label: 'Scheduled', color: 'bg-green-500' },
            { key: 'published', label: 'Published', color: 'bg-slate-600' },
          ].map((item) => {
            const count = stats.byStatus[item.key] || 0;
            const max = Math.max(...Object.values(stats.byStatus));
            const height = max > 0 ? (count / max) * 100 : 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            
            return (
              <div key={item.key} className="flex-1 flex flex-col items-center">
                <div className="text-lg font-bold text-slate-700 mb-1">{count}</div>
                <div className={`w-full ${item.color} rounded-t transition-all duration-500`} 
                     style={{ height: `${Math.max(height, 5)}%` }} 
                />
                <div className="text-xs text-slate-500 mt-2 text-center">{item.label}</div>
                <div className="text-xs text-slate-400">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Publishing Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-500" />
          平台发布统计
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* WeChat */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">微信公众号</span>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-3xl font-bold text-green-900">
                  {stats.platformPosts?.wechat?.published || 0}
                </div>
                <div className="text-sm text-green-600">已发布</div>
              </div>
              <div className="text-2xl font-bold text-green-700/50">
                {stats.platformPosts?.wechat?.draft || 0}
              </div>
              <div className="text-sm text-green-600/70">草稿</div>
            </div>
            <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ 
                  width: `${stats.platformPosts?.wechat?.published + stats.platformPosts?.wechat?.draft > 0
                    ? (stats.platformPosts?.wechat?.published / (stats.platformPosts?.wechat?.published + stats.platformPosts?.wechat?.draft)) * 100
                    : 0}%` 
                }}
              />
            </div>
          </div>
          
          {/* Total Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">发布效率</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">已发布文章</span>
                <span className="text-xl font-bold text-blue-900">{stats.totalPublished || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">发布转化率</span>
                <span className="text-xl font-bold text-blue-900">
                  {stats.total > 0 ? Math.round((stats.totalPublished / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tags Cloud */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            热门标签
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.tagCounts.map(([tag, count]) => {
              // 根据数量计算字体大小
              const maxCount = stats.tagCounts[0]?.[1] || 1;
              const sizeLevel = Math.ceil((count / maxCount) * 3);
              const sizes = ['text-sm', 'text-base', 'text-lg'];
              const colors = ['bg-slate-100', 'bg-blue-50', 'bg-purple-50'];
              
              return (
                <div
                  key={tag}
                  className={`flex items-center gap-1.5 px-3 py-1.5 ${colors[sizeLevel - 1]} rounded-full transition-all hover:scale-105`}
                >
                  <span className={`${sizes[sizeLevel - 1]} font-medium text-slate-700`}>{tag}</span>
                  <span className="text-xs text-slate-400">{count}</span>
                </div>
              );
            })}
            {stats.tagCounts.length === 0 && (
              <p className="text-slate-400 text-sm">暂无标签数据</p>
            )}
          </div>
        </div>

        {/* Top Sources */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            主要来源
          </h2>
          <div className="space-y-3">
            {stats.bySource.map(([source, count], i) => (
              <div key={source} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 truncate max-w-[200px]">{source}</span>
                    <span className="text-sm text-slate-500">{count}篇</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(count / (stats.bySource[0]?.[1] || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.bySource.length === 0 && (
              <p className="text-slate-400 text-sm">暂无来源数据</p>
            )}
          </div>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500" />
          知识库搜索
        </h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索记忆..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          {filteredMemories?.map((memory: any) => (
            <div key={memory.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <p className="text-sm text-slate-700">{memory.content}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">{memory.type}</span>
                {(memory.tags ? JSON.parse(memory.tags) : []).map((tag: string) => (
                  <span key={tag} className="text-xs text-slate-400">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
          {(!filteredMemories || filteredMemories.length === 0) && (
            <p className="text-center text-slate-400 py-8">{searchQuery ? '未找到匹配的记忆' : '暂无记忆'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
