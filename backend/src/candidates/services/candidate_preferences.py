from pydantic import BaseModel, Field
from typing import Union
from enum import Enum
from openai import OpenAI

from ..schemas import Resume, CallTranscript, FileExtension
from ..utils import read_fathom_pdf_file, read_ashby_pdf_file

class FundingStageEnum(str, Enum):
    PRE_SEED = "pre_seed"
    SEED = "seed"
    SERIES_A = "series_a"
    SERIES_B = "series_b"
    SERIES_C = "series_c"
    SERIES_D = "series_d"
    SERIES_E = "series_e"
    SERIES_F = "series_f"
    SERIES_G = "series_g"
    SERIES_H = "series_h"
    SERIES_I = "series_i"
    SERIES_J = "series_j"
    SERIES_K = "series_k"
    SERIES_L = "series_l"
    PRIVATE_EQUITY = "private_equity"
    UNDISCLOSED = "undisclosed"
    SERIES_UNKNOWN = "series_unknown"

class CategoryEnum(str, Enum):
    MANUFACTURING = "manufacturing"
    CONSULTING = "consulting"
    SOFTWARE = "software"
    INFORMATION_TECHNOLOGY = "information technology"
    HEALTH_CARE = "health care"
    FINANCIAL_SERVICES = "financial services"
    E_COMMERCE = "e-commerce"
    REAL_ESTATE = "real estate"
    ADVERTISING = "advertising"
    INDUSTRIAL = "industrial"
    MEDICAL = "medical"
    RETAIL = "retail"
    CONSTRUCTION = "construction"
    MARKETING = "marketing"
    EDUCATION = "education"
    WHOLESALE = "wholesale"
    FINANCE = "finance"
    TRAINING = "training"
    INTERNET = "internet"
    FOOD_AND_BEVERAGE = "food and beverage"
    NON_PROFIT = "non profit"
    WEB_DESIGN = "web design"
    PROFESSIONAL_SERVICES = "professional services"
    WEB_DEVELOPMENT = "web development"
    COMMERCIAL = "commercial"
    ELECTRONICS = "electronics"
    AUTOMOTIVE = "automotive"
    DIGITAL_MARKETING = "digital marketing"
    ADVICE = "advice"
    TRANSPORTATION = "transportation"
    INSURANCE = "insurance"
    PROPERTY_MANAGEMENT = "property management"
    PRODUCT_DESIGN = "product design"
    RESIDENTIAL = "residential"
    WELLNESS = "wellness"
    SERVICE_INDUSTRY = "service industry"
    SALES = "sales"
    LOGISTICS = "logistics"
    ACCOUNTING = "accounting"
    BUSINESS_DEVELOPMENT = "business development"
    EVENTS = "events"
    CONSUMER_GOODS = "consumer goods"
    FASHION = "fashion"
    CUSTOMER_SERVICE = "customer service"
    GRAPHIC_DESIGN = "graphic design"
    MACHINERY_MANUFACTURING = "machinery manufacturing"
    MOBILE_APPS = "mobile apps"
    RECRUITING = "recruiting"
    INFORMATION_SERVICES = "information services"
    MEDIA_AND_ENTERTAINMENT = "media and entertainment"
    LEGAL = "legal"
    BUILDING_MATERIAL = "building material"
    APPS = "apps"
    TELECOMMUNICATIONS = "telecommunications"
    SEO = "seo"
    PROJECT_MANAGEMENT = "project management"
    MANAGEMENT_CONSULTING = "management consulting"
    ARTIFICIAL_INTELLIGENCE = "artificial intelligence (ai)"
    HUMAN_RESOURCES = "human resources"
    ENERGY = "energy"
    PRINTING = "printing"
    HOSPITAL = "hospital"
    MECHANICAL_ENGINEERING = "mechanical engineering"
    ANALYTICS = "analytics"
    COMMUNITIES = "communities"
    INDUSTRIAL_ENGINEERING = "industrial engineering"
    BIOTECHNOLOGY = "biotechnology"
    RENTAL = "rental"
    PUBLISHING = "publishing"
    ARCHITECTURE = "architecture"
    STAFFING_AGENCY = "staffing agency"
    SECURITY = "security"
    MEDICAL_DEVICE = "medical device"
    CIVIL_ENGINEERING = "civil engineering"
    SPORTS = "sports"
    SAAS = "saas"
    BANKING = "banking"
    HARDWARE = "hardware"
    INDUSTRIAL_MANUFACTURING = "industrial manufacturing"
    COMPUTER = "computer"
    SOCIAL_MEDIA = "social media"
    PHARMACEUTICAL = "pharmaceutical"
    DENTAL = "dental"
    BRAND_MARKETING = "brand marketing"
    FOOD_PROCESSING = "food processing"
    SUPPLY_CHAIN_MANAGEMENT = "supply chain management"
    TRAVEL = "travel"
    INTERIOR_DESIGN = "interior design"
    NEWS = "news"
    FINTECH = "fintech"
    THERAPEUTICS = "therapeutics"
    MOBILE = "mobile"
    CYBER_SECURITY = "cyber security"
    REAL_ESTATE_INVESTMENT = "real estate investment"
    CHEMICAL = "chemical"
    VENTURE_CAPITAL = "venture capital"
    MUSIC = "music"
    VIDEO = "video"
    PROPERTY_DEVELOPMENT = "property development"
    ASSET_MANAGEMENT = "asset management"
    HEALTH_DIAGNOSTICS = "health diagnostics"
    AGRICULTURE = "agriculture"
    COMMERCIAL_REAL_ESTATE = "commercial real estate"
    OIL_AND_GAS = "oil and gas"
    FITNESS = "fitness"
    TECHNICAL_SUPPORT = "technical support"
    FURNITURE = "furniture"
    WEALTH_MANAGEMENT = "wealth management"
    PERSONAL_HEALTH = "personal health"
    ASSOCIATION = "association"
    PACKAGING_SERVICES = "packaging services"
    CLOUD_COMPUTING = "cloud computing"
    EVENT_MANAGEMENT = "event management"
    RENEWABLE_ENERGY = "renewable energy"
    E_LEARNING = "e-learning"
    WEB_HOSTING = "web hosting"
    DIGITAL_MEDIA = "digital media"
    INDUSTRIAL_AUTOMATION = "industrial automation"
    WAREHOUSING = "warehousing"
    RISK_MANAGEMENT = "risk management"
    ONLINE_PORTALS = "online portals"
    PUBLIC_RELATIONS = "public relations"
    HOSPITALITY = "hospitality"
    CONSUMER_ELECTRONICS = "consumer electronics"
    MACHINE_LEARNING = "machine learning"
    B2B = "b2b"
    ENVIRONMENTAL_CONSULTING = "environmental consulting"
    ENTERPRISE_SOFTWARE = "enterprise software"
    BEAUTY = "beauty"
    SOCIAL_MEDIA_MARKETING = "social media marketing"
    OUTSOURCING = "outsourcing"
    TEXTILES = "textiles"
    GOVERNMENT = "government"
    FREIGHT_SERVICE = "freight service"
    INTERNET_OF_THINGS = "internet of things"
    PLASTICS_AND_RUBBER_MANUFACTURING = "plastics and rubber manufacturing"
    LENDING = "lending"
    TOURISM = "tourism"
    COSMETICS = "cosmetics"
    CRM = "crm"
    FACILITIES_SUPPORT_SERVICES = "facilities support services"
    LIGHTING = "lighting"
    PAYMENTS = "payments"
    GAMING = "gaming"
    HOME_DECOR = "home decor"
    NETWORK_SECURITY = "network security"
    CONTENT = "content"
    RENTAL_PROPERTY = "rental property"
    WINE_AND_SPIRITS = "wine and spirits"
    BLOCKCHAIN = "blockchain"
    HIGHER_EDUCATION = "higher education"
    LEASING = "leasing"
    BUSINESS_INTELLIGENCE = "business intelligence"
    MARKET_RESEARCH = "market research"
    LIFE_INSURANCE = "life insurance"
    SHOPPING = "shopping"
    LIFESTYLE = "lifestyle"
    AEROSPACE = "aerospace"
    SHIPPING = "shipping"
    RETIREMENT = "retirement"
    AUTO_INSURANCE = "auto insurance"
    IT_MANAGEMENT = "it management"
    BROADCASTING = "broadcasting"
    TEST_AND_MEASUREMENT = "test and measurement"
    EMPLOYMENT = "employment"
    SMALL_AND_MEDIUM_BUSINESSES = "small and medium businesses"
    BIG_DATA = "big data"
    ELECTRICAL_DISTRIBUTION = "electrical distribution"
    HOME_IMPROVEMENT = "home improvement"
    RESTAURANTS = "restaurants"
    SOCIAL = "social"
    SOLAR = "solar"
    WASTE_MANAGEMENT = "waste management"
    MARKETPLACE = "marketplace"
    IT_INFRASTRUCTURE = "it infrastructure"
    CHARITY = "charity"
    APPAREL = "apparel"
    SOFTWARE_ENGINEERING = "software engineering"
    ENVIRONMENTAL_ENGINEERING = "environmental engineering"
    LAW_ENFORCEMENT = "law enforcement"
    ROBOTICS = "robotics"
    REHABILITATION = "rehabilitation"
    BUILDING_MAINTENANCE = "building maintenance"
    SUSTAINABILITY = "sustainability"
    HEALTH_INSURANCE = "health insurance"
    PHOTOGRAPHY = "photography"
    ART = "art"
    HEATING = "heating"
    VENTILATION = "ventilation"
    AND_AIR_CONDITIONING = "and air conditioning (hvac)"
    NURSING_AND_RESIDENTIAL_CARE = "nursing and residential care"
    UX_DESIGN = "ux design"
    FARMING = "farming"
    WEB_APPS = "web apps"
    CREATIVE_AGENCY = "creative agency"
    COMMERCIAL_INSURANCE = "commercial insurance"
    WATER = "water"
    RECYCLING = "recycling"
    ENTERPRISE_RESOURCE_PLANNING = "enterprise resource planning (erp)"
    INFRASTRUCTURE = "infrastructure"
    CLOUD_DATA_SERVICES = "cloud data services"
    SPORTING_GOODS = "sporting goods"
    PUBLIC_SAFETY = "public safety"
    LEISURE = "leisure"
    DATABASE = "database"
    HOME_SERVICES = "home services"
    WIRELESS = "wireless"
    LANDSCAPING = "landscaping"
    JEWELRY = "jewelry"
    FILM_PRODUCTION = "film production"
    DELIVERY = "delivery"
    MINING = "mining"
    IOS = "ios"
    EMAIL_MARKETING = "email marketing"
    CRYPTOCURRENCY = "cryptocurrency"
    HOME_HEALTH_CARE = "home health care"
    HOME_RENOVATION = "home renovation"
    CONSUMER = "consumer"
    TRAVEL_AGENCY = "travel agency"
    AUDIO = "audio"
    RECREATION = "recreation"
    MENTAL_HEALTH = "mental health"
    FIELD_SUPPORT = "field support"
    EDTECH = "edtech"
    ELDER_CARE = "elder care"
    WOMENS = "women's"
    IMPACT_INVESTING = "impact investing"
    NUTRITION = "nutrition"
    CONTENT_MARKETING = "content marketing"
    COMPLIANCE = "compliance"
    CREDIT = "credit"
    CHILDREN = "children"
    PET = "pet"
    DIGITAL_SIGNAGE = "digital signage"
    CHILD_CARE = "child care"
    LIFE_SCIENCE = "life science"
    TECHNOLOGY_3D = "3d technology"
    PROPERTY_INSURANCE = "property insurance"
    EMPLOYEE_BENEFITS = "employee benefits"
    VIDEO_GAMES = "video games"
    ANIMATION = "animation"
    VIRTUAL_REALITY = "virtual reality"
    CONTENT_CREATORS = "content creators"
    FOOD_DELIVERY = "food delivery"
    TRADING_PLATFORM = "trading platform"
    JANITORIAL_SERVICE = "janitorial service"
    WOOD_PROCESSING = "wood processing"
    FACILITY_MANAGEMENT = "facility management"
    DOCUMENT_MANAGEMENT = "document management"
    COSMETIC_SURGERY = "cosmetic surgery"
    REAL_ESTATE_BROKERAGE = "real estate brokerage"
    GIFT = "gift"
    WINERY = "winery"
    E_COMMERCE_PLATFORMS = "e-commerce platforms"
    INFORMATION_AND_COMMUNICATIONS_TECHNOLOGY = "information and communications technology (ict)"
    PRECIOUS_METALS = "precious metals"
    PERFORMING_ARTS = "performing arts"
    AIR_TRANSPORTATION = "air transportation"
    SEMICONDUCTOR = "semiconductor"
    LEAD_GENERATION = "lead generation"
    SNACK_FOOD = "snack food"
    HOTEL = "hotel"
    INDUSTRIAL_DESIGN = "industrial design"
    HOME_AND_GARDEN = "home and garden"
    CORPORATE_TRAINING = "corporate training"
    BOOKKEEPING_AND_PAYROLL = "bookkeeping and payroll"
    PRODUCT_RESEARCH = "product research"
    FLEET_MANAGEMENT = "fleet management"
    VOIP = "voip"
    SOCIAL_MEDIA_MANAGEMENT = "social media management"
    MARINE_TRANSPORTATION = "marine transportation"
    PRINTING_3D = "3d printing"
    MORTGAGE = "mortgage"
    CATERING = "catering"
    ENERGY_MANAGEMENT = "energy management"
    DELIVERY_SERVICE = "delivery service"
    DIGITAL_ENTERTAINMENT = "digital entertainment"
    LOCAL_BUSINESS = "local business"
    EYEWEAR = "eyewear"
    COMMUNICATIONS_INFRASTRUCTURE = "communications infrastructure"
    FILM = "film"
    QUALITY_ASSURANCE = "quality assurance"
    DATA_MANAGEMENT = "data management"
    SHOES = "shoes"
    EMAIL = "email"
    SEARCH_ENGINE = "search engine"
    SOCIAL_NETWORK = "social network"
    MECHANICAL_DESIGN = "mechanical design"
    DATA_INTEGRATION = "data integration"
    CLINICAL_TRIALS = "clinical trials"
    OUTDOORS = "outdoors"
    WEDDING = "wedding"
    CLOUD_MANAGEMENT = "cloud management"
    ASSISTED_LIVING = "assisted living"
    DATA_CENTER = "data center"
    UNIVERSITIES = "universities"
    WATER_PURIFICATION = "water purification"
    VETERINARY = "veterinary"
    ANDROID = "android"
    PERSONAL_DEVELOPMENT = "personal development"
    CLEANTECH = "cleantech"
    NETWORK_HARDWARE = "network hardware"
    ORGANIC_FOOD = "organic food"
    ELECTRIC_VEHICLE = "electric vehicle"
    MARKETING_AUTOMATION = "marketing automation"
    BILLING = "billing"
    COFFEE = "coffee"
    ANGEL_INVESTMENT = "angel investment"
    ENERGY_EFFICIENCY = "energy efficiency"
    FUNDING_PLATFORM = "funding platform"
    GOLF = "golf"
    TRAVEL_ACCOMMODATIONS = "travel accommodations"
    BAKERY = "bakery"
    MOBILE_PAYMENTS = "mobile payments"
    MESSAGING = "messaging"
    PRODUCTIVITY_TOOLS = "productivity tools"
    SECONDARY_EDUCATION = "secondary education"
    TV = "tv"
    DEVELOPER_TOOLS = "developer tools"
    AGTECH = "agtech"
    MARINE_TECHNOLOGY = "marine technology"
    BUSINESS_INFORMATION_SYSTEMS = "business information systems"
    CAD = "cad"
    TICKETING = "ticketing"
    GROCERY = "grocery"
    PERSONAL_FINANCE = "personal finance"
    DATA_VISUALIZATION = "data visualization"
    ONLINE_GAMES = "online games"
    LANGUAGE_LEARNING = "language learning"
    PRIMARY_EDUCATION = "primary education"
    AUGMENTED_REALITY = "augmented reality"
    TOYS = "toys"
    RETAIL_TECHNOLOGY = "retail technology"
    BOOKS = "books"
    PAPER_MANUFACTURING = "paper manufacturing"
    BIOPHARMA = "biopharma"
    CHEMICAL_ENGINEERING = "chemical engineering"
    RAILROAD = "railroad"
    CLOUD_INFRASTRUCTURE = "cloud infrastructure"
    PSYCHOLOGY = "psychology"
    POINT_OF_SALE = "point of sale"
    NATURAL_RESOURCES = "natural resources"
    INNOVATION_MANAGEMENT = "innovation management"
    DEVELOPER_PLATFORM = "developer platform"
    TOUR_OPERATOR = "tour operator"
    TAX_PREPARATION = "tax preparation"
    PROFESSIONAL_NETWORKING = "professional networking"
    SENSOR = "sensor"
    TV_PRODUCTION = "tv production"
    CAREER_PLANNING = "career planning"
    FOUNDRIES = "foundries"
    TRANSLATION_SERVICE = "translation service"
    DIETARY_SUPPLEMENTS = "dietary supplements"
    OUTPATIENT_CARE = "outpatient care"
    ADVERTISING_PLATFORMS = "advertising platforms"
    RELIGION = "religion"
    ANIMAL_FEED = "animal feed"
    INSURTECH = "insurtech"
    PRODUCT_MANAGEMENT = "product management"
    OFFICE_ADMINISTRATION = "office administration"
    VIDEO_STREAMING = "video streaming"
    PROCUREMENT = "procurement"
    CANNABIS = "cannabis"
    THEATRE = "theatre"
    CLOUD_SECURITY = "cloud security"
    EVENT_PROMOTION = "event promotion"
    OUTDOOR_ADVERTISING = "outdoor advertising"
    FUEL = "fuel"
    FRUIT = "fruit"
    CROWDFUNDING = "crowdfunding"
    DEVOPS = "devops"
    CREDIT_CARDS = "credit cards"
    SMART_HOME = "smart home"
    BOATING = "boating"
    WEB3 = "web3"
    ORGANIC = "organic"
    EBOOKS = "ebooks"
    DRONES = "drones"
    COLLABORATION = "collaboration"
    PREDICTIVE_ANALYTICS = "predictive analytics"
    ADVENTURE_TRAVEL = "adventure travel"
    LEGAL_TECH = "legal tech"
    FAMILY = "family"
    B2C = "b2c"
    TAX_CONSULTING = "tax consulting"
    PRIMARY_AND_URGENT_CARE = "primary and urgent care"
    SOCIAL_NEWS = "social news"
    REAL_TIME = "real time"
    LASER = "laser"
    AUTONOMOUS_VEHICLES = "autonomous vehicles"
    SOCIAL_IMPACT = "social impact"
    CRAFT_BEER = "craft beer"
    CALL_CENTER = "call center"
    INTERNET_RADIO = "internet radio"
    PUBLIC_TRANSPORTATION = "public transportation"
    COWORKING = "coworking"
    DEVELOPER_APIS = "developer apis"
    FINANCIAL_EXCHANGES = "financial exchanges"
    PERSONAL_BRANDING = "personal branding"
    MAPPING_SERVICES = "mapping services"
    VIDEO_EDITING = "video editing"
    LOCATION_BASED_SERVICES = "location based services"
    VACATION_RENTAL = "vacation rental"
    CLEAN_ENERGY = "clean energy"
    WEARABLES = "wearables"
    MUSICAL_INSTRUMENTS = "musical instruments"
    SKILL_ASSESSMENT = "skill assessment"
    TRANSACTION_PROCESSING = "transaction processing"
    DEBT_COLLECTIONS = "debt collections"
    HANDMADE = "handmade"
    SALES_AUTOMATION = "sales automation"
    DOMAIN_REGISTRAR = "domain registrar"
    MANAGEMENT_INFORMATION_SYSTEMS = "management information systems"
    GEOSPATIAL = "geospatial"
    INTELLECTUAL_PROPERTY = "intellectual property"
    SEAFOOD = "seafood"
    PODCAST = "podcast"
    DATA_STORAGE = "data storage"
    MHEALTH = "mhealth"
    LAUNDRY_AND_DRY_CLEANING = "laundry and dry-cleaning"
    PHYSICAL_SECURITY = "physical security"
    MILITARY = "military"
    ENTERPRISE = "enterprise"
    CONFECTIONERY = "confectionery"
    COMMERCIAL_LENDING = "commercial lending"
    TUTORING = "tutoring"
    SUBSCRIPTION_SERVICE = "subscription service"
    COMPUTER_VISION = "computer vision"
    MINERAL = "mineral"
    PC_GAMES = "pc games"
    RESORTS = "resorts"
    BITCOIN = "bitcoin"
    JOURNALISM = "journalism"
    SOCIAL_MEDIA_ADVERTISING = "social media advertising"
    GPS = "gps"
    COPYWRITING = "copywriting"
    DOCUMENT_PREPARATION = "document preparation"
    GENERATIVE_AI = "generative ai"
    OPEN_SOURCE = 'open source'
    GENETICS = "genetics"
    ENTERPRISE_APPLICATIONS = "enterprise applications"
    GIFT_CARD = "gift card"
    FRAUD_DETECTION = "fraud detection"
    GAMIFICATION = "gamification"
    LEAD_MANAGEMENT = "lead management"
    CHATBOT = "chatbot"
    IAAS = "iaas"
    BASKETBALL = "basketball"
    A_B_TESTING = "a/b testing"


class CompanyPreferences(BaseModel):
    funding_stage: list[FundingStageEnum] = Field(..., description="List of acceptable funding stages for the candidate")
    locations: list[str] = Field(..., description="List of preferred locations/regions (e.g., 'san francisco', 'new york', 'washington', 'texas')")
    categories: list[CategoryEnum] = Field(..., description="List of high-level sector keywords (e.g., 'fintech', 'artificial intelligence', 'health care')")

system_prompt = """
You are an expert transcript analyzer focused on extracting candidate company preferences from call transcripts and resumes. 
Your task is to carefully analyze the provided documents and extract specific information about what types of companies the candidate is interested in.
Your goal is to create a structured profile of the candidate's company preferences to assist with matching them to appropriate opportunities.

## [IMPORTANT] Guidelines for extracting information:

For funding stage preferences:
- Extract all acceptable funding stages the candidate would consider
- If the candidate mentions specific stages (e.g., "Series A and Series C"), include only those stages
- If the candidate mentions a range (e.g., "Series B to Series D"), include all stages in that range (Series B, Series C, Series D)
- If the candidate mentions a minimum (e.g., "Series B or later"), include all stages from that point onwards (Series B, Series C, Series D, etc.)
- If the candidate mentions a maximum (e.g., "up to Series C"), include all stages up to that point (Series A, Series B, Series C)
- If no funding stage preference is mentioned, return an empty list

For location preferences:
- Extract locations as individual city or region names (e.g., "San Francisco", "New York", "London")
- Use standardized location names without qualifiers or descriptions
- For remote work, simply use "Remote" as a location
- Break down broad regions into specific locations when possible (e.g., "US" should become specific cities if mentioned)
- If no location preferences are mentioned, return an empty list

For category/sector preferences:
- Extract high-level industry keywords as single terms (e.g., "Fintech", "AI", "Healthcare", "SaaS", "B2B")
- Focus on the primary business domain rather than specific technologies
- Use standardized industry terms without qualifiers or descriptions
- If the candidate mentions both industries they like and dislike, only include the preferred ones
- If no specific industry preferences are mentioned, return an empty list

## [IMPORTANT] Examples to understand the pattern:

Funding Stage Examples:

Scenario 1: Candidate says "I'm interested in Series A and Series C companies"
- funding_stage: ["series_a", "series_c"]

Scenario 2: Candidate says "I'm looking for Series B or later companies"
- funding_stage: ["series_b", "series_c", "series_d", "series_e", "series_f", "series_g", "series_h", "series_i", "series_j", "series_k", "series_l"]

Scenario 3: Candidate says "I prefer early-stage, up to Series A"
- funding_stage: ["series_a", "series_b", "series_c"]

Scenario 4: Candidate says "I want companies between Series A and Series D"
- funding_stage: ["series_a", "series_b", "series_c", "series_d"]

Scenario 5: Candidate says "I'm only interested in Series C companies"
- funding_stage: ["series_c"]

Scenario 6: Candidate says "I don't have a preference for company stage"
- funding_stage: []

locations (correct format):
- ["san francisco", "new york", "remote"]
- ["london", "berlin", "washington"]
- ["chicago", "boston", "austin"]

Locations (INCORRECT format - do not use):
- ["Anywhere in the US"]
- ["Preferably on the West Coast"]
- ["Companies located in major tech hubs"]

categories (correct format):
- ["fintech", "artificial intelligence", "saas", "e-learning"]
- ["health care", "biotech", "fashion"]
- ["consumer_goods", "e-commerce", "food", "b2b"]
- ["crm", "software", "health"]

Categories (INCORRECT format - do not use):
- ["Companies focusing on healthcare solutions"]
- ["Preferably in the financial sector"]
- ["Any innovative tech company"]

## [IMPORTANT] Make sure to extract only the preferences explicitly mentioned by the candidate.
## [IMPORTANT] If the candidate doesn't specify a preference in a certain category, leave it empty rather than making assumptions.
## [IMPORTANT] Always use precise, individual terms for locations and categories that can be directly used programmatically.
## [IMPORTANT] If there is any conflicting information between additional_info and the data extracted from the resume or call transcript, always prioritize and use the values from additional_info.
"""

class CandidatePreferencesService:
    def __init__(self, openai_client: OpenAI, openai_model: str):
        self.openai_client = openai_client
        self.openai_model = openai_model

    def extract_candidate_preferences(self, resume: Resume, call_transcript: CallTranscript, additional_info: str):
        if resume.extension == FileExtension.PDF:
            resume_content = read_ashby_pdf_file(resume.file_bytes)

        if call_transcript.extension == FileExtension.PDF:
            call_transcript_content = read_fathom_pdf_file(call_transcript.file_bytes)
        elif call_transcript.extension == FileExtension.STR:
            call_transcript_content = call_transcript.content

        prompt = f"Call Transcript:\n{call_transcript_content}\n\nResume:\n{resume_content}\n\nAdditional Info: {additional_info}"

        response = self.openai_client.responses.parse(
            model=self.openai_model,
            input=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            text_format=CompanyPreferences
        )

        company_preferences: CompanyPreferences = response.output_parsed

        return company_preferences.model_dump()
