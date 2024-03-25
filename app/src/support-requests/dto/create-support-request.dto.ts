import { IsDefined, IsString } from 'class-validator';
import { ID } from './abstract-support-requests';

export class CreateSupportRequestDto {
  @IsDefined()
  user: ID;

  @IsDefined()
  @IsString()
  text: string;
}
