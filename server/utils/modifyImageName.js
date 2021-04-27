module.exports = (name) => {
    let value = name.split(".").slice(0, -1).join("-") + "_" + Date.now() + "." + name.split(".").slice(-1)
    return value
};
