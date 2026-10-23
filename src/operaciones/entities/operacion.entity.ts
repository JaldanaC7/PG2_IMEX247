import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { User } from '../../users/entities/user.entity';

@Entity('operaciones')
export class Operacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  codigo: string;

  @ManyToOne(() => Cliente, { nullable: false })
  cliente: Cliente;

  @Column({
    type: 'varchar',
    length: 100,
  })
  tipoServicio: string;

  @CreateDateColumn()
  fechaRegistro: Date;

  @ManyToOne(() => User, { nullable: false })
  responsable: User;

  @Column({ default: 'REGISTRADO' })
  estado: string;
}