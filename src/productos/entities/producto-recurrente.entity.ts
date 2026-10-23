import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('productos_recurrentes')
export class ProductoRecurrente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  producto: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  fraccionArancelaria: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  dai: number;
}