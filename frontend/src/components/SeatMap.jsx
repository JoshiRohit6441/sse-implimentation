import { seatId } from "../seats.js";

const EMPTY = new Set();

export default function SeatMap({
  rows,
  columns,
  locked,
  mine,
  booked,
  pending = EMPTY,
  busy,
  onLock,
}) {
  const aisleAfter = columns >= 8 ? Math.floor(columns / 2) : 0;
  const numbers = Array.from({ length: columns }, (_, index) => index + 1);

  return (
    <div className="map-scroll">
      <div className="screen" aria-hidden="true">
        <span>Screen</span>
      </div>
      <div className="map">
        <div className="map-row">
          <span className="row-label" />
          {numbers.map((number) => (
            <span className="seat-cell" key={`col-${number}`}>
              {aisleAfter && number === aisleAfter + 1 ? <span className="aisle" /> : null}
              <span className="col-label">{number}</span>
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <div className="map-row" key={row}>
            <span className="row-label">{row}</span>
            {numbers.map((number) => {
              const id = seatId(row, number);
              const isBooked = booked.has(id);
              const isMine = mine.has(id) && !isBooked;
              const isPending = pending.has(id);
              const isTaken = locked.has(id) && !isMine && !isBooked;
              const label = isBooked
                ? `Seat ${id}, booked by you`
                : isMine
                  ? `Seat ${id}, held by you`
                  : isPending
                    ? `Seat ${id}, locking`
                    : isTaken
                      ? `Seat ${id}, taken`
                      : `Seat ${id}, open`;

              return (
                <span className="seat-cell" key={id}>
                  {aisleAfter && number === aisleAfter + 1 ? <span className="aisle" /> : null}
                  <button
                    type="button"
                    className={`seat${isBooked ? " is-booked" : ""}${isMine ? " is-mine" : ""}${isTaken ? " is-taken" : ""}${isPending ? " is-pending" : ""}`}
                    aria-label={label}
                    disabled={busy || isTaken || isMine || isBooked || isPending}
                    onClick={() => onLock(id)}
                  >
                    {number}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
