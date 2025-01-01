import os
import re
from datetime import datetime, timezone, timedelta
from typing import Optional
import random


async def generate_unique_uid():
    while True:
        user_uid = str(random.randint(100000, 999999))
        exists = await UserModel.filter(user_uid=user_uid).exists()
        if not exists:
            return user_uid  # 找到唯一的 UID

        
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from tortoise.contrib.fastapi import register_tortoise
from tortoise.expressions import Q
from tortoise.exceptions import IntegrityError

from dotenv import load_dotenv

# 自定義模組
import config
from schemas.registerSchema import UserRegisterFormData, UserProfileFormData
from schemas.loginSchema import UserLoginFormData
from schemas.listSchema import UserListCreate, UserListDelete
from schemas.productSchema import ProductFormData, getProductFormData, deleteProductFormData
from models.userModel import UserModel, UserProfileModel
from models.listModel import ProductModel, UserListModel, ListPermissionModel

# 加載 .env 檔案
load_dotenv()

# 獲取環境變數
FRONTEND_URL = os.getenv('FRONTEND_URL')


# JWT 配置
SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('JWT_ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    創建 JWT Token
    """
    to_encode = data.copy()
    print(to_encode)
    expire = datetime.now(timezone(timedelta(hours=8))) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    print(expire, datetime.now(timezone(timedelta(hours=8))))
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str = Depends(oauth2_scheme)):
    """
    驗證 JWT Token
    """
    # print(token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userid: str = payload.get("sub")
        if userid is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return userid
    except JWTError as e:
        print(e)
        raise HTTPException(status_code=401, detail=f'Invalid token, {e}')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # 允許的前端來源
    allow_credentials=True,
    allow_methods=["*"],  # 允許所有 HTTP 方法（如 GET、POST 等）
    allow_headers=["*"],  # 允許所有 HTTP 標頭
)

@app.get("/")
async def read_root():
    """
    根目錄test
    """
    return {"Hello": "World"}

@app.post("/api/create_user")
async def register(data :UserRegisterFormData):
    """
    測試資料庫可否正常存值
    """
    try:
        print("1")
        last_user = await UserModel.all().order_by('-id').first()
        table_id = 1
        if last_user is not None:
            table_id = int(last_user.id) + 1

        current_timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds')

        instance = await UserModel.create(
            id = str(table_id),
            user_uid = await generate_unique_uid(),
            username = data.username,
            email = data.email,
            password = data.password,
            name = data.name,
            created_at = current_timestamp,
            updated_at = current_timestamp
        )


        user_profile_instance = await UserProfileModel.create(
            id = str(table_id),
            f_user_uid = instance,
        )

        response = JSONResponse(
            status_code=201,
            content={
                "success": True,
                "message": "Instance created successfully",
                "data": {"id": instance.id, "username": user_profile_instance.id},
            },
        )

        return response
    except IntegrityError as e:
        if "username" in str(e):
            print(f"Username '{data.username}' is already exist", e)
            detail = f"Username '{data.username}' is already exist"
            raise HTTPException(status_code=400, detail=detail)  from e
        elif "email" in str(e):
            print(f"Email '{data.email}' is already exist", e)
            detail = f"Email '{data.email}' is already exist"
            raise HTTPException(status_code=400, detail=detail)  from e
        else:
            print(e)
            raise HTTPException(status_code=400, detail="Database error") from e

@app.post("/api/login_user")
async def login(data :UserLoginFormData):
    """
    測試資料庫可否正常存值
    """
    print(data.username_or_email)
    user = await UserModel.get_or_none(
        Q(username=data.username_or_email) | Q(email=data.username_or_email)
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    password = data.password
    if not password == user.password:
        print("password wrong...")
        raise HTTPException(status_code=400, detail="password wrong...")

    token_data = {"sub": str(user.user_uid)}  # 使用用戶的 email 作為 JWT 主體
    access_token = create_access_token(
        data=token_data, 
        expires_delta=timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
        )

    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
            "access_token" : access_token
        },
    )

    return response

@app.post("/api/create_list")
async def create_product(data: UserListCreate, userid: str = Depends(decode_token)):
    """
    創建產品的內容
    """
    user_instance = await UserModel.get_or_none(user_uid=userid)

    if not user_instance:
        print("user not exist")
        raise HTTPException(status_code=404, detail="user not found")

    last_list = await UserListModel.all().order_by('-id').first()

    table_id = 1
    if last_list:
        table_id = int(last_list.id) + 1
    current_timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds')
    instance = await UserListModel.create(
        id = str(table_id),
        f_user_uid = user_instance,
        list_name = data.list_name,
        description = data.description,
        created_at = current_timestamp,
    )



    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "create list successfully",
            "id": instance.id
        },
    )

    return response

@app.post("/api/get_lists")
async def showlist(userid: str = Depends(decode_token)):
    """
    顯示出使用者目前的 清單分配
    """

    user_instance = await UserModel.get_or_none(user_uid = userid)
    all_list = await UserListModel.\
        filter(f_user_uid = user_instance).values_list("list_name", flat=True)


    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
            "list": all_list
        },
    )

    return response

@app.post("/api/delete_list")
async def deletelist(data: UserListDelete, userid: str = Depends(decode_token)):
    """
    刪除出使用者目前的 清單種類
    """
    user_instance = await UserModel.get_or_none(id=userid)
    # print(data.list_name)

    list_instance = await UserListModel.get_or_none(user=user_instance, list_name=data.list_name)
    if not list_instance:
        raise HTTPException(status_code=404, detail="List not found")

    # 刪除清單
    await list_instance.delete()

    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
        },
    )

    return response

@app.post("/api/create_product")
async def addlist(data: ProductFormData, userid: str = Depends(decode_token)):
    """
    增加出使用者目前的 清單種類
    """
    user_instance = await UserModel.get_or_none(user_uid=userid)
    list_instance = await UserListModel.get_or_none(
        f_user_uid=user_instance, 
        list_name=data.list_name
    )
    last_product = await ProductModel.all().order_by('-id').first()

    table_id = 1
    if last_product:
        table_id = int(last_product.id) + 1
    try:
        instance = await ProductModel.create(
            id = str(table_id),
            f_user_uid = user_instance,
            f_list_uid = list_instance,
            product_name = data.product_name,
            product_barcode = data.product_barcode,
            expiry_date = data.expiry_date,
            description = data.description,
            product_image_url = f'http://domainaname/image/product/{str(table_id)}'
        )
    except Exception as err:
        print(f"Error creating product instance: {err}")

    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "create successfully",
            "list": 2
        },
    )

    return response



@app.post("/api/get_product")
async def get_product(data: getProductFormData, userid: str = Depends(decode_token)):
    """
    顯示出使用者目前的 清單分配
    """
    user_instance = await UserModel.get_or_none(user_uid = userid)
    list_instance = await UserListModel.get_or_none(
        f_user_uid=user_instance,
        list_name=data.list_name
    )
    all_products = await ProductModel\
        .filter(f_user_uid = user_instance, f_list_uid = list_instance)\
        .order_by("expiry_date")\
        .values_list("id", "product_name", "expiry_date", "product_image_url")

    print(all_products)

    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
            "product": all_products
        },
    )

    return response


@app.post("/api/delete_product")
async def delete_product(data: deleteProductFormData, userid: str = Depends(decode_token)):
    """
    顯示出使用者目前的 清單分配
    """
    
    products_instance = await ProductModel.get_or_none(id=data.id)

    if not products_instance:
        raise HTTPException(status_code=404, detail="not found")

    await products_instance.delete()


    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
            "product": f'{userid} product {data.id} delete successful.'
        },
    )

    return response


register_tortoise(
    app,
    config = config.TORTOISE_ORM,
    generate_schemas = True,  # 自動生成資料表
    add_exception_handlers = True,
)
