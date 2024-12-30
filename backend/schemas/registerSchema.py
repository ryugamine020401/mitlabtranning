from pydantic import BaseModel


class UserRegisterFormData(BaseModel):
    """
    userregister form
    """
    username : str
    email : str
    password_hash : str
    name : str

class UserProfileFormData(BaseModel):
    """
    用戶詳細資料表
    """
    phone_number : str
    date_of_birth : str
    address : str
    profile_picture_url : str
    bio : str
