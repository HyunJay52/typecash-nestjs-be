import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdModule } from './ad/ad.module';
import { UserModule } from './user/user.module';
import { PointModule } from './point/point.module';

@Module({
  imports: [AdModule, UserModule, PointModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
