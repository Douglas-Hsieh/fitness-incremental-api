import appleSignin from 'apple-signin-auth';

const APPLE_CLIENT_ID = 'com.randompermutation.fitnessincremental.servicesid';

export async function verify(idToken: string) {
  return await appleSignin.verifyIdToken(idToken);
}
