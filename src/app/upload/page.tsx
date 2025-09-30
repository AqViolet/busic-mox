"use client";

import React, { useEffect, useState } from "react";

type Album = {
  id: number | string;
  name: string;
  artist?: string;
  coverUrl?: string | null;
};

export default function UploadPage() {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [albumImage, setAlbumImage] = useState<File | null>(null);
  const [albumImagePreview, setAlbumImagePreview] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | number>("");
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "info" | "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await fetch("/api/albums");
        if (!res.ok) {
          throw new Error(`Failed to load albums: ${res.statusText}`);
        }
        const data: Album[] = await res.json();
        setAlbums(data);
        if (data.length > 0) {
          setSelectedAlbumId(data[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setMessage({ type: "error", text: "Could not fetch albums. Make sure /api/albums exists." });
      }
    }
    fetchAlbums();
  }, []);

  // preview album image when selected
  useEffect(() => {
    if (!albumImage) {
      setAlbumImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(albumImage);
    setAlbumImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [albumImage]);

  function validateNewAlbum() {
    if (!albumImage) return "Album cover image is required.";
    if (!albumName.trim()) return "Album name is required.";
    if (!artistName.trim()) return "Artist name is required.";
    return null;
  }
  function validateExistingAlbum() {
    if (!selectedAlbumId) return "Please select an album.";
    if (!songFile) return "Please select a song file to upload.";
    // add song title validation
    return null;
  }

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const err = validateNewAlbum();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    const form = new FormData();
    form.append("cover", albumImage!); 
    form.append("name", albumName.trim());
    form.append("artist", artistName.trim());

    setIsUploading(true);
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

      const body = await res.json();

      setMessage({ type: "success", text: "Album created successfully." });
      setAlbumImage(null);
      setAlbumName("");
      setArtistName("");
      setAlbumImagePreview(null);
      if (body?.album) {
        setAlbums((prev) => [body.album, ...prev]);
        setSelectedAlbumId(body.album.id);
      } else {
        const listRes = await fetch("/api/albums");
        if (listRes.ok) {
          const listData: Album[] = await listRes.json();
          setAlbums(listData);
          if (listData.length > 0) setSelectedAlbumId(listData[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Album upload failed" });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleUploadSong(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const err = validateExistingAlbum();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    const form = new FormData();
    form.append("song", songFile!); 
    form.append("albumId", String(selectedAlbumId));
    if (songTitle.trim()) form.append("title", songTitle.trim());

    setIsUploading(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Song upload failed: ${res.status}`);
      }

      setMessage({ type: "success", text: "Song uploaded successfully." });
      setSongFile(null);
      setSongTitle("");
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Song upload failed" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-2">Upload</h1>
        <p className="text-sm text-slate-500 mb-6">
          Create a new album (cover + metadata) or upload a song to an existing album.
        </p>
        <div className="mb-6 flex gap-2">
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              mode === "new"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setMode("new")}
            type="button">
            New Album
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              mode === "existing"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setMode("existing")}
            type="button">
            Existing Album
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-slate-50 text-slate-700"}`}>
            {message.text}
          </div>
        )}
        {mode === "new" && (
          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Album cover</label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 bg-slate-100 rounded overflow-hidden flex items-center justify-center border">
                  {albumImagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={albumImagePreview} alt="Album preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400 text-center px-2">No cover selected</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0] ?? null;
                      setAlbumImage(f);
                    }}
                    className="block w-full text-sm text-slate-700"/>
                  <p className="text-xs text-slate-400 mt-1">
                    Recommended: square image, JPG/PNG. Max size handled server-side.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Album name</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g., My Awesome Album"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Artist name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g., The Example Band"/>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 rounded-md bg-slate-900 text-white font-medium disabled:opacity-60">
                {isUploading ? "Creating..." : "Create Album"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlbumImage(null);
                  setAlbumImagePreview(null);
                  setAlbumName("");
                  setArtistName("");
                  setMessage(null);
                }}
                className="px-3 py-2 text-sm rounded-md border">
                Reset
              </button>
            </div>
          </form>
        )}

        {mode === "existing" && (
          <form onSubmit={handleUploadSong} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select album</label>
              <div className="flex items-center gap-4">
                <select
                  value={String(selectedAlbumId)}
                  onChange={(e) => setSelectedAlbumId(e.target.value)}
                  className="flex-1 rounded-md border px-3 py-2"
                >
                  {albums.length === 0 && (
                    <option value="">No albums found</option>
                  )}
                  {albums.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.name} {a.artist ? `— ${a.artist}` : ""}
                    </option>
                  ))}
                </select>

                {/* make this to big album preview */}
                {selectedAlbumId && (
                  <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden border">
                    {(() => {
                      const selected = albums.find((x) => String(x.id) === String(selectedAlbumId));
                      if (selected?.coverUrl) {
                        // eslint-disable-next-line @next/next/no-img-element
                        return <img src={selected.coverUrl} alt="cover" className="w-full h-full object-cover" />;
                      } else {
                        return <div className="text-xs text-slate-400 p-2 flex items-center justify-center">No image</div>;
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Song file</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(ev) => {
                  const f = ev.target.files?.[0] ?? null;
                  setSongFile(f);
                }}
                className="block w-full text-sm text-slate-700"/>
              <p className="text-xs text-slate-400 mt-1">Accepts mp3, wav, m4a, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Song title (optional)</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="If empty, server can use filename"/>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 rounded-md bg-slate-900 text-white font-medium disabled:opacity-60">
                {isUploading ? "Uploading..." : "Upload Song"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSongFile(null);
                  setSongTitle("");
                  setMessage(null);
                }}
                className="px-3 py-2 text-sm rounded-md border">
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="mx-auto max-w-3xl mt-6 text-sm text-slate-500">
        <p>
          Note: This UI sends files to `/api/albums` and `/api/songs`. Implement the server-side handlers to:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Save incoming files to your local <code>uploads/</code> folder</li>
          <li>Insert/Update rows in your RDBMS (albums, songs) after successful saves</li>
          <li>Return JSON responses with created resources so the UI can refresh lists</li>
        </ul>
      </div>
    </main>
  );
}
