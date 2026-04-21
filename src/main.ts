import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

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
  app.useGlobalPipes(new ValidationPipe({transform: true}))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
