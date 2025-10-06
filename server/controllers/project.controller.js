import {
  createProject,
  getProjectsByContext,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
  isProjectMember,
} from "../models/project.model.js";
import { isContextAdmin, isContextMember } from "../models/context.model.js";
import { isValidContextName } from "../utils/validators.js";

// Create new project (admin only)
export const create = async (req, res) => {
  try {
    const { contextId } = req.params;
    const { name, color_code } = req.body;
    const userId = req.userId;

    // Check if user is admin
    const isAdmin = await isContextAdmin(contextId, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can create projects",
      });
    }

    // Validate
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Project name is required",
      });
    }

    if (!isValidContextName(name)) {
      return res.status(400).json({
        success: false,
        error: "Project name must be between 3 and 100 characters",
      });
    }

    // Create project
    const project = await createProject(
      contextId,
      name,
      color_code || "#3B82F6"
    );

    res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create project",
    });
  }
};

// Get all projects in a context
export const getContextProjects = async (req, res) => {
  try {
    const { contextId } = req.params;
    const userId = req.userId;

    // Check if user is member
    const membership = await isContextMember(contextId, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this context",
      });
    }

    const projects = await getProjectsByContext(contextId);

    res.json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get projects",
    });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const project = await getProjectById(id);

    // Check if user is member of the context
    const membership = await isContextMember(project.context_id, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this project",
      });
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project",
    });
  }
};

// Update project (admin only)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color_code } = req.body;
    const userId = req.userId;

    const project = await getProjectById(id);

    // Check if user is admin
    const isAdmin = await isContextAdmin(project.context_id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can update projects",
      });
    }

    const updates = {};
    if (name) {
      if (!isValidContextName(name)) {
        return res.status(400).json({
          success: false,
          error: "Project name must be between 3 and 100 characters",
        });
      }
      updates.name = name;
    }
    if (color_code) updates.color_code = color_code;

    const updatedProject = await updateProject(id, updates);

    res.json({
      success: true,
      data: { project: updatedProject },
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update project",
    });
  }
};

// Add member to project (admin only)
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const userId = req.userId;

    const project = await getProjectById(id);

    // Check if user is admin
    const isAdmin = await isContextAdmin(project.context_id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can add members to projects",
      });
    }

    // Check if the user being added is a context member
    const isContextMemberUser = await isContextMember(
      project.context_id,
      user_id
    );
    if (!isContextMemberUser) {
      return res.status(400).json({
        success: false,
        error: "User must be a member of the context first",
      });
    }

    await addProjectMember(id, user_id);

    res.json({
      success: true,
      message: "Member added to project successfully",
    });
  } catch (error) {
    console.error("Add member error:", error);
    if (error.message === "User is already a member of this project") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to add member to project",
    });
  }
};

// Remove member from project (admin only)
export const removeMember = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = req.userId;

    const project = await getProjectById(id);

    // Check if user is admin
    const isAdmin = await isContextAdmin(project.context_id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can remove members from projects",
      });
    }

    await removeProjectMember(id, memberUserId);

    res.json({
      success: true,
      message: "Member removed from project successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove member from project",
    });
  }
};

// Get project members
export const getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const project = await getProjectById(id);

    // Check if user is member of the context
    const membership = await isContextMember(project.context_id, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this project",
      });
    }

    const members = await getProjectMembers(id);

    res.json({
      success: true,
      data: { members },
    });
  } catch (error) {
    console.error("Get project members error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project members",
    });
  }
};
