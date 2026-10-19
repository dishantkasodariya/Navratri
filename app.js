// Service Worker Registration & Cache Purge for 404 Mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        registration.update();
      })
      .catch(() => {});
  });
}

// Clear all previous caches so installed app doesn't show any old tickets or views
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name !== 'yashvi-404-v1') {
        caches.delete(name);
      }
    });
  });
}

try {
  localStorage.clear();
  sessionStorage.clear();
} catch (e) {}

// Ensure that even if old HTML was cached by an installed PWA, it immediately displays 404
function force404Display() {
  const container = document.querySelector('.container');
  if (!container || !document.querySelector('h1')) {
    document.title = '404 Not Found';
    document.body.innerHTML = `
      <div style="max-width: 480px; margin: 0 auto; text-align: center; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <h1 style="font-size: 56px; font-weight: 600; color: #1a1a1a; letter-spacing: -1px; margin-bottom: 12px;">404 Not Found</h1>
        <div style="width: 48px; height: 2px; background-color: #e2e8f0; margin: 18px auto;"></div>
        <p style="font-size: 16px; color: #4a5568; line-height: 1.5; margin-bottom: 8px;">The requested URL was not found on this server.</p>
        <p style="font-size: 13px; color: #a0aec0; line-height: 1.4;">404 Error: Resource is currently unavailable or has been removed.</p>
      </div>
    `;
    document.body.style.cssText = 'width: 100%; height: 100vh; background-color: #ffffff; color: #333333; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0; padding: 0; box-sizing: border-box;';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', force404Display);
} else {
  force404Display();
}
