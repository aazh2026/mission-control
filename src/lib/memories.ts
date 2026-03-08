import { getDB } from './db';

export interface Memory {
  id: number;
  content: string;
  type: 'insight' | 'fact' | 'decision' | 'preference';
  sourceContentId?: number;
  tags: string[];
  createdAt: number;
}

export function getAllMemories(): any[] {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM memories ORDER BY created_at DESC');
  return stmt.all();
}

export function createMemory(data: Omit<Memory, 'id' | 'createdAt'>): number {
  const db = getDB();
  
  const stmt = db.prepare(`
    INSERT INTO memories (content, type, source_content_id, tags, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.content,
    data.type,
    data.sourceContentId || null,
    data.tags ? JSON.stringify(data.tags) : '[]',
    Date.now()
  );
  
  return result.lastInsertRowid as number;
}

export function deleteMemory(id: number): void {
  const db = getDB();
  const stmt = db.prepare('DELETE FROM memories WHERE id = ?');
  stmt.run(id);
}
