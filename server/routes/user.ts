import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assessments: true,
            chats: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, email } = req.body;

    if (email && email !== req.user!.email) {
      // Check if new email is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    res.json({
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get latest assessment
    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        chats: {
          orderBy: { lastActivity: 'desc' },
          take: 5, // Last 5 chats
          select: {
            id: true,
            startedAt: true,
            lastActivity: true,
            _count: {
              select: { messages: true },
            },
          },
        },
      },
    });

    // Get all assessments count
    const totalAssessments = await prisma.assessment.count({
      where: { userId },
    });

    // Get recent chats count
    const recentChatsCount = await prisma.chat.count({
      where: {
        userId,
        startedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Get total messages count
    const totalMessages = await prisma.message.count({
      where: {
        chat: {
          userId,
        },
      },
    });

    res.json({
      dashboard: {
        latestAssessment,
        stats: {
          totalAssessments,
          recentChats: recentChatsCount,
          totalMessages,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Delete user account (with all associated data)
router.delete('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Note: Prisma will handle cascade deletion due to schema setup
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export { router as userRoutes };
