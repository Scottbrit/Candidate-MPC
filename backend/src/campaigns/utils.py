from src.core.openai import openai_client
from pydantic import BaseModel, Field
from typing import Optional

class DecisionMakers(BaseModel):
    primary_decision_maker_idx: Optional[int] = Field(description="The index of the primary decision maker")
    cc_decision_maker_1_idx: Optional[int] = Field(description="The index of the first CC decision maker")
    cc_decision_maker_2_idx: Optional[int] = Field(description="The index of the second CC decision maker")
    alt_decision_maker_1_idx: Optional[int] = Field(description="The index of the first alt decision maker")
    alt_decision_maker_2_idx: Optional[int] = Field(description="The index of the second alt decision maker")

def analyze_decision_makers(decision_makers: list[dict]):

    decision_makers_prompt = ""

    for idx, decision_maker in enumerate(decision_makers):

        email = decision_maker.get("email")
        seniority = decision_maker.get("seniority")
        title = decision_maker.get("title")
        headline = decision_maker.get("headline")

        decision_makers_prompt += f"Decision Maker {idx}:\nIndex: {idx}\nEmail: {email}\nSeniority: {seniority}\nTitle: {title}\nHeadline: {headline}\n\n"

    system_prompt = """
You are a highly skilled cold email assistant with strong reasoning abilities. Your task is to rank the provided decision maker information based on their level of seniority. You must order them from the highest seniority to the lowest. For example, if you are given:

Decision Maker #0:
Index: 0
Email: arnold@companyx.com
Seniority: c_suite
Title: Chief People and Culture Officer
Headline: ...

Decision Maker #1:
Index: 1
Email: jack@companyx.com
Seniority: c_suite
Title: Chief Growth Officer
Headline: ...

Decision Maker #2:
Index: 2
Email: melissa@companyx.com
Seniority: founder
Title: Instagram co-founder, now CPO
Headline: ...

Decision Maker #3:
Index: 3
Email: kevin@companyx.com
Seniority: founder
Title: President and co-founder
Headline: ...

Decision Maker #4:
Index: 4
Email: ashly@companyx.com
Seniority: c_suite
Title: CFO
Headline: ...

The correct ranking should be:
	1.	Decision Maker #4 - Ashly (C-Suite - CFO)
	2.	Decision Maker #1 - Jack (C-Suite - Chief Growth Officer)
	3.	Decision Maker #0 - Arnold (C-Suite - Chief People and Culture Officer)
	4.	Decision Maker #2 - Melissa (C-Suite - CPO)
	5.	Decision Maker #3 - Kevin (Founder - President and Co-founder)

Here, we evaluate based on their current titles.

You are doing this within the context of sending a cold email. The person you place first in the ranking will be added to the email's "To" field, while the following two decision makers will be placed in "CC." Therefore, this is a critical task and must be performed with very high accuracy.

This cold email will be sent by a recruiting firm to the company, along with a potential candidate's blind resume. Including the correct decision makers in the email with the right strategy is therefore essential.

Important addition regarding the headline field:
- If the headline is missing → this person must be treated as a last resort and placed at the very end of the ranking, regardless of their listed seniority or title.
"""

    response = openai_client.responses.parse(
        model="gpt-5-mini",
        input=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": decision_makers_prompt
            }
        ],
        text_format=DecisionMakers,
    )

    return response.output_parsed
