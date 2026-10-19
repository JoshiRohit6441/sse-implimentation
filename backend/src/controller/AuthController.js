import { generateAuthToken, generateOTP } from "../../utils/helper-function.js";
import httpResponse from "../../utils/http-response.js";
import {
  deleteRedisData,
  getRedisData,
  setRedisData,
} from "../../utils/redisFunction.js";
import User from "../model/UserSchema.js";

// register login controller
export const registerLogin = async (req, resp) => {
  try {
    const { email } = req.body;
    if (!email) return httpResponse(404, "Email is required", {}, resp);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {},
      },
      {
        upsert: true,
        new: true,
      },
    );

    const otp = generateOTP();

    await setRedisData(`${email}-otp`, otp, 120);
    console.log("otp  ", otp);

    const accessToken = await generateAuthToken(user._id, "access");

    resp.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
      sameSite: "lax",
    });

    return httpResponse(200, "OTP sent successfully to your email", {}, resp);
  } catch (err) {
    return httpResponse(500, err?.message, {}, resp);
  }
};

// verify OTP controller
export const verifyOTP = async (req, resp) => {
  try {
    const user = req.user;
    const { otp } = req.body;

    if (!otp) return httpResponse(404, "OTP is required", {}, resp);

    const redisCode = await getRedisData(`${user?.email}-otp`);
    if (redisCode !== otp) return httpResponse(404, "Invalid OTP", {}, resp);

    await deleteRedisData(`${user?.email}-otp`);

    const [accessToken, refreshToken] = await Promise.all([
      generateAuthToken(user._id, "access"),
      generateAuthToken(user._id, "refresh"),
    ]);

    resp.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
      sameSite: "lax",
    });
    resp.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return httpResponse(200, "Login successful", {}, resp);
  } catch (err) {
    console.log("err : ", err);
    return httpResponse(500, err?.message, {}, resp);
  }
};

// get profile
export const getProfile = async (req, resp) => {
  try {
    const user = req.user;
    return httpResponse(200, "Profile fetched successfully", { user }, resp);
  } catch (err) {
    return httpResponse(500, err?.message, {}, resp);
  }
};

// logout
export const logout = async (req, resp) => {
  try {
    resp.clearCookie("accessToken");
    resp.clearCookie("refreshToken");
    return httpResponse(200, "Logout successful", {}, resp);
  } catch (err) {
    return httpResponse(500, err?.message, {}, resp);
  }
};
