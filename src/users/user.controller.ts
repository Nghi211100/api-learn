import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TFAJwtAuthGuard } from 'src/auth/tfa-jwt.guard';
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
  ): Promise<string> {
    const resultAuthor = await this.userService.authorization(req.user.id, id);
    if (resultAuthor) return resultAuthor;
    const result = await this.userService.deleteById(id);
    if (result.affected === 1) {
      return 'Delete Successful!';
    } else {
      return 'An error occurred while deleting, please check id of user!';
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
      return 'An error occurred while updating, please check property or id of user!';
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDTO> {
    const result = await this.userService.getUserById(id);
    return this.userService.plainUser(result);
  }

  @Get()
  async getAllUsers(): Promise<UserDTO[]> {
    const result = await this.userService.getAllUsers();
    const plainArray = result.map((res) => this.userService.plainUser(res));
    return plainArray;
  }
}
