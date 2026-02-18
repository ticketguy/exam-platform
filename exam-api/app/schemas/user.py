from pydantic import BaseModel, EmailStr


# --- Auth ---

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    nickname: str
    email: str
    password: str


class AuthResponse(BaseModel):
    id: str
    name: str
    email: str
    nickname: str
    role: str
    token: str


# --- Profile ---

class ProfileResponse(BaseModel):
    id: str
    name: str
    nickname: str
    email: str
    role: str
    avatar: str | None = None
    bio: str | None = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: str | None = None
    nickname: str | None = None
    bio: str | None = None
    avatar: str | None = None
