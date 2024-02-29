import dbConnect from "./db";
import mongoose from "mongoose";
import { User } from "./definitions";

const userSchema = new mongoose.Schema({
  shows: [
    {
      showId: Number,
      watched: [Boolean],
    },
  ],
});

const UserModel = mongoose.model<User>("User", userSchema);

const createUser = async () => {
  await dbConnect();
  const user = await UserModel.create({ shows: [] });
  return user;
};

const addShow = async (userId: string, showId: number) => {
  try {
    await dbConnect();
    const user = await UserModel.findById(userId);
    if (user) {
      user.shows.push({ showId, watched: [] });
      await user.save();
    } else {
      throw new Error("User not found");
    }
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
    await dbConnect();
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const show = user.shows.find((s) => s.showId === showId);
    if (!show) {
      throw new Error("Show not found");
    }
    show.watched[episode] = true;
    await user.save();
  } catch (err) {
    console.error(err);
  }
};

export { createUser, addShow, updateWatchedOne };
