import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  username!: string;

  @ApiProperty({ example: 'senhaForte123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;
}
