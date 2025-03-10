import { SeriesExtended } from "@/app/lib/definitions";
import ShowList from "./show-list";

interface ShowsTableProps {
  series: SeriesExtended[];
}

export default function ShowsTable({ series }: ShowsTableProps) {
  console.log(series);

  // const episodes = series.length
  //   ? series
  //       .find((s) => s.id === currShow)
  //       ?.seasons.flatMap((s) => s.episodes || [])
  //   : undefined;
  // const watchedList = user
  //   ? user.shows.find((s) => s.showId === currShow)?.watched
  //   : undefined;

  const sortedShows =
    series &&
    series.sort((a, b) => {
      return (
        new Date(b.last_air_date).getTime() -
        new Date(a.last_air_date).getTime()
      );
    });

  // const setCurrShowAndEpFromSeries = (series: SeriesExtended) => {
  //   if (series && series.id) {
  //     setCurrShow(series.id);
  //     setCurrEpisode(
  //       series.seasons[0] && series.seasons[0].episodes
  //         ? series.seasons[0].episodes[0].id
  //         : 0,
  //     );
  //   }
  // };
  // const setCurrShowAndEp = (showId: number, ep: number) => {
  //   setCurrShow(showId);
  //   setCurrEpisode(ep);
  // };

  return (
    <div className="flex flex-row gap-3 p-5 overflow-y-auto h-full">
      {series.length ? (
        <ShowList shows={sortedShows} />
      ) : (
        <div className="p-5 flex flex-col text-2xl w-1/3 overflow-y-auto scrollbar-hide rounded-md">
          No Shows Yet <br />
          <p className="text-lg">Try searching for a new show</p>
        </div>
      )}
      {series.length ? (
        // <EpisodeList
        //   user={user}
        //   setUser={setUser}
        //   currShow={currShow}
        //   currEpisode={currEpisode}
        //   episodes={episodes}
        //   setCurrEpisode={setCurrEpisode}
        //   watchedList={watchedList}
        // />
        <div className="p-5 flex flex-col text-2xl w-1/3 overflow-y-auto scrollbar-hide rounded-md">
          Not for you yet
        </div>
      ) : (
        <div className="p-5 text-2xl flex flex-col w-1/3 rounded-md">
          No Show Selected
        </div>
      )}
      {/* <EpisodeItem episode={episodes?.find((e) => e.id === currEpisode)} /> */}
    </div>
  );
}
