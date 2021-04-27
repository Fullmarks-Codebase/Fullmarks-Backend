const urlCheck = (url) => {
  if (url.substring(0, 4) === "http") return true;
  return false;
};

export default urlCheck;
