import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.use(morgan('tiny'));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.use(session({ secret: 'SECRET' }));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setDescription('The API')
    .setVersion('1.0')
    .addTag('')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  app.enableCors();

  if (configService.get('mode') === 'PROD') {
    require('newrelic');
  }

  await app.listen(configService.get<number>('port'));
}

bootstrap();
