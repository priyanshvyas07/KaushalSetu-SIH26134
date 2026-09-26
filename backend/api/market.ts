import { Router, Request, Response } from 'express';
import { db } from '../database/store';
import { CANONICAL_SKILLS, SKILL_ALIASES, normalizeSkillText } from '../data/taxonomy';

export const marketRouter = Router();

// All Skills
marketRouter.get('/skills', (req: Request, res: Response) => {
  const skills = db.getAllSkills();
  res.json({ skills });
});

// Taxonomy & Aliases
marketRouter.get('/taxonomy', (req: Request, res: Response) => {
  res.json({
    canonicalSkills: CANONICAL_SKILLS,
    aliasesCount: SKILL_ALIASES.length,
    sampleAliases: SKILL_ALIASES.slice(0, 20),
  });
});

// Normalize endpoint
marketRouter.post('/normalize-skill', (req: Request, res: Response) => {
  const { rawText } = req.body;
  if (!rawText) {
    res.status(400).json({ error: 'rawText is required.' });
    return;
  }

  const normalized = normalizeSkillText(rawText);
  const skillObj = normalized ? {
    id: normalized.id,
    name: normalized.canonicalName,
    canonicalName: normalized.canonicalName,
    category: normalized.category,
    marketDemandLevel: normalized.marketDemandLevel,
    averageSalaryBumpPct: normalized.averageSalaryBumpPct,
  } : null;

  res.json({
    rawInput: rawText,
    normalized: skillObj,
    normalizedSkill: skillObj,
    isRecognized: Boolean(normalized),
    isCanonical: Boolean(normalized),
  });
});
