from src.campaigns.services.lemlist_async import LemListService
from src.core.database import AsyncClient
from src.config import LEMLIST_API_KEY

lemlist_service = LemListService(LEMLIST_API_KEY)

class CandidateLifecycleService:
    def __init__(self, 
                 supabase_client: AsyncClient,
                 lemlist_service: LemListService = lemlist_service):
        self.supabase = supabase_client
        self.lemlist = lemlist_service

    async def delete_candidate_safely(self, candidate_id: int):

        lemlist_campaign = await self.supabase.table("candidate_lemlist_campaigns").select("lemlist_campaign_id").eq("candidate_id", int(candidate_id)).execute()
        if lemlist_campaign.data:
            await self.lemlist.pause_campaign(lemlist_campaign.data[0]['lemlist_campaign_id'])

        user_id = await self.supabase.table("candidates").select("user_id").eq("id", int(candidate_id)).execute()
        response = await self.supabase.table("candidates").delete().eq("id", int(candidate_id)).execute()

        await self.supabase.auth.admin.delete_user(user_id.data[0]['user_id'])

        return True
