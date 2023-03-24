import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
  NotFoundException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TFAJwtAuthGuard } from 'src/auth/tfa-jwt.guard';
import { responseDTO } from 'src/common/base.respone';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(TFAJwtAuthGuard)
  @Delete(':id')
  async deleteUserById(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
  ): Promise<string> {
    const resultAuthor = await this.userService.authorization(req.user.id, id);
    if (resultAuthor) return resultAuthor;
    const result = await this.userService.deleteById(id);
    if (result.affected === 1) {
      const resData: responseDTO = {
        status: HttpStatus.OK,
        message: 'Delete Successful!',
      };
      res.status(HttpStatus.OK).json(resData);
    } else {
      throw new NotFoundException(`User's Id ${id} not found!`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUserById(
    @Param('id') id: string,
    @Body() user: UserDTO,
    @Request() req,
  ) {
    const result = await this.userService.authorization(req.user.id, id);
    if (result) return result;
    try {
      await this.userService.updateUserById(id, user);
      return this.getUserById(id);
    } catch (error) {
      throw new NotFoundException(`User's Id ${id} not found!`);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDTO> {
    try {
      const result = await this.userService.getUserById(id);
      return this.userService.plainUser(result);
    } catch (error) {
      throw new NotFoundException(`User's Id ${id} not found!`);
    }
  }

  @Get()
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<UserDTO[]> {
    const result = await this.userService.getAllUsers(page, limit);
    const plainArray = result.map((res) => this.userService.plainUser(res));
    return plainArray;
  }
}
