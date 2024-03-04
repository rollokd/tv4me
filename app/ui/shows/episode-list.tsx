import { updateWatchedEp } from "@/app/lib/actions";
import { EpisodeSeries, User } from "@/app/lib/definitions";
import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";

function EpisodeList({
  user,
  setUser,
  currShow,
  episodes,
  setCurrEpisode,
  watchedList,
}: {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  currShow: number;
  episodes: EpisodeSeries[] | undefined;
  setCurrEpisode: Function;
  watchedList: boolean[] | undefined;
}) {
  // function handleWatchedClick(event: React.MouseEvent<HTMLButtonElement>) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   console.log(`watched ${episode.name} + no. ${index} `);
  // }
  // console.log(episodes);
  episodes = episodes?.filter((e) => e.seasonNumber !== 0);
  console.log(episodes?.length);
  return (
    <div className="flex flex-col w-1/3 bg-red-800 rounded-md gap-2">
      {episodes && watchedList ? (
        <>
          <p>Episodes</p>
          <ol className="flex flex-col gap-2">
            {episodes.map((episode: EpisodeSeries, index: number) => (
              <li
                className={`flex flex-row justify-between items-center ${
                  watchedList[index] ? "bg-green-600" : "bg-blue-600"
                } rounded-md cursor-pointer ${
                  watchedList[index]
                    ? "hover:bg-green-400"
                    : "hover:bg-blue-400"
                } transition duration-300 ease-in-out`}
                key={episode.id}
                onClick={() => setCurrEpisode(episode.id)}
              >
                {episode.name}
                <button
                  className={
                    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  }
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const resp = await updateWatchedEp(
                      user._id,
                      currShow,
                      index
                    );
                    if (resp == "successful") {
                      setUser((prev: User) => {
                        return {
                          ...prev,
                          shows: prev.shows.map((s) => {
                            return s.showId === currShow
                              ? { ...s, watched: watchedList }
                              : s;
                          }),
                        };
                      });
                      console.log(`watched ${episode.name} + no. ${index} `);
                    }
                  }}
                >
                  {watchedList[index] ? "Unwatched" : "Watched"}
                </button>
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
