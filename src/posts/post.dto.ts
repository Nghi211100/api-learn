import { Expose } from 'class-transformer';
import { BaseDTO } from 'src/common/base.dto';
import { UserDTO } from 'src/users/user.dto';

export class PostDTO extends BaseDTO {
  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  content: string;

  @Expose()
  user: UserDTO;
}
