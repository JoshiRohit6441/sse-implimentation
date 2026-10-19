import { Link } from "react-router-dom";
import SeatMap from "../components/SeatMap.jsx";
import { useAuth } from "../useAuth.js";

const previewLocked = new Set(["A3", "B7", "C2", "D8", "E5"]);
const previewMine = new Set(["C5"]);
const previewBooked = new Set(["C6"]);

export default function Home() {
  const { authed } = useAuth();

  return (
    <section className="home">
      <div className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Screen 01</p>
          <h1>Hold a seat while the hall is still open.</h1>
          <p className="lede">
            Sign in with your email, enter the code, then tap a seat to hold it.
            Book the seats you are holding. Taken seats come straight from the server.
          </p>
          <div className="hero-actions">
            <Link className="btn" to={authed ? "/book" : "/login"}>
              {authed ? "Open the hall" : "Book a seat"}
            </Link>
          </div>
        </div>
        <aside className="hall-card">
          <div className="hall-card-head">
            <p>Tonight’s map</p>
            <span>Preview</span>
          </div>
          <SeatMap
            rows={["A", "B", "C", "D", "E"]}
            columns={8}
            locked={previewLocked}
            mine={previewMine}
            booked={previewBooked}
            busy
            onLock={() => {}}
          />
          <ul className="legend">
            <li><i className="swatch is-open" /> Open</li>
            <li><i className="swatch is-mine" /> Your hold</li>
            <li><i className="swatch is-booked" /> Booked</li>
            <li><i className="swatch is-taken" /> Taken</li>
          </ul>
        </aside>
      </div>
      <ol className="steps">
        <li>
          <span>01</span>
          <h2>Email</h2>
          <p>The server creates your account if it is new, then issues a code.</p>
        </li>
        <li>
          <span>02</span>
          <h2>Code</h2>
          <p>Confirm the 6-digit code. After that the hall opens.</p>
        </li>
        <li>
          <span>03</span>
          <h2>Seats</h2>
          <p>Tap an open seat to hold it, then book the seats you are holding.</p>
        </li>
      </ol>
    </section>
  );
}
