type Props = {
  title: string;
  artist: string;
  cover: string;
};

export default function AlbumCard({ title, artist, cover }: Props) {
  return (
    <div className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105">
      <div className="w-40 h-40 bg-neutral-800 rounded overflow-hidden shadow-md">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <div className="text-center mt-2">
        <p className="text-sm font-medium text-white truncate w-40">
          {title}
        </p>
        <p className="text-xs text-gray-400 truncate w-40">{artist}</p>
      </div>
    </div>
  );
}
