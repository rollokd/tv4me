"use client";

import { useEffect, useState } from "react";
import type { SearchResponse } from "../lib/definitions";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { addUserShow, removeUserShow } from "../lib/actions";
import { imageLoader } from "../lib/client-utils";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export default function SearchResults({
  query,
  id,
}: {
  query: string;
  id: string;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [libraryShowIds, setLibraryShowIds] = useState<number[]>([]);
  const [response, setResponse] = useState<SearchResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      const [userPayload, searchResults]: [
        { user: SessionUser; libraryShowIds: number[] },
        SearchResponse[],
      ] = await Promise.all([
        fetch(`${base}/api/users/${id}`).then((r) => {
          if (!r.ok) throw new Error("user fetch failed");
          return r.json();
        }),
        fetch(`${base}/api/shows/search/${encodeURIComponent(query)}`)
          .then((r) => r.json())
          .then((r) => r.searchResults as SearchResponse[]),
      ]);
      setUser(userPayload.user);
      setLibraryShowIds(userPayload.libraryShowIds ?? []);
      setResponse(searchResults ?? []);
    };
    if (query !== "") fetchData().catch(() => setResponse([]));
    else setResponse([]);
  }, [id, query]);

  return (
    <div className="grid grid-cols-2 grid-rows-4 border-2 rounded-md gap-5 m-5 p-5 grow">
      {response.length ? (
        <>
          {response.map((result) => (
            <Card
              className="flex flex-row box-border items-center border-2 rounded-lg gap-4 p-2"
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
                <span className="font-medium">{result.name}</span>
                <Button
                  type="button"
                  variant={
                    libraryShowIds.includes(Number(result.id))
                      ? "secondary"
                      : "default"
                  }
                  className="w-fit gap-1 rounded-full font-bold"
                  disabled={!user}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) return;
                    const rid = Number(result.id);
                    if (!libraryShowIds.includes(rid)) {
                      const res = await addUserShow(user.id, rid);
                      if (res === "successful") {
                        setLibraryShowIds((prev) => [...prev, rid]);
                      }
                    } else {
                      const res = await removeUserShow(user.id, rid);
                      if (res === "successful") {
                        setLibraryShowIds((prev) =>
                          prev.filter((x) => x !== rid),
                        );
                      }
                    }
                  }}
                >
                  {libraryShowIds.includes(Number(result.id)) ? (
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
                </Button>
              </div>
            </Card>
          ))}
        </>
      ) : (
        <div className="col-span-2 justify-self-center self-center text-muted-foreground">
          Try searching for something!
        </div>
      )}
    </div>
  );
}
