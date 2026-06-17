const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const directoryPath = path.join(__dirname, 'backend', 'public', 'assets', 'images', 'products');
  console.log('Target directory:', directoryPath);

  try {
    const files = fs.readdirSync(directoryPath);
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
    console.log(`Found ${pngFiles.length} PNG files to convert.`);

    for (const file of pngFiles) {
      const inputPath = path.join(directoryPath, file);
      const outputPath = path.join(directoryPath, path.basename(file, '.png') + '.webp');
      
      console.log(`Converting: ${file} -> ${path.basename(outputPath)}`);
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
    }
    console.log('[Success] All images converted to WebP successfully!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

main();
