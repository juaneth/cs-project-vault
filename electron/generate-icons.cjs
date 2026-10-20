const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const assetsDir = path.join(__dirname, "assets");
fs.mkdirSync(assetsDir, { recursive: true });

function createPng(width, height, drawFn) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const color = drawFn(x, y, width, height);
      rawData[pixelOffset] = color[0];
      rawData[pixelOffset + 1] = color[1];
      rawData[pixelOffset + 2] = color[2];
      rawData[pixelOffset + 3] = color[3];
    }
  }
  const idatData = zlib.deflateSync(rawData);
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }
  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([header, chunk("IHDR", ihdr), chunk("IDAT", idatData), chunk("IEND", Buffer.alloc(0))]);
}

const png16 = createPng(16, 16, (x, y) => {
  if ((x === 2 && (y >= 4 && y <= 11)) ||
      (x === 3 && (y >= 5 && y <= 10)) ||
      (x === 4 && (y >= 6 && y <= 9)) ||
      (x === 5 && (y >= 7 && y <= 8))) {
    return [255, 255, 255, 255];
  }
  if (x >= 8 && x <= 13 && (y === 11 || y === 12)) {
    return [255, 255, 255, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(assetsDir, "trayTemplate.png"), png16);

const png32 = createPng(32, 32, (x, y) => {
  const sx = Math.floor(x / 2);
  const sy = Math.floor(y / 2);
  if ((sx === 2 && (sy >= 4 && sy <= 11)) ||
      (sx === 3 && (sy >= 5 && sy <= 10)) ||
      (sx === 4 && (sy >= 6 && sy <= 9)) ||
      (sx === 5 && (sy >= 7 && sy <= 8))) {
    return [255, 255, 255, 255];
  }
  if (sx >= 8 && sx <= 13 && (sy === 11 || sy === 12)) {
    return [255, 255, 255, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(assetsDir, "trayTemplate@2x.png"), png32);
console.log("Tray template icons generated successfully!");
