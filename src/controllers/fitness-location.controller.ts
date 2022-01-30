import { NextFunction, Request, Response } from 'express';
import { CreateFitnessLocationDto } from '@/dtos/fitness-locations.dto';
import { FitnessLocation } from '@interfaces/fitness-location.interface';
import fitnessLocationService from '@services/fitness-location.service';
import { RequestWithFitnessLocation, RequestWithUser } from '@/interfaces/auth.interface';

class FitnessLocationController {
  public fitnessLocationService = new fitnessLocationService();

  public getFitnessLocations = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllFitnessLocationsData: FitnessLocation[] = req.user.roles.includes('ROLE_ADMIN')
        ? await this.fitnessLocationService.findAllFitnessLocation()
        : await this.fitnessLocationService.findFitnessLocationsByUserId(req.user.id);

      res.status(200).json({ data: findAllFitnessLocationsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUnverifiedFitnessLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllFitnessLocationsData: FitnessLocation[] = await this.fitnessLocationService.findFitnessLocationsByIsVerified(null);

      res.status(200).json({ data: findAllFitnessLocationsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getFitnessLocation = async (req: RequestWithFitnessLocation, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ data: req.fitnessLocation, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createFitnessLocation = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fitnessLocationData: CreateFitnessLocationDto = req.body;
      const createFitnessLocationData: FitnessLocation = await this.fitnessLocationService.createFitnessLocation(req.user, fitnessLocationData);

      res.status(201).json({ data: createFitnessLocationData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateFitnessLocation = async (req: RequestWithFitnessLocation, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fitnessLocationData: CreateFitnessLocationDto = req.body;

      const updateFitnessLocationData: FitnessLocation = await this.fitnessLocationService.updateFitnessLocation(
        req.fitnessLocation,
        fitnessLocationData,
      );

      res.status(200).json({ data: updateFitnessLocationData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default FitnessLocationController;
