from supabase import create_client, acreate_client, AsyncClient, Client

from src.config import SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_JWT_SECRET

if not all([SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_JWT_SECRET]):
    raise EnvironmentError("One or more Supabase environment variables are missing.")

# SUPABASE ADMIN CLIENT
async def create_supabase():
  supabase: AsyncClient = await acreate_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
  return supabase

async def get_supabase_admin_client():
    return await create_supabase()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
