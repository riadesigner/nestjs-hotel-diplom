import { PartialType } from '@nestjs/mapped-types';

import { IsDefined, IsOptional } from 'class-validator';
import { CreateRoomDto } from './create-room.dto';

export class UpdateRoomParams extends PartialType(CreateRoomDto) {
  @IsOptional()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsDefined()
  isEnabled?: boolean;
}
