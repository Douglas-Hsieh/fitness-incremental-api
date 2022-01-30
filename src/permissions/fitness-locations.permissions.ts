import { FitnessLocation } from '@/interfaces/fitness-location.interface';
import { User } from '@/interfaces/users.interface';

export const canViewFitnessLocation = (user: User, fitnessLocation: FitnessLocation) => {
  return user.roles.includes('ROLE_ADMIN') || fitnessLocation.userId === user.id;
};

export const canEditFitnessLocation = (user: User, fitnessLocation: FitnessLocation) => {
  return user.roles.includes('ROLE_ADMIN') || fitnessLocation.userId === user.id;
};

export const canDeleteFitnessLocation = (user: User, fitnessLocation: FitnessLocation) => {
  return user.roles.includes('ROLE_ADMIN') || fitnessLocation.userId === user.id;
};
