import express from "express";
import {
  getProfile,
  logout,
  registerLogin,
  verifyOTP,
} from "../controller/AuthController.js";
import { authMiddleware } from "../middleware./authMiddleware.js";
import {
  bookSeat,
  getSeatLayout,
  lockSeat,
} from "../controller/SeatLayoputController.js";
import { addClient, emitSeatEvent } from "../../utils/sseManager.js";

const router = express.Router();

router.post("/register-login", registerLogin);
router.post("/verify-otp", authMiddleware, verifyOTP);

// get profile
router.get("/get-profile", authMiddleware, getProfile);

router.post("/logout", authMiddleware, logout);

router.post("/lock-seat", authMiddleware, lockSeat);
router.get("/get-available-seats", authMiddleware, getSeatLayout);

router.get("/seats/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { date } = req.query;

  res.flushHeaders();

  addClient(date, res);
  res.write("data: SSE connected successfully\n\n");
});

//  book seat
router.post("/book-seat", authMiddleware, bookSeat);

export default router;
