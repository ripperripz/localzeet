'use client';

import React from 'react';
import { Track } from 'livekit-client';
import { useTracks } from '@livekit/components-react';

/**
 * Floating "Fullscreen" button that appears whenever a screen share is active.
 * - Works on desktop (standard Fullscreen API) and iOS Safari (webkitEnterFullscreen).
 * - Double-clicking the screen share also triggers fullscreen.
 * - Uses position:fixed (not a portal) to avoid stale DOM reference issues when
 *   LiveKit re-renders the focus layout after tile clicks.
 */
export function ScreenShareFullscreen() {
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const isSharing = screenShareTracks.length > 0;

  // Keep isFullscreen in sync — cover both standard and webkit events
  React.useEffect(() => {
    const handleChange = () =>
      setIsFullscreen(
        !!document.fullscreenElement ||
        !!(document as unknown as { webkitFullscreenElement: Element | null })
          .webkitFullscreenElement,
      );
    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, []);

  // Exit fullscreen automatically when screen share stops
  React.useEffect(() => {
    if (!isSharing) {
      const doc = document as unknown as {
        webkitFullscreenElement: Element | null;
        webkitExitFullscreen: () => void;
      };
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen();
    }
  }, [isSharing]);

  const enterFullscreen = React.useCallback(() => {
    // 1. Try the actual screen share <video> element first.
    //    This is the only approach that works on iOS Safari.
    const screenVideo = document.querySelector<HTMLVideoElement>(
      'video[data-lk-source="screen_share"]',
    );
    if (screenVideo) {
      if (typeof screenVideo.requestFullscreen === 'function') {
        screenVideo.requestFullscreen({ navigationUI: 'hide' }).catch(console.error);
        return;
      }
      const iosVideo = screenVideo as unknown as { webkitEnterFullscreen?: () => void };
      if (typeof iosVideo.webkitEnterFullscreen === 'function') {
        iosVideo.webkitEnterFullscreen();
        return;
      }
    }

    // 2. Fallback: fullscreen the screen-share participant tile or the focus layout
    const target =
      document.querySelector<HTMLElement>(
        '.lk-participant-tile[data-lk-source="screen_share"]',
      ) ??
      document.querySelector<HTMLElement>('.lk-focus-layout') ??
      document.querySelector<HTMLElement>('.lk-video-conference');

    if (!target) return;

    if (typeof target.requestFullscreen === 'function') {
      target.requestFullscreen({ navigationUI: 'hide' }).catch(console.error);
    } else {
      const t = target as unknown as { webkitRequestFullscreen?: () => void };
      t.webkitRequestFullscreen?.();
    }
  }, []);

  const exitFullscreen = React.useCallback(() => {
    const doc = document as unknown as {
      webkitFullscreenElement: Element | null;
      webkitExitFullscreen: () => void;
    };
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen();
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    const doc = document as unknown as { webkitFullscreenElement: Element | null };
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  // Double-click the screen share tile to toggle fullscreen (desktop)
  React.useEffect(() => {
    if (!isSharing) return;

    const handleDblClick = (e: MouseEvent) => {
      // Fresh query on every event — no stale reference
      const tile =
        document.querySelector('.lk-participant-tile[data-lk-source="screen_share"]') ??
        document.querySelector('.lk-focus-layout');
      if (tile?.contains(e.target as Node)) toggleFullscreen();
    };

    document.addEventListener('dblclick', handleDblClick);
    return () => document.removeEventListener('dblclick', handleDblClick);
  }, [isSharing, toggleFullscreen]);

  if (!isSharing) return null;

  return (
    <button
      id="screenshare-fullscreen-btn"
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen shared screen'}
      onClick={toggleFullscreen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        // Fixed so it always shows — avoids stale portal target issues
        position: 'fixed',
        bottom: '5.5rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        background: hovered ? 'rgba(30, 30, 35, 0.95)' : 'rgba(18, 18, 22, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#fff',
        fontSize: '0.8125rem',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        letterSpacing: '0.01em',
        // Larger tap target on mobile
        minWidth: '44px',
        minHeight: '44px',
      }}
    >
      {isFullscreen ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
          Exit Fullscreen
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8V5a2 2 0 0 1 2-2h3" />
            <path d="M16 3h3a2 2 0 0 1 2 2v3" />
            <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
            <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
          </svg>
          Fullscreen
        </>
      )}
    </button>
  );
}
