import { useRef, useState } from "react";
import type { ListeningPlaybackState } from "../../domain/examTypes";
import styles from "./RestrictedAudioPlayer.module.css";

interface RestrictedAudioPlayerProps {
  partId: string;
  src?: string;
  playbackState: ListeningPlaybackState;
  onStarted: () => void;
  onCompleted: () => void;
}

export function RestrictedAudioPlayer({
  partId,
  src,
  playbackState,
  onStarted,
  onCompleted,
}: RestrictedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(1);
  const completed = playbackState.completedPartIds.includes(partId);
  const otherPartIsPlaying =
    Boolean(playbackState.activePartId) && playbackState.activePartId !== partId;

  async function startPlayback() {
    const audio = audioRef.current;
    if (!audio || completed || otherPartIsPlaying || isPlaying) {
      return;
    }

    try {
      audio.volume = volume;
      audio.currentTime = 0;
      onStarted();
      await audio.play();
      setIsPlaying(true);
    } catch {
      setHasError(true);
    }
  }

  if (!src) {
    return (
      <div className={styles.missing}>
        Listening audio asset is missing for this section.
      </div>
    );
  }

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onError={() => setHasError(true)}
        onEnded={() => {
          setIsPlaying(false);
          onCompleted();
        }}
      />
      <button
        disabled={completed || otherPartIsPlaying || isPlaying}
        type="button"
        onClick={startPlayback}
      >
        {completed ? "Completed" : isPlaying ? "Playing" : "Start audio"}
      </button>
      <label className={styles.volume}>
        <span>Volume</span>
        <input
          min="0"
          max="1"
          step="0.05"
          type="range"
          value={volume}
          onChange={(event) => {
            const nextVolume = Number(event.target.value);
            setVolume(nextVolume);
            if (audioRef.current) {
              audioRef.current.volume = nextVolume;
            }
          }}
        />
      </label>
      {hasError ? (
        <span className={styles.error}>Audio file not found: {src}</span>
      ) : null}
      {otherPartIsPlaying ? (
        <span className={styles.status}>Another section is playing.</span>
      ) : null}
    </div>
  );
}
