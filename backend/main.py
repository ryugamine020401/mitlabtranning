import os
import re
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from tortoise.contrib.fastapi import register_tortoise
from tortoise.expressions import Q

from dotenv import load_dotenv

# 自定義模組
import config
from schemas.registerSchema import UserRegisterFormData, UserProfileFormData
from schemas.loginSchema import UserLoginFormData
from schemas.listSchema import UserListCreate, UserListDelete
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
    print(token)
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

@app.post("/api/register")
async def register(data :UserRegisterFormData, req: Request):
    """
    測試資料庫可否正常存值
    """
    print(req.headers.get("origin"))

    if not UserModel.get_or_none(username=data.username):
        print(f"Username '{data.username}' is already exist")
        raise HTTPException(status_code=400, detail=f"Username '{data.username}' is already exist")

    if not UserModel.get_or_none(email=data.email):
        print(f"Email '{data.email}' is already exist")
        raise HTTPException(status_code=400, detail=f"Email '{data.email}' is already exist")


    instance = await UserModel.create(
        username = data.username,
        email = data.email,
        password_hash = data.password_hash,
        name = data.name
    )

    response = JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Instance created successfully",
            "data": {"id": instance.id, "username": instance.username},
        },
    )

    return response

@app.post("/api/login")
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

    password_hash = data.password_hash
    print(password_hash, user.password_hash)
    if not password_hash == user.password_hash:
        print("password wrong...")
        raise HTTPException(status_code=400, detail="password wrong...")

    token_data = {"sub": str(user.id)}  # 使用用戶的 email 作為 JWT 主體
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


@app.post("/api/list")
async def showlist(userid: str = Depends(decode_token)):
    """
    顯示出使用者目前的 清單分配
    """
    
    all_list = await UserListModel.filter(user = userid).values_list("list_name", flat=True)
    print(all_list)   

    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
            "list": all_list
        },
    )

    return response

@app.post("/api/addlist")
async def addlist(data: UserListCreate, userid: str = Depends(decode_token)):
    """
    增加出使用者目前的 清單種類
    """
    user_instance = await UserModel.get_or_none(id=userid)
    print(data.list_name)
    instance = await UserListModel.create(
        user = user_instance,
        list_name = data.list_name,
        description = data.description
    )

    response = JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "login successfully",
            "list": instance.id
        },
    )

    return response

@app.post("/api/deletelist")
async def deletelist(data: UserListDelete, userid: str = Depends(decode_token)):
    """
    刪除出使用者目前的 清單種類
    """
    user_instance = await UserModel.get_or_none(id=userid)
    print(data.list_name)

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


register_tortoise(
    app,
    config = config.TORTOISE_ORM,
    generate_schemas = True,  # 自動生成資料表
    add_exception_handlers = True,
)
