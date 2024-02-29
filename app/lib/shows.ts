import dbConnect from "./db";

const showSchema = new mongoose.Schema({});

const Show = mongoose.model("Show", showSchema);

export {};
