import { Controller, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class PaymentController {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly paymentService: PaymentService,
  ) {}

  @EventPattern('order-created')
  async handleOrderCreated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    const originalMessage = context.getMessage();
    const orderId = originalMessage?.key?.toString();
    const partition = context.getPartition();
    const offset = originalMessage.offset;

    console.log(`Nhận Order ${orderId} tại Partition ${partition}`);

    try {
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        this.kafkaClient.emit('payment-success', {
          key: orderId,
          value: message,
        });
        console.log(`Payment SUCCESS cho Order ${orderId}`);
      } else {
        throw new Error('Payment gateway timeout');
      }
    } catch (error) {
      console.log(`Payment FAILED cho Order ${orderId}. Gửi vào DLQ.`);
      this.kafkaClient.emit('payment-dlq', {
        key: orderId,
        value: { error: error.message, data: message },
      });
    } finally {
      const consumer = context.getConsumer();
      await consumer.commitOffsets([
        {
          topic: context.getTopic(),
          partition,
          offset: (BigInt(offset) + 1n).toString(),
        },
      ]);
    }
  }
}
