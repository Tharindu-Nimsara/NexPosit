import { supabase } from "../utils/supabase.js";

// Create new user
export const createUser = async (
  email,
  passwordHash,
  fullName,
  timezone = "UTC"
) => {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        timezone: timezone,
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
    .select("id, email, full_name, timezone, created_at")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Check if email exists
export const emailExists = async (email) => {
  const user = await findUserByEmail(email);
  return !!user;
};
