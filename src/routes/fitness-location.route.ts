/* eslint-disable prettier/prettier */
import { Router } from 'express';
import FitnessLocationController from '@/controllers/fitness-location.controller';
import { CreateFitnessLocationDto } from '@dtos/fitness-location.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class FitnessLocationsRoute implements Routes {
  public path = '/fitness-locations';
  public router = Router();
  public fitnessLocationController = new FitnessLocationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.fitnessLocationController.getFitnessLocations);
    this.router.get(`${this.path}/isVerified/null`, this.fitnessLocationController.getUnverifiedFitnessLocation);
    this.router.get(`${this.path}/:userId`, this.fitnessLocationController.getFitnessLocationByUserId);
    this.router.post(`${this.path}`, validationMiddleware(CreateFitnessLocationDto, 'body', true), this.fitnessLocationController.createFitnessLocation);
    this.router.put(`${this.path}/:userId`, validationMiddleware(CreateFitnessLocationDto, 'body', true), this.fitnessLocationController.updateFitnessLocation);
  }
}

export default FitnessLocationsRoute;
