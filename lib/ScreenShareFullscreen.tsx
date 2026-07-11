'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Track } from 'livekit-client';
import { useTracks } from '@livekit/components-react';

/**
 * Adds a floating "Fullscreen" button that appears whenever a screen share is
 * active in the room. Clicking it fullscreens the focused screen-share panel.
 * Works inside a LiveKit RoomContext.
 */
export function ScreenShareFullscreen() {
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const isSharing = screenShareTracks.length > 0;

  // Keep isFullscreen in sync with the browser state
  React.useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // Exit fullscreen automatically when screen share ends
  React.useEffect(() => {
    if (!isSharing && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [isSharing]);

  const toggleFullscreen = React.useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    const target =
      document.querySelector<HTMLElement>('.lk-participant-tile[data-lk-source="screen_share"]') ??
      document.querySelector<HTMLElement>('.lk-focus-layout') ??
      document.querySelector<HTMLElement>('.lk-video-conference');

    if (target) {
      target.requestFullscreen({ navigationUI: 'hide' }).catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    }
  }, []);

  // Allow double-clicking the focused screen share to toggle fullscreen
  React.useEffect(() => {
    if (!isSharing) return;

    const handleDblClick = (e: MouseEvent) => {
      const targetElement =
        document.querySelector('.lk-participant-tile[data-lk-source="screen_share"]') ??
        document.querySelector('.lk-focus-layout');
      
      if (targetElement && targetElement.contains(e.target as Node)) {
        toggleFullscreen();
      }
    };

    document.addEventListener('dblclick', handleDblClick);
    return () => document.removeEventListener('dblclick', handleDblClick);
  }, [isSharing, toggleFullscreen]);

  const [focusLayout, setFocusLayout] = React.useState<Element | null>(null);

  // Poll for the focus layout element once screen sharing starts,
  // as LiveKit might take a moment to render it.
  React.useEffect(() => {
    if (!isSharing) {
      setFocusLayout(null);
      return;
    }
    const interval = setInterval(() => {
      const el = document.querySelector('.lk-focus-layout');
      if (el) {
        setFocusLayout(el);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isSharing]);

  if (!isSharing) return null;

  const button = (
    <button
      id="screenshare-fullscreen-btn"
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen shared screen'}
      onClick={toggleFullscreen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        background: hovered
          ? 'rgba(30, 30, 35, 0.95)'
          : 'rgba(18, 18, 22, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#fff',
        fontSize: '0.8125rem',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        letterSpacing: '0.01em',
      }}
    >
      {isFullscreen ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
          Exit Fullscreen
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // If focus layout exists, portal the button into it so it stays visible in fullscreen.
  // Otherwise just render it normally (it will fall back to fullscreening the video conference).
  return focusLayout ? createPortal(button, focusLayout) : button;
}

