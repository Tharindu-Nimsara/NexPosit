import express from "express";
import { getContextById } from "../models/context.model.js";
import { getProjectsByContext } from "../models/project.model.js";
import { getPostsByContext } from "../models/post.model.js";

const router = express.Router();

// Public Dashboard - Get everything at once (NO AUTH REQUIRED)
router.get("/:contextId/dashboard", async (req, res) => {
  try {
    const { contextId } = req.params;

    // Get context
    const context = await getContextById(contextId);
    if (!context) {
      return res.status(404).json({
        success: false,
        error: "Organization not found",
      });
    }

    // Get projects and posts in parallel
    const [projects, posts] = await Promise.all([
      getProjectsByContext(contextId),
      getPostsByContext(contextId),
    ]);

    // Calculate stats
    const stats = {
      totalProjects: projects?.length || 0,
      totalPosts: posts?.length || 0,
      draftPosts: posts?.filter((p) => p.status === "draft").length || 0,
      scheduledPosts:
        posts?.filter((p) => p.status === "scheduled").length || 0,
      publishedPosts:
        posts?.filter((p) => p.status === "published").length || 0,
    };

    // ✨ UPDATED: Get upcoming posts using publish_date (next 4 days)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const fourDaysFromNow = new Date();
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
    fourDaysFromNow.setHours(23, 59, 59, 999); // End of day 4

    const upcomingPosts =
      posts
        ?.filter((post) => {
          if (!post.publish_date) return false; // ✨ Changed from scheduled_time to publish_date
          const publishDate = new Date(post.publish_date);
          return publishDate >= now && publishDate <= fourDaysFromNow;
        })
        .sort((a, b) => new Date(a.publish_date) - new Date(b.publish_date))
        .slice(0, 10) // Limit to 10 posts
        .map((post) => {
          // Find the project for this post
          const project = projects?.find((p) => p.id === post.project_id);
          return {
            id: post.id,
            title: post.title,
            publish_date: post.publish_date, // ✨ Changed from scheduled_time
            specific_time: post.specific_time, // ✨ Added for time formatting
            publish_time_slot: post.publish_time_slot, // ✨ Added for time formatting
            status: post.status,
            project: project
              ? {
                  id: project.id,
                  name: project.name,
                  color_code: project.color_code,
                }
              : null,
          };
        }) || [];

    res.json({
      success: true,
      data: {
        context: {
          id: context.id,
          name: context.name,
          description: context.description,
          created_at: context.created_at,
        },
        projects: projects || [],
        stats,
        upcomingPosts,
      },
    });
  } catch (error) {
    console.error("Get public dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
    });
  }
});

// Public route - Get context info (NO AUTH REQUIRED)
router.get("/contexts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const context = await getContextById(id);

    if (!context) {
      return res.status(404).json({
        success: false,
        error: "Organization not found",
      });
    }

    // Return only public info
    res.json({
      success: true,
      data: {
        context: {
          id: context.id,
          name: context.name,
          description: context.description,
          created_at: context.created_at,
        },
      },
    });
  } catch (error) {
    console.error("Get public context error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch organization",
    });
  }
});

// Public route - Get projects (NO AUTH REQUIRED)
router.get("/contexts/:contextId/projects", async (req, res) => {
  try {
    const { contextId } = req.params;
    const projects = await getProjectsByContext(contextId);

    res.json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    console.error("Get public projects error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
    });
  }
});

// Public route - Get posts (NO AUTH REQUIRED)
router.get("/contexts/:contextId/posts", async (req, res) => {
  try {
    const { contextId } = req.params;
    const posts = await getPostsByContext(contextId);

    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    console.error("Get public posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch posts",
    });
  }
});

export default router;
