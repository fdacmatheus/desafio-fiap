import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdensServicoService } from '../application/ordens-servico.service';
import { ResponderOrcamentoDto } from './dto/responder-orcamento.dto';
import { OrdemServicoPresenter } from './ordem-servico.presenter';

@ApiTags('ordens-servico-publico')
@Controller('publico/ordens-servico')
export class OrdensServicoPublicoController {
  constructor(private readonly service: OrdensServicoService) {}

  @Get(':numero')
  @ApiOperation({
    summary: 'Consulta pública (sem JWT) do andamento de uma OS pelo número — para o cliente',
  })
  async porNumero(@Param('numero', ParseIntPipe) numero: number) {
    const os = await this.service.findByNumero(numero);
    return OrdemServicoPresenter.publico(os);
  }

  @Get(':numero/status')
  @ApiOperation({ summary: 'Consulta apenas a situação atual da OS pelo número' })
  async status(@Param('numero', ParseIntPipe) numero: number) {
    const os = await this.service.findByNumero(numero);
    return OrdemServicoPresenter.status(os);
  }

  @Post(':numero/orcamento')
  @ApiOperation({
    summary: 'Webhook para notificação externa de aprovação ou recusa do orçamento pelo cliente',
  })
  async responderOrcamento(
    @Param('numero', ParseIntPipe) numero: number,
    @Body() dto: ResponderOrcamentoDto,
  ) {
    const os = await this.service.responderOrcamento(numero, dto.aprovado);
    return OrdemServicoPresenter.publico(os);
  }
}
