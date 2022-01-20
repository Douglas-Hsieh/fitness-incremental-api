import { NextFunction, Request, Response } from 'express';
import { CreateFitnessLocationDto } from '@dtos/fitness-location.dto';
import { FitnessLocation } from '@interfaces/fitness-location.interface';
import fitnessLocationService from '@services/fitness-location.service';

class FitnessLocationController {
  public fitnessLocationService = new fitnessLocationService();

  public getFitnessLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllFitnessLocationsData: FitnessLocation[] = await this.fitnessLocationService.findAllFitnessLocation();

      res.status(200).json({ data: findAllFitnessLocationsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUnverifiedFitnessLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllFitnessLocationsData: FitnessLocation[] = await this.fitnessLocationService.findFitnessLocationByIsVerified(null);

      res.status(200).json({ data: findAllFitnessLocationsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getFitnessLocationByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.userId);
      console.log('userId', userId);
      const findOneFitnessLocationData: FitnessLocation = await this.fitnessLocationService.findFitnessLocationByUserId(userId);

      res.status(200).json({ data: findOneFitnessLocationData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createFitnessLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('FitnessLocationController.createFitnessLocation');
    try {
      const fitnessLocationData: CreateFitnessLocationDto = req.body;
      const createFitnessLocationData: FitnessLocation = await this.fitnessLocationService.createFitnessLocation(fitnessLocationData);

      res.status(201).json({ data: createFitnessLocationData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateFitnessLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('FitnessLocationController.updateFitnessLocation');
    try {
      const userId = String(req.params.userId);
      const fitnessLocationData: CreateFitnessLocationDto = req.body;
      console.log('fitnessLocationData', fitnessLocationData);

      const updateFitnessLocationData: FitnessLocation = await this.fitnessLocationService.upsertFitnessLocation(userId, fitnessLocationData);

      res.status(200).json({ data: updateFitnessLocationData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default FitnessLocationController;
