import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('order-created')
  async handleOrderCreated(
    @Payload() message: Record<string, unknown>,
    @Ctx() context: KafkaContext,
  ) {
    await this.paymentService.processOrderPayment(message, context);
  }
}
