import { prettyDate } from "@/app/lib/client-utils";
import { Episode } from "@/app/lib/definitions";
import Image from "next/image";
import { imageLoader } from "@/app/lib/client-utils";

function EpisodeItem({ episode }: { episode: Episode | undefined }) {
  return (
    <div className="flex flex-col w-1/3 rounded-md">
      <h1 className="text-white text-2xl sticky top-0 px-3 pt-3 pb-1">
        Description
      </h1>
      {episode ? (
        <div className="flex flex-col mt-2 gap-3 p-3 items-center text-center text-white overflow-y-auto border-2 border-white rounded-md h-full">
          <h2 className="text-2xl p-2">{episode?.name}</h2>
          {episode.still_path && (
            <Image
              className="white-border w-full h-auto"
              loader={imageLoader}
              width={300}
              height={150}
              src={episode.still_path}
              alt="Image of episode"
              priority
            ></Image>
          )}
          <p>{episode?.overview}</p>
          <p>Airdate: {prettyDate(episode?.air_date)}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-3 items-center text-center text-white overflow-y-auto border-2 border-white rounded-md h-full">
          <p>Hmm...?</p>
          <p>No episode selected yet</p>
        </div>
      )}
    </div>
  );
}

export default EpisodeItem;
