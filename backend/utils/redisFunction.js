import redis from "../config/redicConnection.js";

// set redis data
export const setRedisData = async (key, value, expiration = 120) => {
  try {
    const redisValue =
      typeof value === "object" ? JSON.stringify(value) : value;
    await redis.set(key, redisValue, "EX", expiration);
    return true;
  } catch (err) {
    throw new Error(err?.message);
  }
};

// get redis data
export const getRedisData = async (key) => {
  try {
    const data = await redis.get(key);
    return data;
  } catch (err) {
    throw new Error(err?.message);
  }
};

// delete redis data
export const deleteRedisData = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    throw new Error(err?.message);
  }
};

// get locked seats
export const getLockedSeatKeys = async (date) => {
  try {
    const keys = [];

    const stream = redis.scanStream({
      match: `${date}-*`,
      count: 1000,
    });

    for await (const batch of stream) {
      keys.push(...batch);
    }

    return keys;
  } catch (err) {
    console.error("Redis scan error:", err);
    throw err;
  }
};

export const getLockedSeats = async (date, id) => {
  try {
    const keys = await getLockedSeatKeys(date);
    const lockedSeats = [];
    for (const key of keys) {
      const data = await getRedisData(key);
      const parsedData = JSON.parse(data);
      lockedSeats.push(parsedData);
    }

    return lockedSeats;
  } catch (err) {
    throw new Error(err?.message);
  }
};
