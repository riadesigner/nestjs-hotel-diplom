import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Superadmin } from './users.superadmin';
import { forwardRef } from '@nestjs/common';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, Superadmin],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {
  constructor(private superAdmin: Superadmin) {
    // adding first admin to empty db
    this.superAdmin.init();
  }
}
