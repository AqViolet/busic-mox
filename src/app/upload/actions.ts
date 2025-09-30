'use server';

import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
// import { NextResponse } from 'next/server';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

//dir check
const ensureDirs = () => {
  const albumDir = path.join(uploadDir, 'album_covers');
  const songDir = path.join(uploadDir, 'songs');
  if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });
  if (!fs.existsSync(songDir)) fs.mkdirSync(songDir, { recursive: true });
};

export async function uploadNewAlbum(formData: FormData) {
  ensureDirs();

  const albumName = formData.get('albumName') as string;
  const artistName = formData.get('artistName') as string;
  const cover = formData.get('albumCover') as File;
  const song = formData.get('song') as File;

  if (!albumName || !artistName || !cover || !song)
    throw new Error('All fields are required.');

  const coverPath = path.join(uploadDir, 'album_covers', cover.name);
  const coverBuffer = Buffer.from(await cover.arrayBuffer());
  fs.writeFileSync(coverPath, coverBuffer);

  const songPath = path.join(uploadDir, 'songs', song.name);
  const songBuffer = Buffer.from(await song.arrayBuffer());
  fs.writeFileSync(songPath, songBuffer);

  const [artistResult]: any = await db.execute(
    'INSERT INTO artists (name) VALUES (?)',
    [artistName]
  );
  const artistId = artistResult.insertId;

  const [albumResult]: any = await db.execute(
    'INSERT INTO albums (name, artist_id, cover_path) VALUES (?, ?, ?)',
    [albumName, artistId, `/uploads/album_covers/${cover.name}`]
  );
  const albumId = albumResult.insertId;

  await db.execute(
    'INSERT INTO songs (title, album_id, file_path) VALUES (?, ?, ?)',
    [song.name, albumId, `/uploads/songs/${song.name}`]
  );

  return { success: true };
}

export async function uploadExistingAlbum(formData: FormData) {
  ensureDirs();

  const albumId = formData.get('albumId') as string;
  const song = formData.get('song') as File;

  if (!albumId || !song) throw new Error('All fields are required.');

  const songPath = path.join(uploadDir, 'songs', song.name);
  const songBuffer = Buffer.from(await song.arrayBuffer());
  fs.writeFileSync(songPath, songBuffer);

  await db.execute(
    'INSERT INTO songs (title, album_id, file_path) VALUES (?, ?, ?)',
    [song.name, albumId, `/uploads/songs/${song.name}`]
  );

  return { success: true };
}

export async function getAlbums() {
  const [albums] = await db.execute('SELECT id, name FROM albums');
  return albums as { id: number; name: string }[];
}
