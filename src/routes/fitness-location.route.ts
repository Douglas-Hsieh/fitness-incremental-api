/* eslint-disable prettier/prettier */
import { NextFunction, Response, Router } from 'express';
import FitnessLocationController from '@/controllers/fitness-location.controller';
import { CreateFitnessLocationDto } from '@/dtos/fitness-locations.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { auth, authRole } from '@/middlewares/auth.middleware';
import { FitnessLocationEntity } from '@/entities/fitness-location.entity';
import { canEditFitnessLocation, canViewFitnessLocation } from '@/permissions/fitness-locations.permissions';
import { RequestWithFitnessLocation } from '@/interfaces/auth.interface';

class FitnessLocationsRoute implements Routes {
  public path = '/fitness-locations';
  public router = Router();
  public fitnessLocationController = new FitnessLocationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, auth, this.fitnessLocationController.getFitnessLocations);
    this.router.get(`${this.path}/isVerified/null`, auth, authRole('ROLE_ADMIN'), this.fitnessLocationController.getUnverifiedFitnessLocation);
    this.router.get(`${this.path}/:fitnessLocationId`, auth, setFitnessLocation, authGetFitnessLocation, this.fitnessLocationController.getFitnessLocation);
    this.router.post(`${this.path}`, auth, validationMiddleware(CreateFitnessLocationDto, 'body', true), this.fitnessLocationController.createFitnessLocation);
    this.router.put(`${this.path}/:fitnessLocationId`, auth, setFitnessLocation, authUpdateFitnessLocation, validationMiddleware(CreateFitnessLocationDto, 'body', true), this.fitnessLocationController.updateFitnessLocation);
  }

}

const setFitnessLocation = async (req: RequestWithFitnessLocation, res: Response, next: NextFunction) => {
  const fitnessLocationId = parseInt(req.params.fitnessLocationId);
  req.fitnessLocation = await FitnessLocationEntity.findOne({ where: { id: fitnessLocationId } });
  if (req.fitnessLocation == null) {
    res.status(404);
    return res.send('Fitness location not found')
  }
  next();
}

const authGetFitnessLocation = (req, res, next) => {
  if (!canViewFitnessLocation(req.user, req.fitnessLocation)) {
    res.status(401);
    return res.send('Not Allowed');
  }
  next();
}

const authUpdateFitnessLocation = (req, res, next) => {
  if (!canEditFitnessLocation(req.user, req.fitnessLocation)) {
    res.status(401);
    return res.send('Not Allowed');
  }
  next();
}

export default FitnessLocationsRoute;
