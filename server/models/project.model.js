import { supabase } from "../utils/supabase.js";

// Create new project
export const createProject = async (contextId, name, colorCode) => {
  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        context_id: contextId,
        name,
        color_code: colorCode,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all projects in a context
export const getProjectsByContext = async (contextId) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("context_id", contextId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get single project
export const getProjectById = async (projectId) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("is_hidden", false)
    .single();

  if (error) throw error;
  return data;
};

// Update project
export const updateProject = async (projectId, updates) => {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Add member to project
export const addProjectMember = async (projectId, userId) => {
  const { data, error } = await supabase
    .from("project_members")
    .insert([
      {
        project_id: projectId,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) {
    // Check if already exists
    if (error.code === "23505") {
      throw new Error("User is already a member of this project");
    }
    throw error;
  }
  return data;
};

// Remove member from project
export const removeProjectMember = async (projectId, userId) => {
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};

// Get project members
export const getProjectMembers = async (projectId) => {
  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
      id,
      created_at,
      users:user_id (
        id,
        email,
        full_name
      )
    `
    )
    .eq("project_id", projectId);

  if (error) throw error;
  return data;
};

// Check if user is project member
export const isProjectMember = async (projectId, userId) => {
  const { data, error } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
};

// Delete project
export const deleteProject = async (projectId) => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) throw error;
  return true;
};
