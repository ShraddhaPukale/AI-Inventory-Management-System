from pydantic import BaseModel
from datetime import date


class ProductBase(BaseModel):
    product_name: str
    quantity: int
    price: float


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


class SaleBase(BaseModel):
    product_id: int
    quantity_sold: int
    sale_date: date


class SaleCreate(SaleBase):
    pass


class Sale(SaleBase):
    sale_id: int

    class Config:
        from_attributes = True