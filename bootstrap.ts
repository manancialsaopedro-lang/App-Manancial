// Clear production workers before importing the app: a cached module can prevent
// index.tsx from running, so cleanup inside that module happens too late.
async function bootstrap() {
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith('manancial-')).map((key) => caches.delete(key)));
      }
      if (navigator.serviceWorker.controller && registrations.length > 0) {
        window.location.reload();
        return;
      }
    } catch (error) {
      console.warn('Não foi possível limpar o cache de desenvolvimento:', error);
    }
  }

  await import('./index');
}

void bootstrap();
