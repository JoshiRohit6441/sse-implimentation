import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/envConfig.js";

// GENERATE AUTH TOKEN
export const generateAuthToken = async (userId, type) => {
  try {
    if (!["access", "refresh"].includes(type))
      throw new Error("Invalid token type");

    return jwt.sign(
      { id: userId },
      type == "access" ? env.ACCESS_TOKEN_SECRET : env.REFRESH_TOKEN_SECRET,
      { expiresIn: type == "access" ? "15m" : "1d" },
    );
  } catch (err) {
    throw new Error(err?.message);
  }
};

// VERIFY AUTH TOKEN
export const verifyAuthToken = async (token, type) => {
  if (!["access", "refresh"].includes(type))
    throw new Error("Invalid token type");

  return jwt.verify(
    token,
    type == "access" ? env.ACCESS_TOKEN_SECRET : env.REFRESH_TOKEN_SECRET,
  );
};

// GENERATE OTP
export const generateOTP = (length = 6) => {
  try {
    const min = 10 ** (length - 1);
    const max = 10 ** length;

    return crypto.randomInt(min, max).toString();
  } catch (err) {
    throw new Error(err?.message);
  }
};
