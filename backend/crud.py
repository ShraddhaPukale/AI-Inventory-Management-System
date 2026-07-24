from sqlalchemy.orm import Session
from fastapi import HTTPException
from passlib.context import CryptContext
from datetime import datetime
import models
import schemas
from auth import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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

    product = db.query(models.Product).filter(
        models.Product.id == sale.product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    if product.quantity < sale.quantity_sold:
        raise HTTPException(
            status_code=400,
            detail="Not enough stock available."
        )

    product.quantity -= sale.quantity_sold

    db_sale = models.Sale(
        product_id=sale.product_id,
        quantity_sold=sale.quantity_sold,
        sale_date=datetime.now()
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


# ==========================
# Register User
# ==========================

def create_user(db: Session, user: schemas.UserCreate):

    # Check Email
    existing_email = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # Check Username
    existing_username = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken."
        )

    # Hash Password
    hashed_password = pwd_context.hash(user.password)

    db_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(db_user)

    try:
        db.commit()
        db.refresh(db_user)

        return {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Database error."
        )

# ==========================
# Login User
# ==========================

def login_user(
    db: Session,
    email: str,
    password: str
):

    # Find user by email
    db_user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password."
        )

    # Verify password
    if not pwd_context.verify(password, db_user.password):
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password."
        )

    # Create JWT Token
    access_token = create_access_token(
        data={"sub": db_user.email,"role": db_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }