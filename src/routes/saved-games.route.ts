import SavedGamesController from '@/controllers/saved-games.controller';
import { Routes } from '@/interfaces/routes.interface';
import { Router } from 'express';

class SavedGamesRoute implements Routes {
  public path = '/saved-games';
  public router = Router();
  public savedGamesController = new SavedGamesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.put(`${this.path}`, this.savedGamesController.upsertSavedGame);
  }
}

export default SavedGamesRoute;
