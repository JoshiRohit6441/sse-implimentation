const httpResponse = (code, message, data, resp) => {
  const payload = {
    http_status: 200,
    message,
    data: data || {},
    timeStamp: new Date().toISOString(),
  };

  return resp.status(code).json(payload);
};

export default httpResponse;
