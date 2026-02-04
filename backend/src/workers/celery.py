from celery import Celery
import os

celery_app = Celery(__name__)
celery_app.conf.broker_url = os.getenv('CELERY_BROKER_URL')
celery_app.conf.result_backend = os.getenv('CELERY_RESULT_BACKEND')
celery_app.conf.broker_connection_retry_on_startup = True

celery_app.autodiscover_tasks(packages=['src.candidates.tasks', 'src.campaigns.tasks'])