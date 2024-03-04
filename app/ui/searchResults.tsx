"use client";

import { useEffect, useState } from "react";
import { SearchResponse, User, UserShow } from "../lib/definitions";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { addUserShow } from "../lib/actions";
import clsx from "clsx";
import { set } from "mongoose";

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
      console.log("fetching data for query:", query);
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
  }, [id, query]);

  query && console.log("got data for query:", query);
  // console.log("response:", response);
  return (
    <div>
      <h1>Search Results</h1>
      <p>Results for {query}</p>
      {response.length ? (
        <ol>
          {response.map((result) => {
            return (
              <li className="flex flex-row items-center gap-2" key={result.id}>
                {result.name}
                <button
                  className={clsx(
                    "flex flex-row gap-1 text-white font-bold py-2 px-4 rounded-full",
                    shows.includes(Number(result.tvdb_id))
                      ? "bg-green-500"
                      : "bg-blue-500 hover:bg-blue-700"
                  )}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!shows.includes(Number(result.tvdb_id))) {
                      console.log("adding show:", result.name);
                      const resp = await addUserShow(
                        user._id,
                        Number(result.tvdb_id)
                      );
                      console.log("resp:", resp);
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
                      console.log("show already added:", result.name);
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
              </li>
            );
          })}
        </ol>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
