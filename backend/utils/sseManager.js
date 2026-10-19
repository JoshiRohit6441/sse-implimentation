const clients = new Map();

// add client to clients map
export const addClient = (date, res) => {
  if (!clients.has(date)) {
    clients.set(date, new Set());
  }

  clients.get(date).add(res);

  res.on("close", () => {
    const showClients = clients.get(date);
    if (!showClients) return;

    showClients.delete(res);

    if (showClients.size === 0) {
      clients.delete(date);
    }
  });
};

// emit seat event to clients
export const emitSeatEvent = (date) => {
  const showClients = clients.get(date);

  if (!showClients) return;

  for (const client of showClients) {
    client.write(
      `event: SEATS_UPDATED\n` + `data: ${JSON.stringify({ date })}\n\n`,
    );
  }
};
