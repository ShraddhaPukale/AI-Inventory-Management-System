from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas


# ==========================
# Create Product
# ==========================

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        product_name=product.product_name,
        quantity=product.quantity,
        price=product.price
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


# ==========================
# Get All Products
# ==========================

def get_products(db: Session):
    return db.query(models.Product).all()


# ==========================
# Create Sale
# ==========================

def create_sale(db: Session, sale: schemas.SaleCreate):

    # Find Product
    product = db.query(models.Product).filter(
        models.Product.id == sale.product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    # Check Stock
    if product.quantity < sale.quantity_sold:
        raise HTTPException(
            status_code=400,
            detail="Not enough stock available."
        )

    # Reduce Quantity
    product.quantity -= sale.quantity_sold

    # Save Sale
    db_sale = models.Sale(
        product_id=sale.product_id,
        quantity_sold=sale.quantity_sold,
        sale_date=sale.sale_date
    )

    db.add(db_sale)

    db.commit()

    db.refresh(db_sale)

    return db_sale


# ==========================
# Get All Sales
# ==========================

def get_sales(db: Session):
    return db.query(models.Sale).all()

# ==========================
# Delete Product
# ==========================

def delete_product(db: Session, product_id: int):

    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    db.delete(product)

    db.commit()

    return {
        "message": "Product deleted successfully."
    }

    # ==========================
# Update Product
# ==========================

def update_product(db: Session, product_id: int, product: schemas.ProductCreate):

    db_product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if db_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    db_product.product_name = product.product_name
    db_product.quantity = product.quantity
    db_product.price = product.price

    db.commit()
    db.refresh(db_product)

    return db_product