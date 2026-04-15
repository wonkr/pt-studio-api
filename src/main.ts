import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new PrismaExceptionFilter())
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
