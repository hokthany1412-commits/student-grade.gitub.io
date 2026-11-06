const fs = require('fs');
const zlib = require('zlib');

// Helper to decode JPEG using canvas or raw image processing
// For styles that have transparent borders (like 58, 69, etc.) we can composite onto white canvas.
// For full page JPEGs, we can mask the inner text region with white so that dynamic editable text sits crisp on top!

console.log('Organizing all 7 PDF template frames...');

// 1. Style 5 (Classic Bronze from Obj 58) 2538x1792
if (fs.existsSync('images/extracted_border_58_2538x1792.png')) {
    fs.copyFileSync('images/extracted_border_58_2538x1792.png', 'images/praise_border_style_5_bronze.png');
    console.log('Saved praise_border_style_5_bronze.png');
}

// 2. Style 1 (Gold & Blue from Obj 5) 2339x1654
if (fs.existsSync('images/extracted_page_5_2339x1654.jpg')) {
    fs.copyFileSync('images/extracted_page_5_2339x1654.jpg', 'images/praise_page_style_1_gold_blue.jpg');
    console.log('Saved praise_page_style_1_gold_blue.jpg');
}

// 3. Style 2 (Sapphire Blue from Obj 53) 2339x1654
if (fs.existsSync('images/extracted_page_53_2339x1654.jpg')) {
    fs.copyFileSync('images/extracted_page_53_2339x1654.jpg', 'images/praise_page_style_2_sapphire.jpg');
    console.log('Saved praise_page_style_2_sapphire.jpg');
}

// 4. Style 3 (Amber & Blue from Obj 64) 1600x1104
if (fs.existsSync('images/extracted_page_64_1600x1104.jpg')) {
    fs.copyFileSync('images/extracted_page_64_1600x1104.jpg', 'images/praise_page_style_3_amber_blue.jpg');
    console.log('Saved praise_page_style_3_amber_blue.jpg');
}

// 5. Style 4 (Gold & Green from Obj 75) 1573x1076
if (fs.existsSync('images/extracted_page_75_1573x1076.jpg')) {
    fs.copyFileSync('images/extracted_page_75_1573x1076.jpg', 'images/praise_page_style_4_gold_green.jpg');
    console.log('Saved praise_page_style_4_gold_green.jpg');
}

// 6. Style 6 (Ruby Red from Obj 89) 1971x1463
if (fs.existsSync('images/extracted_page_89_1971x1463.jpg')) {
    fs.copyFileSync('images/extracted_page_89_1971x1463.jpg', 'images/praise_page_style_6_ruby_red.jpg');
    console.log('Saved praise_page_style_6_ruby_red.jpg');
}

// 7. Style 7 (Royal Blue from Obj 92) 1126x740
if (fs.existsSync('images/extracted_page_92_1126x740.jpg')) {
    fs.copyFileSync('images/extracted_page_92_1126x740.jpg', 'images/praise_page_style_7_royal_blue.jpg');
    console.log('Saved praise_page_style_7_royal_blue.jpg');
}
