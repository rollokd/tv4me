import { EpisodeSeries } from "@/app/lib/definitions";

function EpisodeItem({ episode }: { episode: EpisodeSeries | undefined }) {
  return (
    <div className="bg-red-800 w-1/3 rounded-md">
      <h1>{episode?.name}</h1>
      <p>{episode?.overview}</p>
      <p>{episode?.aired}</p>
    </div>
  );
}

export default EpisodeItem;
