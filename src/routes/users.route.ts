import { NextFunction, Response, Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { auth } from '@/middlewares/auth.middleware';
import { RequestWithRouteUser } from '@/interfaces/auth.interface';
import { UserEntity } from '@/entities/users.entity';
import { canEditUser } from '@/permissions/users.permissions';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/:id(\\d+)`, this.usersController.getUserById);
    // this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.post(`${this.path}`, this.usersController.createUser);
    this.router.put(
      `${this.path}/:id(\\d+)`,
      auth,
      setUser,
      authUpdateUser,
      validationMiddleware(CreateUserDto, 'body', true),
      this.usersController.updateUser,
    );
    this.router.delete(`${this.path}/:id(\\d+)`, this.usersController.deleteUser);
  }
}

const setUser = async (req: RequestWithRouteUser, res: Response, next: NextFunction) => {
  const userId = parseInt(req.params.id);
  req.routeUser = await UserEntity.findOne({ where: { id: userId } });
  if (req.routeUser == null) {
    res.status(404);
    return res.send('User not found');
  }
  next();
};

const authUpdateUser = (req, res, next) => {
  if (!canEditUser(req.user, req.routeUser)) {
    res.status(401);
    return res.send('Not Allowed');
  }
  next();
};

export default UsersRoute;
