from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.name is not None:
        current_user.name = body.name

    if body.nickname is not None:
        # Check uniqueness
        existing = (
            db.query(User)
            .filter(User.nickname == body.nickname, User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Nickname already taken",
            )
        current_user.nickname = body.nickname

    if body.bio is not None:
        current_user.bio = body.bio

    if body.avatar is not None:
        current_user.avatar = body.avatar

    db.commit()
    db.refresh(current_user)
    return current_user
