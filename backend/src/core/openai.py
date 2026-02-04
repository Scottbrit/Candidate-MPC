import openai
from src.config import OPENAI_API_KEY

if not all([OPENAI_API_KEY]):
    raise EnvironmentError("OPENAI_API_KEY environment variable is missing")

openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
