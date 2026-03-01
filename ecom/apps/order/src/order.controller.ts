import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,

    private readonly orderService: OrderService,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('order-created');
    await this.kafkaClient.connect();
  }

  @Post()
  createOrder(@Body() body: any) {
    return this.orderService.createOrder(body);
  }
}
