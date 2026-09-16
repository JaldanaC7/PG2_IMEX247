import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.contrasenia,
      10,
    );

    const user = this.userRepository.create({
      usuario: createUserDto.usuario,
      contrasenia: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findByUsuario(usuario: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { usuario },
    });
  }
}