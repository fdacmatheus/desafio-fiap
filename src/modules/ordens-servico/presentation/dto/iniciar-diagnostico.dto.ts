import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class IniciarDiagnosticoDto {
  @ApiPropertyOptional({ example: 'Pastilhas de freio gastas, disco com sulcos' })
  @IsOptional()
  @IsString()
  diagnostico?: string;
}
