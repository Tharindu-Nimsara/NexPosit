import {
  createContext,
  getUserContexts,
  getContextById,
  findContextByInviteCode,
  addContextMember,
  isContextMember,
  isContextAdmin,
  getContextMembers,
  updateContextMemberRole,
  removeContextMember,
  regenerateInviteCode,
} from "../models/context.model.js";
import { isValidContextName } from "../utils/validators.js";

// Create new context
export const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    // Validate
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Context name is required",
      });
    }

    if (!isValidContextName(name)) {
      return res.status(400).json({
        success: false,
        error: "Context name must be between 3 and 100 characters",
      });
    }

    // Create context
    const context = await createContext(name, description || "", userId);

    res.status(201).json({
      success: true,
      data: { context },
    });
  } catch (error) {
    console.error("Create context error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create context",
    });
  }
};

// Get user's contexts
export const getUserContextsList = async (req, res) => {
  try {
    const userId = req.userId;

    const contexts = await getUserContexts(userId);

    res.json({
      success: true,
      data: { contexts },
    });
  } catch (error) {
    console.error("Get contexts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get contexts",
    });
  }
};

// Get single context
export const getContext = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is member
    const membership = await isContextMember(id, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this context",
      });
    }

    const context = await getContextById(id);

    res.json({
      success: true,
      data: {
        context: {
          ...context,
          user_role: membership.role,
          isAdmin: membership.role === "admin",
          isOwner: context.created_by === userId, // 🔒 Add owner flag
        },
      },
    });
  } catch (error) {
    console.error("Get context error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get context",
    });
  }
};

// Join context via invite code
export const joinContext = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.userId;

    // Find context by invite code
    const context = await findContextByInviteCode(code);

    if (!context) {
      return res.status(404).json({
        success: false,
        error: "Invalid invite code",
      });
    }

    // Check if already a member
    const existingMembership = await isContextMember(context.id, userId);
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: "You are already a member of this context",
      });
    }

    // Add as member
    await addContextMember(context.id, userId, "member");

    res.json({
      success: true,
      data: {
        context,
        message: "Successfully joined context",
      },
    });
  } catch (error) {
    console.error("Join context error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to join context",
    });
  }
};

// Get context members
export const getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is member
    const membership = await isContextMember(id, userId);
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this context",
      });
    }

    // Get context to identify owner
    const context = await getContextById(id);
    const members = await getContextMembers(id);

    // 🔒 Add owner flag to each member
    const membersWithOwner = members.map((member) => ({
      ...member,
      isOwner: member.user_id === context.created_by,
    }));

    res.json({
      success: true,
      data: { members: membersWithOwner },
    });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get members",
    });
  }
};

// Update member role (promote/demote)
export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const { role } = req.body;
    const userId = req.userId;

    // Check if user is admin
    const isAdmin = await isContextAdmin(id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can change member roles",
      });
    }

    // Validate role
    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be either admin or member",
      });
    }

    // Don't allow changing own role
    if (userId === memberUserId) {
      return res.status(400).json({
        success: false,
        error: "You cannot change your own role",
      });
    }

    // 🔒 PROTECTION: Get context and check if target is the owner
    const context = await getContextById(id);
    if (memberUserId === context.created_by) {
      return res.status(403).json({
        success: false,
        error: "Cannot change the role of the context owner",
      });
    }

    // Update role
    await updateContextMemberRole(id, memberUserId, role);

    res.json({
      success: true,
      message: `Member role updated to ${role}`,
    });
  } catch (error) {
    console.error("Update member role error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update member role",
    });
  }
};

// Remove member from context
export const removeMember = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = req.userId;

    // Check if user is admin
    const isAdmin = await isContextAdmin(id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can remove members",
      });
    }

    // Don't allow removing yourself
    if (userId === memberUserId) {
      return res.status(400).json({
        success: false,
        error: "You cannot remove yourself from the context",
      });
    }

    // 🔒 PROTECTION: Get context and check if target is the owner
    const context = await getContextById(id);
    if (memberUserId === context.created_by) {
      return res.status(403).json({
        success: false,
        error: "Cannot remove the context owner",
      });
    }

    // Remove member
    await removeContextMember(id, memberUserId);

    res.json({
      success: true,
      message: "Member removed from context",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove member",
    });
  }
};

// Regenerate invite code (admin only)
export const regenerateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is admin
    const isAdmin = await isContextAdmin(id, userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only admins can regenerate invite codes",
      });
    }

    const context = await regenerateInviteCode(id);

    res.json({
      success: true,
      data: {
        context,
        message: "Invite code regenerated successfully",
      },
    });
  } catch (error) {
    console.error("Regenerate code error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to regenerate invite code",
    });
  }
};


export const joinContextById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if context exists
    const context = await getContextById(id);
    if (!context) {
      return res.status(404).json({
        success: false,
        error: "Organization not found",
      });
    }

    // Check if already a member
    const existingMembership = await isContextMember(id, userId);
    if (existingMembership) {
      return res.status(200).json({
        success: true,
        data: {
          context,
          message: "You are already a member of this organization",
        },
      });
    }

    // Add as member
    await addContextMember(id, userId, "member");

    res.json({
      success: true,
      data: {
        context,
        message: "Successfully joined organization",
      },
    });
  } catch (error) {
    console.error("Join context by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to join organization",
    });
  }
};
