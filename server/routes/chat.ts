import express from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create new chat session
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { assessmentId } = req.body;

    // Create chat session
    const chat = await prisma.chat.create({
      data: {
        userId,
        assessmentId,
      },
    });

    res.status(201).json({
      chat,
      message: 'Chat session created successfully',
    });
  } catch (error) {
    console.error('Chat creation error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Send message and get AI response
router.post('/:chatId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        assessment: true,
        messages: {
          orderBy: { timestamp: 'asc' },
          take: -50, // Get last 50 messages for context
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        content,
        sender: 'user',
      },
    });

    // Get assessment context for personalized responses
    let aiResponse = '';
    let suggestions: string[] = [];
    let metadata = {};

    try {
      // Build system message with assessment context
      let systemMessage = `You are a professional career advisor AI. You have access to the user's assessment data. Provide personalized, actionable career advice based on their profile.

Key Assessment Data:
- Skills: ${JSON.stringify(chat.assessment?.skills || [])}
- Interests: ${JSON.stringify(chat.assessment?.interests || [])}
- Personality: ${JSON.stringify(chat.assessment?.personality || {})}
- Experience: ${chat.assessment?.experience || 'Not specified'}
- Career Goals: ${JSON.stringify(chat.assessment?.goals || [])}

Guidelines:
1. Be professional, supportive, and encouraging
2. Provide specific, actionable advice
3. Reference their skills and interests when possible
4. Suggest concrete next steps
5. Ask clarifying questions when needed
6. Provide realistic timelines and expectations
7. Include relevant resources or strategies

Always respond in a helpful, personalized manner that considers their unique profile.`;

      // Build conversation history for context
      const messagesFormatted = [
        { role: 'system' as const, content: systemMessage },
        ...chat.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        })),
        { role: 'user' as const, content },
      ];

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesFormatted,
        max_tokens: 1000,
        temperature: 0.7,
        stop: null,
      });

      aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

      // Generate suggestions based on the response
      suggestions = await generateSuggestions(aiResponse, chat.assessment);

      // Add metadata
      metadata = {
        tokens_used: completion.usage?.total_tokens,
        model: completion.model,
        response_time: completion.created,
      };

    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      aiResponse = 'I apologize, but there was an issue processing your request. Please try again in a moment.';
      suggestions = ['Please try again', 'Contact support if the issue persists'];
    }

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        chatId,
        content: aiResponse,
        sender: 'ai',
        suggestions,
        metadata,
      },
    });

    // Update chat last activity
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastActivity: new Date() },
    });

    res.json({
      userMessage,
      aiMessage,
      suggestions,
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;
    const { limit = '50' } = req.query;

    const limitNum = parseInt(limit as string, 10);

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
      take: limitNum,
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Get user's chat sessions
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const chats = await prisma.chat.findMany({
      where: { userId },
      include: {
        assessment: {
          select: {
            id: true,
            completedAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastActivity: 'desc' },
    });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions' });
  }
});

// Delete chat session
router.delete('/:chatId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Delete chat (cascade will handle messages)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// Helper function to generate suggestions
async function generateSuggestions(aiResponse: string, assessment: any): Promise<string[]> {
  const suggestions: string[] = [];

  // Basic suggestions based on response content
  if (aiResponse.toLowerCase().includes('skill') || aiResponse.toLowerCase().includes('learn')) {
    suggestions.push('What specific skills should I focus on?');
    suggestions.push('Suggest online learning resources');
  }

  if (aiResponse.toLowerCase().includes('job') || aiResponse.toLowerCase().includes('career')) {
    suggestions.push('What jobs match my skills and interests?');
    suggestions.push('How do I optimize my resume?');
  }

  if (aiResponse.toLowerCase().includes('interview') || aiResponse.toLowerCase().includes('interviews')) {
    suggestions.push('Help me prepare for technical interviews');
  }

  if (aiResponse.toLowerCase().includes('network') || aiResponse.toLowerCase().includes('networking')) {
    suggestions.push('How can I network effectively?');
    suggestions.push('Find career meetups or conferences');
  }

  // Assessment-specific suggestions
  if (assessment?.skills?.includes('JavaScript') || assessment?.skills?.includes('React')) {
    suggestions.push('Suggest full-stack development roles');
  }

  if (assessment?.interests?.includes('Data & Analytics')) {
    suggestions.push('Explore data science career paths');
  }

  // Default suggestions if none generated
  if (suggestions.length === 0) {
    suggestions.push('Tell me more about career transitions');
    suggestions.push('Help with resume optimization');
    suggestions.push('Suggest professional development courses');
  }

  // Return first 3-4 suggestions
  return suggestions.slice(0, 4);
}

export { router as chatRoutes };
