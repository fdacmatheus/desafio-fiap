import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdensServicoService } from '../application/ordens-servico.service';
import { OrdemServicoPresenter } from './ordem-servico.presenter';

@ApiTags('ordens-servico-publico')
@Controller('publico/ordens-servico')
export class OrdensServicoPublicoController {
  constructor(private readonly service: OrdensServicoService) {}

  @Get(':numero')
  @ApiOperation({
    summary:
      'Consulta pública (sem JWT) do andamento de uma OS pelo número — para o cliente',
  })
  async porNumero(@Param('numero', ParseIntPipe) numero: number) {
    const os = await this.service.findByNumero(numero);
    return OrdemServicoPresenter.publico(os);
  }
}
