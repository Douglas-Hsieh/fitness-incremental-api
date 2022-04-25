import { OAuth2Client } from 'google-auth-library';

export async function verify(idToken: string) {
  const webClientId = '449996184337-h3nmg0vln8jeh8u40o2p7bbm4r1oamds.apps.googleusercontent.com';
  const client = new OAuth2Client(webClientId);
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: webClientId,
  });
  const payload = ticket.getPayload();
  const userId = payload['sub'];
  return userId;
}
