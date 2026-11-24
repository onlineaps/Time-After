/* Time After service worker. index.html বদলালে CACHE নামের version বাড়ান (v2 -> v3) */
var CACHE='time-after-v2';
var ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];

self.addEventListener('install',function(e){
  /* একটা ফাইল না পেলেও বাকিগুলো জমা হবে */
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ASSETS.map(function(a){return c.add(a).catch(function(){});}));
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin) return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&res.status===200){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      return hit||caches.match('./index.html').then(function(r){return r||caches.match('./');});
    });
    return hit||net;
  }));
});
