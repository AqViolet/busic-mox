"use client";
import { useState, useEffect, useRef } from "react";
import { usePlayer, PlayerSong } from "@/context/PlayerContext";
import { MoreVertical } from "lucide-react";

interface Song {
  id: number;
  title: string;
  file_path: string;
}

interface Album {
  id: number;
  name: string;
  artist_id: number;
  artist_name: string;
  cover_path: string;
  created_at: string;
}

export default function AlbumPage({ album, songs }: { album: Album; songs: Song[] }) {
  const { playSong, currentSong } = usePlayer();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [songList, setSongList] = useState<Song[]>(songs);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const playlist: PlayerSong[] = songList.map((s: Song) => ({
    id: s.id,
    title: s.title,
    src: s.file_path,
    albumId: album.id,
    albumName: album.name,
    artist: album.artist_name,
    cover: album.cover_path,
  }));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (songId: number) => {
    try {
      const res = await fetch(`/api/songs/${songId}`, { method: "DELETE" });
      if (res.ok) {
        setSongList((prev: Song[]) => prev.filter((s: Song) => s.id !== songId));
      } else console.error("Failed to delete song");
    } catch (error) {
      console.error("Error deleting song:", error);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
      <div className="flex w-[90%] max-w-6xl items-start justify-center space-x-16 py-12 mt-16">
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

          <ul className="space-y-2 text-sm relative">
            {playlist.map((song: PlayerSong, index: number) => (
              <li
                key={song.id}
                onMouseEnter={() => setHoveredId(song.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`cursor-pointer flex justify-between items-center px-4 py-2 rounded-lg transition hover:bg-gray-900 relative ${
                  currentSong?.id === song.id ? "bg-gray-800 text-white" : ""
                }`}>
                <div className="flex gap-4 items-center" onClick={() => playSong(song, playlist)}>
                  <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                  <span className="truncate max-w-[260px]">{song.title}</span>
                </div>
                <div className="flex items-center gap-3 relative">
                  <span className="text-gray-600 text-xs">
                    {currentSong?.id === song.id ? "▶" : ""}
                  </span>
                  {hoveredId === song.id && (
                    <button
                      className="p-1 text-gray-400 hover:text-white transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === song.id ? null : song.id);
                      }}>
                      <MoreVertical size={16} />
                    </button>
                  )}

                  {openMenuId === song.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-6 bg-gray-900 border border-gray-700 rounded-md shadow-lg w-32 z-50"
                      onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="block w-full text-left px-4 py-2 hover:bg-red-700 text-red-400 text-sm">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showEditModal && (
        <div
          className="fixed inset-0 flex justify-center items-end bg-transparent"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}>
          <div className="bg-gray-900 p-6 rounded-t-2xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Song</h2>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white mb-3"
              placeholder="Song Title"/>
            <input
              type="file"
              accept="audio/*"
              className="w-full p-2 bg-gray-800 rounded text-white mb-4"/>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowEditModal(false)} className="bg-gray-600 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
