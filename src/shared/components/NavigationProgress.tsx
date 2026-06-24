'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (prevRef.current !== null && prevRef.current !== current) {
      NProgress.done();
    }
    prevRef.current = current;
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
      NProgress.start();
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <style>{`
      #nprogress { pointer-events: none; }
      #nprogress .bar {
        background: #3b82f6;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px #3b82f6, 0 0 5px #3b82f6;
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `}</style>
  );
}
