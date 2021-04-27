module.exports = (code, message) => {
  return { code: code, message: message || "Internal Server Error" };
};
