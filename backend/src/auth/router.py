from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from src.core.database import get_supabase_admin_client
from src.dependencies import get_current_user

router = APIRouter(tags=["auth"])

class UserLoginRequest(BaseModel):
    email: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/auth/login")
async def login(user_data: UserLoginRequest):
    try:

        if user_data.email == "scott@conscioustalent.com" and user_data.password == "cst9osb@30":
            return {
                "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6IldSZDA4N3c1L3RKanp1WE8iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2x4cnJrZW9yb3pvYWJ6a2J1ZXBjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1YTZmODZhZS1mMWFjLTRlNWMtOGFmNC02ZjMwMjUwMzc0NDUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgxNTYzMzk3LCJpYXQiOjE3NDk5OTM4ODQsImVtYWlsIjoic2NvdHRAY29uc2Npb3VzdGFsZW50LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvbGUiOiJhZG1pbiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im90cCIsInRpbWVzdGFtcCI6MTc1MDAyNzMyNX1dLCJzZXNzaW9uX2lkIjoiYTYzMTc3NDYtYjhmNS00ZmNhLTg0NzYtOWI4ZDZlM2ZmZjM0IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.P5IpEUOZibVzsZ3VhwkBEkQZeVEROv6gop1zA42twFU",
                "refresh_token": "4Fmqux9bOJxPeFU41SGvTg"
            }
        else:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        # buradaki durum şu, login yapıdlığında, supabase admin client'inin üstüne overwrite ediliyor. bunun önüne geçildi. eğer candidate'lerin de login yapması gerektiğinde custom jwt encoder oluşturacağız aynı jwt secret ile.
        # response = supabase.auth.sign_in_with_password({
        #     "email": user_data.email,
        #     "password": user_data.password
        # })
        
        # return {
        #     "access_token": response.session.access_token,
        #     "refresh_token": response.session.refresh_token
        # }
        # ÇÖZÜM BU İŞLEMDEN HEMEN SONRA TEKRAR SECRET_KEY İLE ADMIN CLIENT'I OLUŞTURMAK OLABİLİR
        # ÇÖZÜM AUTH'I BROWSER (CLIENT) SIDE'DE HALLET
    except Exception as e:
        raise HTTPException(status_code=400, detail="Incorrect email or password")


@router.post("/auth/refresh")
async def refresh(refresh_token: RefreshTokenRequest):
    raise HTTPException(status_code=400, detail=f"Error refreshing token: {e}")
    # try:
    #     response = supabase.auth.refresh_session(refresh_token.refresh_token)
    #     return {
    #         "access_token": response.session.access_token,
    #         "refresh_token": response.session.refresh_token
    #     } # admin_supabase gereksinimiyle aynı şekilde, refresh token expired olması sorunu da aynı durumdan kaynaklanıyor olabilir. supabase client'i çok el değiştiriyor bu şekilde.
    # except Exception as e:
    #     raise HTTPException(status_code=400, detail=f"Error refreshing token: {e}")
    # # ÇÖZÜM BU İŞLEMDEN HEMEN SONRA TEKRAR SECRET_KEY İLE ADMIN CLIENT'I OLUŞTURMAK OLABİLİR
    

@router.post("/protected_route")
async def protected_route(payload: dict = Depends(get_current_user)):
    return payload