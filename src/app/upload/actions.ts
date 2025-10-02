'use server';

import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

//dir check
const ensureDirs = () => {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
};

export async function uploadNewAlbum(formData: FormData) {
  ensureDirs();

  const albumName = formData.get('albumName') as string;
  const artistName = formData.get('artistName') as string;
  const cover = formData.get('albumCover') as File;
  const song = formData.get('song') as File;

  if (!albumName || !artistName || !cover || !song)
    throw new Error('All fields are required.');

  // Album-specific directory structure
  const albumFolder = path.join(uploadDir, albumName);
  const albumCoverPath = path.join(albumFolder, 'cover.jpg');
  const albumSongsDir = path.join(albumFolder, 'songs');

  if (!fs.existsSync(albumFolder)) fs.mkdirSync(albumFolder, { recursive: true });
  if (!fs.existsSync(albumSongsDir)) fs.mkdirSync(albumSongsDir, { recursive: true });

  // Save album cover
  const coverBuffer = Buffer.from(await cover.arrayBuffer());
  fs.writeFileSync(albumCoverPath, coverBuffer);

  // Save song
  const songPath = path.join(albumSongsDir, song.name);
  const songBuffer = Buffer.from(await song.arrayBuffer());
  fs.writeFileSync(songPath, songBuffer);

  // Insert into DB
  const [artistResult]: any = await db.execute(
    'INSERT INTO artists (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
    [artistName]
  );
  const artistId = artistResult.insertId;

  const [albumResult]: any = await db.execute(
    'INSERT INTO albums (name, artist_id, cover_path) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
    [albumName, artistId, `/uploads/${albumName}/cover.jpg`]
  );
  const albumId = albumResult.insertId;

  await db.execute(
    'INSERT INTO songs (title, album_id, file_path) VALUES (?, ?, ?)',
    [song.name, albumId, `/uploads/${albumName}/songs/${song.name}`]
  );

  return { success: true };
}

export async function uploadExistingAlbum(formData: FormData) {
  ensureDirs();

  const albumId = formData.get('albumId') as string;
  const albumName = formData.get('albumName') as string;
  const song = formData.get('song') as File;

  if (!albumId || !albumName || !song) throw new Error('All fields are required.');
  const albumSongsDir = path.join(uploadDir, albumName, 'songs');
  if (!fs.existsSync(albumSongsDir)) fs.mkdirSync(albumSongsDir, { recursive: true });

  const songPath = path.join(albumSongsDir, song.name);
  const songBuffer = Buffer.from(await song.arrayBuffer());
  fs.writeFileSync(songPath, songBuffer);

  await db.execute(
    'INSERT INTO songs (title, album_id, file_path) VALUES (?, ?, ?)',
    [song.name, albumId, `/uploads/${albumName}/songs/${song.name}`]
  );

  return { success: true };
}

export async function getAlbums() {
  const [albums] = await db.execute('SELECT id, name, cover_path FROM albums');
  return albums as { id: number; name: string; cover_path: string }[];
}
