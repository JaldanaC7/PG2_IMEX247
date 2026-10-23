import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';

import { ProductoRecurrente } from './entities/producto-recurrente.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoRecurrente)
    private readonly productoRepository: Repository<ProductoRecurrente>,
  ) {}

  async create(
    createProductoDto: CreateProductoDto,
  ): Promise<ProductoRecurrente> {
    const producto = createProductoDto.producto.trim();
    const fraccionArancelaria =
      createProductoDto.fraccionArancelaria.trim();

    const existente = await this.productoRepository.findOne({
      where: {
        producto,
        fraccionArancelaria,
        dai: createProductoDto.dai,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe un producto con el mismo nombre, fracción arancelaria y DAI',
      );
    }

    const nuevoProducto = this.productoRepository.create({
      producto,
      fraccionArancelaria,
      dai: createProductoDto.dai,
    });

    return this.productoRepository.save(nuevoProducto);
  }

  async findOne(
    id: number,
  ): Promise<ProductoRecurrente> {
    const producto =
      await this.productoRepository.findOne({
        where: {
          id,
        },
      });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado`,
      );
    }

    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoRecurrente> {
    const productoExistente = await this.findOne(id);

    const producto =
      updateProductoDto.producto !== undefined
        ? updateProductoDto.producto.trim()
        : productoExistente.producto;

    const fraccionArancelaria =
      updateProductoDto.fraccionArancelaria !== undefined
        ? updateProductoDto.fraccionArancelaria.trim()
        : productoExistente.fraccionArancelaria;

    const dai =
      updateProductoDto.dai !== undefined
        ? updateProductoDto.dai
        : Number(productoExistente.dai);

    const duplicado =
      await this.productoRepository.findOne({
        where: {
          id: Not(id),
          producto,
          fraccionArancelaria,
          dai,
        },
      });

    if (duplicado) {
      throw new ConflictException(
        'Ya existe otro producto con el mismo nombre, fracción arancelaria y DAI',
      );
    }

    productoExistente.producto = producto;
    productoExistente.fraccionArancelaria =
      fraccionArancelaria;
    productoExistente.dai = dai;

    return this.productoRepository.save(
      productoExistente,
    );
  }

  async buscar(
    termino?: string,
  ): Promise<ProductoRecurrente[]> {
    const busqueda = termino?.trim();

    if (!busqueda) {
      return this.productoRepository.find({
        order: {
          producto: 'ASC',
        },
      });
    }

    return this.productoRepository.find({
      where: [
        {
          producto: Like(`%${busqueda}%`),
        },
        {
          fraccionArancelaria: Like(
            `%${busqueda}%`,
          ),
        },
      ],
      order: {
        producto: 'ASC',
      },
    });
  }
}