'use client';

import { useState, useRef, useMemo } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { useInboxShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Inbox, Plus, Sparkles, ArrowRight, Trash2, Database, RefreshCw, Rss, Filter, CheckSquare, Square, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function InboxPage() {
  const { data: contents, error, isLoading, refetch } = useApiQuery<any[]>('/api/contents?type=inbox');
  const { mutate: create, isLoading: isCreating } = useApiMutation('/api/contents', 'POST');
  const { mutate: remove } = useApiMutation('/api/contents?id=', 'DELETE');
  const { mutate: batchUpdate } = useApiMutation('/api/contents/batch', 'PATCH');
  const { mutate: seed } = useApiMutation('/api/seed', 'POST');
  const { mutate: fetchRss, isLoading: isFetching } = useApiMutation('/api/rss/fetch', 'POST');
  
  const [newTitle, setNewTitle] = useState('');
  const [seeded, setSeeded] = useState(false);
  const [fetchResult, setFetchResult] = useState<{ added: number; articles: string[] } | null>(null);
  
  // 筛选状态
  const [filterRelevance, setFilterRelevance] = useState<number | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // 批量操作状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 快捷键：n 聚焦输入框
  useInboxShortcuts(() => {
    inputRef.current?.focus();
  });

  // 提取所有可用标签和来源
  const { allTags, allSources } = useMemo(() => {
    const tags = new Set<string>();
    const sources = new Set<string>();
    contents?.forEach((c) => {
      if (c.ai_tags) {
        try {
          JSON.parse(c.ai_tags).forEach((t: string) => tags.add(t));
        } catch {}
      }
      if (c.source) {
        try {
          const hostname = new URL(c.source).hostname;
          sources.add(hostname);
        } catch {}
      }
    });
    return { allTags: Array.from(tags), allSources: Array.from(sources) };
  }, [contents]);

  // 筛选后的内容
  const filteredContents = useMemo(() => {
    if (!contents) return [];
    return contents.filter((c) => {
      if (filterRelevance && (c.ai_relevance || 0) < filterRelevance) return false;
      if (filterTag) {
        try {
          const tags = JSON.parse(c.ai_tags || '[]');
          if (!tags.includes(filterTag)) return false;
        } catch {
          return false;
        }
      }
      if (filterSource && c.source) {
        try {
          if (!c.source.includes(filterSource)) return false;
        } catch {}
      }
      return true;
    });
  }, [contents, filterRelevance, filterTag, filterSource]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await create({ title: newTitle, aiRelevance: 5 });
    setNewTitle('');
    refetch();
  };

  const handleDelete = async (id: number) => {
    await remove(null, `/api/contents?id=${id}`);
    refetch();
  };

  const handleSeed = async () => {
    await seed();
    setSeeded(true);
    refetch();
  };

  const handleFetchRss = async () => {
    setFetchResult(null);
    const result = await fetchRss();
    setFetchResult(result);
    refetch();
  };

  // 批量操作
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredContents.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (!confirm(`确定删除选中的 ${selectedIds.size} 篇文章？`)) return;
    for (const id of selectedIds) {
      await remove(null, `/api/contents?id=${id}`);
    }
    setSelectedIds(new Set());
    setIsBatchMode(false);
    refetch();
  };

  const handleBatchMove = async (status: string) => {
    await batchUpdate({ ids: Array.from(selectedIds), status });
    setSelectedIds(new Set());
    setIsBatchMode(false);
    refetch();
  };

  const clearFilters = () => {
    setFilterRelevance(null);
    setFilterTag(null);
    setFilterSource(null);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 8) return 'bg-red-500';
    if (score >= 6) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const hasFilters = filterRelevance || filterTag || filterSource;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-blue-500" />
            Inbox
          </h1>
          <p className="text-slate-500 mt-1">
            选题想法和内容源
            {hasFilters && (
              <span className="ml-2 text-blue-600">
                (筛选后 {filteredContents.length} 篇)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleFetchRss}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <Rss className="w-4 h-4" />
            {isFetching ? '抓取中...' : '抓取 RSS'}
          </button>

          {!seeded && contents?.length === 0 && (
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Database className="w-4 h-4" />
              加载示例数据
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showFilters || hasFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
            {hasFilters && <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">!</span>}
          </button>

          <div className="text-sm text-slate-500">
            {contents?.length || 0} 个待处理
          </div>
        </div>
      </div>

      {/* RSS Fetch Result */}
      {fetchResult && (
        <div className={`p-4 rounded-lg ${fetchResult.added > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
          <div className="flex items-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4" />
            {fetchResult.added > 0 ? `新增 ${fetchResult.added} 篇文章` : '没有新文章'}
          </div>
          {fetchResult.articles.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {fetchResult.articles.slice(0, 3).map((title, i) => (
                <li key={i} className="truncate">{title}</li>
              ))}
              {fetchResult.articles.length > 3 && <li>...还有 {fetchResult.articles.length - 3} 篇</li>}
            </ul>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选条件
            </h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                清除筛选
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* 相关度筛选 */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">相关度最低分</label>
              <div className="flex gap-2">
                {[null, 6, 7, 8].map((score) => (
                  <button
                    key={score ?? 'all'}
                    onClick={() => setFilterRelevance(score)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filterRelevance === score
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {score ?? '全部'}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签筛选 */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">标签</label>
              <select
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部标签</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* 来源筛选 */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">来源</label>
              <select
                value={filterSource || ''}
                onChange={(e) => setFilterSource(e.target.value || null)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部来源</option>
                {allSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Batch Operations Bar */}
      {isBatchMode && (
        <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-700">
              已选择 <strong>{selectedIds.size}</strong> 篇
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              全选
            </button>
            <button
              onClick={deselectAll}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              清空
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 mr-2">批量操作:</span>
            <button
              onClick={() => handleBatchMove('research')}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              移到 Research
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              删除
            </button>
            <button
              onClick={() => {
                setIsBatchMode(false);
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="快速添加选题想法... (⌘K 或 N 聚焦)"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!newTitle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
              <span className="text-xs text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">N</span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      </form>

      {/* Batch Mode Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setIsBatchMode(!isBatchMode);
            if (isBatchMode) setSelectedIds(new Set());
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isBatchMode
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBatchMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          批量操作
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-500 mt-2">加载中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          加载失败: {error.message}
        </div>
      )}

      {/* Content List */}
      <div className="space-y-3">
        {filteredContents?.map((content) => (
          <div
            key={content.id}
            className={`bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow ${
              isBatchMode ? 'cursor-pointer' : ''
            } ${selectedIds.has(content.id) ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => isBatchMode && toggleSelection(content.id)}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox in batch mode */}
              {isBatchMode && (
                <div className="pt-2">
                  {selectedIds.has(content.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              )}

              {/* Relevance Badge */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRelevanceColor(
                    content.ai_relevance || 0
                  )}`}
                >
                  {content.ai_relevance || '-'}
                </div>
                <span className="text-xs text-slate-400 mt-1">相关度</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{content.title}</h3>
                    {content.source && (
                      <p className="text-xs text-slate-400 mt-1">
                        来源: {new URL(content.source).hostname}
                      </p>
                    )}
                  </div>
                  
                  {!isBatchMode && (
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* AI Summary */}
                {content.ai_summary && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-1">
                      <Sparkles className="w-4 h-4" />
                      AI 摘要
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-3">{content.ai_summary}</p>
                  </div>
                )}

                {/* Tags */}
                {content.ai_tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {JSON.parse(content.ai_tags || '[]').map((tag: string) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded-full ${
                          filterTag === tag
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterTag(filterTag === tag ? null : tag);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {!isBatchMode && (
                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      href={`/pipeline?id=${content.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      开始创作
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    
                    {content.ai_notes && (
                      <span className="text-xs text-slate-400">
                        💡 {content.ai_notes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!isLoading && filteredContents?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {hasFilters ? '没有符合筛选条件的文章' : 'Inbox 为空'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
