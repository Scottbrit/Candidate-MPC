from fathom_python import Fathom, models

class FathomService:
    def __init__(self, fathom_api_key: str):
        self.fathom_api_key = fathom_api_key

    def get_meeting_transcript_by_email(self, email_to_search: str):
        with Fathom(
            security=models.Security(
                api_key_auth=self.fathom_api_key,
            ),
        ) as fathom:
            res = fathom.list_meetings()
            all_meetings = []
            
            while res is not None:
                all_meetings.extend(res.result.items)
                res = res.next()
            
            print(f"Total meetings: {len(all_meetings)}")

            found_meetings = []
            
            for meeting in all_meetings:
                for invitee in meeting.calendar_invitees:
                    if invitee.email == email_to_search:
                        found_meetings.append(meeting)
                        # print('---- FOUND ----')
                        # print(meeting.title)
                        # print(invitee.email)
                        # print(meeting.recording_start_time)
                        # transcript = fathom.get_recording_transcript(recording_id=meeting.recording_id, destination_url="")
                        # print(transcript)
            found_meetings.sort(key=lambda x: x.scheduled_start_time, reverse=True)
            print(found_meetings[0].recording_id)
            return fathom.get_recording_transcript(recording_id=found_meetings[0].recording_id, destination_url="")

    async def get_transcript_by_recording_id(self, recording_id: int):
        with Fathom(
            security=models.Security(
                api_key_auth=self.fathom_api_key,
            ),
        ) as fathom:
            transcript = await fathom.get_recording_transcript_async(recording_id=recording_id, destination_url="")
            transcript_text = ""
            for item in transcript.transcript:
                transcript_text += f"{item.speaker.display_name}: {item.text}"

            return transcript_text, "Test"
