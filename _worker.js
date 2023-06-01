export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      url.hostname = 'dorew.ovh'
      let new_request = new Request(url, request);
      
      // Check if the request contains a cookie
      const cookie = request.headers.get('cookie');
      
      // Check if the response is already cached
      const cachedResponse = await caches.match(new_request);
      
      if (cachedResponse) {
        // If the response is already cached, return it with the cookie
        const response = new Response(cachedResponse.body, {
          ...cachedResponse,
          headers: {
            ...cachedResponse.headers,
            "Set-Cookie": cookie // Add the cookie to the response headers          }
        });
        return response;
      } else {
        // If the response is not cached, fetch it from the API server
        let response = await fetch(new_request);
        
        // Create a new response with the cookie and cache it
        response = new Response(response.body, response);
        response.headers.set('Set-Cookie', cookie);
        const cache = await caches.open('api-cache');
        cache.put(new_request, response.clone());
        
        return response;
      }
    }
    
    return env.ASSETS.fetch(request);
  },
};
