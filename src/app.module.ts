import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'cockroachdb',
      url: new URL(process.env.DATABASE_URL).toString(),
      ssl: true,
      entities: [Task],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
