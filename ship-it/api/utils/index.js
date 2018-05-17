/**
 * Parse token from authorization header.
 * @param {string} header The Authorization header (Format ex: Bearer XYZ).
 * @returns {string} The parsed token from the authorization header (From ex. above: XYZ).
 */
function getTokenFromHeader(header) {
  if (typeof header != 'string') {
    console.error(`Token extraction from header failed because header is ${header}`);
    return '';
  }
  const regex = /^Bearer\s*(\w*)$/;
  const matches = header.match(regex);
  if (matches == null) return '';
  return matches[1];
}

module.exports = { getTokenFromHeader };