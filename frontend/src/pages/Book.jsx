import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import SeatMap from "../components/SeatMap.jsx";
import { columnsFromLast, rowsFromLast, sortSeatIds } from "../seats.js";

function pad(value) {
  return String(value).padStart(2, "0");
}

function todayDMY() {
  const now = new Date();
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
}

function isValidDmy(value) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function seatIds(values) {
  return (values || []).map(String).filter((id) => id && id !== "undefined");
}

function Skeleton() {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="screen">
        <span>Screen</span>
      </div>
      {Array.from({ length: 5 }, (_, row) => (
        <div className="map-row" key={row}>
          <span className="row-label" />
          {Array.from({ length: 10 }, (_, column) => (
            <span className="seat is-ghost" key={column} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Book() {
  const [date, setDate] = useState(todayDMY);
  const [dateDraft, setDateDraft] = useState(date);
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(() => new Set());
  const [booking, setBooking] = useState(false);
  const [stream, setStream] = useState("connecting");
  const refreshRef = useRef(async () => {});
  const requestRef = useRef(0);
  const pendingRef = useRef(new Set());

  function changeDate(value) {
    if (!isValidDmy(value) || value === date) return;
    setDateDraft(value);
    pendingRef.current = new Set();
    setDate(value);
    setPending(new Set());
    setNotice("");
    setLayout(null);
    setLoading(true);
    setError("");
    setStream("connecting");
  }

  useEffect(() => {
    const requestId = ++requestRef.current;
    let cancelled = false;

    const run = async (quiet) => {
      try {
        const payload = await api(`/api/get-available-seats?q=${encodeURIComponent(date)}`, {
          auth: true,
        });
        if (cancelled || requestId !== requestRef.current) return;
        setLayout(payload.data || {});
        setError("");
      } catch (err) {
        if (cancelled || requestId !== requestRef.current) return;
        setError(err.message);
      } finally {
        if (!cancelled && requestId === requestRef.current && !quiet) setLoading(false);
      }
    };

    refreshRef.current = () => run(true);
    run(false);

    const timer = setInterval(() => run(true), 5000);
    const source = new EventSource(`/api/seats/events?date=${encodeURIComponent(date)}`);
    source.onopen = () => {
      if (!cancelled) setStream("live");
    };
    source.onerror = () => {
      if (!cancelled) setStream("refreshing");
    };
    source.addEventListener("SEATS_UPDATED", () => run(true));

    return () => {
      cancelled = true;
      clearInterval(timer);
      source.close();
    };
  }, [date]);

  const rows = rowsFromLast(layout?.last_row);
  const columns = columnsFromLast(layout?.last_column);
  const locked = new Set(seatIds(layout?.locked_seats));
  const mine = new Set(seatIds(layout?.user_locked_seats));
  const booked = new Set(seatIds(layout?.user_booked_seats));
  const mineList = sortSeatIds(mine);
  const bookedList = sortSeatIds(booked);
  const openCount = Math.max(0, rows.length * columns - locked.size);

  async function lockSeat(id) {
    if (pendingRef.current.has(id) || mine.has(id) || booked.has(id) || locked.has(id)) return;
    pendingRef.current.add(id);
    setPending(new Set(pendingRef.current));
    setNotice("");
    try {
      await api("/api/lock-seat", {
        method: "POST",
        auth: true,
        body: { seatId: id, date },
      });
      setNotice(`${id} is held for you.`);
      await refreshRef.current();
    } catch (err) {
      setNotice(err.message);
      await refreshRef.current();
    } finally {
      pendingRef.current.delete(id);
      setPending(new Set(pendingRef.current));
    }
  }

  async function bookHeldSeats() {
    if (!mineList.length || booking) return;
    setBooking(true);
    setNotice("");
    try {
      await api("/api/book-seat", {
        method: "POST",
        auth: true,
        body: { bookedSeats: mineList, date },
      });
      setNotice(mineList.length === 1 ? `${mineList[0]} is booked.` : `${mineList.join(", ")} are booked.`);
      await refreshRef.current();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBooking(false);
    }
  }

  function onDateDraft(value) {
    const next = value.replace(/[^\d-]/g, "").slice(0, 10);
    setDateDraft(next);
    if (isValidDmy(next)) changeDate(next);
  }

  return (
    <section className="book">
      <div className="book-head">
        <div>
          <p className="eyebrow">Screen 01</p>
          <h1>{date}</h1>
        </div>
        <label className="field field-date">
          Show date
          <input
            type="text"
            inputMode="numeric"
            placeholder="DD-MM-YYYY"
            autoComplete="off"
            spellCheck={false}
            value={dateDraft}
            onChange={(event) => onDateDraft(event.target.value)}
          />
        </label>
      </div>

      <div className="book-meta">
        <p className={`stream is-${stream}`}>
          {stream === "live" ? "Seat stream connected" : "Refreshing the map"}
        </p>
        {layout ? (
          <p>
            {openCount} open · {mine.size} held · {booked.size} booked · rows {layout.last_row} ·{" "}
            {layout.last_column} across
          </p>
        ) : null}
      </div>

      <div className="auditorium">
        {error ? <p className="banner">{error}</p> : null}
        {notice ? (
          <p className="banner is-quiet" aria-live="polite">
            {notice}
          </p>
        ) : null}

        {!layout && loading ? <Skeleton /> : null}
        {!layout && !loading && error ? (
          <button className="btn" type="button" onClick={() => refreshRef.current()}>
            Try again
          </button>
        ) : null}
        {layout ? (
          <SeatMap
            rows={rows}
            columns={columns}
            locked={locked}
            mine={mine}
            booked={booked}
            pending={pending}
            busy={booking}
            onLock={lockSeat}
          />
        ) : null}

        <ul className="legend">
          <li><i className="swatch is-open" /> Open</li>
          <li><i className="swatch is-mine" /> Your hold</li>
          <li><i className="swatch is-booked" /> Booked</li>
          <li><i className="swatch is-taken" /> Taken</li>
        </ul>
      </div>

      <div className="hold-bar">
        <div>
          <p className="hold-label">Your holds</p>
          <p className="hold-seats">{mineList.length ? mineList.join(", ") : "Tap a seat to hold it"}</p>
        </div>
        <div>
          <p className="hold-label">Booked</p>
          <p className="hold-seats">{bookedList.length ? bookedList.join(", ") : "None for this date"}</p>
        </div>
        <button className="btn" type="button" disabled={booking || !mineList.length} onClick={bookHeldSeats}>
          {booking ? "Booking…" : mineList.length ? `Book ${mineList.length}` : "Book seats"}
        </button>
      </div>
    </section>
  );
}
