import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Order } from 'apps/order/src/order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  createOrder(order: Order) {
    const orderId = uuidv4();
    const orderData = { id: orderId, item: order.item, price: order.price };

    this.kafkaClient.emit('order-created', {
      key: orderId,
      value: orderData,
    });

    return { message: 'Order created processing', orderId };
  }
}
