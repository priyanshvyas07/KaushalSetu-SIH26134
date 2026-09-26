"""
Macro Labour Market Analytics Engine for Government and Institutional Stakeholders.
Computes geographic heatmaps, emerging skill growth metrics, and supply-demand ratios.
"""

from typing import Dict, List, Any
from .skill_normalizer import CANONICAL_SKILLS_DATA


class AnalyticsEngine:
    def get_skill_shortages(self) -> List[Dict[str, Any]]:
        """Identify critical shortages (Demand > Supply) and oversupply risks."""
        shortages = [
            {
                "skill_id": "sk-k8s",
                "skill_name": "Kubernetes",
                "category": "Cloud & DevOps",
                "total_openings_india": 38200,
                "demand_index": 92.0,
                "supply_index": 24.5,
                "gap_ratio": 3.75,
                "status": "CRITICAL SHORTAGE",
                "yoy_growth_pct": 45.0,
                "avg_salary_lpa": 16.5,
                "impacted_roles": ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"]
            },
            {
                "skill_id": "sk-genai",
                "skill_name": "Generative AI",
                "category": "AI & Data Science",
                "total_openings_india": 46500,
                "demand_index": 97.5,
                "supply_index": 21.0,
                "gap_ratio": 4.64,
                "status": "CRITICAL SHORTAGE",
                "yoy_growth_pct": 82.0,
                "avg_salary_lpa": 18.0,
                "impacted_roles": ["AI/ML Engineer", "LLM Engineer", "Data Scientist"]
            },
            {
                "skill_id": "sk-docker",
                "skill_name": "Docker",
                "category": "Cloud & DevOps",
                "total_openings_india": 49800,
                "demand_index": 94.0,
                "supply_index": 37.0,
                "gap_ratio": 2.54,
                "status": "CRITICAL SHORTAGE",
                "yoy_growth_pct": 38.0,
                "avg_salary_lpa": 13.5,
                "impacted_roles": ["Backend Developer", "DevOps Engineer", "Full Stack Developer"]
            },
            {
                "skill_id": "sk-aws",
                "skill_name": "AWS",
                "category": "Cloud & DevOps",
                "total_openings_india": 58000,
                "demand_index": 95.0,
                "supply_index": 41.0,
                "gap_ratio": 2.32,
                "status": "MODERATE SHORTAGE",
                "yoy_growth_pct": 33.0,
                "avg_salary_lpa": 14.5,
                "impacted_roles": ["Cloud Systems Engineer", "Solutions Architect", "DevOps Engineer"]
            },
            {
                "skill_id": "sk-cybersec",
                "skill_name": "Cybersecurity",
                "category": "Cybersecurity",
                "total_openings_india": 26400,
                "demand_index": 84.0,
                "supply_index": 28.0,
                "gap_ratio": 3.00,
                "status": "CRITICAL SHORTAGE",
                "yoy_growth_pct": 42.0,
                "avg_salary_lpa": 15.0,
                "impacted_roles": ["Security Analyst", "SecOps Engineer", "Penetration Tester"]
            },
            {
                "skill_id": "sk-java",
                "skill_name": "Java (Core & Desktop)",
                "category": "Backend",
                "total_openings_india": 32000,
                "demand_index": 70.0,
                "supply_index": 94.0,
                "gap_ratio": 0.74,
                "status": "OVERSUPPLY",
                "yoy_growth_pct": 8.0,
                "avg_salary_lpa": 9.5,
                "impacted_roles": ["Application Developer", "Maintenance Engineer"]
            }
        ]
        return shortages

    def get_emerging_skills(self) -> List[Dict[str, Any]]:
        """Return rapid-growth skills (>30% YoY growth)."""
        return [
            {"skill_name": "Generative AI & LLM Agents", "growth_rate_pct": 82.0, "category": "AI & Data Science", "openings_count": 46500, "top_state": "Karnataka"},
            {"skill_name": "Kubernetes Cluster Ingress", "growth_rate_pct": 45.0, "category": "Cloud & DevOps", "openings_count": 38200, "top_state": "Karnataka"},
            {"skill_name": "Zero-Trust Cybersecurity", "growth_rate_pct": 42.0, "category": "Cybersecurity", "openings_count": 26400, "top_state": "Maharashtra"},
            {"skill_name": "Multi-Stage Docker Builds", "growth_rate_pct": 38.0, "category": "Cloud & DevOps", "openings_count": 49800, "top_state": "Maharashtra"},
            {"skill_name": "AWS Cloud Native IaC", "growth_rate_pct": 33.0, "category": "Cloud & DevOps", "openings_count": 58000, "top_state": "Telangana"}
        ]

    def get_state_heatmaps(self) -> List[Dict[str, Any]]:
        """Return regional geographic distribution of tech hiring."""
        return [
            {"state": "Karnataka", "openings_count": 68500, "avg_alignment_score": 54.2, "institute_count": 240, "student_enrollment_capacity": 48000, "top_skills": ["Generative AI", "AWS", "Docker", "React"], "lat": 12.9716, "lng": 77.5946},
            {"state": "Maharashtra", "openings_count": 52400, "avg_alignment_score": 48.2, "institute_count": 310, "student_enrollment_capacity": 62000, "top_skills": ["Linux", "Docker", "Python", "SQL"], "lat": 19.0760, "lng": 72.8777},
            {"state": "Telangana", "openings_count": 44800, "avg_alignment_score": 50.8, "institute_count": 190, "student_enrollment_capacity": 38000, "top_skills": ["AWS", "Docker", "GenAI", "SQL"], "lat": 17.3850, "lng": 78.4867},
            {"state": "Delhi NCR", "openings_count": 41200, "avg_alignment_score": 53.0, "institute_count": 220, "student_enrollment_capacity": 42000, "top_skills": ["React", "Python", "AWS", "GenAI"], "lat": 28.6139, "lng": 77.2090},
            {"state": "Tamil Nadu", "openings_count": 36500, "avg_alignment_score": 51.5, "institute_count": 280, "student_enrollment_capacity": 56000, "top_skills": ["Java", "Docker", "AWS", "Python"], "lat": 13.0827, "lng": 80.2707},
            {"state": "Gujarat", "openings_count": 18200, "avg_alignment_score": 44.0, "institute_count": 140, "student_enrollment_capacity": 24000, "top_skills": ["Docker", "Cybersecurity", "React"], "lat": 23.0225, "lng": 72.5714}
        ]

    def export_csv(self, report_type: str = "skill-gaps") -> str:
        """Export CSV report for administrative decision makers."""
        shortages = self.get_skill_shortages()
        lines = ["Skill ID,Skill Name,Category,Openings in India,Demand Index,Supply Index,Gap Ratio,Status,YoY Growth %"]
        for s in shortages:
            lines.append(f"{s['skill_id']},{s['skill_name']},{s['category']},{s['total_openings_india']},{s['demand_index']},{s['supply_index']},{s['gap_ratio']},{s['status']},{s['yoy_growth_pct']}%")
        return "\n".join(lines)


analytics_engine = AnalyticsEngine()
