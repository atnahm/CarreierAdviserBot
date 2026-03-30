import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateToken } from '../middleware/auth.js';
import { getTenantPrismaClient } from '../utils/tenant.js';

const router = express.Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);

const MASTER_DATABASE_URL = process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL;
const masterPool = new Pool({ connectionString: MASTER_DATABASE_URL });

const sanitizeClientDbName = (name: string, id: string): string => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 26);
  const truncId = id.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
  return `careeradviser_${cleanName}_${truncId}`;
};

const buildClientDatabaseUrl = (masterUrl: string, dbName: string): string => {
  const url = new URL(masterUrl);
  return `${url.protocol}//${url.username}:${url.password}@${url.hostname}:${url.port}/${dbName}`;
};

const createDatabaseForClient = async (clientName: string, clientId: string): Promise<string> => {
  const dbName = sanitizeClientDbName(clientName, clientId);
  await masterPool.query(`CREATE DATABASE \\"${dbName}\\"`);
  return buildClientDatabaseUrl(MASTER_DATABASE_URL, dbName);
};

const applyPrismaMigrationsToDatabase = async (databaseUrl: string) => {
  await execAsync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
};

// Register new client + tenant DB + admin user
router.post('/client-register', async (req, res) => {
  try {
    const { clientName, domain, adminEmail, adminPassword, adminName } = req.body;

    if (!clientName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'clientName, adminEmail, and adminPassword are required' });
    }

    const existingClient = await prisma.client.findUnique({
      where: { name: clientName },
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Client with this name already exists' });
    }

    const client = await prisma.client.create({
      data: {
        name: clientName,
        domain,
      },
    });

    const clientDbUrl = await createDatabaseForClient(clientName, client.id);

    await prisma.client.update({
      where: { id: client.id },
      data: { databaseUrl: clientDbUrl },
    });

    await applyPrismaMigrationsToDatabase(clientDbUrl);

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create tenant admin user in master registry for client lookup
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        clientId: client.id,
      },
      select: { id: true, email: true, name: true, clientId: true },
    });

    // Also create tenant admin user directly in tenant DB to guarantee complete isolation
    const tenantPrisma = await getTenantPrismaClient(clientDbUrl);
    await tenantPrisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        clientId: client.id,
      },
    });

    const token = generateToken(adminUser.id, adminUser.email, client.id);

    return res.status(201).json({
      client: { id: client.id, name: client.name, domain: client.domain, databaseUrl: clientDbUrl },
      adminUser,
      token,
      message: 'Client and tenant database created successfully',
    });
  } catch (error) {
    console.error('Client registration error:', error);
    return res.status(500).json({ error: 'Failed to create client and tenant database' });
  }
});

// Register a user under existing client
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, clientId } = req.body;

    if (!email || !password || !clientId) {
      return res.status(400).json({ error: 'email, password, and clientId are required' });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        clientId,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists for this client' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        clientId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id, user.email, client.id);
    res.status(201).json({ user, token, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, clientId } = req.body;

    if (!email || !password || !clientId) {
      return res.status(400).json({ error: 'email, password, and clientId are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email, clientId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email);
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    res.json({ user: { id: 'placeholder-id', email: 'user@example.com', name: 'John Doe' } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

export { router as authRoutes };
