import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  conversationId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  content!: string;
}
