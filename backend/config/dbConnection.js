import mongoose from "mongoose";
import env from "./envConfig.js";

export default async function dbConnection() {
  try {
    await mongoose.connect(env.MONGO_URL);
    console.log("[MONGO] DB connected successfully");
  } catch (err) {
    console.log("[ERROR] failed to connect to db", err);
  }
}
