/* 記帳本 service worker — App 殼快取；資料走 Apps Script，不經過這裡 */
const CACHE = 'ledger-cc3e4900';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'ledger-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;                       // 寫入試算表的 POST 直接放行
  if (url.origin === location.origin) {
    if (url.pathname.endsWith('version.json')) return;           // 版本檢查一律走網路
    // App 殼：先給快取（秒開），背景再抓新版覆蓋快取，下次打開就是新的
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(new Request(e.request.url.split('?')[0], { cache: 'reload' })).then(res => { if (res && res.ok) c.put(e.request.url.split('?')[0], res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      const res = await net; return res || new Response('離線中，且尚未快取', { status: 504 });
    }));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {  // 字型：有快取用快取，沒有就抓並存起來
    e.respondWith(caches.open('ledger-fonts').then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      try { const res = await fetch(e.request); if (res.ok || res.type === 'opaque') c.put(e.request, res.clone()); return res; }
      catch (err) { return new Response('', { status: 504 }); }
    }));
  }
});
