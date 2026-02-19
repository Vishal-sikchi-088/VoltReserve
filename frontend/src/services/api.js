async function request(path, options) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers)
    },
    ...options
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");

  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      body && body.error && body.error.message
        ? body.error.message
        : "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function get(path) {
  return request(path, { method: "GET" });
}

function post(path, payload) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
}

const api = {
  get,
  post
};

export default api;

