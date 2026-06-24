import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');

@Injectable()
export class WebImageService implements OnModuleInit {
  private readonly imagesDir = path.join(process.cwd(), 'public', 'assets', 'images');

  async onModuleInit() {
    console.log('[WebImageService] Initializing auto-conversion of assets to WebP...');
    try {
      const result = await this.convertAll();
      console.log(`[WebImageService] Auto-conversion completed. Converted ${result.converted.length} files. Errors: ${result.errors.length}`);
    } catch (e) {
      console.error('[WebImageService] Auto-conversion during startup failed:', e);
    }
  }

  async convertAll(): Promise<{ success: boolean; converted: string[]; errors: string[] }> {
    const converted: string[] = [];
    const errors: string[] = [];

    if (!fs.existsSync(this.imagesDir)) {
      console.log(`[WebImageService] Images directory not found: ${this.imagesDir}`);
      return { success: false, converted, errors: ['Images directory does not exist'] };
    }

    const files = fs.readdirSync(this.imagesDir);
    const imageExtensions = ['.png', '.jpg', '.jpeg'];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const inputPath = path.join(this.imagesDir, file);
        const outputFilename = `${path.parse(file).name}.webp`;
        const outputPath = path.join(this.imagesDir, outputFilename);

        // Check if WebP version already exists and is newer than the source image
        if (fs.existsSync(outputPath)) {
          const sourceStat = fs.statSync(inputPath);
          const destStat = fs.statSync(outputPath);
          if (destStat.mtimeMs >= sourceStat.mtimeMs) {
            continue;
          }
        }

        try {
          await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
          converted.push(outputFilename);
          console.log(`[WebImageService] Converted: ${file} -> ${outputFilename}`);
        } catch (err: any) {
          console.error(`[WebImageService] Failed to convert ${file}:`, err);
          errors.push(`${file}: ${err.message}`);
        }
      }
    }

    return { success: true, converted, errors };
  }
}
