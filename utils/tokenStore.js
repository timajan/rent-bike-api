const refreshTokens = new Set();

function addRefreshToken(token) {
  refreshTokens.add(token);
}

function removeRefreshToken(token) {
  refreshTokens.delete(token);
}

function hasRefreshToken(token) {
  return refreshTokens.has(token);
}

module.exports = {
  addRefreshToken,
  removeRefreshToken,
  hasRefreshToken,
};