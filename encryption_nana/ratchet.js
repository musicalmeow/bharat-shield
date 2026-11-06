/**
 * Double Ratchet / forward secrecy is not implemented in this MVP bundle.
 * Messages use per-message AES-GCM keys wrapped for the recipient with RSA-OAEP.
 */
function isRatchetAvailable() {
  return false;
}

module.exports = { isRatchetAvailable };
