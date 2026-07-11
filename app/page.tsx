'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { generateRoomId } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

const FEATURES = [
  {
    icon: '🖥️',
    name: 'High Quality Screen Sharing',
    desc: 'Share your screen in up to 4K resolution. The browser negotiates the best quality for your hardware and network.',
  },
  {
    icon: '🎙️',
    name: 'Crystal Clear Voice',
    desc: 'Full-band audio with noise suppression powered by LiveKit. Hear every word without distortion or lag.',
  },
  {
    icon: '🔗',
    name: 'Instant Invite Links',
    desc: 'Share the room URL with anyone. No sign-up, no downloads. They open the link and they\'re in.',
  },
];

export default function Page() {
  const router = useRouter();
  const [joinValue, setJoinValue] = useState('');

  const handleCreate = () => {
    router.push(`/rooms/${generateRoomId()}`);
  };

  const handleJoin = () => {
    const raw = joinValue.trim();
    if (!raw) return;

    // Accept either a full URL or a bare room name/ID
    try {
      const url = new URL(raw);
      // Extract last path segment as room name
      const segments = url.pathname.split('/').filter(Boolean);
      const roomName = segments[segments.length - 1];
      if (roomName) {
        router.push(`/rooms/${roomName}`);
        return;
      }
    } catch {
      // Not a URL — treat as room name directly
    }

    router.push(`/rooms/${raw}`);
  };

  const handleJoinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <span className={styles.logo}>
          <span className={styles.logoDot} />
          Meetup
        </span>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            No sign-up required
          </div>

          <h1 className={styles.heroTitle}>
            Video calls that{' '}
            <span className={styles.heroGradient}>just work</span>
          </h1>

          <p className={styles.heroSub}>
            Create a room, share the link, and start talking. Screen sharing, voice, and video — all in one click.
          </p>

          <div className={styles.actionCard}>
            <button
              id="create-room-btn"
              className={styles.createBtn}
              onClick={handleCreate}
            >
              Create a Room
            </button>

            <div className={styles.divider}>or join existing</div>

            <div className={styles.joinRow}>
              <input
                id="join-room-input"
                className={styles.joinInput}
                type="text"
                placeholder="Room name or invite link"
                value={joinValue}
                onChange={(e) => setJoinValue(e.target.value)}
                onKeyDown={handleJoinKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                id="join-room-btn"
                className={styles.joinBtn}
                onClick={handleJoin}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <p className={styles.featuresLabel}>What&apos;s included</p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.name} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureName}>{f.name}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Built with LiveKit</span>
        <a
          href="https://livekit.io/cloud"
          rel="noopener noreferrer"
          target="_blank"
          className={styles.footerLink}
        >
          LiveKit Cloud
        </a>
        <a
          href="https://github.com/livekit-examples/meet"
          rel="noopener noreferrer"
          target="_blank"
          className={styles.footerLink}
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
