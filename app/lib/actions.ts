"use server";

import { revalidatePath } from "next/cache";
import { addShow, getUser, updateWatchedOne, removeShow } from "./users";
import { getEpsNumber, getShowsList, getUsersShowsAndEpisodes } from "./api";
import { User } from "./definitions";

export async function updateWatchedEp(
  userId: string,
  showId: number,
  episodeNo: number
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
    const episodeNo = await getEpsNumber(showId);
    console.log("episodeNo", episodeNo);
    await addShow(userId, showId, episodeNo);
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
    const user: User = await getUser(id);
    const showIds = user.shows.map((s) => s.showId);
    const [showWEps, series] = await Promise.all([
      getUsersShowsAndEpisodes(showIds),
      getShowsList(showIds),
    ]);
    const seriesData = series.map((s) => s.data);
    const data = showWEps.map((s) => s.data);
    return JSON.stringify({ user, series: data, seriesData });
  } catch (err) {
    console.log(err);
    return "failed";
  }
}
