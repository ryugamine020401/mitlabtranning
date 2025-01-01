from pydantic import BaseModel, Field
from typing import Optional

# 用戶註冊表單數據
class ProductFormData(BaseModel):
    """
    用戶註冊表單
    """
    list_name: str = Field(..., max_length=100)
    product_name: str = Field(..., max_length=100)
    product_barcode: str = Field(..., max_length=13)
    expiry_date: str = Field(..., max_length=10)
    description: Optional[str] = Field(None, max_length=255)

class getProductFormData(BaseModel):
    """
    用戶獲取產品
    """
    list_name: str = Field(..., max_length=100)

class deleteProductFormData(BaseModel):
    """
    用戶刪除產品
    """
    id: str = Field(..., max_length=100)
