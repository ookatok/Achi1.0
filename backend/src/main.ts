import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables manually from root backend/ folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Serve static assets from backend/public
  const publicPath = __dirname.includes('dist') 
    ? path.join(__dirname, '..', '..', 'public') 
    : path.join(__dirname, '..', 'public');
  app.useStaticAssets(publicPath);
  console.log(`[NestJS] Serving static assets from: ${publicPath}`);  // Enable Cross-Origin Resource Sharing (CORS) for Frontend
  app.enableCors({
    origin: true, // Allow frontend requests
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Fashion E-Commerce API')
    .setDescription('Backend API contract and data definitions for fashion products, accounts, and catalog filters')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Expose Swagger UI at /docs and JSON schema doc at /docs-json
  app.use('/docs-json', (req, res) => res.json(document));
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`[NestJS] Server is running on http://localhost:${port}/api`);
  console.log(`[NestJS] API documentation (JSON) available at http://localhost:${port}/docs-json`);
  console.log(`[NestJS] API interactive docs (UI) available at http://localhost:${port}/docs`);
}
bootstrap();
