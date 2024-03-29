"use client";

import { useEffect, useState } from "react";
import { SearchResponse, User } from "../lib/definitions";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { addUserShow, removeUserShow } from "../lib/actions";
import clsx from "clsx";
import Image from "next/image";

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
      setUser(user);
      setResponse(searchResults);
    };
    if (query !== "") fetchData();
    else setResponse([]);
  }, [id, query]);

  return (
    <div className="grid grid-cols-2 grid-rows-4 border-2 border-white rounded-md gap-5 m-5 p-5 h-full">
      {response.length ? (
        <>
          {response.map((result) => {
            return (
              <div
                className="flex flex-row box-border items-center gap-2 border-2 border-white rounded-lg pr-4"
                key={result.id}
              >
                <Image
                  className="rounded-l-md w-auto h-full"
                  width={100}
                  height={100}
                  src={result.image_url}
                  alt={"Image of tv show: " + result.name}
                />
                {result.name}
                <button
                  className={clsx(
                    "ml-auto flex flex-row gap-1 text-white font-bold py-2 px-4 rounded-full",
                    shows.includes(Number(result.tvdb_id))
                      ? "bg-green-500"
                      : "bg-blue-500 hover:bg-blue-700"
                  )}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!shows.includes(Number(result.tvdb_id))) {
                      const resp = await addUserShow(
                        user._id,
                        Number(result.tvdb_id)
                      );
                      setUser((prev: User) => {
                        return {
                          ...prev,
                          shows: [
                            ...prev.shows,
                            { showId: Number(result.tvdb_id), watched: [] },
                          ],
                        };
                      });
                    } else {
                      const resp = await removeUserShow(
                        user._id,
                        Number(result.tvdb_id)
                      );
                      setUser((prev: User) => {
                        return {
                          ...prev,
                          shows: prev.shows.filter(
                            (s) => s.showId !== Number(result.tvdb_id)
                          ),
                        };
                      });
                    }
                  }}
                >
                  {shows.includes(Number(result.tvdb_id)) ? (
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
