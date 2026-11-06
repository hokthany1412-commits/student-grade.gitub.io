const fs = require('fs');
const zlib = require('zlib');

function rotatePNG90(srcPath, dstPath) {
    const buf = fs.readFileSync(srcPath);
    // Parse PNG
    let offset = 8;
    let w = 0, h = 0;
    let idatChunks = [];
    
    while (offset < buf.length) {
        const len = buf.readUInt32BE(offset);
        const type = buf.slice(offset + 4, offset + 8).toString('ascii');
        const data = buf.slice(offset + 8, offset + 8 + len);
        
        if (type === 'IHDR') {
            w = data.readUInt32BE(0);
            h = data.readUInt32BE(4);
        } else if (type === 'IDAT') {
            idatChunks.push(data);
        }
        offset += 12 + len;
    }
    
    const allIdat = Buffer.concat(idatChunks);
    const uncompressed = zlib.inflateSync(allIdat);
    
    // Extract RGBA (each scanline has 1 filter byte + w*4 bytes)
    const srcRGBA = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        const lineOffset = y * (w * 4 + 1) + 1;
        uncompressed.copy(srcRGBA, y * w * 4, lineOffset, lineOffset + w * 4);
    }
    
    // Rotate 90 degrees clockwise: new width = h, new height = w
    const newW = h;
    const newH = w;
    const dstRGBA = Buffer.alloc(newW * newH * 4);
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const srcIdx = (y * w + x) * 4;
            const newX = h - 1 - y;
            const newY = x;
            const dstIdx = (newY * newW + newX) * 4;
            
            dstRGBA[dstIdx] = srcRGBA[srcIdx];         // R
            dstRGBA[dstIdx + 1] = srcRGBA[srcIdx + 1]; // G
            dstRGBA[dstIdx + 2] = srcRGBA[srcIdx + 2]; // B
            dstRGBA[dstIdx + 3] = srcRGBA[srcIdx + 3]; // A
        }
    }
    
    // Create new PNG
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(newW, 0);
    ihdr.writeUInt32BE(newH, 4);
    ihdr[8] = 8;
    ihdr[9] = 6; // RGBA
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
    
    const rawScanlines = Buffer.alloc(newH * (newW * 4 + 1));
    for (let y = 0; y < newH; y++) {
        rawScanlines[y * (newW * 4 + 1)] = 0; // Filter None
        dstRGBA.copy(rawScanlines, y * (newW * 4 + 1) + 1, y * newW * 4, (y + 1) * newW * 4);
    }
    
    const compressedIDAT = zlib.deflateSync(rawScanlines, { level: 9 });
    const outputPNG = Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', compressedIDAT), makeChunk('IEND', Buffer.alloc(0))]);
    fs.writeFileSync(dstPath, outputPNG);
    console.log('Rotated and saved:', dstPath, newW + 'x' + newH);
}

const frames = [
    'praise_frame_style_1.png',
    'praise_frame_border6.png',
    'praise_frame_style_3.png',
    'praise_frame_style_4.png',
    'praise_frame_style_5.png',
    'praise_frame_style_7.png'
];

frames.forEach(f => {
    try {
        const src = 'd:/student-grade-system-final/images/' + f;
        const dst = 'd:/student-grade-system-final/images/portrait_' + f;
        rotatePNG90(src, dst);
    } catch(e) {
        console.error('Error with', f, e.message);
    }
});
