"""
Deterministic Skill Gap Engine for Student Candidates and Target Roles.
Provides mathematically explainable match percentages and actionable priority rankings.
"""

from typing import Dict, List, Any
from .skill_normalizer import CANONICAL_SKILLS_DATA, skill_normalizer


class SkillGapEngine:
    PROFICIENCY_RANKS = {
        "BEGINNER": 1,
        "INTERMEDIATE": 2,
        "ADVANCED": 3
    }

    def is_proficiency_sufficient(self, has: str, needed: str) -> bool:
        has_rank = self.PROFICIENCY_RANKS.get(has.upper(), 1)
        needed_rank = self.PROFICIENCY_RANKS.get(needed.upper(), 1)
        return has_rank >= needed_rank

    def evaluate_student_job_match(self, student_skills: List[Dict[str, Any]], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate exact match between candidate skills and job requirements.
        Formula: RequiredWeight = 0.70, PreferredWeight = 0.30
        Match% = (MatchedRequired / TotalRequired * 0.70 + MatchedPreferred / TotalPreferred * 0.30) * 100
        """
        student_skill_map = {s.get("skill_id") or s.get("skillId"): s for s in student_skills}

        job_skills = job.get("skills") or job.get("required_skills", [])
        required_reqs = [s for s in job_skills if s.get("is_required", s.get("isRequired", True))]
        preferred_reqs = [s for s in job_skills if not s.get("is_required", s.get("isRequired", True))]

        matched_required = 0
        matched_preferred = 0

        strong_skills = []
        missing_skills = []
        weak_skills = []

        all_skills_dict = {s["id"]: s for s in CANONICAL_SKILLS_DATA}

        for req in job_skills:
            skill_id = req.get("skill_id") or req.get("skillId")
            is_req = req.get("is_required", req.get("isRequired", True))
            min_prof = req.get("min_proficiency", req.get("minProficiency", "INTERMEDIATE"))

            skill_obj = all_skills_dict.get(skill_id, {
                "id": skill_id,
                "name": skill_id,
                "normalized_name": skill_id,
                "category": "Engineering",
                "description": "",
                "market_demand_level": "HIGH",
                "average_salary_bump_pct": 20.0
            })

            student_has = student_skill_map.get(skill_id)

            if not student_has:
                priority = "CRITICAL" if (is_req and skill_obj.get("market_demand_level") == "HIGH") else ("HIGH" if is_req else "MEDIUM")
                missing_skills.append({
                    "skill": skill_obj,
                    "status": "MISSING",
                    "is_required": is_req,
                    "required_proficiency": min_prof,
                    "market_demand": skill_obj.get("market_demand_level", "HIGH"),
                    "gap_priority": priority,
                    "explanation": f"Mandatory requirement for this role ({min_prof} level required)." if is_req else "Preferred skill. Would boost candidate rating."
                })
            else:
                student_prof = student_has.get("proficiency", "INTERMEDIATE")
                if self.is_proficiency_sufficient(student_prof, min_prof):
                    if is_req:
                        matched_required += 1
                    else:
                        matched_preferred += 1

                    is_verified = student_has.get("verified", False)
                    is_strong = is_verified and student_prof in ("ADVANCED", "INTERMEDIATE")
                    detail = {
                        "skill": skill_obj,
                        "status": "STRONG" if is_strong else "MATCHED",
                        "is_required": is_req,
                        "student_proficiency": student_prof,
                        "required_proficiency": min_prof,
                        "market_demand": skill_obj.get("market_demand_level", "HIGH"),
                        "gap_priority": "LOW",
                        "explanation": f"Candidate verified at {student_prof} level (meets {min_prof} threshold)."
                    }
                    if is_strong:
                        strong_skills.append(detail)
                else:
                    weak_skills.append({
                        "skill": skill_obj,
                        "status": "WEAK",
                        "is_required": is_req,
                        "student_proficiency": student_prof,
                        "required_proficiency": min_prof,
                        "market_demand": skill_obj.get("market_demand_level", "HIGH"),
                        "gap_priority": "HIGH",
                        "explanation": f"Candidate has {student_prof} proficiency, but job explicitly requires {min_prof}."
                    })

        total_req = max(1, len(required_reqs))
        req_fraction = matched_required / total_req

        if preferred_reqs:
            pref_fraction = matched_preferred / len(preferred_reqs)
            overall_pct = round((req_fraction * 0.70 + pref_fraction * 0.30) * 100)
        else:
            pref_fraction = 1.0
            overall_pct = round(req_fraction * 100)

        explanation = (
            f"Score computed mathematically: {matched_required}/{total_req} mandatory skills met "
            f"({round(req_fraction * 100)}% required weight) + {matched_preferred}/{max(1, len(preferred_reqs))} "
            f"preferred skills met. Identified {len(missing_skills)} missing skill gaps."
        )

        return {
            "job": job,
            "overall_match_pct": overall_pct,
            "required_match_pct": round(req_fraction * 100),
            "preferred_match_pct": round(pref_fraction * 100),
            "matched_skills_count": matched_required + matched_preferred,
            "total_required_count": total_req,
            "strong_skills": strong_skills,
            "missing_skills": missing_skills,
            "weak_skills": weak_skills,
            "match_breakdown_explanation": explanation
        }

    def evaluate_role_gaps(self, student_skills: List[Dict[str, Any]], target_role: str, all_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Evaluate macro skill gaps against benchmark requirements for a given target role."""
        # Find matching jobs for this role
        matching_jobs = [
            j for j in all_jobs
            if target_role.lower() in j.get("role_category", "").lower()
            or target_role.lower() in j.get("title", "").lower()
        ]
        jobs_to_use = matching_jobs if matching_jobs else all_jobs[:3]

        # Aggregate skill frequencies
        frequency = {}
        for job in jobs_to_use:
            for s in job.get("skills", []):
                s_id = s.get("skill_id") or s.get("skillId")
                is_req = s.get("is_required", s.get("isRequired", True))
                frequency[s_id] = frequency.get(s_id, 0) + (2 if is_req else 1)

        student_skill_ids = {s.get("skill_id") or s.get("skillId") for s in student_skills}
        all_skills_dict = {s["id"]: s for s in CANONICAL_SKILLS_DATA}

        market_skills_needed = []
        strong_count = 0
        missing_count = 0

        for skill_id in frequency.keys():
            skill_obj = all_skills_dict.get(skill_id)
            if not skill_obj:
                continue

            has = skill_id in student_skill_ids
            is_missing = not has
            if is_missing:
                missing_count += 1
            else:
                strong_count += 1

            market_skills_needed.append({
                "skill": skill_obj,
                "market_demand": skill_obj.get("market_demand_level", "HIGH"),
                "is_missing": is_missing,
                "is_weak": False,
                "priority": "CRITICAL" if (is_missing and skill_obj.get("market_demand_level") == "HIGH") else "HIGH",
                "explanation": f"Standard industry competency for {target_role}."
            })

        total = max(1, len(market_skills_needed))
        overall_preparedness_pct = round((strong_count / total) * 100)

        return {
            "target_role": target_role,
            "market_skills_needed": market_skills_needed,
            "strong_count": strong_count,
            "missing_count": missing_count,
            "overall_preparedness_pct": overall_preparedness_pct,
            "data_source": "DEMO/SEED DATA - Aggregated from Indian Tech Roles"
        }


skill_gap_engine = SkillGapEngine()
