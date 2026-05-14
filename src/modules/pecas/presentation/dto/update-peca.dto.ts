import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePecaDto } from './create-peca.dto';

export class UpdatePecaDto extends PartialType(
  OmitType(CreatePecaDto, ['sku', 'estoque'] as const),
) {}
