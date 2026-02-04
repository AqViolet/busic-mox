"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

export default function GlobalPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    progress,
    duration,
    seek,
    volume,
    setVolume,
  } = usePlayer();

  const fmt = (t?: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const pathname = usePathname();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    setShowLogout(!["/login", "/register"].includes(pathname));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black text-gray-300 border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-2 text-sm">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="hover:text-white transition">
              (1) Dashboard
            </Link>
            {currentSong?.albumId ? (
              <Link href={`/album/${currentSong.albumId}`} className="hover:text-white transition">
                (2) Current Album
              </Link>
            ) : (
              <span className="hover:text-white">Current Album</span>
            )}
            <Link href="/update" className="hover:text-white transition">
              (3) Update
            </Link>
            <Link href="/upload" className="hover:text-white transition">
              (4) Upload
            </Link>
            {showLogout && (
              <button
                onClick={handleLogout}
                className="hover:text-white transition text-gray-300">
                (5) Logout
              </button>
            )}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 justify-end min-w-[45%]">
            <div className="flex flex-col items-end w-full max-w-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={playPrev}
                  className="text-gray-300 hover:text-white"
                  title="Previous">
                  ◀◀
                </button>

                <button
                  onClick={togglePlay}
                  className="px-2 py-px bg-gray-800 hover:bg-gray-700 rounded text-white"
                  title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? "▌▌" : "▶"}
                </button>

                <button
                  onClick={playNext}
                  className="text-gray-300 hover:text-white"
                  title="Next">
                  ▶▶
                </button>

                <div className="truncate text-right ml-3">
                  <div className="text-white text-sm font-medium truncate">
                    {currentSong ? currentSong.title : "No song playing"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentSong ? currentSong.artist || "" : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full mt-0.5">
                <span className="text-xs text-gray-500">{fmt(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full accent-white h-[3px] cursor-pointer"
                />
                <span className="text-xs text-gray-500">{fmt(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 accent-white h-[3px] cursor-pointer"/>
              {currentSong?.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSong.cover}
                  alt="cover"
                  className="w-6 h-6 rounded-sm object-cover shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      </header>
      <div style={{ height: 56 }} />
    </>
  );
}