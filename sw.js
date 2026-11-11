const CACHE_NAME = 'whose-liberty-montesquieu-v7';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/report.css',
  './js/report.js',
  './js/presentation-data.mjs',
  './js/timeline-data.mjs',
  './js/audience-sync-logic.mjs',
  './js/qr-svg.mjs',
  './js/voice-control.js',
  './js/remote-controller.js',
  './js/studio.js',
  './js/workspace-firebase.js',
  './js/three-meridian.js',
  './vendor/fonts/inter-tight.css',
  './vendor/fonts/newsreader.css',
  './vendor/fonts/pinyon-script.css',
  './vendor/js/gsap.min.js',
  './vendor/js/ScrollTrigger.min.js',
  './assets/report/montesquieu-oval.webp',
  './assets/report/compromisso.jpg',
  './assets/report/justica.jpg',
  './public/assets/aistudio/7fefb9a6-f0ef-44ce-9981-b65916a5eb01__1__a4e5800a.png',
  './public/assets/aistudio/c9c1d695-f5e3-4da2-b7dc-d4a3788e04bf_3353c5b9.png',
  './assets/owl-perched.webp',
  './assets/img/logo-owl.png',
  './assets/img/hero/front-l.webp',
  './assets/img/hero/front-r.webp',
  './assets/img/bgs/storm.webp',
  './assets/img/bgs/palace.webp',
  './assets/img/bgs/lake.webp',
  './assets/img/bgs/nightsea.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.mp4')) return;

  event.respondWith(
    fetch(request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkRes;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
