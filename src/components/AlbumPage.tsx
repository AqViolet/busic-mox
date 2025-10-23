"use client";

import { usePlayer, PlayerSong } from "@/context/PlayerContext";

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
  const { playSong, currentSong } = usePlayer();
  const playlist: PlayerSong[] = songs.map((s) => ({
    id: s.id,
    title: s.title,
    src: s.file_path,
    albumId: album.id,
    albumName: album.name,
    artist: album.artist_name,
    cover: album.cover_path,
  }));

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
            {playlist.map((song, index) => (
              <li
                key={song.id}
                onClick={() => playSong(song, playlist)}
                className={`cursor-pointer flex justify-between items-center px-4 py-2 rounded-lg transition hover:bg-gray-900 ${
                  currentSong?.id === song.id ? "bg-gray-800 text-white" : ""
                }`}>
                <div className="flex gap-4 items-center">
                  <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                  <span className="truncate max-w-[260px]">{song.title}</span>
                </div>
                <span className="text-gray-600 text-xs">
                  {currentSong?.id === song.id ? "▶" : "3:17"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
