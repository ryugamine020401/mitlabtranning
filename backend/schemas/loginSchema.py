from pydantic import BaseModel


class UserLoginFormData(BaseModel):
    """
    userlogin form
    """
    username_or_email: str
    password_hash : str
