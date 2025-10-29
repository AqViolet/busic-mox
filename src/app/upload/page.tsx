'use client';

import React, { useState, useEffect } from 'react';
import { uploadNewAlbum, uploadExistingAlbum, getAlbums } from '@/app/upload/actions';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function UploadPage() {
  const router = useRouter();
  const [isNewAlbum, setIsNewAlbum] = useState(true);
  const [albums, setAlbums] = useState<{ id: number; name: string }[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [song, setSong] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const albumList = await getAlbums();
        setAlbums(albumList);
      } catch (err) {
        console.error('Error fetching albums:', err);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();

      if (isNewAlbum) {
        if (!albumName || !artistName || !albumCover || !song)
          throw new Error('All fields are required for a new album.');

        formData.append('albumName', albumName);
        formData.append('artistName', artistName);
        formData.append('albumCover', albumCover);
        formData.append('song', song);

        await uploadNewAlbum(formData);
      } else {
        if (!selectedAlbum || !song)
          throw new Error('Please select an album and a song.');

        const selected = albums.find((a) => a.id.toString() === selectedAlbum);
        if (!selected) throw new Error('Invalid album.');

        formData.append('albumId', selectedAlbum);
        formData.append('albumName', selected.name);
        formData.append('song', song);

        await uploadExistingAlbum(formData);
      }

      setSuccess(true);
      setTimeout(() => router.refresh(), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">Upload Music</h1>

      <div className="flex items-center gap-3 mb-6">
        <span className={isNewAlbum ? 'text-green-400' : 'text-gray-400'}>
          New Album
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!isNewAlbum}
            onChange={() => setIsNewAlbum(!isNewAlbum)}/>
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
        <span className={!isNewAlbum ? 'text-green-400' : 'text-gray-400'}>
          Existing Album
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-2xl shadow-md w-full max-w-lg space-y-4">
        {isNewAlbum ? (
          <>
            <label className="block">
              <span className="text-gray-300">Album Name:</span>
              <input
                type="text"
                className="w-full bg-gray-800 p-2 rounded-md mt-1"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                required/>
            </label>

            <label className="block">
              <span className="text-gray-300">Artist Name:</span>
              <input
                type="text"
                className="w-full bg-gray-800 p-2 rounded-md mt-1"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required/>
            </label>

            <label className="block">
              <span className="text-gray-300">Album Cover:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAlbumCover(e.target.files?.[0] || null)}
                className="w-full bg-gray-800 p-2 rounded-md mt-1"
                required
              />
            </label>
          </>
        ) : (
          <label className="block">
            <span className="text-gray-300">Select Album:</span>
            <select
              className="w-full bg-gray-800 p-2 rounded-md mt-1"
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}>
              <option value="">Select an Album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-gray-300">Song File:</span>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setSong(e.target.files?.[0] || null)}
            className="w-full bg-gray-800 p-2 rounded-md mt-1"
            required/>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded-md text-white font-semibold mt-4">
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-2">Upload successful!</p>}
      </form>
    </div>
    </AuthGuard>
  );
}
