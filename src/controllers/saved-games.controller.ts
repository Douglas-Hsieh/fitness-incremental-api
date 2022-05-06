import SavedGameService from '@/services/saved-games.service';
import { Request, Response, NextFunction } from 'express';

class SavedGamesController {
  public savedGamesService = new SavedGameService();

  public upsertSavedGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken, os, gameStateSerialized } = req.body;
      const upsertSavedGame = await this.savedGamesService.upsertSavedGame(idToken, os, gameStateSerialized);

      res.status(200).json({ data: upsertSavedGame, message: 'upserted' });
    } catch (error) {
      next(error);
    }
  };
}

export default SavedGamesController;
