import { supabase } from "../utils/supabase.js";

// Create new user (supports both email/password and Google users)
export const createUser = async (
  email,
  passwordHash,
  fullName,
  timezone = "UTC",
  isGoogleUser = false,
  googleId = null,
  profilePicture = null // Add this parameter
) => {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        timezone: timezone,
        is_google_user: isGoogleUser,
        google_id: googleId,
        profile_picture: profilePicture, // Add this field
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Find user by email
export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw error;
  }

  return data;
};

// Find user by ID
export const findUserById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, full_name, timezone, created_at, is_google_user, profile_picture"
    ) // Add profile_picture
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Find user by Google ID
export const findUserByGoogleId = async (googleId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("google_id", googleId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw error;
  }

  return data;
};

// Check if email exists
export const emailExists = async (email) => {
  const user = await findUserByEmail(email);
  return !!user;
};
