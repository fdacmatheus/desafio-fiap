import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

export class ItemServicoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  servicoId!: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantidade?: number;
}

export class ItemPecaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  pecaId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantidade!: number;
}

export class CreateOrdemServicoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  clienteId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  veiculoId!: string;

  @ApiPropertyOptional({ type: [ItemServicoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemServicoDto)
  servicos?: ItemServicoDto[];

  @ApiPropertyOptional({ type: [ItemPecaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPecaDto)
  pecas?: ItemPecaDto[];
}
