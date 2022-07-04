// https://www.youtube.com/watch?v=WbbAPfDVqfY&t=1175s&ab_channel=dcode
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["./", "./css/style.css", "./fei.png"]);
        })
    )
});

self.addEventListener("fetch", e => {
    console.log(`Intercepting for ${e.request.url}`);
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request)
        })
    );
})