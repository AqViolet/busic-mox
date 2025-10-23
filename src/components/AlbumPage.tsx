"use client";

import { useState, useRef, useEffect } from "react";

interface Song{
  id: number;
  title: string;
  file_path: string;
}

interface Album{
  id: number;
  name: string;
  artist_id: number;
  artist_name: string;
  cover_path: string;
  created_at: string;
}

export default function AlbumPage({ album, songs }: { album: Album; songs: Song[] }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = (index: number) => {
    if (!songs[index]) return;
    const audio = audioRef.current;
    if (audio) {
      audio.src = songs[index].file_path;
      audio.volume = volume;
      audio.play();
      setCurrentIndex(index);
    }
  };

  const handleEnded = () => {
    if (currentIndex === null) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      playSong(nextIndex);
    } else {
      setCurrentIndex(null); 
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
      <div className="flex w-[90%] max-w-6xl items-start justify-center space-x-16 py-12">
        <div className="flex flex-col items-center w-[35%]">
          <img
            src={album.cover_path}
            alt={album.name}
            className="w-[360px] h-[360px] object-cover rounded-lg shadow-2xl mb-6"/>
          <h2 className="text-2xl font-semibold">{album.name}</h2>
          <p className="text-sm text-gray-400 mt-1">{album.artist_name}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(album.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col w-[55%]">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-medium text-gray-300 tracking-wide uppercase">
              Tracklist
            </h3>
            <div className="w-full h-px bg-gray-800 mt-2"></div>
          </div>

          <ul className="space-y-2 text-sm">
            {songs.map((song, index) => (
              <li
                key={song.id}
                onClick={() => playSong(index)}
                className={`cursor-pointer flex justify-between items-center px-4 py-2 rounded-lg transition ${
                  currentIndex === index ? "bg-gray-800 text-white" : "hover:bg-gray-900"
                }`}>
                <div className="flex gap-4 items-center">
                  <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                  <span className="truncate max-w-[260px]">{song.title}</span>
                </div>
                <span className="text-gray-600 text-xs">
                  {currentIndex === index ? "▶" : "3:17"}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-center space-y-4">
            <audio
              ref={audioRef}
              controls
              className="w-full bg-transparent"
              onEnded={handleEnded}/>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">🔉</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-40 accent-green-500 cursor-pointer"/>
              <span className="text-xs text-gray-500">🔊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
