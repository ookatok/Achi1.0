import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { WebImageModule } from './modules/web-image/web-image.module';
import { UserModule } from './modules/user/user.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { CollectionModule } from './modules/collection/collection.module';

@Module({
  imports: [DatabaseModule, AuthModule, ProductModule, CartModule, OrderModule, WebImageModule, UserModule, BlogModule, ContactModule, CollectionModule],
})
export class AppModule {}
