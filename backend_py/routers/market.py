"""
Canonical Market & Skill Normalization Router:
/api/v1/market/skills, /api/v1/market/normalize-skill
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from ..schemas import SkillNormalizeRequest
from ..ai.skill_normalizer import CANONICAL_SKILLS_DATA, skill_normalizer

router = APIRouter(prefix="/api/v1/market", tags=["Market & Taxonomy"])


@router.get("/skills")
def get_canonical_skills():
    """Retrieve all canonical industry skills recognized by the intelligence engine."""
    return {"skills": CANONICAL_SKILLS_DATA}


@router.post("/normalize-skill")
def normalize_skill(req: SkillNormalizeRequest):
    """Normalize any arbitrary string variation into canonical standardized skill."""
    norm = skill_normalizer.normalize(req.raw_text)
    return {
        "rawInput": req.raw_text,
        "normalizedSkill": norm,
        "isCanonical": norm is not None
    }
