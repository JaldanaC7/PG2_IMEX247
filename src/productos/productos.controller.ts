import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('productos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
  ) {}

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERADOR)
  async create(
    @Body() createProductoDto: CreateProductoDto,
  ) {
    return this.productosService.create(
      createProductoDto,
    );
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERADOR)
  async buscar(
    @Query('buscar') buscar?: string,
  ) {
    return this.productosService.buscar(buscar);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERADOR)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERADOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(
      id,
      updateProductoDto,
    );
  }
}