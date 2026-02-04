from fastapi import APIRouter, HTTPException
from fathom_python import Fathom, models
from src.config import FATHOM_API_KEY

router = APIRouter(tags=["Fathom"])

async def get_meeting_transcript_by_email(
    email_to_search: str
):
    async with Fathom(
        security=models.Security(
            api_key_auth=FATHOM_API_KEY,
        ),
    ) as fathom:

        res = await fathom.list_meetings_async()
        found_meeting = None
            
        while res is not None:
            meetings = res.result.items
            for meeting in meetings:
                for invitee in meeting.calendar_invitees:
                    if invitee.email == email_to_search:
                        found_meeting = meeting
                        break
                if found_meeting is not None:
                    break
            if found_meeting is not None:
                break
            res = res.next()

        if found_meeting is None:
            return None
        
        transcript = await fathom.get_recording_transcript_async(recording_id=found_meeting.recording_id, destination_url="")

        transcript_text = ""

        for item in transcript.transcript:
            transcript_text += f"{item.speaker.display_name}: {item.text}"

        return transcript_text, found_meeting.recording_id, found_meeting.title


@router.get("/fathom/transcript")
async def get_transcript(
    email: str
):
    transcript_text, recording_id, call_transcript_title = await get_meeting_transcript_by_email(email)

    return {
        "transcript": transcript_text,
        "call_transcript_title": call_transcript_title,
        "call_transcript_id": recording_id
    }
