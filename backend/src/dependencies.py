from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from typing import Annotated
import jwt
from src.config import SUPABASE_JWT_SECRET

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience='authenticated')
        print(payload)
        return payload
    except jwt.exceptions.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.exceptions.InvalidSignatureError:
        raise HTTPException(
            status_code=403,
            detail="Invalid token signature"
        )
    except jwt.exceptions.InvalidTokenError:
        raise HTTPException(
            status_code=400,
            detail="Invalid token"
        )

CurrentUser = Annotated[dict, Depends(get_current_user)]


def check_roles(allowed_roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if "role" not in current_user['user_metadata']:
            raise HTTPException(
                status_code=401,
                detail="Role information missing in token"
            )
        if current_user["user_metadata"]["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to perform this action"
            )
        return current_user
    return role_checker

AdminOnly = Annotated[dict, Depends(check_roles(["admin"]))]
AdminOrCandidate = Annotated[dict, Depends(check_roles(["admin", "candidate"]))]

from src.core.database import get_supabase_admin_client, AsyncClient
from src.services.candidate_lifecycle_service import CandidateLifecycleService

# Service Dependencies
async def get_candidate_lifecycle_service(
    supabase_client: AsyncClient = Depends(get_supabase_admin_client)
) -> CandidateLifecycleService:
    return CandidateLifecycleService(supabase_client)
