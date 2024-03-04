import { EpisodeSeries } from "@/app/lib/definitions";
import Image from "next/image";

function EpisodeItem({ episode }: { episode: EpisodeSeries | undefined }) {
  return (
    <div className="bg-red-800 w-1/3 rounded-md">
      {episode ? (
        <>
          {/* TODO: find how to render images behind API authentication */}
          {/* <Image
            width={300}
            height={300}
            src={episode?.image}
            alt="Image of episode"
          ></Image> */}
          <h1>{episode?.name}</h1>
          <p>{episode?.overview}</p>
          <p>{episode?.aired}</p>
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
