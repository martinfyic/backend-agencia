import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Role } from '@prisma/client';

import { RoleProtected } from './role-protected/role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
