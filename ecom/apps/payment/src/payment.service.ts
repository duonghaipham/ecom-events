import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async processOrderPayment(
    message: Record<string, unknown>,
    context: KafkaContext,
  ): Promise<void> {
    const originalMessage = context.getMessage();
    const orderId = originalMessage?.key?.toString();
    const partition = context.getPartition();
    const offset = originalMessage.offset;

    console.log(
      `[Payment] Received order ${orderId} on partition ${partition}`,
    );

    try {
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        void this.kafkaClient.emit('payment-success', {
          key: orderId,
          value: message,
        });
        console.log(`[Payment] Payment succeeded for order ${orderId}`);
      } else {
        throw new Error('Payment gateway timeout');
      }
    } catch (error) {
      console.log(
        `[Payment] Payment failed for order ${orderId}. Forwarding to DLQ.`,
      );
      void this.kafkaClient.emit('payment-dlq', {
        key: orderId,
        value: { error: (error as Error).message, data: message },
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
