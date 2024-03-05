import { EpisodeSeries } from "@/app/lib/definitions";
import Image from "next/image";

function EpisodeItem({ episode }: { episode: EpisodeSeries | undefined }) {
  return (
    <div className="flex flex-col p-3 items-center text-center gap-3 bg-gray-950 text-white w-1/3 rounded-md overflow-y-auto">
      {episode ? (
        <>
          <h1 className="text-2xl p-2">{episode?.name}</h1>
          {/* TODO: find how to render images behind API authentication */}
          <Image
            className="border-2 border-white rounded-md"
            width={500}
            height={500}
            src={"https://artworks.thetvdb.com" + episode?.image}
            alt="Image of episode"
          ></Image>
          <p>{episode?.overview}</p>
          <p>Airdate: {episode?.aired}</p>
        </>
      ) : (
        <>
          <p>Hmm...?</p>
          <p>No Episode here yet</p>
        </>
      )}
    </div>
  );
}

export default EpisodeItem;
