import { User } from '@/interfaces/users.interface';

export const canViewUser = (user: User, routeUser: User) => {
  return user.roles.includes('ROLE_ADMIN') || user.id === routeUser.id;
};

export const canEditUser = (user: User, routeUser: User) => {
  return user.roles.includes('ROLE_ADMIN') || user.id === routeUser.id;
};

export const canDeleteUser = (user: User, routeUser: User) => {
  return user.roles.includes('ROLE_ADMIN') || user.id === routeUser.id;
};
