import { HttpStatus } from '@nestjs/common';

export class responseDTO {
  status: HttpStatus;
  message?: string;
  data?: any;
}
