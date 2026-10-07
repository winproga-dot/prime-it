import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Icon from './Icon.jsx';

export default function HeroVideo() {
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState('idle');
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef(null);
  const playbackId = useRef(0);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px)');
    const update = () => {
      setCanPlay(media.matches);
      if (!media.matches) {
        ++playbackId.current;
        videoRef.current?.pause();
        setRequested(false);
        setStatus('idle');
      }
    };
    update();
    media.addEventListener('change', update);
    return () => {
      ++playbackId.current;
      media.removeEventListener('change', update);
    };
  }, []);

  const fail = id => {
    if (id !== playbackId.current) return;
    ++playbackId.current;
    setRequested(false);
    setStatus('error');
  };
  const toggleVideo = () => {
    if (requested) {
      ++playbackId.current;
      videoRef.current?.pause();
      setRequested(false);
      setStatus('idle');
      return;
    }
    // Mount and start inside the user's click. Safari may lose activation
    // when play() is deferred to a React effect.
    const id = ++playbackId.current;
    flushSync(() => {
      setStatus('loading');
      setRequested(true);
    });
    const video = videoRef.current;
    if (!video) return fail(id);
    video.muted = true;
    video.defaultMuted = true;
    try { video.play()?.catch(() => fail(id)); }
    catch { fail(id); }
  };

  const session = playbackId.current;
  return <div className={'hero-media hero-video-shell' + (requested ? ' is-playing' : '')} data-video-state={status}>
    {requested && <div className="hero-video-overlay">
      <video ref={videoRef} src="/media/hero.mp4" poster="/hero.webp" width="854" height="480"
        muted playsInline loop controls preload="metadata" className="hero-video" aria-label="Видео о компьютерном сервисе"
        onPlaying={() => { if (session === playbackId.current) setStatus('playing'); }}
        onWaiting={() => { if (session === playbackId.current) setStatus('loading'); }} onError={() => fail(session)} />
    </div>}
    {canPlay && <button className="video-control" type="button" onClick={toggleVideo}
      aria-pressed={requested} aria-label={requested ? 'Закрыть видео' : status === 'error' ? 'Повторить загрузку видео' : 'Посмотреть видео о сервисе'}>
      <Icon name={requested ? 'X' : 'Play'} size={16} />{requested ? 'Закрыть' : status === 'error' ? 'Повторить' : 'Видео'}
    </button>}
    <div className={'video-status' + (status === 'loading' || status === 'error' ? ' is-visible' : '')} role="status" aria-live="polite">
      {status === 'loading' ? 'Загружаем видео…' : status === 'error' ? 'Видео не загрузилось. Попробуйте ещё раз.' : ''}
    </div>
  </div>;
}
