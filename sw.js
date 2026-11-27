const V="pesci-v7",IMG="pesci-foto-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192-foto.png","./icon-512-foto.png","./icon-maskable-512-foto.png","./apple-touch-icon-foto.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("pesci-")&&x!==V&&x!==IMG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const cacheFirst=(req,name)=>caches.match(req).then(r=>r||fetch(req).then(n=>{if(n.ok){const cp=n.clone();caches.open(name).then(c=>c.put(req,cp))}return n}));
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // rete prima per avere gli aggiornamenti, cache se offline
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"))));
  }else if(url.hostname==="upload.wikimedia.org"||/\.wikipedia\.org$/.test(url.hostname)&&url.pathname.startsWith("/api/rest_v1/page/summary/")){
    e.respondWith(cacheFirst(req,IMG));
  }else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(cacheFirst(req,V));
  }
});
