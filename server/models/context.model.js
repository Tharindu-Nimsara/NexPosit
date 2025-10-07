import { supabase } from "../utils/supabase.js";

// Generate random invite code
const generateInviteCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create new context
export const createContext = async (name, description, createdBy) => {
  const inviteCode = generateInviteCode();

  const { data, error } = await supabase
    .from("contexts")
    .insert([
      {
        name,
        description,
        created_by: createdBy,
        invite_code: inviteCode,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Add creator as admin in context_members
  await addContextMember(data.id, createdBy, "admin");

  return data;
};

// Add member to context
export const addContextMember = async (contextId, userId, role = "member") => {
  const { data, error } = await supabase
    .from("context_members")
    .insert([
      {
        context_id: contextId,
        user_id: userId,
        role,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's contexts
export const getUserContexts = async (userId) => {
  const { data, error } = await supabase
    .from("context_members")
    .select(
      `
      role,
      contexts:context_id (
        id,
        name,
        description,
        invite_code,
        created_at,
        is_hidden
      )
    `
    )
    .eq("user_id", userId)
    .eq("contexts.is_hidden", false);

  if (error) throw error;

  // Flatten the data structure
  return data.map((item) => ({
    ...item.contexts,
    user_role: item.role,
  }));
};

// Get context by ID
export const getContextById = async (contextId) => {
  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("id", contextId)
    .eq("is_hidden", false)
    .single();

  if (error) throw error;
  return data;
};

// Find context by invite code
export const findContextByInviteCode = async (inviteCode) => {
  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("invite_code", inviteCode.toUpperCase())
    .eq("is_hidden", false)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Check if user is member of context
export const isContextMember = async (contextId, userId) => {
  const { data, error } = await supabase
    .from("context_members")
    .select("role")
    .eq("context_id", contextId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Check if user is admin
export const isContextAdmin = async (contextId, userId) => {
  const member = await isContextMember(contextId, userId);
  return member?.role === "admin";
};

// Get context members
export const getContextMembers = async (contextId) => {
  const { data, error } = await supabase
    .from("context_members")
    .select(
      `
      id,
      role,
      created_at,
      users:user_id (
        id,
        email,
        full_name
      )
    `
    )
    .eq("context_id", contextId);

  if (error) throw error;
  return data;
};

// Regenerate invite code
export const regenerateInviteCode = async (contextId) => {
  const newCode = generateInviteCode();

  const { data, error } = await supabase
    .from("contexts")
    .update({ invite_code: newCode })
    .eq("id", contextId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update member role
export const updateContextMemberRole = async (contextId, userId, role) => {
  const { error } = await supabase
    .from("context_members")
    .update({ role })
    .eq("context_id", contextId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};

// Remove member from context
export const removeContextMember = async (contextId, userId) => {
  const { error } = await supabase
    .from("context_members")
    .delete()
    .eq("context_id", contextId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};
