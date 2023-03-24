import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from 'src/common/base.dto';
import { UserDTO } from 'src/users/user.dto';

export class PostDTO extends BaseDTO {
  @IsNotEmpty()
  @Expose()
  title: string;

  @IsNotEmpty()
  @Expose()
  description: string;

  @IsNotEmpty()
  @Expose()
  content: string;

  @Expose()
  user: UserDTO;
}
