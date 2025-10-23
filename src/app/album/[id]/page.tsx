import { db } from "@/lib/db";
import AlbumPage from "@/components/AlbumPage";

export default async function Album({ params }: { params: { id: string } }) {
  const albumId = params.id;
  const [albumRows] = await db.execute(
    `SELECT 
        a.id, 
        a.name, 
        a.artist_id, 
        ar.name AS artist_name, 
        a.cover_path, 
        a.created_at
     FROM albums a
     JOIN artists ar ON a.artist_id = ar.id
     WHERE a.id = ?`,
    [albumId]
  );
  const [songRows] = await db.execute(
    "SELECT id, title, file_path FROM songs WHERE album_id = ? ORDER BY id",
    [albumId]
  );

  const albums = albumRows as unknown as {
    id: number;
    name: string;
    artist_id: number;
    artist_name: string;
    cover_path: string;
    created_at: string;
  }[];

  const songs = songRows as unknown as {
    id: number;
    title: string;
    file_path: string;
  }[];

  const album = albums[0];

  if (!album) {
    return <div className="text-center text-white p-10">Album not found</div>;
  }

  return <AlbumPage album={album} songs={songs} />;
}
