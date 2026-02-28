from pydantic import BaseModel, EmailStr


class ContactInfo(BaseModel):
    contact_email: EmailStr
    phone_number: str
    address: str
    open_hours: str
