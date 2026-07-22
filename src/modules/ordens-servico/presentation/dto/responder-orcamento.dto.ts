import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResponderOrcamentoDto {
  @ApiProperty({ description: 'true aprova o orçamento; false recusa (cancela a OS)' })
  @IsBoolean()
  aprovado: boolean;

  @ApiPropertyOptional({ description: 'Motivo informado pelo cliente (opcional)' })
  @IsOptional()
  @IsString()
  motivo?: string;
}
