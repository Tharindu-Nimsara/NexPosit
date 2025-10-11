import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  findUserByEmail,
  createUser,
  findUserById,
} from "../models/user.model.js";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await findUserByEmail(profile.emails[0].value);

        if (!user) {
          // Get profile picture URL
          const profilePicture =
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : null;

          // Create new user
          user = await createUser(
            profile.emails[0].value,
            null, // No password for Google users
            profile.displayName,
            "UTC",
            true, // is_google_user flag
            profile.id, // google_id
            profilePicture // profile_picture
          );
        } else if (
          !user.profile_picture &&
          profile.photos &&
          profile.photos.length > 0
        ) {
          // If user exists but doesn't have a profile picture, update it
          // You'll need to add an updateUser function for this
          // For now, we'll skip this to keep it simple
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
