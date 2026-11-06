const fs = require('fs');
const zlib = require('zlib');

// Minimal PNG decoder/encoder to tint and composite borders
function createPNG(w, h, data) {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    
    function makeChunk(type, chunkData) {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(chunkData.length, 0);
        const typeBuf = Buffer.from(type, 'ascii');
        const crcBuf = Buffer.alloc(4);
        let c = 0xffffffff;
        const toCrc = Buffer.concat([typeBuf, chunkData]);
        for (let i = 0; i < toCrc.length; i++) {
            c ^= toCrc[i];
            for (let j = 0; j < 8; j++) {
                c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
            }
        }
        c ^= 0xffffffff;
        crcBuf.writeInt32BE(c, 0);
        return Buffer.concat([len, typeBuf, chunkData, crcBuf]);
    }
    
    const rawScanlines = Buffer.alloc(h * (w * 4 + 1));
    for (let y = 0; y < h; y++) {
        rawScanlines[y * (w * 4 + 1)] = 0;
        data.copy(rawScanlines, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
    }
    const compressedIDAT = zlib.deflateSync(rawScanlines, { level: 9 });
    return Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', compressedIDAT), makeChunk('IEND', Buffer.alloc(0))]);
}

function decodePNG(buf) {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    let pos = 8;
    let idatChunks = [];
    while (pos < buf.length) {
        let len = buf.readUInt32BE(pos);
        let type = buf.slice(pos+4, pos+8).toString('ascii');
        if (type === 'IDAT') {
            idatChunks.push(buf.slice(pos+8, pos+8+len));
        }
        pos += 12 + len;
    }
    let raw = zlib.inflateSync(Buffer.concat(idatChunks));
    // Unfilter raw scanlines (Filter None is 0)
    let rgba = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        raw.copy(rgba, y * w * 4, y * (w * 4 + 1) + 1, (y + 1) * (w * 4 + 1));
    }
    return { width: w, height: h, rgba: rgba };
}

// 1. Bronze Classic (2538x1792)
const bronzeBuf = fs.readFileSync('images/extracted_border_58_2538x1792.png');
fs.writeFileSync('images/praise_frame_style_1.png', bronzeBuf);

// 2. Royal Blue Border (from extracted_border_69_1600x1120.png)
const blueBuf = fs.readFileSync('images/extracted_border_69_1600x1120.png');
fs.writeFileSync('images/praise_frame_style_3.png', blueBuf);

// Let's create tinted variations for the other styles from the master border
const blueImg = decodePNG(blueBuf);
const w = blueImg.width;
const h = blueImg.height;

// Style 2: Royal Blue & Gold (Gold corners / blue scroll)
let s2 = Buffer.from(blueImg.rgba);
for (let i = 0; i < w * h; i++) {
    let a = s2[i * 4 + 3];
    if (a > 30) {
        let r = s2[i * 4];
        let g = s2[i * 4 + 1];
        let b = s2[i * 4 + 2];
        let lum = (r + g + b) / 3;
        // Shift towards Gold/Bronze
        s2[i * 4] = Math.min(255, lum * 1.2 + 40);
        s2[i * 4 + 1] = Math.min(255, lum * 0.9 + 20);
        s2[i * 4 + 2] = Math.min(255, lum * 0.3);
    }
}
fs.writeFileSync('images/praise_frame_style_2.png', createPNG(w, h, s2));

// Style 4: Amber & Blue (Gold/amber tone)
let s4 = Buffer.from(blueImg.rgba);
for (let i = 0; i < w * h; i++) {
    let a = s4[i * 4 + 3];
    if (a > 30) {
        let r = s4[i * 4];
        let g = s4[i * 4 + 1];
        let b = s4[i * 4 + 2];
        let lum = (r + g + b) / 3;
        s4[i * 4] = Math.min(255, lum * 1.3 + 30);
        s4[i * 4 + 1] = Math.min(255, lum * 1.0);
        s4[i * 4 + 2] = Math.min(255, lum * 0.1);
    }
}
fs.writeFileSync('images/praise_frame_style_4.png', createPNG(w, h, s4));

// Style 5: Emerald Green & Gold
let s5 = Buffer.from(blueImg.rgba);
for (let i = 0; i < w * h; i++) {
    let a = s5[i * 4 + 3];
    if (a > 30) {
        let r = s5[i * 4];
        let g = s5[i * 4 + 1];
        let b = s5[i * 4 + 2];
        let lum = (r + g + b) / 3;
        s5[i * 4] = Math.min(255, lum * 0.4);
        s5[i * 4 + 1] = Math.min(255, lum * 1.1 + 30);
        s5[i * 4 + 2] = Math.min(255, lum * 0.4);
    }
}
fs.writeFileSync('images/praise_frame_style_5.png', createPNG(w, h, s5));

// Style 6: Crimson Ruby Red
let s6 = Buffer.from(blueImg.rgba);
for (let i = 0; i < w * h; i++) {
    let a = s6[i * 4 + 3];
    if (a > 30) {
        let r = s6[i * 4];
        let g = s6[i * 4 + 1];
        let b = s6[i * 4 + 2];
        let lum = (r + g + b) / 3;
        s6[i * 4] = Math.min(255, lum * 1.3 + 50);
        s6[i * 4 + 1] = Math.min(255, lum * 0.2);
        s6[i * 4 + 2] = Math.min(255, lum * 0.2);
    }
}
fs.writeFileSync('images/praise_frame_style_6.png', createPNG(w, h, s6));

// Style 7: Royal Navy
let s7 = Buffer.from(blueImg.rgba);
for (let i = 0; i < w * h; i++) {
    let a = s7[i * 4 + 3];
    if (a > 30) {
        let r = s7[i * 4];
        let g = s7[i * 4 + 1];
        let b = s7[i * 4 + 2];
        let lum = (r + g + b) / 3;
        s7[i * 4] = Math.min(255, lum * 0.1);
        s7[i * 4 + 1] = Math.min(255, lum * 0.4 + 20);
        s7[i * 4 + 2] = Math.min(255, lum * 1.3 + 40);
    }
}
fs.writeFileSync('images/praise_frame_style_7.png', createPNG(w, h, s7));

console.log('Successfully generated all 7 clean transparent border frames!');
