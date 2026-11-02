// Reviewed public resource/documentation pages only; no private storage or signed URLs.
export const PUBLIC_RESOURCE_SITES = Object.freeze([
  'https://app.irbank.net/',
  'https://tgmcharts.com/developers',
  'https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/',
  'https://github.com/settings/tokens',
  'https://plamo.preferredai.jp/',
  'https://docs.bigmodel.cn/',
  'https://docs.z.ai/guides/overview/quick-start',
  'https://www.siliconflow.cn/',
  'https://ai.sakura.ad.jp/sakura-ai/ai-engine/',
  'https://console.groq.com/docs/quickstart',
  'https://api-docs.deepseek.com/',
  'https://ai.google.dev/gemini-api/docs',
  'https://developers.cloudflare.com/workers-ai/'
]);
export function isPublicResourceSite(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && PUBLIC_RESOURCE_SITES.includes(value);
  } catch { return false; }
}
