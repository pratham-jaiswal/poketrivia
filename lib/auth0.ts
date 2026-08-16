import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { connect } from "./mongoose";
import { User } from "./models";

const auth0IssuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
if (!auth0IssuerBaseUrl) {
  throw new Error(
    "Missing required environment variable AUTH0_ISSUER_BASE_URL",
  );
}

const auth0Domain = (() => {
  try {
    return new URL(auth0IssuerBaseUrl).hostname;
  } catch {
    return auth0IssuerBaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
})();

async function ensureUser(session: any) {
  if (!session?.user?.email) return session;

  await connect();

  const email = session.user.email;
  const existing = await User.findOne({ email });
  if (existing) return session;

  const username =
    session.user.name || session.user.nickname || email.split("@")[0];
  await User.create({
    username,
    email,
    pokemons: [],
  });
  return session;
}

export const auth0 = new Auth0Client({
  domain: auth0Domain,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.AUTH0_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  beforeSessionSaved: ensureUser,
});
