import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/presentation/jwt-auth.guard';
import { PecasService } from '../application/pecas.service';
import { CreatePecaDto } from './dto/create-peca.dto';
import { MovimentacaoEstoqueDto } from './dto/movimentacao-estoque.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';

@ApiTags('pecas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pecas')
export class PecasController {
  constructor(private readonly service: PecasService) {}

  @Post()
  create(@Body() dto: CreatePecaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'includeInativas', required: false, type: Boolean })
  findAll(
    @Query('includeInativas', new ParseBoolPipe({ optional: true }))
    includeInativas?: boolean,
  ) {
    return this.service.findAll(includeInativas);
  }

  @Get('estoque-baixo')
  @ApiOperation({ summary: 'Lista peças com estoque abaixo ou igual ao mínimo' })
  findEstoqueBaixo() {
    return this.service.findEstoqueBaixo();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePecaDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/entrada')
  @ApiOperation({ summary: 'Registra entrada de estoque' })
  entrada(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MovimentacaoEstoqueDto) {
    return this.service.entradaEstoque(id, dto.quantidade);
  }

  @Post(':id/saida')
  @ApiOperation({ summary: 'Registra saída de estoque (avulsa)' })
  saida(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MovimentacaoEstoqueDto) {
    return this.service.saidaEstoque(id, dto.quantidade);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
