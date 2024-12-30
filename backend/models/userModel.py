from tortoise.models import Model
from tortoise import fields

class UserModel(Model):
    """
    用戶表
    """
    id = fields.CharField(max_length=36, pk=True)
    user_uid = fields.CharField(max_length=36, unique=True)
    username = fields.CharField(max_length=30, unique=True)
    email = fields.CharField(max_length=320, unique=True)
    password_hash = fields.CharField(max_length=255)
    name = fields.CharField(max_length=50, default="user")
    created_at = fields.CharField(max_length=25)
    updated_at = fields.CharField(max_length=36)


    profiles: fields.ReverseRelation["UserProfileModel"]

    class Meta:
        """
        定義 table name
        """
        table = "users"



class UserProfileModel(Model):
    """
    擴充的 User 資料表
    """
    id = fields.CharField(max_length=36, pk=True)
    user = fields.ForeignKeyField(
        "models.UserModel",
        related_name="profiles",
        on_delete=fields.CASCADE
    ) 
    phone_number = fields.CharField(max_length=15, null=True)
    date_of_birth = fields.CharField(max_length=10, null=True)
    address = fields.CharField(max_length=255, null=True)
    profile_picture_url = fields.CharField(max_length=255, null=True)
    bio = fields.CharField(max_length=500, null=True)

    class Meta:
        """
        定義資料表名稱
        """
        table = "user_profiles"
