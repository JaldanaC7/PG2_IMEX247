import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BitacoraService } from './bitacora.service';
import { CreateAvanceDto } from './dto/create-avance.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('bitacora')
export class BitacoraController {
  constructor(
    private readonly bitacoraService: BitacoraService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Get('operacion/:operacionId')
  findByOperacion(
    @Param('operacionId', ParseIntPipe) operacionId: number,
  ) {
    return this.bitacoraService.findByOperacion(operacionId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Post('operacion/:operacionId/avance')
  registrarAvance(
    @Param('operacionId', ParseIntPipe) operacionId: number,
    @Body() createAvanceDto: CreateAvanceDto,
    @Req() req: any,
  ) {
    return this.bitacoraService.registrarAvance(
      operacionId,
      req.user.id,
      createAvanceDto.observacion,
    );
  }
}