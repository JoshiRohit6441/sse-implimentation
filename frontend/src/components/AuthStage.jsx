export default function AuthStage({ eyebrow, title, lede, children }) {
  return (
    <section className="stage">
      <article className="ticket">
        <p className="ticket-kicker">Admit one</p>
        <h2>Screen 01</h2>
        <p>One hall for the date you pick. A hold stays with the server until its timer ends.</p>
        <div className="ticket-split" />
        <dl className="ticket-meta">
          <div>
            <dt>Sign in</dt>
            <dd>Email</dd>
          </div>
          <div>
            <dt>Confirm</dt>
            <dd>6-digit code</dd>
          </div>
          <div>
            <dt>Hold</dt>
            <dd>Live seat map</dd>
          </div>
        </dl>
      </article>
      <div className="panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}
