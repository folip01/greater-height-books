"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeToInstallation(onChange: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    displayMode.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const installed = useSyncExternalStore(subscribeToInstallation, isInstalled, () => false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => { setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return <p className="success">Greater Height Books is installed on this device.</p>;

  async function install() {
    if (!prompt) { setShowInstructions(true); return; }
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return <div className="install-app">
    <button type="button" className="button button-secondary" onClick={() => { void install(); }}>Install mobile app</button>
    {showInstructions && <p role="status">In Chrome on Android, open the menu (⋮) and choose <strong>Install app</strong>.</p>}
  </div>;
}
