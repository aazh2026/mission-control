import { getDB } from './db';

export interface Content {
  id: number;
  title: string;
  status: 'idea' | 'research' | 'writing' | 'editing' | 'scheduled' | 'published';
  source?: string;
  sourceTitle?: string;
  sourceContent?: string;
  aiSummary?: string;
  aiRelevance?: number;
  aiTags?: string[];
  aiOutline?: string;
  aiDraft?: string;
  aiNotes?: string;
  myDraft?: string;
  platformVersions?: Record<string, string>;
  scheduledAt?: number;
  publishedAt?: number;
  publishedUrls?: Record<string, string>;
  analytics?: { views: number; likes: number; comments: number; shares: number };
  createdAt: number;
  updatedAt: number;
}

export function getInbox(): any[] {
  const db = getDB();
  const stmt = db.prepare(`SELECT * FROM contents WHERE status = 'idea' ORDER BY COALESCE(ai_relevance, 0) DESC`);
  return stmt.all();
}

export function getAllContents(): any[] {
  const db = getDB();
  const stmt = db.prepare(`SELECT * FROM contents ORDER BY created_at DESC`);
  return stmt.all();
}

export function getPipeline(): Record<string, any[]> {
  const db = getDB();
  const statuses = ['research', 'writing', 'editing', 'scheduled', 'published'];
  const result: Record<string, any[]> = {};
  
  for (const status of statuses) {
    const stmt = db.prepare(`SELECT * FROM contents WHERE status = ? ORDER BY updated_at DESC`);
    result[status] = stmt.all(status);
  }
  
  return result;
}

export function createContent(data: Partial<Content>): number {
  const db = getDB();
  const now = Date.now();
  
  const stmt = db.prepare(`
    INSERT INTO contents (title, status, source, source_title, source_content,
      ai_summary, ai_relevance, ai_tags, ai_outline, ai_draft, ai_notes,
      created_at, updated_at)
    VALUES (?, 'idea', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.title || 'Untitled',
    data.source || null,
    data.sourceTitle || null,
    data.sourceContent || null,
    data.aiSummary || null,
    data.aiRelevance || null,
    data.aiTags ? JSON.stringify(data.aiTags) : null,
    data.aiOutline || null,
    data.aiDraft || null,
    data.aiNotes || null,
    now,
    now
  );
  
  return result.lastInsertRowid as number;
}

export function updateContentStatus(id: number, newStatus: Content['status']): void {
  const db = getDB();
  const stmt = db.prepare(`UPDATE contents SET status = ?, updated_at = ? WHERE id = ?`);
  stmt.run(newStatus, Date.now(), id);
}

export function updateContent(id: number, data: Partial<Content>): void {
  const db = getDB();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.myDraft !== undefined) { fields.push('my_draft = ?'); values.push(data.myDraft); }
  if (data.aiDraft !== undefined) { fields.push('ai_draft = ?'); values.push(data.aiDraft); }
  if (data.aiOutline !== undefined) { fields.push('ai_outline = ?'); values.push(data.aiOutline); }
  if (data.platformVersions !== undefined) { fields.push('platform_versions = ?'); values.push(JSON.stringify(data.platformVersions)); }
  if (data.scheduledAt !== undefined) { fields.push('scheduled_at = ?'); values.push(data.scheduledAt); }
  if (data.publishedAt !== undefined) { fields.push('published_at = ?'); values.push(data.publishedAt); }
  if (data.publishedUrls !== undefined) { fields.push('published_urls = ?'); values.push(JSON.stringify(data.publishedUrls)); }
  if (data.analytics !== undefined) { fields.push('analytics = ?'); values.push(JSON.stringify(data.analytics)); }
  
  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);
  
  const stmt = db.prepare(`UPDATE contents SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteContent(id: number): void {
  const db = getDB();
  const stmt = db.prepare('DELETE FROM contents WHERE id = ?');
  stmt.run(id);
}

export function getPlatformPosts(contentId: number): any[] {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT * FROM platform_posts WHERE content_id = ? ORDER BY created_at DESC'
  );
  return stmt.all(contentId);
}

export function createPlatformPost(data: {
  contentId: number;
  platform: string;
  status: string;
  draftId?: string;
  mediaId?: string;
  postUrl?: string;
}): number {
  const db = getDB();
  const stmt = db.prepare(
    `INSERT INTO platform_posts (content_id, platform, status, draft_id, media_id, post_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
    data.contentId,
    data.platform,
    data.status,
    data.draftId || null,
    data.mediaId || null,
    data.postUrl || null,
    Date.now()
  );
  return result.lastInsertRowid as number;
}

export function updatePlatformPost(mediaId: string, data: Partial<{
  status: string;
  postUrl: string;
  errorMessage: string;
  publishedAt: number;
}>): void {
  const db = getDB();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.postUrl !== undefined) { fields.push('post_url = ?'); values.push(data.postUrl); }
  if (data.errorMessage !== undefined) { fields.push('error_message = ?'); values.push(data.errorMessage); }
  if (data.publishedAt !== undefined) { fields.push('published_at = ?'); values.push(data.publishedAt); }
  
  if (fields.length === 0) return;
  
  values.push(mediaId);
  const stmt = db.prepare(`UPDATE platform_posts SET ${fields.join(', ')} WHERE media_id = ?`);
  stmt.run(...values);
}
