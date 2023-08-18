import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.emun';

export const Role = (role: UserRole) => SetMetadata('role', role);
