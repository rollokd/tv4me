import mongoose from "mongoose";
import { User, UserShow } from "./definitions";
import { db } from "../db";
import { user } from "./schema/auth-schema";
import { eq } from "drizzle-orm";

const userSchema = new mongoose.Schema({
  shows: [
    {
      showId: Number,
      watched: [Boolean],
    },
  ],
});

const UserModel =
  mongoose.models.User || mongoose.model<User>("User", userSchema);

const getUser = async (userId: string) => {
  try {
    const users = await db.select().from(user).where(eq(user.id, userId));
    const foundUser = users[0];
    return foundUser;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const addShow = async (userId: string, showId: number, episodes: number) => {
  try {
    const user = await UserModel.findById(userId);
    if (user && user.shows.find((s: UserShow) => s.showId === showId)) {
      throw new Error("Show already added");
    }
    if (!user) {
      throw new Error("User not found");
    }
    const watched = new Array(episodes).fill(false);
    user.shows.push({ showId, watched });
    await user.save();
  } catch (err) {
    console.error(err);
  }
};

const removeShow = async (userId: string, showId: number) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.shows = user.shows.filter((s: UserShow) => s.showId !== showId);
    await user.save();
  } catch (err) {
    console.error(err);
  }
};

const updateWatchedOne = async (
  userId: string,
  showId: number,
  episode: number,
) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const show = user.shows.find((s: UserShow) => s.showId === showId);
    if (!show) {
      throw new Error("Show not found");
    }
    if (episode < 0 || episode >= show.watched.length) {
      throw new Error("Episode index out of range");
    }
    show.watched[episode] = !show.watched[episode];
    await user.save();
    return user;
  } catch (err) {
    console.error(err);
  }
};

export { getUser, addShow, updateWatchedOne, removeShow };
