import { Body, Controller, Inject, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly orderService: OrderService,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('order-created');
    await this.kafkaClient.connect();
  }

  @Post()
  createOrder(@Body() body: any) {
    const orderId = uuidv4();
    const orderData = { id: orderId, item: body.item, price: body.price };

    this.kafkaClient.emit('order-created', {
      key: orderId,
      value: orderData,
    });

    return { message: 'Order created processing', orderId };
  }
}
