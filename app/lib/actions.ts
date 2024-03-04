"use server";

import { revalidatePath } from "next/cache";
import { addShow, updateWatchedOne } from "./users";
import { getEpsNumber } from "./api";

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
