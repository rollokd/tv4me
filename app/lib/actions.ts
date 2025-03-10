"use server";

import { revalidatePath } from "next/cache";
import { addShow, getUser, updateWatchedOne, removeShow } from "./users";
import { getEpisodes, getUsersShowsAndEpisodes } from "./api";

export async function updateWatchedEp(
  userId: string,
  showId: number,
  episodeNo: number,
) {
  try {
    await updateWatchedOne(userId, showId, episodeNo);
    revalidatePath("/shows");
    return "successful";
  } catch (err) {
    console.log(err);
    return "failed";
  }
}

export async function addUserShow(userId: string, showId: number) {
  try {
    const episodes = await getEpisodes(showId);
    console.log("episodeNo", episodes);
    await addShow(userId, showId, episodes);
    revalidatePath("/shows");
    return "successful";
  } catch (err) {
    console.log(err);
    return "failed";
  }
}

export async function removeUserShow(userId: string, showId: number) {
  try {
    await removeShow(userId, showId);
    revalidatePath("/shows");
    return "successful";
  } catch (err) {
    console.log(err);
    return "failed";
  }
}

export async function getShowsAndEpsFromId(id: string) {
  try {
    const user = await getUser(id);
    const showWEps = await getUsersShowsAndEpisodes(id);
    return JSON.stringify({ user, series: showWEps });
  } catch (err) {
    console.log(err);
    return "failed";
  }
}
