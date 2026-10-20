const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { execSync } = require('child_process')

const assetsDir = path.join(__dirname, 'assets')
const iconsetDir = path.join(assetsDir, 'icon.iconset')
fs.mkdirSync(iconsetDir, { recursive: true })

function createPng(width, height, drawFn) {
  const rowSize = width * 4 + 1
  const rawData = Buffer.alloc(rowSize * height)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize
    rawData[rowOffset] = 0
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4
      const color = drawFn(x, y, width, height)
      rawData[pixelOffset] = color[0]
      rawData[pixelOffset + 1] = color[1]
      rawData[pixelOffset + 2] = color[2]
      rawData[pixelOffset + 3] = color[3]
    }
  }
  const idatData = zlib.deflateSync(rawData)
  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type)
    const body = Buffer.concat([typeBuf, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body), 0)
    return Buffer.concat([len, body, crc])
  }
  function crc32(buf) {
    let crc = 0 ^ -1
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
    }
    return (crc ^ -1) >>> 0
  }
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    table[n] = c
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([header, chunk("IHDR", ihdr), chunk("IDAT", idatData), chunk("IEND", Buffer.alloc(0))])
}

function drawAppIcon(x, y, width, height) {
  // Normalize to 0..1
  const nx = x / width
  const ny = y / height
  
  // Outer margin for macOS squircle
  const pad = 0.08
  if (nx < pad || nx > 1 - pad || ny < pad || ny > 1 - pad) {
    return [0, 0, 0, 0] // Transparent
  }
  
  // Squircle formula (approx superellipse with n=4)
  const cx = 0.5, cy = 0.5
  const rx = (nx - cx) / (0.5 - pad)
  const ry = (ny - cy) / (0.5 - pad)
  const dist = Math.pow(Math.abs(rx), 4.2) + Math.pow(Math.abs(ry), 4.2)
  
  if (dist > 1.0) {
    return [0, 0, 0, 0]
  }
  
  // Border highlight
  if (dist > 0.94) {
    return [60, 60, 65, 255] // Hairline border
  }
  
  // Terminal > prompt:
  // Draw > symbol around center left
  const px = (nx - 0.28) / 0.24
  const py = (ny - 0.5) / 0.24
  
  // > chevron math
  if (px >= 0 && px <= 1.0 && Math.abs(py) <= 1.0) {
    const lineX = Math.abs(py) // V-shape rotated 90 deg -> >
    if (Math.abs(px - (1.0 - lineX)) < 0.22) {
      return [255, 255, 255, 255]
    }
  }
  
  // _ underline prompt around center right
  if (nx >= 0.58 && nx <= 0.78 && ny >= 0.65 && ny <= 0.71) {
    return [255, 255, 255, 255]
  }

  // Pure dark background
  return [10, 10, 12, 255]
}

const sizes = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 },
]

for (const { name, size } of sizes) {
  const png = createPng(size, size, drawAppIcon)
  fs.writeFileSync(path.join(iconsetDir, name), png)
}

try {
  const icnsPath = path.join(assetsDir, 'icon.icns')
  execSync(`/usr/bin/iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`)
  console.log('Successfully created icon.icns!')
} catch (err) {
  console.error('iconutil error:', err.message)
}
