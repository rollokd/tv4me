import dbConnect from "./db";
import mongoose from "mongoose";
import { User, UserShow } from "./definitions";

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

const createUser = async () => {
  const user = await UserModel.create({ shows: [] });
  return user;
};

const getUser = async (userId: string) => {
  try {
    await dbConnect();
    const user = await UserModel.findById(userId);
    return user;
  } catch (err) {
    console.log(err);
    return "User not found";
  }
};

const addShow = async (userId: string, showId: number, episodes: number) => {
  try {
    await dbConnect();
    const user = await UserModel.findById(userId);
    if (user.shows.find((s: UserShow) => s.showId === showId)) {
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

const updateWatchedOne = async (
  userId: string,
  showId: number,
  episode: number
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
    show.watched[episode] = true;
    await user.save();
  } catch (err) {
    console.error(err);
  }
};

export { createUser, getUser, addShow, updateWatchedOne };
