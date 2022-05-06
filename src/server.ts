import 'dotenv/config';
import '@/index';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import FitnessLocationsRoute from '@routes/fitness-location.route';
import validateEnv from '@utils/validateEnv';
import SavedGamesRoute from './routes/saved-games.route';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new FitnessLocationsRoute(), new SavedGamesRoute(), new AuthRoute()]);

app.listen();
