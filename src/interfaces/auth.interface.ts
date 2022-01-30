import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { FitnessLocation } from '@interfaces/fitness-location.interface';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithRouteUser extends RequestWithUser {
  routeUser: User; // User associated with the current route
}

export interface RequestWithFitnessLocation extends RequestWithUser {
  fitnessLocation: FitnessLocation;
}
