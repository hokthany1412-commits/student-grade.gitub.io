const fs = require('fs');
const zlib = require('zlib');

// Minimal PNG encoder in JS
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

// Border 6 is a soft bronze floral border without blue inner line
// Let's create high resolution version from the JPEG or direct overlay
fs.copyFileSync('images/praise_border_6.jpg', 'images/praise_frame_border6.jpg');

console.log('Processed Border 6 image asset.');
