import { EpisodeSeries } from "@/app/lib/definitions";

function EpisodeList({
  episodes,
  setCurrEpisode,
}: {
  episodes: EpisodeSeries[] | undefined;
  setCurrEpisode: Function;
}) {
  console.log(episodes);
  episodes = episodes?.filter((e) => e.seasonNumber !== 0);
  console.log(episodes?.length);
  return (
    <div className="flex flex-col w-1/3 bg-red-800 rounded-md gap-2">
      {episodes ? (
        <>
          <p>Episodes</p>
          <ol className="flex flex-col gap-2">
            {episodes.map((episode: EpisodeSeries) => (
              <li
                className="bg-blue-600 rounded-md cursor-pointer hover:bg-blue-400 transition duration-300 ease-in-out"
                key={episode.id}
                onClick={() => setCurrEpisode(episode.id)}
              >
                {episode.name}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p>No Episodes Yet</p>
      )}
    </div>
  );
}

export default EpisodeList;
