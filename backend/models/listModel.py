from tortoise.models import Model
from tortoise import fields

class ListModel(Model):
    """
    user自訂清單
    """
    id = fields.CharField(max_length=36, pk=True)
    f_user_uid = fields.ForeignKeyField(
        "models.UserModel", 
        related_name="lists",
        on_delete=fields.CASCADE
    )
    list_name = fields.CharField(max_length=100)
    description = fields.CharField(max_length=255, null=True)
    created_at = fields.CharField(max_length=25)

    products: fields.ReverseRelation["ProductModel"]
    permissions: fields.ReverseRelation["ListPermissionModel"]

    class Meta:
        """
        定義資料表名稱
        """
        table = "lists"

class ProductModel(Model):
    """
    產品內容
    """
    id = fields.CharField(max_length=36, pk=True)
    f_user_uid = fields.ForeignKeyField(
        "models.UserModel", 
        related_name="products",
        on_delete=fields.CASCADE
    )
    f_list_uid = fields.ForeignKeyField(
        "models.ListModel", 
        related_name="products",
        on_delete=fields.CASCADE
    )
    product_name = fields.CharField(max_length=100)
    product_barcode = fields.CharField(max_length=13, unique=True)
    product_image_url = fields.CharField(max_length=255)
    expiry_date = fields.CharField(max_length=10)
    description = fields.CharField(max_length=255, null=True)

    class Meta:
        """
        定義資料表名稱
        """
        table = "products"



class ListPermissionModel(Model):
    """
    閱覽清單的權限
    """
    id = fields.CharField(max_length=36, pk=True)
    f_owner_id = fields.ForeignKeyField(
        "models.UserModel", 
        related_name="permissions_given",
        on_delete=fields.CASCADE
    )
    f_viewer_id = fields.ForeignKeyField(
        "models.UserModel", 
        related_name="permissions_received",
        on_delete=fields.CASCADE
    )
    f_list_id = fields.ForeignKeyField(
        "models.ListModel", 
        related_name="permissions",
        on_delete=fields.CASCADE
    )
    granted_at = fields.CharField(max_length=36)

    class Meta:
        """
        定義資料表名稱
        """
        table = "list_permissions"
