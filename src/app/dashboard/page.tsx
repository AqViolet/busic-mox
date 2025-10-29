import Link from "next/link";
import { db } from "@/lib/db";
import AlbumCard from "@/components/AlbumCard"
import AuthGuard from "@/components/AuthGuard";

export const revalidate = 0;

export default async function DashboardPage() {
  const [rows]: any = await db.execute(`
    SELECT albums.id, albums.name AS album_name, albums.cover_path,
           artists.name AS artist_name
    FROM albums
    JOIN artists ON albums.artist_id = artists.id
    ORDER BY albums.id DESC;
  `);

  const albums = rows as {
    id: number;
    album_name: string;
    artist_name: string;
    cover_path: string;
  }[];

  return (
    <AuthGuard>
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex justify-between items-center px-6 py-3 text-sm text-gray-400">
      </div>
      <section className="flex-1 px-8 pb-12">
        {albums.length === 0 ? (
          <p className="text-gray-500 mt-12 text-center">
            No albums uploaded yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {albums.map((album) => (
              <Link key={album.id} href={`/album/${album.id}`} className="block">
                <AlbumCard
                  title={album.album_name}
                  artist={album.artist_name}
                  cover={album.cover_path}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
    </AuthGuard>
  );
}
