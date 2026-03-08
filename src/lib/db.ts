import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径
const DB_PATH = path.join(process.cwd(), 'mission-control.db');

// 确保目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 单例数据库连接
let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

// 初始化数据库表
function initSchema() {
  const database = getDB();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'idea',
      source TEXT,
      source_title TEXT,
      source_content TEXT,
      ai_summary TEXT,
      ai_relevance INTEGER,
      ai_tags TEXT,
      ai_outline TEXT,
      ai_draft TEXT,
      ai_notes TEXT,
      my_draft TEXT,
      platform_versions TEXT,
      scheduled_at INTEGER,
      published_at INTEGER,
      published_urls TEXT,
      analytics TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
    CREATE INDEX IF NOT EXISTS idx_contents_created ON contents(created_at);

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'insight',
      source_content_id INTEGER,
      tags TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content_id INTEGER,
      payload TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

    CREATE TABLE IF NOT EXISTS rss_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      last_fetched_at INTEGER,
      fetch_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS platform_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL UNIQUE,
      config TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE TABLE IF NOT EXISTS platform_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      draft_id TEXT,
      post_url TEXT,
      media_id TEXT,
      error_message TEXT,
      scheduled_at INTEGER,
      published_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      FOREIGN KEY (content_id) REFERENCES contents(id)
    );

    CREATE INDEX IF NOT EXISTS idx_platform_posts_content ON platform_posts(content_id);
    CREATE INDEX IF NOT EXISTS idx_platform_posts_platform ON platform_posts(platform);
  `);
}
