// WeChat Official Account API Integration
// 微信公众号 API 集成

const WECHAT_API_BASE = 'https://api.weixin.qq.com/cgi-bin';

export interface WeChatConfig {
  appId: string;
  appSecret: string;
  accessToken?: string;
  tokenExpiry?: number;
}

export interface WeChatNewsItem {
  title: string;
  thumb_media_id: string;
  author?: string;
  digest?: string;
  show_cover_pic: number;
  content: string;
  content_source_url?: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
}

// 获取 Access Token
export async function getAccessToken(appId: string, appSecret: string): Promise<string> {
  const url = `${WECHAT_API_BASE}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`WeChat API Error: ${data.errmsg} (${data.errcode})`);
  }
  
  return data.access_token;
}

// 上传图片获取 media_id
export async function uploadImage(accessToken: string, imageUrl: string): Promise<string> {
  // 下载图片并上传到微信
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  
  const formData = new FormData();
  formData.append('media', imageBlob, 'cover.jpg');
  
  const url = `${WECHAT_API_BASE}/media/upload?access_token=${accessToken}&type=image`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`Upload failed: ${data.errmsg} (${data.errcode})`);
  }
  
  return data.media_id;
}

// 创建图文素材（草稿）
export async function createNewsDraft(
  accessToken: string,
  articles: WeChatNewsItem[]
): Promise<string> {
  const url = `${WECHAT_API_BASE}/draft/add?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles }),
  });
  
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`Draft creation failed: ${data.errmsg} (${data.errcode})`);
  }
  
  return data.media_id; // 草稿的 media_id
}

// 发布草稿（群发）
export async function publishDraft(accessToken: string, mediaId: string): Promise<void> {
  const url = `${WECHAT_API_BASE}/freepublish/submit?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_id: mediaId }),
  });
  
  const data = await response.json();
  
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`Publish failed: ${data.errmsg} (${data.errcode})`);
  }
}

// 获取发布状态
export async function getPublishStatus(accessToken: string, publishId: string): Promise<any> {
  const url = `${WECHAT_API_BASE}/freepublish/get?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publish_id: publishId }),
  });
  
  return response.json();
}

// HTML 转微信图文格式
export function convertToWeChatHTML(content: string): string {
  // 基础转换规则
  let html = content
    // 处理标题
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    // 处理粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 处理斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 处理代码块
    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')
    // 处理行内代码
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // 处理链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 处理段落
    .replace(/\n\n/g, '</p><p>')
    // 处理换行
    .replace(/\n/g, '<br>');
  
  // 包装在 p 标签中
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}

// 生成摘要（限制 120 字）
export function generateDigest(content: string, maxLength: number = 120): string {
  // 移除 HTML 标签
  const plainText = content.replace(/<[^>]+>/g, '');
  // 移除 Markdown 标记
  const cleanText = plainText
    .replace(/[#*`_\[\]()]/g, '')
    .replace(/\n/g, ' ')
    .trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return cleanText.substring(0, maxLength) + '...';
}
