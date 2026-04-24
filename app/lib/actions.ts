"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "./users";
import {
  deleteUserShow,
  getUserLibraryWithProgress,
  getUserShowsList,
  insertUserShow,
  toggleEpisodeWatched,
  updateUserShowStatus,
} from "./library-service";
import type { ShowStatus } from "./shows";
import { getShow } from "./api";

export async function updateWatchedEp(
  userId: string,
  showId: number,
  seasonNumber: number,
  episodeNumber: number,
  watchthrough = 0,
) {
  try {
    await toggleEpisodeWatched(
      userId,
      showId,
      seasonNumber,
      episodeNumber,
      watchthrough,
    );
    revalidatePath("/shows");
    return "successful" as const;
  } catch (err) {
    console.error(err);
    return "failed" as const;
  }
}

export async function addUserShow(userId: string, showId: number) {
  try {
    const detail = await getShow(showId);
    if (!detail?.id) {
      return "failed" as const;
    }
    await insertUserShow(userId, showId, detail.name ?? "Unknown show");
    revalidatePath("/shows");
    revalidatePath("/search");
    return "successful" as const;
  } catch (err) {
    console.error(err);
    return "failed" as const;
  }
}

export async function removeUserShow(userId: string, showId: number) {
  try {
    await deleteUserShow(userId, showId);
    revalidatePath("/shows");
    revalidatePath("/search");
    return "successful" as const;
  } catch (err) {
    console.error(err);
    return "failed" as const;
  }
}

export async function setUserShowStatus(
  userId: string,
  showId: number,
  status: ShowStatus,
) {
  try {
    await updateUserShowStatus(userId, showId, status);
    revalidatePath("/shows");
    revalidatePath(`/shows/${showId}`);
    revalidatePath("/search");
    return "successful" as const;
  } catch (err) {
    console.error(err);
    return "failed" as const;
  }
}

export async function getShowsAndEpsFromId(id: string) {
  try {
    const user = await getUser(id);
    if (!user) {
      return { ok: false as const, error: "User not found" };
    }
    const series = await getUserLibraryWithProgress(id);
    return { ok: true as const, user, series };
  } catch (err) {
    console.error(err);
    return { ok: false as const, error: "Failed to load shows" };
  }
}

export async function getShowsFromId(id: string) {
  try {
    const user = await getUser(id);
    if (!user) {
      return { ok: false as const, error: "User not found" };
    }
    const series = await getUserShowsList(id);
    return { ok: true as const, user, series };
  } catch (err) {
    console.error(err);
    return { ok: false as const, error: "Failed to load shows" };
  }
}
