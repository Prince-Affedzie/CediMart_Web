// src/components/Feed/ReelVideo.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

// Plays MP4 directly, and HLS (.m3u8) via hls.js where the browser can't do it natively (everything except Safari).
export default function ReelVideo({ src, poster, active, paused, muted }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const barRef = useRef(null);
  const wantPlayRef = useRef(false);
  const durationRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // Attach the source. Cleanup fully tears down the decoder, which matters
  // because browsers cap how many videos can decode at once.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    let cancelled = false;
    setReady(false);

    const isHls = /\.m3u8(\?|$)/.test(src);
    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) { video.src = src; return; }
        const hls = new Hls({ maxBufferLength: 12, maxMaxBufferLength: 24, capLevelToPlayerSize: true });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  // Play / pause
  useEffect(() => {
    const video = videoRef.current;
    wantPlayRef.current = active && !paused;
    if (!video) return;
    if (wantPlayRef.current) {
      video.play().catch(() => {});
    } else {
      video.pause();
      if (!active) { try { video.currentTime = 0; } catch {} }
    }
  }, [active, paused, src]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !active || !barRef.current) return;
    const d = v.duration || durationRef.current;
    if (d > 0) barRef.current.style.width = `${Math.min(100, (v.currentTime / d) * 100)}%`;
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    const d = v?.duration;
    if (!v || !d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1) * d;
  };

  return (
    <div className="fd-video-wrap">
      {poster && <img className={`fd-poster${ready ? ' is-hidden' : ''}`} src={poster} alt="" />}

      <video
        ref={videoRef}
        className="fd-video"
        loop
        playsInline
        muted={muted}
        preload="auto"
        onLoadedMetadata={(e) => { durationRef.current = e.currentTarget.duration || 0; }}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => { if (wantPlayRef.current) videoRef.current?.play().catch(() => {}); }}
        onPlaying={() => { setReady(true); setBuffering(false); }}
        onWaiting={() => setBuffering(true)}
        onTimeUpdate={handleTimeUpdate}
      />

      {buffering && active && !paused && <div className="fd-spinner" aria-hidden="true" />}

      {active && (
        <div className="fd-progress" onClick={handleSeek} role="presentation">
          <div className="fd-progress-track"><div className="fd-progress-fill" ref={barRef} /></div>
        </div>
      )}
    </div>
  );
}