import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}

export class CreateDirectMessageDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
