function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json({ success: true, data });
}

function sendError(res, code, message, statusCode) {
  res.status(statusCode).json({ success: false, error: { code, message } });
}

module.exports = { sendSuccess, sendError };
