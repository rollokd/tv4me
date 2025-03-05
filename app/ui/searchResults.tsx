"use client";

import { useEffect, useState } from "react";
import { SearchResponse, User } from "../lib/definitions";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { addUserShow, removeUserShow } from "../lib/actions";
import { imageLoader } from "../lib/client-utils";
import Image from "next/image";
import clsx from "clsx";

export default function SearchResults({
  query,
  id,
}: {
  query: string;
  id: string;
}) {
  const [user, setUser] = useState<User>({ _id: "", shows: [] });
  const [response, setResponse] = useState<SearchResponse[]>([]);

  const shows = user.shows.map((s) => s.showId);

  useEffect(() => {
    const fetchData = async () => {
      const [user, searchResults]: [
        user: User,
        searchResult: SearchResponse[]
      ] = await Promise.all([
        fetch(`http://localhost:3000/api/users/${id}`)
          .then((r) => r.json())
          .then((r) => r.user),
        fetch(`http://localhost:3000/api/shows/search/${query}`)
          .then((r) => r.json())
          .then((r) => r.searchResults),
      ]);
      console.log(searchResults);
      setUser(user);
      setResponse(searchResults);
    };
    if (query !== "") fetchData();
    else setResponse([]);
  }, [id, query]);

  return (
    <div className="grid grid-cols-2 grid-rows-4 border-2 rounded-md gap-5 m-5 p-5 grow">
      {response.length ? (
        <>
          {response.map((result) => {
            return (
              <div
                className={clsx(
                  "flex flex-row box-border items-center border-2 rounded-lg gap-4"
                )}
                key={result.id}
              >
                {result.poster_path && (
                  <Image
                    className="rounded-l-md"
                    loader={imageLoader}
                    width={100}
                    height={150}
                    src={result.poster_path}
                    alt={"Image of tv show: " + result.name}
                  />
                )}
                <div className="flex flex-col gap-4">
                  {result.name}
                  <button
                    className={clsx(
                      "flex flex-row gap-1 font-bold py-2 px-4 rounded-full w-fit",
                      shows.includes(Number(result.id))
                        ? "bg-green-500"
                        : "bg-blue-500 hover:bg-blue-700"
                    )}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!shows.includes(Number(result.id))) {
                        await addUserShow(user._id, Number(result.id));
                        setUser((prev: User) => {
                          return {
                            ...prev,
                            shows: [
                              ...prev.shows,
                              { showId: Number(result.id), watched: [] },
                            ],
                          };
                        });
                      } else {
                        await removeUserShow(user._id, Number(result.id));
                        setUser((prev: User) => {
                          return {
                            ...prev,
                            shows: prev.shows.filter(
                              (s) => s.showId !== Number(result.id)
                            ),
                          };
                        });
                      }
                    }}
                  >
                    {shows.includes(Number(result.id)) ? (
                      <>
                        Added
                        <CheckCircleIcon className="h-6 w-6" />
                      </>
                    ) : (
                      <>
                        Add
                        <PlusCircleIcon className="h-6 w-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="col-span-2 justify-self-center self-center">
          Try searching for something!
        </div>
      )}
    </div>
  );
}
