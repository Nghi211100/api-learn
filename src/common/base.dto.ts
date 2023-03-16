import { Expose } from 'class-transformer';

export abstract class BaseDTO {
  @Expose()
  id: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
