import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsCpfOrCnpj } from 'src/shared/validators/cpf-cnpj.validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome!: string;

  @ApiProperty({ example: '12345678909', description: 'CPF (11 dígitos) ou CNPJ (14 dígitos)' })
  @IsCpfOrCnpj()
  documento!: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefone?: string;
}
