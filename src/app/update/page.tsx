'use client';

import React, { useEffect, useState } from 'react';
import { getAlbumsWithSongs, updateAlbum, updateSong, deleteSong } from './actions';
import AuthGuard from '@/components/AuthGuard';

export default function UpdatePage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getAlbumsWithSongs();
      setAlbums(data);
      localStorage.setItem('albums', JSON.stringify(data));
    })();
  }, []);

  const handleAlbumUpdate = async (id: number, name: string, artistName: string, cover: File | null) => {
    setLoading(true);
    setMsg('');
    const res = await updateAlbum(id, { name, artistName, newCover: cover });
    if (res.success) {
      const updated = albums.map(a => (a.album_id === id ? { ...a, album_name: name, artist_name: artistName } : a));
      setAlbums(updated);
      localStorage.setItem('albums', JSON.stringify(updated));
      setMsg('✅ Album updated successfully.');
    } else setMsg('❌ ' + res.error);
    setLoading(false);
  };

  const handleSongUpdate = async (songId: number, title: string, file: File | null, albumName: string) => {
    setLoading(true);
    setMsg('');
    const res = await updateSong(songId, { title, file, albumName });
    if (res.success) setMsg('✅ Song updated.');
    else setMsg('❌ ' + res.error);
    setLoading(false);
  };

  const handleSongDelete = async (songId: number) => {
    await deleteSong(songId);
    setAlbums(albums.map(a => ({ ...a, songs: a.songs.filter((s: any) => s.id !== songId) })));
    setMsg('🗑️ Song deleted.');
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Update Music Library</h1>
      {msg && <p className="text-green-400 mb-4">{msg}</p>}

      {albums.map((album) => (
        <div key={album.album_id} className="bg-gray-900 rounded-2xl p-6 space-y-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{album.album_name}</h2>
              <p className="text-gray-400">{album.artist_name}</p>
            </div>
            <img
              src={album.cover_path}
              alt="cover"
              className="w-16 h-16 object-cover rounded-lg border border-gray-700"
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as HTMLFormElement;
              const name = (target.elements.namedItem('name') as HTMLInputElement).value;
              const artist = (target.elements.namedItem('artist') as HTMLInputElement).value;
              const cover = (target.elements.namedItem('cover') as HTMLInputElement).files?.[0] || null;
              handleAlbumUpdate(album.album_id, name || album.album_name, artist || album.artist_name, cover);
            }}
            className="space-y-2">
            <input name="name" placeholder="New Album Name" className="bg-gray-800 p-2 rounded-md w-full" />
            <input name="artist" placeholder="New Artist Name" className="bg-gray-800 p-2 rounded-md w-full" />
            <input name="cover" type="file" accept="image/*" className="bg-gray-800 p-2 rounded-md w-full" />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold">
              Update Album
            </button>
          </form>


          <div className="mt-4 space-y-3">
            <h3 className="text-lg text-gray-300">Songs</h3>
            {album.songs.length === 0 ? (
              <p className="text-gray-500">No songs yet.</p>
            ) : (
              album.songs.map((song: any) => (
                <form
                  key={song.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as HTMLFormElement;
                    const title = (target.elements.namedItem('title') as HTMLInputElement).value;
                    const file = (target.elements.namedItem('file') as HTMLInputElement).files?.[0] || null;
                    handleSongUpdate(song.id, title || song.title, file, album.album_name);
                  }}
                  className="bg-gray-800 p-3 rounded-md flex items-center justify-between gap-4">
                  <div className="flex flex-col flex-1">
                    <input
                      name="title"
                      defaultValue={song.title}
                      className="bg-gray-700 p-2 rounded-md w-full text-sm"/>
                    <input name="file" type="file" accept="audio/*" className="mt-2 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 px-3 py-1 rounded-md text-sm">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSongDelete(song.id)}
                      className="bg-red-600 px-3 py-1 rounded-md text-sm">
                      Delete
                    </button>
                  </div>
                </form>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
    </AuthGuard>
  );
}