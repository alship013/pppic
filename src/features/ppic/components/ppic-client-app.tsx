'use client';

import { useEffect, useRef } from 'react';

import { mountPpicApp } from '@/features/ppic/runtime/mount-ppic-app';

export default function PpicClientApp() {
  const appRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appRootRef.current) return;

    const cleanup = mountPpicApp(appRootRef.current);
    return cleanup;
  }, []);

  return <div id="app" ref={appRootRef} suppressHydrationWarning />;
}
