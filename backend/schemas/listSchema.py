from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Product Schema
class ProductBase(BaseModel):
    product_name: str = Field(..., max_length=100)
    product_barcode: str = Field(..., max_length=50)
    product_image_url: str
    expiry_date: datetime
    description: Optional[str] = None

class ProductCreate(ProductBase):
    list_id: int  # Relates to UserList

class ProductOut(ProductBase):
    id: int
    user_id: int
    list_id: int

    class Config:
        orm_mode = True


# UserList Schema
class UserListBase(BaseModel):
    list_name: str = Field(..., max_length=100)
    description: Optional[str] = None

class UserListCreate(UserListBase):
    pass

class UserListDelete(UserListBase):
    pass

class UserListOut(UserListBase):
    id: int
    user_id: int
    created_at: datetime
    products: List[ProductOut] = []  # Embedded product details

    class Config:
        orm_mode = True


# ListPermission Schema
class ListPermissionBase(BaseModel):
    viewer_id: int  # User receiving the permission
    list_id: int  # Shared UserList

class ListPermissionCreate(ListPermissionBase):
    pass

class ListPermissionOut(ListPermissionBase):
    id: int
    owner_id: int
    granted_at: datetime

    class Config:
        orm_mode = True
