import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/store';
import { User, UserRole } from '../types/models';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'kaushal-setu-sih-2026-super-secret-key';

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      organizationName: user.organizationName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, role, name, organizationName } = req.body;
    if (!email || !password || !role || !name) {
      res.status(400).json({ error: 'Missing required registration fields.' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      passwordHash: 'dummy_hash', // For prototype
      role: role as UserRole,
      name: name.trim(),
      organizationName: organizationName?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // If student, create empty profile
    if (newUser.role === 'STUDENT') {
      db.saveStudentProfile({
        id: `stu-${Date.now()}`,
        userId: newUser.id,
        targetRole: 'DevOps / Cloud Engineer',
        preferredLocation: 'Bengaluru, Karnataka',
        experienceLevel: 'Fresher (0-1 yrs)',
        education: 'B.Tech / MCA in Computer Science',
        bio: 'Aspiring engineering professional looking to align skills with industry demands.',
        profileCompletionPct: 50,
        skills: [],
        savedRoadmapProgress: {},
      });
    }

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        organizationName: newUser.organizationName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// Login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    // Check user by email
    let user = email ? db.getUserByEmail(email) : undefined;

    // Convenient demo fallback: if logging in by role selector
    if (!user && role) {
      for (const u of db.users.values()) {
        if (u.role === role) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      // Default to student if nothing found
      user = db.users.get('usr-student-1');
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials or user not found.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        organizationName: user.organizationName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Current User Details
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return default student session for smooth UI exploration
    const defaultUser = db.users.get('usr-student-1')!;
    const token = generateToken(defaultUser);
    res.json({
      token,
      user: {
        id: defaultUser.id,
        email: defaultUser.email,
        role: defaultUser.role,
        name: defaultUser.name,
        organizationName: defaultUser.organizationName,
      },
    });
    return;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.getUserById(decoded.userId) || decoded;
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});
