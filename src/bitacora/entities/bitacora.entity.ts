import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Operacion } from '../../operaciones/entities/operacion.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bitacora')
export class Bitacora {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Operacion, { nullable: false })
  operacion: Operacion;

  @Column()
  estadoAnterior: string;

  @Column()
  estadoNuevo: string;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @ManyToOne(() => User, { nullable: false })
  responsable: User;

  @CreateDateColumn()
  fechaRegistro: Date;
}