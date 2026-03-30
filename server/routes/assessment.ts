import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getTenantPrismaClient } from '../utils/tenant.js';

const router = express.Router();
const prisma = new PrismaClient();

const getPrismaClientForRequest = async (req: AuthRequest): Promise<PrismaClient> => {
  const clientId = req.user?.clientId;
  if (!clientId) {
    throw new Error('Missing clientId in user token');
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client?.databaseUrl) {
    throw new Error('Client database URL not found');
  }

  return getTenantPrismaClient(client.databaseUrl);
};

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

    const tenantPrisma = await getPrismaClientForRequest(req);

    // Create assessment
    const assessment = await tenantPrisma.assessment.create({
      data: {
        userId,
        clientId: req.user!.clientId!,
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

    const tenantPrisma = await getPrismaClientForRequest(req);

    const assessments = await tenantPrisma.assessment.findMany({
      where: { userId, clientId: req.user!.clientId },
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

    const tenantPrisma = await getPrismaClientForRequest(req);

    const assessment = await tenantPrisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId,
        clientId: req.user!.clientId,
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
    const tenantPrisma = await getPrismaClientForRequest(req);

    const existingAssessment = await tenantPrisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId,
        clientId: req.user!.clientId,
      },
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Update assessment
    const assessment = await tenantPrisma.assessment.update({
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
    const tenantPrisma = await getPrismaClientForRequest(req);
    await tenantPrisma.assessment.delete({
      where: { id: assessmentId },
    });

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Assessment deletion error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

export { router as assessmentRoutes };
