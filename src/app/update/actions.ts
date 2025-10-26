'use server';

import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const ensureDir = (dir: string) => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

export async function getAlbumsWithSongs() {
  const [albums]: any = await db.execute(`
    SELECT a.id AS album_id, a.name AS album_name, a.cover_path,
           ar.name AS artist_name
    FROM albums a
    JOIN artists ar ON a.artist_id = ar.id
    ORDER BY a.id DESC;
  `);

  const [songs]: any = await db.execute(`
    SELECT id, title, album_id, file_path FROM songs ORDER BY id ASC;
  `);
  
  return albums.map((a: any) => ({
    ...a,
    songs: songs.filter((s: any) => s.album_id === a.album_id),
  }));
}

export async function updateAlbum(
  albumId: number,
  data: { name?: string; artistName?: string; newCover?: File | null }
) {
  try {
    let coverPath = null;

    if (data.newCover) {
      const albumName = data.name || `album_${albumId}`;
      const albumDir = path.join(uploadDir, albumName);
      ensureDir(albumDir);

      const coverBuffer = Buffer.from(await data.newCover.arrayBuffer());
      const coverFile = path.join(albumDir, 'cover.jpg');
      fs.writeFileSync(coverFile, coverBuffer);
      coverPath = `/uploads/${albumName}/cover.jpg`;
    }

    let artistId: number | null = null;
    if (data.artistName) {
      const [artistRes]: any = await db.execute(
        'INSERT INTO artists (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [data.artistName]
      );
      artistId = artistRes.insertId;
    }

    await db.execute(
      `UPDATE albums
       SET name = COALESCE(?, name),
           cover_path = COALESCE(?, cover_path),
           artist_id = COALESCE(?, artist_id)
       WHERE id = ?`,
      [data.name, coverPath, artistId, albumId]
    );

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function updateSong(
  songId: number,
  data: { title?: string; file?: File | null; albumName?: string }
) {
  try {
    let filePath = null;
    if (data.file && data.albumName) {
      const songsDir = path.join(uploadDir, data.albumName, 'songs');
      ensureDir(songsDir);

      const buffer = Buffer.from(await data.file.arrayBuffer());
      const newPath = path.join(songsDir, data.file.name);
      fs.writeFileSync(newPath, buffer);
      filePath = `/uploads/${data.albumName}/songs/${data.file.name}`;
    }

    await db.execute(
      `UPDATE songs
       SET title = COALESCE(?, title),
           file_path = COALESCE(?, file_path)
       WHERE id = ?`,
      [data.title, filePath, songId]
    );

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function deleteSong(songId: number) {
  await db.execute('DELETE FROM songs WHERE id = ?', [songId]);
  return { success: true };
}