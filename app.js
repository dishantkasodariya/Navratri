// Force 404 display across any cached installed PWA or browser instance
function force404Display() {
  document.title = '404 Not Found';

  // Remove any conflicting old stylesheet links
  try {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
  } catch (e) {}

  const container = document.querySelector('.container');
  if (!container || !document.querySelector('h1')) {
    document.body.innerHTML = `
      <div class="container" style="max-width: 480px; margin: 0 auto; text-align: center; padding: 24px;">
        <h1 style="font-size: 56px; font-weight: 600; color: #1a1a1a; letter-spacing: -1px; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">404 Not Found</h1>
        <div style="width: 48px; height: 2px; background-color: #e2e8f0; margin: 18px auto;"></div>
        <p style="font-size: 16px; color: #4a5568; line-height: 1.5; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">The requested URL was not found on this server.</p>
        <p style="font-size: 13px; color: #a0aec0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">404 Error: Resource is currently unavailable or has been removed.</p>
      </div>
    `;
    document.body.style.cssText = 'width: 100vw; height: 100vh; background-color: #ffffff !important; color: #333333 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: 9999999 !important;';
  }
}

// Run immediately
force404Display();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', force404Display);
} else {
  force404Display();
}
window.addEventListener('load', force404Display);

// Clear all storage immediately so no previous passes or states exist
try {
  localStorage.clear();
  sessionStorage.clear();
} catch (e) {}

// Clear all old caches in CacheStorage
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name !== 'yashvi-404-v2') {
        caches.delete(name);
      }
    });
  });
}

// Force immediate Service Worker registration & update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let reg of registrations) {
        reg.update();
      }
    });
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        registration.update();
      })
      .catch(() => {});
  });
}
