from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.portfolio import PortfolioItem
from app.schemas.portfolio import PortfolioCreate
import uuid

async def get_user_portfolio(db: AsyncSession, user_id: uuid.UUID):
    result = await db.execute(
        select(PortfolioItem).where(PortfolioItem.user_id == user_id)
    )
    return result.scalars().all()

async def create_portfolio_item(db: AsyncSession, item: PortfolioCreate, user_id: uuid.UUID):
    db_item = PortfolioItem(
        user_id=user_id,
        ticker=item.ticker,
        quantity=item.quantity,
        buy_price=item.buy_price
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

async def delete_portfolio_item(db: AsyncSession, item_id: int, user_id: uuid.UUID):
    result = await db.execute(
        select(PortfolioItem).where(PortfolioItem.id == item_id, PortfolioItem.user_id == user_id)
    )
    item = result.scalars().first()
    if item:
        await db.delete(item)
        await db.commit()
        return True
    return False
