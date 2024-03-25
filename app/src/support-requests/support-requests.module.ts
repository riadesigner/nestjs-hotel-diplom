import { Module } from '@nestjs/common';
import { SupportRequestEmployeeService } from './support-requests-employee.service';
import { SupportRequestClientService } from './support-requests-client.service';
import { SupportRequestService } from './support-requests.service';
import { SupportGateway } from './support-requests.gateway';
import {
  Message,
  MessageSchema,
  SupportRequest,
  SupportRequestSchema,
} from './support-requests-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportRequestsController } from './support-requests.controllers';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: SupportRequest.name, schema: SupportRequestSchema },
    ]),
    UsersModule,
  ],
  providers: [
    SupportGateway,
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
  ],
  controllers: [SupportRequestsController],
})
export class SupportRequestsModule {}
