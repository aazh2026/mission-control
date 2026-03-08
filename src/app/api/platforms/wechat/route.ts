import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// GET: 获取微信公众号配置或检查状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    const db = getDB();
    
    if (action === 'config') {
      // 获取配置（不含敏感信息）
      const config = db.prepare('SELECT platform, enabled FROM platform_configs WHERE platform = ?').get('wechat');
      return NextResponse.json({ 
        configured: !!config,
        enabled: config?.enabled === 1 
      });
    }
    
    if (action === 'posts') {
      const contentId = searchParams.get('contentId');
      if (!contentId) {
        return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
      }
      
      const posts = db.prepare(
        'SELECT * FROM platform_posts WHERE content_id = ? AND platform = ? ORDER BY created_at DESC'
      ).all(contentId, 'wechat');
      
      return NextResponse.json(posts);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('WeChat GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: 创建草稿或发布
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contentId } = body;
    
    if (!contentId) {
      return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
    }
    
    const db = getDB();
    
    // 检查数据库中是否存在表
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='platform_posts'"
    ).get();
    
    if (!tableExists) {
      // 如果表不存在，创建表
      db.exec(`
        CREATE TABLE IF NOT EXISTS platform_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content_id INTEGER NOT NULL,
          platform TEXT NOT NULL,
          status TEXT NOT NULL,
          draft_id TEXT,
          media_id TEXT,
          post_url TEXT,
          error_message TEXT,
          created_at INTEGER NOT NULL,
          published_at INTEGER
        )
      `);
    }
    
    if (action === 'markPreparing') {
      // 记录准备状态（复制了格式准备发布）
      const existing = db.prepare(
        'SELECT id FROM platform_posts WHERE content_id = ? AND platform = ? AND status = ? ORDER BY created_at DESC LIMIT 1'
      ).get(contentId, 'wechat', 'preparing');
      
      if (!existing) {
        db.prepare(
          `INSERT INTO platform_posts (content_id, platform, status, created_at)
           VALUES (?, ?, 'preparing', ?)`
        ).run(contentId, 'wechat', Date.now());
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '已记录准备状态' 
      });
    }
    
    if (action === 'markPublished') {
      const { postUrl } = body;
      
      // 更新之前的状态为已发布，或创建新的发布记录
      const existing = db.prepare(
        'SELECT id FROM platform_posts WHERE content_id = ? AND platform = ? ORDER BY created_at DESC LIMIT 1'
      ).get(contentId, 'wechat');
      
      if (existing) {
        db.prepare(
          'UPDATE platform_posts SET status = ?, post_url = ?, published_at = ? WHERE id = ?'
        ).run('published', postUrl || null, Date.now(), existing.id);
      } else {
        db.prepare(
          `INSERT INTO platform_posts (content_id, platform, status, post_url, created_at, published_at)
           VALUES (?, ?, 'published', ?, ?, ?)`
        ).run(contentId, 'wechat', postUrl || null, Date.now(), Date.now());
      }
      
      // 可选：更新内容状态为 published
      try {
        db.prepare('UPDATE contents SET status = ?, published_at = ? WHERE id = ?')
          .run('published', Date.now(), contentId);
      } catch (e) {
        // 表可能不存在，忽略
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '已标记为已发布' 
      });
    }
    
    // 保留原有的 API 调用功能（如果有配置的话）
    if (action === 'createDraft' || action === 'publish') {
      // 尝试获取配置
      const configRow = db.prepare('SELECT config FROM platform_configs WHERE platform = ?').get('wechat');
      if (!configRow) {
        return NextResponse.json({ 
          error: 'WeChat API not configured',
          message: '个人账号请使用手动发布模式'
        }, { status: 400 });
      }
      
      // 如果有配置，尝试调用 API
      try {
        const { getAccessToken, createNewsDraft, publishDraft } = await import('@/lib/wechat');
        const config = JSON.parse(configRow.config);
        const accessToken = await getAccessToken(config.appId, config.appSecret);
        
        if (action === 'createDraft') {
          const { articles } = body;
          const mediaId = await createNewsDraft(accessToken, articles);
          
          db.prepare(
            `INSERT INTO platform_posts (content_id, platform, status, draft_id, media_id, created_at)
             VALUES (?, ?, 'draft', ?, ?, ?)`
          ).run(contentId, 'wechat', mediaId, mediaId, Date.now());
          
          return NextResponse.json({ 
            success: true, 
            mediaId,
            message: '草稿创建成功' 
          });
        }
        
        if (action === 'publish') {
          const { mediaId } = body;
          await publishDraft(accessToken, mediaId);
          
          db.prepare(
            'UPDATE platform_posts SET status = ?, published_at = ? WHERE media_id = ?'
          ).run('published', Date.now(), mediaId);
          
          db.prepare('UPDATE contents SET status = ?, published_at = ? WHERE id = ?')
            .run('published', Date.now(), contentId);
          
          return NextResponse.json({ 
            success: true, 
            message: '发布成功' 
          });
        }
      } catch (e) {
        return NextResponse.json({ 
          error: 'API call failed',
          message: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('WeChat POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH: 更新配置（保留供企业账号使用）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, appSecret, enabled } = body;
    
    const db = getDB();
    
    // 检查表是否存在
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='platform_configs'"
    ).get();
    
    if (!tableExists) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS platform_configs (
          platform TEXT PRIMARY KEY,
          config TEXT NOT NULL,
          enabled INTEGER DEFAULT 1,
          updated_at INTEGER
        )
      `);
    }
    
    // 测试配置是否有效（如果有提供）
    if (appId && appSecret) {
      try {
        const { getAccessToken } = await import('@/lib/wechat');
        await getAccessToken(appId, appSecret);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid credentials', details: e instanceof Error ? e.message : 'Unknown' },
          { status: 400 }
        );
      }
    }
    
    const config = { appId, appSecret };
    
    // 插入或更新配置
    db.prepare(
      `INSERT INTO platform_configs (platform, config, enabled, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(platform) DO UPDATE SET
       config = excluded.config,
       enabled = excluded.enabled,
       updated_at = excluded.updated_at`
    ).run('wechat', JSON.stringify(config), enabled ? 1 : 0, Date.now());
    
    return NextResponse.json({ success: true, message: '配置已保存' });
  } catch (error) {
    console.error('WeChat PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
