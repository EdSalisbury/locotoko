import { Module } from '@nestjs/common';
import { AcquisitionService } from './acquisition.service';
import { AcquisitionController } from './acquisition.controller';

@Module({
  providers: [AcquisitionService],
  controllers: [AcquisitionController]
})
export class AcquisitionModule {}
