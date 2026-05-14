import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class MovimentacaoEstoqueDto {
  @ApiProperty({ example: 10, minimum: 1 })
  @IsInt()
  @Min(1)
  quantidade!: number;
}
