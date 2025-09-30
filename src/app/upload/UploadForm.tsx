'use client';

import React, { useEffect, useState } from 'react';
import { uploadNewAlbum, uploadExistingAlbum, getAlbums } from './actions';

export default function UploadForm() {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [albums, setAlbums] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // fetch existing album names
  useEffect(() => {
    const loadAlbums = async () => {
      const res = await getAlbums();
      setAlbums(res);
    };
    loadAlbums();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try{
      if (mode === 'new'){
        const albumName = formData.get('albumName');
        const artistName = formData.get('artistName');
        const cover = formData.get('albumCover');
        const song = formData.get('song');
        if (!albumName || !artistName || !cover || !song)
          throw new Error('All fields are required.');

        await uploadNewAlbum(formData);
        setMessage('New album and song uploaded successfully!');
      } else {
        const albumId = formData.get('albumId');
        const song = formData.get('song');
        if (!albumId || !song)
          throw new Error('Please select album and upload a song.');

        await uploadExistingAlbum(formData);
        setMessage('Song added to existing album!');
      }

    //   e.currentTarget.reset();   needs fixing here
    } catch (err: any){
      setMessage(`${err.message}`);
    } finally{
      setLoading(false);
    }
  }

  return(
    <div className="max-w-lg mx-auto mt-10 rounded-xl p-6 shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload Music</h2>
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`px-4 py-2 rounded-l-lg ${
            mode === 'new' ? 'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>
          New Album
        </button>
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`px-4 py-2 rounded-r-lg ${
            mode === 'existing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}>
          Existing Album
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'new' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Album Image
              </label>
              <input
                type="file"
                name="albumCover"
                accept="image/*"
                className="mt-1 w-full border rounded-lg p-2"
                required/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Album Name
              </label>
              <input
                type="text"
                name="albumName"
                placeholder="Enter album name"
                className="mt-1 w-full border rounded-lg p-2"
                required/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Artist Name
              </label>
              <input
                type="text"
                name="artistName"
                placeholder="Enter artist name"
                className="mt-1 w-full border rounded-lg p-2"
                required/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Song
              </label>
              <input
                type="file"
                name="song"
                accept="audio/*"
                className="mt-1 w-full border rounded-lg p-2"
                required/>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Album
              </label>
              <select
                name="albumId"
                className="mt-1 w-full border rounded-lg p-2"
                required>
                <option value="">-- Choose an album --</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Song
              </label>
              <input
                type="file"
                name="song"
                accept="audio/*"
                className="mt-1 w-full border rounded-lg p-2"
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
