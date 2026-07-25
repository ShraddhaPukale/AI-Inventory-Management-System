from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "inventory-secret-key-123456789")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

print("SECRET_KEY =", SECRET_KEY)
print("ALGORITHM =", ALGORITHM)



# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ==========================
# Create JWT Token
# ==========================

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ==========================
# Verify JWT Token
# ==========================

def verify_token(token: str):

    print("Received Token:", token)

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("Payload:", payload)

        email = payload.get("sub")
        role = payload.get("role")

        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token."
            )

        return {
            "email": email,
            "role": role
        }

    except JWTError as e:
        print("JWT Error:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid token."
        )


# ==========================
# Get Current User
# ==========================

def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    return verify_token(token)


# ==========================
# Require Admin
# ==========================

def require_admin(
    current_user=Depends(get_current_user)
):

    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    return current_user