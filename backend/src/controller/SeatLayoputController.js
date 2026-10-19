import env from "../../config/envConfig.js";
import httpResponse from "../../utils/http-response.js";
import {
  deleteRedisData,
  getLockedSeats,
  getRedisData,
  setRedisData,
} from "../../utils/redisFunction.js";
import { emitSeatEvent } from "../../utils/sseManager.js";
import Booking from "../model/BookingSchema.js";

// lock seat
export const lockSeat = async (req, resp) => {
  try {
    const { seatId, date } = req.body;
    const { id } = req.user;

    const redisPayload = {
      seat: seatId,
      userId: id,
    };

    const key = `${date}-${seatId}`;

    const isSeatLocked = await getRedisData(key);

    if (isSeatLocked) {
      return httpResponse(400, "Seat already locked", {}, resp);
    }
    await setRedisData(key, redisPayload, 600);

    setTimeout(async () => {
      try {
        const currentLock = await getRedisData(key);

        if (!currentLock) {
          emitSeatEvent(date);
        }
      } catch (err) {
        console.error("Seat expiry handler error:", err);
      }
    }, 600 * 1000);

    emitSeatEvent();

    return httpResponse(200, "Seat locked successfully", {}, resp);
  } catch (err) {
    return httpResponse(500, err?.message, {}, resp);
  }
};

// unlock seat
export const unlockSeat = async (req, resp) => {
  try {
    const { seatId, date } = req.body;
    const { id } = req.user;

    const key = `${date}-${seatId}`;

    await deleteRedisData(key);
    return httpResponse(200, "Seat unlocked successfully", {}, resp);
  } catch (err) {
    throw new Error(err?.message);
  }
};

// get seat layout
export const getSeatLayout = async (req, resp) => {
  try {
    const { q } = req.query;
    const { id } = req.user;

    const data = await getLockedSeats(q);

    const bookedData = await Booking.find({ date: q });

    const responseData = {
      last_row: env.ROW,
      last_column: env.COLUMN,
      date: q,
      locked_seats: [
        ...data?.map((item) => item.seat),
        ...bookedData?.map((item) => item.seatId),
      ],
      user_locked_seats: data
        .filter((item) => item?.userId == id?.toString())
        .map((item) => item.seat),
      user_booked_seats: bookedData
        .filter((item) => item?.userId == id?.toString())
        .map((item) => item.seatId),
    };
    return httpResponse(
      200,
      "Available seats fetched successfully",
      responseData,
      resp,
    );
  } catch (err) {
    return httpResponse(500, err?.message, {}, resp);
  }
};

export const bookSeat = async (req, resp) => {
  try {
    const { bookedSeats, date } = req.body;
    const { id } = req.user;

    const bookings = await Promise.all(
      bookedSeats.map(async (item) => {
        await deleteRedisData(`${date}-${item}`);

        return {
          userId: id?.toString(),
          seatId: item,
          date: date,
        };
      }),
    );

    await Booking.insertMany(bookings);
    emitSeatEvent(date);
    return httpResponse(200, "Seats booked successfully", {}, resp);
  } catch (err) {
    return httpResponse(500, err?.message, {}, resp);
  }
};
