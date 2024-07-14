import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';
import { PaginationDto } from 'src/common/dto';
import { Auth } from './decorators';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   *
   * ==> Registro de usuario (Público)
   *
   */
  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  /**
   *
   * ==> Login de usuario (Público)
   *
   */
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  /**
   *
   * ==> Listar todos los usuarios activos (Privado)
   *
   */
  @Get()
  findAllUsers(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllUsers(paginationDto);
  }

  /**
   *
   * ==> Listar usuario activo por su id (Privado)
   *
   */
  @Get(':id')
  @Auth(Role.ADMIN)
  findOneUser(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.authService.findOneUser(id);
  }

  /**
   *
   * ==> Actualizar usuario activo por su id (Privado)
   *
   */
  @Patch(':id')
  updateUser(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(id, updateUserDto);
  }

  /**
   *
   * ==> Remover usuario activo por su id (Privado)
   *
   */
  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.authService.removeUser(+id);
  }
}
