'use client';

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { 
  GitBranch, 
  ChevronRight, 
  Sparkles, 
  X, 
  Lightbulb, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  MessageCircle,
  Send
} from 'lucide-react';

// 懒加载 WeChat 发布面板
const WeChatPublishPanel = lazy(() => import('@/components/WeChatPublishPanel'));

const STAGES = [
  { key: 'research', label: 'Research', color: 'bg-purple-500', icon: '🔍' },
  { key: 'writing', label: 'Writing', color: 'bg-blue-500', icon: '✍️' },
  { key: 'editing', label: 'Editing', color: 'bg-amber-500', icon: '🎨' },
  { key: 'scheduled', label: 'Scheduled', color: 'bg-green-500', icon: '📅' },
  { key: 'published', label: 'Published', color: 'bg-slate-500', icon: '🚀' },
];

// 智能建议生成器
function generateSuggestions(content: any, currentStage: string): string[] {
  const suggestions: string[] = [];
  
  if (currentStage === 'research') {
    if (!content.ai_outline) {
      suggestions.push('💡 使用AI生成文章大纲，梳理核心观点');
    }
    if (content.source) {
      suggestions.push('📚 补充3-5个相关来源，增强论证深度');
    }
    suggestions.push('🎯 明确核心受众和传播平台');
  }
  
  if (currentStage === 'writing') {
    if (!content.my_draft && !content.ai_draft) {
      suggestions.push('✍️ 基于AI大纲开始写初稿');
    }
    if (content.title?.length > 60) {
      suggestions.push('⚠️ 标题过长，建议控制在40字以内');
    }
    suggestions.push('📝 每段一个观点，保持信息密度');
  }
  
  if (currentStage === 'editing') {
    suggestions.push('🔍 检查标题吸引力，添加hook');
    suggestions.push('📊 添加数据/案例支撑观点');
    suggestions.push('🎨 为不同平台准备版本');
  }
  
  if (currentStage === 'scheduled') {
    if (!content.scheduled_at) {
      suggestions.push('⏰ 选择最佳发布时间（周三21:00效果最佳）');
    }
    suggestions.push('📱 提前准备社交媒体预热文案');
    suggestions.push('💬 配置微信公众号发布');
  }
  
  // 通用建议
  if (content.ai_relevance >= 8) {
    suggestions.unshift('🔥 高相关度文章，建议优先处理');
  }
  
  return suggestions.slice(0, 3);
}

// 拖拽hook
function useDragAndDrop(onDrop: (contentId: number, fromStage: string, toStage: string) => void) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const dragRef = useRef<{ id: number; fromStage: string } | null>(null);

  const handleDragStart = useCallback((contentId: number, fromStage: string) => {
    setDraggingId(contentId);
    dragRef.current = { id: contentId, fromStage };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDragOverStage(stageKey);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    setDraggingId(null);
    
    if (dragRef.current && dragRef.current.fromStage !== toStage) {
      onDrop(dragRef.current.id, dragRef.current.fromStage, toStage);
    }
    dragRef.current = null;
  }, [onDrop]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverStage(null);
    dragRef.current = null;
  }, []);

  return {
    draggingId,
    dragOverStage,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}

// 数据获取hook
function usePipelineData() {
  const [data, setData] = useState<Record<string, any[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastMoved, setLastMoved] = useState<{ id: number; from: string; to: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contents?type=pipeline');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 乐观更新：移动卡片
  const moveCard = useCallback((contentId: number, fromStage: string, toStage: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const content = prev[fromStage]?.find((c) => c.id === contentId);
      if (!content) return prev;

      const newData = { ...prev };
      newData[fromStage] = prev[fromStage].filter((c) => c.id !== contentId);
      newData[toStage] = [{ ...content, status: toStage }, ...(prev[toStage] || [])];
      return newData;
    });
    setLastMoved({ id: contentId, from: fromStage, to: toStage });
  }, []);

  // 撤销移动
  const undoMove = useCallback(() => {
    if (!lastMoved) return;
    moveCard(lastMoved.id, lastMoved.to, lastMoved.from);
    setLastMoved(null);
  }, [lastMoved, moveCard]);

  const refetch = fetchData;

  return { data, isLoading, error, moveCard, refetch, lastMoved, undoMove };
}

export default function PipelinePage() {
  const { data: pipeline, isLoading, moveCard, refetch, lastMoved, undoMove } = usePipelineData();
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

  // 拖拽处理
  const handleDrop = useCallback(async (contentId: number, fromStage: string, toStage: string) => {
    if (fromStage === toStage) return;
    
    // 1. 立即更新 UI（乐观更新）
    moveCard(contentId, fromStage, toStage);
    setMovingId(contentId);

    // 2. 后台 API 调用
    try {
      const res = await fetch(`/api/contents?id=${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toStage }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.error('Move failed:', e);
      refetch(); // 失败时回滚
    } finally {
      setMovingId(null);
    }
  }, [moveCard, refetch]);

  const {
    draggingId,
    dragOverStage,
    handleDragStart,
    handleDragOver,
    handleDrop: onDrop,
    handleDragEnd,
  } = useDragAndDrop(handleDrop);

  // 传统按钮推进
  const handleMove = async (contentId: number, currentStage: string) => {
    const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
    const nextStage = STAGES[currentIndex + 1]?.key;
    if (!nextStage) return;
    await handleDrop(contentId, currentStage, nextStage);
  };

  // 批量推进
  const [selectedForBatch, setSelectedForBatch] = useState<Set<number>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  const toggleSelection = (id: number) => {
    setSelectedForBatch((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBatchMove = async (stageKey: string) => {
    for (const id of selectedForBatch) {
      const currentStage = Object.keys(pipeline || {}).find((key) =>
        pipeline?.[key]?.some((c: any) => c.id === id)
      );
      if (currentStage && currentStage !== stageKey) {
        await handleDrop(id, currentStage, stageKey);
      }
    }
    setSelectedForBatch(new Set());
    setIsBatchMode(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-blue-500" />
            Pipeline
          </h1>
          <p className="text-slate-500 mt-1">拖拽卡片移动，点击编辑，AI智能建议</p>
        </div>

        <div className="flex items-center gap-3">
          {lastMoved && (
            <button
              onClick={undoMove}
              className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
            >
              <X className="w-4 h-4" />
              撤销移动
            </button>
          )}
          <button
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) setSelectedForBatch(new Set());
            }}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              isBatchMode ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isBatchMode ? '退出批量' : '批量操作'}
          </button>
        </div>
      </div>

      {/* Batch Operations */}
      {isBatchMode && selectedForBatch.size > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-slate-700">已选择 {selectedForBatch.size} 篇</span>
          <div className="flex gap-2">
            {STAGES.map((stage) => (
              <button
                key={stage.key}
                onClick={() => handleBatchMove(stage.key)}
                className={`px-3 py-1.5 text-sm rounded-lg ${stage.color} text-white`}
              >
                移到 {stage.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className={`min-w-[300px] flex-shrink-0 transition-all ${
              dragOverStage === stage.key ? 'scale-105' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDrop={(e) => onDrop(e, stage.key)}
          >
            <div className={`${stage.color} text-white px-4 py-2 rounded-t-lg font-medium flex items-center justify-between`}>
              <span>{stage.icon} {stage.label}</span>
              <span className="text-white/80">{pipeline?.[stage.key]?.length || 0}</span>
            </div>
            
            <div className={`bg-slate-100 rounded-b-lg p-3 space-y-3 min-h-[500px] transition-colors ${
              dragOverStage === stage.key ? 'bg-blue-50 ring-2 ring-blue-300' : ''
            }`}>
              {pipeline?.[stage.key]?.map((content: any) => (
                <div
                  key={content.id}
                  draggable={!isBatchMode}
                  onDragStart={() => handleDragStart(content.id, stage.key)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (isBatchMode) toggleSelection(content.id);
                    else setSelectedContent(content);
                  }}
                  className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-all ${
                    draggingId === content.id ? 'opacity-50' : ''
                  } ${
                    isBatchMode && selectedForBatch.has(content.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-slate-900 text-sm line-clamp-2">{content.title}</h4>
                    {content.ai_relevance >= 8 && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex-shrink-0">
                        🔥{content.ai_relevance}
                      </span>
                    )}
                  </div>
                  
                  {content.ai_tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {JSON.parse(content.ai_tags || '[]').slice(0, 2).map((tag: string) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* AI Suggestions Preview */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSuggestions(showSuggestions === content.id ? null : content.id);
                      }}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                      <Lightbulb className="w-3 h-3" />
                      AI建议
                    </button>
                    
                    {showSuggestions === content.id && (
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        {generateSuggestions(content, stage.key).map((suggestion, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {stage.key !== 'published' && !isBatchMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(content.id, stage.key);
                        }}
                        disabled={movingId === content.id}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {movingId === content.id ? '移动中...' : <>推进<ChevronRight className="w-3 h-3" /></>}
                      </button>
                    )}
                    
                    {content.scheduled_at && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(content.scheduled_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedContent && (
        <EditModal
          content={selectedContent}
          suggestions={generateSuggestions(selectedContent, selectedContent.status)}
          onClose={() => setSelectedContent(null)}
          onUpdate={(id, data) => {
            // Update logic
            fetch(`/api/contents?id=${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            }).then(() => refetch());
          }}
          onPublish={() => {
            refetch();
            setSelectedContent(null);
          }}
        />
      )}
    </div>
  );
}

// 编辑弹窗组件
function EditModal({ 
  content, 
  suggestions,
  onClose, 
  onUpdate,
  onPublish
}: { 
  content: any; 
  suggestions: string[];
  onClose: () => void; 
  onUpdate: (id: number, data: any) => void;
  onPublish: () => void;
}) {
  const [draft, setDraft] = useState(content.my_draft || content.ai_draft || '');
  const [outline, setOutline] = useState(content.ai_outline || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'draft' | 'outline' | 'suggestions' | 'publish'>('draft');

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(content.id, { myDraft: draft, aiOutline: outline });
    setSaving(false);
    onClose();
  };

  const tabs = [
    { key: 'draft', label: '我的稿件', icon: '✍️' },
    { key: 'outline', label: 'AI大纲', icon: '📋' },
    { key: 'suggestions', label: '智能建议', icon: '💡' },
    { key: 'publish', label: '公众号发布', icon: '💬' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{content.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                {content.ai_relevance && (
                  <span className="text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    相关度: {content.ai_relevance}/10
                  </span>
                )}
                {content.source && (
                  <a 
                    href={content.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    查看原文
                  </a>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b">
            {tabs.map((tab: any) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'draft' && (
            <div>
              {content.ai_summary && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-1">
                    <Sparkles className="w-4 h-4" />
                    AI摘要
                  </div>
                  <p className="text-sm text-slate-700">{content.ai_summary}</p>
                </div>
              )}
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="在这里编辑你的文章..."
                className="w-full h-64 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {activeTab === 'outline' && (
            <div>
              {content.ai_outline ? (
                <pre className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">{content.ai_outline}</pre>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  <p>还没有AI大纲</p>
                  <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm">
                    生成大纲
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">{suggestion}</p>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  预期表现
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-slate-500">预计阅读</div>
                    <div className="text-xl font-bold text-slate-900">1,200</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-slate-500">互动率</div>
                    <div className="text-xl font-bold text-slate-900">8.5%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-slate-500">最佳发布时间</div>
                    <div className="text-xl font-bold text-slate-900">周三21:00</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'publish' && (
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
              </div>
            }>
              <WeChatPublishPanel
                contentId={content.id}
                title={content.title}
                content={draft || content.ai_summary || ''}
                onPublish={onPublish}
              />
            </Suspense>
          )}

          {activeTab !== 'publish' && (
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
