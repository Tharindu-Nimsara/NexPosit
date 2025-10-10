// server/controllers/public.controller.js
export const getPublicContext = async (req, res) => {
  try {
    const { id } = req.params;
    const context = await getContextById(id);

    // Return only public info (no invite codes, etc.)
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
    res.status(500).json({ error: "Failed to fetch context" });
  }
};

export const getPublicProjects = async (req, res) => {
  try {
    const { contextId } = req.params;
    const projects = await getProjectsByContext(contextId);

    // Return basic project info
    res.json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getPublicPosts = async (req, res) => {
  try {
    const { contextId } = req.params;
    const posts = await getPostsByContext(contextId);

    // Return posts without sensitive info
    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
