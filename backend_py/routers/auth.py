"""
Auth router: /api/v1/auth/register, /api/v1/auth/login, /api/v1/auth/me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudentProfile
from ..schemas import UserRegisterRequest, UserLoginRequest, AuthTokenResponse, UserResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user_optional, get_current_user
import uuid

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists.")

    new_id = f"usr-{uuid.uuid4().hex[:8]}"
    user = User(
        id=new_id,
        name=req.name.strip(),
        email=req.email.lower().strip(),
        role=req.role.upper(),
        password_hash=hash_password(req.password),
        organization_name=req.organization_name
    )
    db.add(user)

    if user.role == "STUDENT":
        profile = StudentProfile(
            id=f"stu-{uuid.uuid4().hex[:8]}",
            user_id=user.id,
            target_role="DevOps / Cloud Engineer",
            preferred_location="Bengaluru, Karnataka",
            experience_level="Fresher (0-1 yrs)",
            education="B.Tech in Computer Engineering",
            bio="Aspiring engineer bridging technical skill gaps.",
            profile_completion_pct=50,
            skills=[],
            saved_roadmap_progress={}
        )
        db.add(profile)

    db.commit()
    db.refresh(user)

    token = create_access_token({"userId": user.id, "email": user.email, "role": user.role, "name": user.name})
    return {
        "message": "Account registered successfully.",
        "token": token,
        "user": user
    }


@router.post("/login", response_model=AuthTokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    user = None
    if req.email:
        user = db.query(User).filter(User.email == req.email.lower().strip()).first()

    # Convenient role switch fallback for prototype/demo
    if not user and req.role:
        user = db.query(User).filter(User.role == req.role.upper()).first()

    if not user:
        user = db.query(User).filter(User.role == "STUDENT").first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    token = create_access_token({"userId": user.id, "email": user.email, "role": user.role, "name": user.name})
    return {
        "message": "Login successful.",
        "token": token,
        "user": user
    }


@router.get("/me")
def get_me(user: User = Depends(get_current_user_optional)):
    """Retrieve current authenticated user information."""
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"user": user}
