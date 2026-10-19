import { Redis } from "ioredis";
import env from "./envConfig.js";

const redis = new Redis(env.REDIS_URL);

export async function connectRedis() {
  redis.on("connect", () => {
    console.log("[REDIS] Connected to Redis");
  });

  redis.on("error", (err) => {
    console.log("[REDIS] Error connecting to Redis", err);
  });

  redis.on("end", () => {
    console.log("[REDIS] Disconnected from Redis");
  });
}

export default redis;
