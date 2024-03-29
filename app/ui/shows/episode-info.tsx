import { prettyDate } from "@/app/lib/client-utils";
import { EpisodeSeries } from "@/app/lib/definitions";
import Image from "next/image";

function EpisodeItem({ episode }: { episode: EpisodeSeries | undefined }) {
  return (
    <div className="flex flex-col p-3 items-center text-center gap-3 bg-gray-950 text-white w-1/3 rounded-md overflow-y-auto">
      {episode ? (
        <>
          <h1 className="text-2xl p-2">{episode?.name}</h1>
          {episode.image && (
            <Image
              className="white-border w-full h-auto"
              width={500}
              height={500}
              src={"https://artworks.thetvdb.com" + episode.image}
              alt="Image of episode"
              priority
            ></Image>
          )}
          <p>{episode?.overview}</p>
          <p>Airdate: {prettyDate(episode?.aired)}</p>
        </>
      ) : (
        <>
          <p>Hmm...?</p>
          <p>No episode selected yet</p>
        </>
      )}
    </div>
  );
}

export default EpisodeItem;
