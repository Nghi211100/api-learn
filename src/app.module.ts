import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostEntity } from './posts/post.entity';
import { PostModule } from './posts/post.module';
import { UserEntity } from './users/user.entity';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'containers-us-west-49.railway.app',
      port: 6355,
      username: 'postgres',
      password: '2OxaUAXJt0ufbJdLbw2D',
      database: 'railway',
      entities: [UserEntity, PostEntity],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
