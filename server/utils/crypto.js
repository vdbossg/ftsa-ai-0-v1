// server/utils/crypto.js
const crypto = require("crypto");

const ALGO = "aes-256-gcm"; // authenticated encryption
const KEY = Buffer.from(process.env.BINANCE_ENCRYPTION_KEY, "base64");
if (KEY.length !== 32) {
  throw new Error("BINANCE_ENCRYPTION_KEY must be base64 of 32 bytes (256 bits)");
}

function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96-bit recommended for GCM
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store iv + tag + encrypted as base64
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(base64) {
  const data = Buffer.from(base64, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = {
  encrypt,
  decrypt,
};
