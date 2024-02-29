import dbConnect from "./db";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const createUser = async (name: string, email: string, password: string) => {
  await dbConnect();
  const user = await User.create({ name, email, password });
  return user;
};

export { createUser };
