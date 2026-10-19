import {
  generateAuthToken,
  verifyAuthToken,
} from "../../utils/helper-function.js";
import httpResponse from "../../utils/http-response.js";
import User from "../model/UserSchema.js";

export const authMiddleware = async (req, resp, next) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  let userData;

  if (accessToken) {
    const decodeAuthToken = await verifyAuthToken(accessToken, "access");

    if (decodeAuthToken) {
      userData = await User.findById(decodeAuthToken.id);
      if (!userData) return httpResponse(401, "User not found", {}, resp);
      req.user = userData;
      return next();
    } else {
      if (!refreshToken) return httpResponse(401, "Token not found", {}, resp);

      const decodeRefreshToken = await verifyAuthToken(refreshToken, "refresh");

      if (!decodeRefreshToken)
        return httpResponse(401, "Token Expired", {}, resp);

      userData = await User.findById(decodeRefreshToken.id);
      if (!userData) return httpResponse(401, "User not found", {}, resp);

      const newAccessToken = await generateAuthToken(userData._id, "access");
      resp.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 1000,
        sameSite: "lax",
      });

      req.user = userData;
      return next();
    }
  } else {
    if (!refreshToken) return httpResponse(401, "Token not found", {}, resp);

    const decodeRefreshToken = await verifyAuthToken(refreshToken, "refresh");

    if (!decodeRefreshToken)
      return httpResponse(401, "Token Expired", {}, resp);

    userData = await User.findById(decodeRefreshToken.id);
    if (!userData) return httpResponse(401, "User not found", {}, resp);

    const newAccessToken = await generateAuthToken(userData._id, "access");
    resp.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
      sameSite: "lax",
    });

    req.user = userData;
    return next();
  }
};
