import sharp from 'sharp';
import fs from 'fs';

async function createRoundFavicon() {
  try {
    const size = 512;
    
    // Read the original image
    const image = await sharp('public/images/77.png')
      .resize(size, size)
      .toBuffer();
    
    // Create a circular mask SVG
    const maskSvg = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>
    `);
    
    // Apply circular mask
    const rounded = await sharp(image)
      .composite([{
        input: maskSvg,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    
    // Save to all favicon locations
    fs.writeFileSync('public/icon.png', rounded);
    fs.writeFileSync('src/app/icon.png', rounded);
    fs.writeFileSync('src/app/favicon.ico', rounded);
    
    console.log('✅ Created round favicon!');
    console.log('   - public/icon.png');
    console.log('   - src/app/icon.png');
    console.log('   - src/app/favicon.ico');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createRoundFavicon();
