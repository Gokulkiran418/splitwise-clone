from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Enum for split type
class SplitType(str, enum.Enum):
    equal = "equal"
    percentage = "percentage"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    group_members = relationship("GroupMember", back_populates="user")
    expenses_paid = relationship("Expense", back_populates="paid_by")
    expense_splits = relationship("ExpenseSplit", back_populates="user")

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    members = relationship("GroupMember", back_populates="group")
    expenses = relationship("Expense", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"
    group_id = Column(Integer, ForeignKey("groups.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_members")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    paid_by_id = Column(Integer, ForeignKey("users.id"))
    split_type = Column(Enum(SplitType), nullable=False)
    group = relationship("Group", back_populates="expenses")
    paid_by = relationship("User", back_populates="expenses_paid")
    splits = relationship("ExpenseSplit", back_populates="expense")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"
    expense_id = Column(Integer, ForeignKey("expenses.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    share_amount = Column(Float, nullable=False)
    percentage = Column(Float, nullable=True)  # Only for percentage splits
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="expense_splits")