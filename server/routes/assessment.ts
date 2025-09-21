import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create new assessment
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { skills, interests, personality, experience, goals } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!skills || !interests || !personality) {
      return res.status(400).json({
        error: 'Skills, interests, and personality scores are required'
      });
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        skills,
        interests,
        personality,
        experience,
        goals: goals || [],
      },
    });

    res.status(201).json({
      assessment,
      message: 'Assessment created successfully',
    });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get user's assessments
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        chats: {
          select: {
            id: true,
            startedAt: true,
            _count: {
              select: { messages: true },
            },
          },
        },
      },
    });

    res.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

// Get specific assessment
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user!.id;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId,
      },
      include: {
        chats: {
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment' });
  }
});

// Update assessment
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user!.id;
    const { skills, interests, personality, experience, goals } = req.body;

    // Check if assessment belongs to user
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId,
      },
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Update assessment
    const assessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        skills: skills || existingAssessment.skills,
        interests: interests || existingAssessment.interests,
        personality: personality || existingAssessment.personality,
        experience: experience !== undefined ? experience : existingAssessment.experience,
        goals: goals || existingAssessment.goals,
      },
    });

    res.json({
      assessment,
      message: 'Assessment updated successfully',
    });
  } catch (error) {
    console.error('Assessment update error:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// Delete assessment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user!.id;

    // Check if assessment belongs to user
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId,
      },
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Delete assessment (cascade will handle related data)
    await prisma.assessment.delete({
      where: { id: assessmentId },
    });

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Assessment deletion error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

export { router as assessmentRoutes };
