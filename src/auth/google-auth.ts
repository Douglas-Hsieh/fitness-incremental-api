import { GaxiosResponse } from 'gaxios';
import { fitness_v1, google } from 'googleapis';
import { TokenPayload } from 'google-auth-library';

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

async function getAuthenticatedClient(serverAuthCode: string) {
  const oAuth2Client = new google.auth.OAuth2(WEB_CLIENT_ID, WEB_CLIENT_SECRET);

  const tokens = await (await oAuth2Client.getToken(serverAuthCode)).tokens;

  console.log('tokens', tokens);
  console.log('JSON.stringify(tokens)'), JSON.stringify(tokens);

  oAuth2Client.setCredentials(tokens);
  console.info('Tokens acquired.');
  return oAuth2Client;
}

export async function getStepsToday(serverAuthCode: string) {
  const oAuth2Client = await getAuthenticatedClient(serverAuthCode);

  const start = new Date();
  const end = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const fitness = google.fitness({ version: 'v1', auth: oAuth2Client });
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
      startTimeMillis: start.valueOf(),
      endTimeMillis: end.valueOf(),
    },
  });

  const buckets = res.data.bucket;
  buckets.forEach(bucket => {
    bucket.dataset.forEach(dataset => {
      console.log('dataset.dataSourceId', dataset.dataSourceId);
      console.log('dataset.point', dataset.point);
    });
  });

  // restart server
}
