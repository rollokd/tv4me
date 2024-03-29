import { Dispatch, SetStateAction } from "react";
import { updateWatchedEp } from "@/app/lib/actions";
import { EpisodeSeries, User } from "@/app/lib/definitions";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";

function EpisodeList({
  user,
  setUser,
  currShow,
  currEpisode,
  episodes,
  setCurrEpisode,
  watchedList,
}: {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  currShow: number;
  currEpisode: number;
  episodes: EpisodeSeries[] | undefined;
  setCurrEpisode: Dispatch<SetStateAction<number>>;
  watchedList: boolean[] | undefined;
}) {
  async function handleWatchedClick(
    e: React.MouseEvent<HTMLButtonElement>,
    watchedList: boolean[],
    index: number,
    episode: EpisodeSeries
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (episodes)
      watchedList[episodes?.indexOf(episode)] =
        !watchedList[episodes?.indexOf(episode)];
    const resp = await updateWatchedEp(user._id, currShow, index);

    setUser((prev: User) => {
      return {
        ...prev,
        shows: prev.shows.map((s) => {
          return s.showId === currShow ? { ...s, watched: watchedList } : s;
        }),
      };
    });
  }

  episodes = episodes?.filter((e) => e.seasonNumber !== 0 && e.aired !== null);
  const epsBySeason = episodes
    ?.reduce((acc: EpisodeSeries[][], item) => {
      if (!acc[item.seasonNumber]) {
        acc[item.seasonNumber] = [];
      }
      acc[item.seasonNumber].push(item);
      return acc;
    }, [])
    .slice(1);

  const seasonNodes =
    watchedList &&
    epsBySeason?.map((season, index) => {
      return (
        <div key={index}>
          <h2 className="text-white bg-gray-950 text-2xl sticky top-0 px-3 py-2 border-b-2 border-white">
            Season {index + 1}
          </h2>
          <div className="rounded-md overflow-y-auto scrollbar-hide h-full">
            <ol className="pl-5 text-white flex flex-col list-decimal list-inside">
              {episodes &&
                season.map((episode: EpisodeSeries, index: number) => (
                  <li
                    className={`flex flex-row p-2 justify-between items-center cursor-pointer border-b-2 transition hover:text-sky-400 duration-300 ease-in-out ${
                      currEpisode === episode.id ? "text-blue-500" : ""
                    }`}
                    key={episode.id}
                    onClick={() => setCurrEpisode(episode.id)}
                  >
                    {index + 1 + ". " + episode.name}
                    <button
                      className={
                        "text-white bg-blue-500 hover:text-blue-700 p-1 rounded-full"
                      }
                      onClick={async (e) => {
                        await handleWatchedClick(
                          e,
                          watchedList,
                          index,
                          episode
                        );
                      }}
                    >
                      {watchedList[episodes?.indexOf(episode)] ? (
                        <SolidCheck className=" w-7 h-7" />
                      ) : (
                        <PlusCircleIcon className="w-7 h-7" />
                      )}
                    </button>
                  </li>
                ))}
            </ol>
          </div>
        </div>
      );
    });

  return (
    <div className="flex flex-col w-1/3 bg-gray-950 rounded-md">
      {episodes && watchedList ? (
        <>
          <h1 className="rounded-md bg-gray-950 text-white text-2xl sticky top-0 px-3 pt-3 pb-1">
            Episodes
          </h1>
          <div className="border-2 border-white rounded-md overflow-y-auto scrollbar-hide h-full mt-2">
            {seasonNodes}
          </div>
        </>
      ) : (
        <p>No Episodes Yet</p>
      )}
    </div>
  );
}

export default EpisodeList;
