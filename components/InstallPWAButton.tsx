import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const InstallPWAButton = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('PWA install accepted');
    } else {
      console.log('PWA install dismissed');
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible || location.pathname !== '/login') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="fixed bottom-24 right-4 z-50 rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-bold shadow-xl hover:bg-gray-800 active:scale-95 transition"
    >
      Instalar App
    </button>
  );
};
