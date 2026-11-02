import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PUBLIC_RESOURCE_SITES,isPublicResourceSite} from '../lib/public-resource-sites.mjs';
test('公开官网允许，凭据、签名、私人分享及伪装地址拒绝',()=>{
  for(const url of PUBLIC_RESOURCE_SITES)assert.equal(isPublicResourceSite(url),true);
  for(const url of [
    'https://docs.z.ai/guides/overview/quick-start?token=private',
    'https://docs.z.ai/guides/overview/quick-start#secret',
    'https://user:password@docs.z.ai/guides/overview/quick-start',
    'https://docs.z.ai.evil.example/guides/overview/quick-start',
    'https://drive.google.com/file/d/private/view',
    'http://app.irbank.net/','http://127.0.0.1/','javascript:alert(1)',
    'https://example.workers.dev/','https://team.cloudflareaccess.com/'
  ])assert.equal(isPublicResourceSite(url),false,url);
});
