from pydantic import BaseModel, Field
from typing import Optional

# 用戶註冊表單數據
class UserRegisterFormData(BaseModel):
    """
    用戶註冊表單
    """
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)
    name: Optional[str] = Field(default="user", max_length=50)



# 用戶詳細資料表單數據
class UserProfileFormData(BaseModel):
    """
    用戶詳細資料表單
    """
    phone_number: Optional[str] = Field(None, max_length=15)
    date_of_birth: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = Field(None, max_length=255)
    profile_picture_url: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=500)

