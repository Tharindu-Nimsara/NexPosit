import { supabase } from "../utils/supabase.js";

// Create new post
export const createPost = async (
  projectId,
  title,
  publishDate,
  publishTimeSlot,
  specificTime,
  createdBy
) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        project_id: projectId,
        title,
        publish_date: publishDate,
        publish_time_slot: publishTimeSlot,
        specific_time: specificTime,
        status: "pending",
        created_by: createdBy,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all posts in a context (for main grid)
export const getPostsByContext = async (contextId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      projects!inner (
        id,
        name,
        color_code,
        context_id
      ),
      created_by_user:users!posts_created_by_fkey (
        id,
        full_name,
        email
      ),
      approved_by_user:users!posts_approved_by_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .eq("projects.context_id", contextId)
    .order("publish_date", { ascending: true });

  if (error) throw error;
  return data;
};

// Get posts by project
export const getPostsByProject = async (projectId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      projects (
        id,
        name,
        color_code
      ),
      created_by_user:users!posts_created_by_fkey (
        id,
        full_name,
        email
      ),
      approved_by_user:users!posts_approved_by_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .eq("project_id", projectId)
    .order("publish_date", { ascending: true });

  if (error) throw error;
  return data;
};

// Get single post
export const getPostById = async (postId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      projects (
        id,
        name,
        color_code,
        context_id
      ),
      created_by_user:users!posts_created_by_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
};

// Update post
export const updatePost = async (postId, updates) => {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete post
export const deletePost = async (postId) => {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
  return true;
};

// Approve post
export const approvePost = async (postId, approvedBy) => {
  const { data, error } = await supabase
    .from("posts")
    .update({
      status: "approved",
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
