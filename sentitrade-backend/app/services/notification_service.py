import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Service for sending notifications to users.
    Currently supports: Email (Mocked)
    """
    
    def __init__(self):
        pass

    async def send_email(self, recipient: str, subject: str, body: str):
        """
        Send an email (Mocked).
        In production, this would use SMTP or an API like SendGrid/SES.
        """
        # Simulate network delay
        await asyncio.sleep(0.5)
        
        log_entry = f"""
        --------------------------------------------------
        [MOCK EMAIL SENT]
        To: {recipient}
        Time: {datetime.now().isoformat()}
        Subject: {subject}
        Body: 
        {body}
        --------------------------------------------------
        """
        logger.info(log_entry)
        
        # Also write to a file for verification
        with open("mock_emails.log", "a", encoding="utf-8") as f:
            f.write(log_entry + "\n")
            
        return True

# Singleton
notification_service = NotificationService()
