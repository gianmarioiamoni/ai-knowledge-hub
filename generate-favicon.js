// generate-favicon.js - Temporary script to generate favicon.ico from icon.svg
const fs = require('fs');
const sharp = require('sharp');

async function generateFavicon() {
  try {
    // Read the SVG
    const svgBuffer = fs.readFileSync('./app/icon.svg');
    
    // Generate 32x32 PNG and save as favicon.ico
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('./app/favicon.ico');
    
    console.log('✓ favicon.ico generated successfully in app/');
    
    // Also create a copy in public/ for fallback
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('./public/favicon.ico');
    
    console.log('✓ favicon.ico copied to public/ for fallback');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();

