"use server";

import { revalidatePath } from "next/cache";
import { updateWatchedOne } from "./users";

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
