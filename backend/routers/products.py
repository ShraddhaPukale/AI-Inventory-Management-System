from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db
from auth import get_current_user, require_admin

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ==========================
# Create Product (Admin Only)
# ==========================

@router.post("/")
def create_product(
    product: schemas.ProductCreate,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    return crud.create_product(db, product)


# ==========================
# Get All Products (Protected)
# ==========================

@router.get("/")
def read_products(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_products(db)


# ==========================
# Delete Product (Admin Only)
# ==========================

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    return crud.delete_product(db, product_id)


# ==========================
# Update Product (Admin Only)
# ==========================

@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    return crud.update_product(db, product_id, product)


# ==========================
# Create Sale (Protected)
# ==========================

@router.post("/sales")
def create_sale(
    sale: schemas.SaleCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_sale(db, sale)


# ==========================
# Get All Sales (Protected)
# ==========================

@router.get("/sales")
def read_sales(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_sales(db)


# ==========================
# AI Inventory Prediction
# ==========================

@router.get("/prediction")
def inventory_prediction(
    db: Session = Depends(get_db)
):

    products = crud.get_products(db)

    low_stock = []
    out_of_stock = []

    for product in products:

        if product.quantity == 0:
            out_of_stock.append(product.product_name)

        elif product.quantity <= 5:
            low_stock.append(product.product_name)

    return {
        "total_products": len(products),
        "low_stock_count": len(low_stock),
        "out_of_stock_count": len(out_of_stock),
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock,
        "message": "AI Inventory Prediction Generated Successfully"
    }