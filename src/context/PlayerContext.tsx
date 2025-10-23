"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type PlayerSong = {
  id: number;
  title: string;
  src: string;           
  albumId?: number;
  albumName?: string;
  artist?: string;
  cover?: string;
};

type PlayerContextType = {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  volume: number;
  progress: number;    
  duration: number;     
  playlist: PlayerSong[] | null;
  playSong: (song: PlayerSong, playlist?: PlayerSong[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<PlayerSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<PlayerSong[] | null>(null);
  const [index, setIndex] = useState<number | null>(null);


  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () =>
      setDuration(isFinite(audio.duration) ? audio.duration : 0);
    const onEnd = () => {
      if (playlist && index !== null && index + 1 < playlist.length) {
        const next = playlist[index + 1];
        playSongInternal(next, playlist, index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);

    audio.volume = volume;

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playSongInternal = (
    song: PlayerSong,
    pl: PlayerSong[] | null,
    idx: number | null
  ) => {
    if (!audioRef.current) return;
    setCurrentSong(song);
    if (pl) {
      setPlaylist(pl);
      setIndex(idx ?? pl.findIndex((s) => s.id === song.id));
    } else {
      if (!playlist || !playlist.find((s) => s.id === song.id)) {
        setPlaylist(null);
        setIndex(null);
      } else {
        setIndex(playlist.findIndex((s) => s.id === song.id));
      }
    }

    audioRef.current.src = song.src;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const playSong = (song: PlayerSong, pl?: PlayerSong[]) => {
    const idx = pl ? pl.findIndex((s) => s.id === song.id) : null;
    playSongInternal(song, pl ?? null, idx);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const playNext = () => {
    if (playlist && index !== null && index + 1 < playlist.length) {
      const next = playlist[index + 1];
      playSongInternal(next, playlist, index + 1);
    }
  };

  const playPrev = () => {
    if (playlist && index !== null && index - 1 >= 0) {
      const prev = playlist[index - 1];
      playSongInternal(prev, playlist, index - 1);
    }
  };

  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    const t = Math.max(0, Math.min(time, duration || Infinity));
    audioRef.current.currentTime = t;
    setProgress(t);
  };

  const value: PlayerContextType = {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    playlist,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    setVolume,
    seek,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};