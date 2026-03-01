import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:19092'],
        },
        consumer: {
          groupId: 'payment-consumer-group',
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
