import { GaxiosResponse } from 'gaxios';
import { fitness_v1, google } from 'googleapis';
import { TokenPayload, Credentials } from 'google-auth-library';
import { User } from '@/interfaces/users.interface';
import { UserEntity } from '@/entities/users.entity';

const WEB_CLIENT_ID = '449996184337-h3nmg0vln8jeh8u40o2p7bbm4r1oamds.apps.googleusercontent.com';
const WEB_CLIENT_SECRET = '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';

export async function verify(idToken: string): Promise<TokenPayload> {
  const oAuth2Client = new google.auth.OAuth2(WEB_CLIENT_ID);
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: idToken,
    audience: WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export function getOAuth2Client() {
  const oAuth2Client = new google.auth.OAuth2(WEB_CLIENT_ID, WEB_CLIENT_SECRET);
  return oAuth2Client;
}

export async function acquireOAuthCredentials(serverAuthCode: string): Promise<Credentials> {
  const oAuth2Client = getOAuth2Client();
  const tokens = (await oAuth2Client.getToken(serverAuthCode)).tokens;
  console.log('Google OAuth tokens acquired');
  return tokens;
}

async function getAuthenticatedClient(user: User) {
  const oAuth2Client = getOAuth2Client();
  const tokens = JSON.parse(user.oAuthCredentials);
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

export async function refreshAccessToken(user: User) {
  const oAuth2Client = await getAuthenticatedClient(user);
  const tokens: Credentials = JSON.parse(user.oAuthCredentials);
  console.log('tokens', tokens);

  const res = await oAuth2Client.getAccessToken();
  const accessToken = res.token;

  tokens.access_token = accessToken;

  UserEntity.update(user.id, { oAuthCredentials: JSON.stringify(tokens) });
}

export async function getStepsToday(user: User): Promise<number> {
  const authenticatedClient = await getAuthenticatedClient(user);

  const serverStart = new Date();
  const serverEnd = new Date();
  serverStart.setHours(0, 0, 0, 0);
  serverEnd.setHours(23, 59, 59, 999);

  const serverTZO = new Date().getTimezoneOffset();
  const userTZO = user.timezoneOffsetMinutes;

  const dayMillis = 24 * 60 * 60 * 1000;
  const offsetMillis = 60000 * (serverTZO - userTZO);

  // Server timezone => User timezone
  // const userStart = new Date(serverStart.getTime() + offsetMillis);
  // const userEnd = new Date(serverEnd.getTime() + offsetMillis);
  const userStart = new Date(serverStart.getTime() - (dayMillis + offsetMillis));
  const userEnd = new Date(serverEnd.getTime() - (dayMillis + offsetMillis));

  console.log('serverStart', serverStart, serverStart.getTime());
  console.log('serverEnd', serverEnd, serverEnd.getTime());
  console.log('userStart', userStart, userStart.getTime());
  console.log('userEnd', userEnd, userEnd.getTime());

  const fitness = google.fitness({ version: 'v1', auth: authenticatedClient });
  const res: GaxiosResponse<fitness_v1.Schema$AggregateResponse> = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [
        {
          dataTypeName: 'com.google.step_count.delta',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
        },
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: userStart.valueOf(),
      endTimeMillis: userEnd.valueOf(),
    },
  });

  let stepsToday = 0;
  res.data.bucket.forEach(bucket => {
    bucket.dataset.forEach(dataset => {
      dataset.point.forEach(point => {
        point.value.forEach(value => (stepsToday += value.intVal));
      });
    });
  });
  console.log('stepsToday', stepsToday);
  return stepsToday;
}
