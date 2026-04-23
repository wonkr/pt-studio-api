import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalFilters(new PrismaExceptionFilter())
  app.use(helmet())
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips unknown fields
      forbidNonWhitelisted: true, // Rejects unexpected input
      transform: true
    })
  )

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
                    .setTitle('PT Studio API')
                    .setDescription('Secure-by-design PT Studio Management API')
                    .setVersion('1.0')
                    .addBearerAuth()
                    .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api-docs', app, document)
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
