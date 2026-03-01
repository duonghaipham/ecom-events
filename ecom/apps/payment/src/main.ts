import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PaymentModule } from './payment.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: process.env.KAFKA_BROKERS?.split(',') || [],
        },
        consumer: {
          groupId: process.env.KAFKA_GROUP_ID || '',
        },
        run: {
          autoCommit: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
