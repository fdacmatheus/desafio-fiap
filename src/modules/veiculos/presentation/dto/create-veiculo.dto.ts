import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { IsPlaca } from 'src/shared/validators/placa.validator';

const ANO_ATUAL = new Date().getFullYear();

export class CreateVeiculoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  clienteId!: string;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa Mercosul ou antiga (ABC-1234)' })
  @IsPlaca()
  placa!: string;

  @ApiProperty({ example: 'Volkswagen' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  marca!: string;

  @ApiProperty({ example: 'Gol' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  modelo!: string;

  @ApiProperty({ example: 2020, minimum: 1900, maximum: ANO_ATUAL + 1 })
  @IsInt()
  @Min(1900)
  @Max(ANO_ATUAL + 1)
  ano!: number;
}
