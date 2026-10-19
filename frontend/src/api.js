export async function api(path, options = {}) {
  const { method = "GET", body, auth = false } = options;

  let response;
  try {
    response = await fetch(path, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Start the backend on port 3000.");
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (response.status === 401 && auth) {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }

  if (!response.ok) {
    throw new Error(payload.message || "Something went wrong");
  }

  return payload;
}
