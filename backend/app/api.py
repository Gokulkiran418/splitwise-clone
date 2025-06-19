from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from pydantic import BaseModel, validator, Field
from typing import List, Optional
import json
from app.database import get_db
from app.models import User, Group, GroupMember, Expense, ExpenseSplit, SplitType
import math
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def parse_query(query: str, current_user_name: str = None):
    messages = [
        {"role": "system", "content": "You are an assistant that parses queries to determine intents and extract entities."},
        {"role": "user", "content": f"""
        Parse this query: '{query}'
        Possible intents:
        - get_user_balance: extract user_name and group_name
        - get_user_expenses: extract user_name and num_expenses
        - get_top_payer: extract group_name
        If 'my' is in the query, replace it with the current user's name if provided.
        Current user: {current_user_name}
        Respond with a JSON object containing 'intent' and the extracted entities.
        """}
    ]
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=100,
        temperature=0
    )
    return json.loads(response.choices[0].message.content.strip())

def generate_response(intent: str, data: dict):
    messages = [
        {"role": "system", "content": "Generate natural language responses based on data."},
        {"role": "user", "content": f"Generate a response for intent '{intent}' with data: {data}"}
    ]
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=50,
        temperature=0.7
    )
    return response.choices[0].message.content.strip()

@router.post("/chat")
async def chat(query: str, current_user_id: int = None, db: Session = Depends(get_db)):
    current_user_name = None
    if current_user_id:
        current_user = db.query(User).filter(User.id == current_user_id).first()
        current_user_name = current_user.name if current_user else None

    parsed = parse_query(query, current_user_name)
    intent = parsed["intent"]

    if intent == "get_user_balance":
        user_name = parsed["user_name"]
        group_name = parsed["group_name"]
        user = db.query(User).filter(User.name == user_name).first()
        group = db.query(Group).filter(Group.name == group_name).first()
        if not user or not group:
            return {"response": "User or group not found."}
        # Replace with your actual balance calculation logic
        balance = sum(e.amount for e in db.query(Expense).filter(Expense.group_id == group.id, Expense.paid_by_id == user.id).all())  # Simplified
        data = {"balance": balance if balance >= 0 else -balance}
        response = generate_response(intent, data)
        return {"response": response}

    elif intent == "get_user_expenses":
        user_name = parsed["user_name"]
        num_expenses = int(parsed["num_expenses"])
        user = db.query(User).filter(User.name == user_name).first()
        if not user:
            return {"response": "User not found."}
        expenses = db.query(Expense).filter(Expense.paid_by_id == user.id).order_by(Expense.id.desc()).limit(num_expenses).all()
        data = [{"description": e.description, "amount": e.amount} for e in expenses]
        response = generate_response(intent, data)
        return {"response": response}

    elif intent == "get_top_payer":
        group_name = parsed["group_name"]
        group = db.query(Group).filter(Group.name == group_name).first()
        if not group:
            return {"response": "Group not found."}
        top_payer = db.query(User).join(Expense, Expense.paid_by_id == User.id)\
            .filter(Expense.group_id == group.id)\
            .group_by(User.id)\
            .order_by(func.sum(Expense.amount).desc())\
            .first()
        if top_payer:
            data = {"user_name": top_payer.name}
            response = generate_response(intent, data)
            return {"response": response}
        return {"response": "No expenses in this group."}

    return {"response": "I didn’t understand that query."}

# Pydantic Models
class UserCreate(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class GroupCreate(BaseModel):
    name: str
    user_ids: List[int]

class GroupResponse(BaseModel):
    id: int
    name: str
    users: List[UserResponse]
    total_expenses: float
    class Config:
        from_attributes = True

class SplitInput(BaseModel):
    user_id: int
    percentage: Optional[float] = None

class ExpenseCreate(BaseModel):
    description: str
    amount: float = Field(gt=0)  # Amount must be positive
    paid_by: int
    split_type: SplitType
    splits: List[SplitInput]

    @validator("splits")
    def validate_splits(cls, splits, values):
        split_type = values.get("split_type")
        if split_type == SplitType.percentage:
            if not all(s.percentage is not None and s.percentage >= 0 for s in splits):
                raise ValueError("All splits must have non-negative percentages for percentage split")
            total_percentage = sum(s.percentage for s in splits)
            if not math.isclose(total_percentage, 100.0, rel_tol=1e-5):
                raise ValueError(f"Percentages must sum to 100, got {total_percentage}")
        return splits

class ExpenseResponse(BaseModel):
    id: int
    group_id: int
    description: str
    amount: float
    paid_by: UserResponse
    split_type: SplitType
    splits: List[dict]
    class Config:
        from_attributes = True

class Balance(BaseModel):
    user_id: int
    name: str
    net_balance: float

class Settlement(BaseModel):
    from_user_id: int
    from_user_name: str
    to_user_id: int
    to_user_name: str
    amount: float

class GroupBalancesResponse(BaseModel):
    group_id: int
    name: str
    balances: List[Balance]
    settlements: List[Settlement]

class UserBalancesResponse(BaseModel):
    user_id: int
    name: str
    balances: List[dict]
    
# User Endpoints
@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Group Endpoints
@router.post("/groups", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    # Validate user_ids
    users = db.query(User).filter(User.id.in_(group.user_ids)).all()
    if len(users) != len(group.user_ids):
        raise HTTPException(status_code=400, detail="Invalid user IDs")
    
    db_group = Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add members
    for user_id in group.user_ids:
        db.add(GroupMember(group_id=db_group.id, user_id=user_id))
    db.commit()
    
    # Fetch group with members and total expenses
    db_group = db.query(Group).filter(Group.id == db_group.id).first()
    total_expenses = sum(expense.amount for expense in db_group.expenses)
    return GroupResponse(
        id=db_group.id,
        name=db_group.name,
        users=[UserResponse.from_orm(user) for user in users],
        total_expenses=total_expenses
    )

@router.get("/groups/{group_id}", response_model=GroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    users = [gm.user for gm in db_group.members]
    total_expenses = sum(expense.amount for expense in db_group.expenses)
    return GroupResponse(
        id=db_group.id,
        name=db_group.name,
        users=[UserResponse.from_orm(user) for user in users],
        total_expenses=total_expenses
    )

# Expense Endpoints
@router.post("/groups/{group_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(group_id: int, expense: ExpenseCreate, db: Session = Depends(get_db)):
    # Validate group and paid_by user
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    paid_by = db.query(User).filter(User.id == expense.paid_by).first()
    if not paid_by:
        raise HTTPException(status_code=404, detail="Payer not found")
    
    # Validate splits match group members
    group_user_ids = {gm.user_id for gm in db_group.members}
    split_user_ids = {s.user_id for s in expense.splits}
    if split_user_ids != group_user_ids:
        raise HTTPException(status_code=400, detail="Splits must include all group members")
    
    # Create expense
    db_expense = Expense(
        group_id=group_id,
        description=expense.description,
        amount=expense.amount,
        paid_by_id=expense.paid_by,
        split_type=expense.split_type
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Calculate and store splits
    if expense.split_type == SplitType.equal:
        share_amount = expense.amount / len(expense.splits)
        for split in expense.splits:
            db.add(ExpenseSplit(
                expense_id=db_expense.id,
                user_id=split.user_id,
                share_amount=share_amount
            ))
    else:  # percentage
        for split in expense.splits:
            share_amount = expense.amount * (split.percentage / 100)
            db.add(ExpenseSplit(
                expense_id=db_expense.id,
                user_id=split.user_id,
                share_amount=share_amount,
                percentage=split.percentage
            ))
    db.commit()
    
    # Fetch response data
    db_expense = db.query(Expense).filter(Expense.id == db_expense.id).first()
    splits = [
        {"user_id": s.user_id, "share_amount": s.share_amount, "percentage": s.percentage}
        for s in db_expense.splits
    ]
    return ExpenseResponse(
        id=db_expense.id,
        group_id=db_expense.group_id,
        description=db_expense.description,
        amount=db_expense.amount,
        paid_by=UserResponse.from_orm(db_expense.paid_by),
        split_type=db_expense.split_type,
        splits=splits
    )

# Balance Endpoints
@router.get("/groups/{group_id}/balances", response_model=GroupBalancesResponse)
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Calculate net balances
    balances = []
    for member in db_group.members:
        user = member.user
        total_paid = sum(
            e.amount for e in db_group.expenses if e.paid_by_id == user.id
        )
        total_owed = sum(
            s.share_amount for s in user.expense_splits
            if s.expense.group_id == group_id
        )
        net_balance = total_paid - total_owed
        balances.append(Balance(
            user_id=user.id,
            name=user.name,
            net_balance=round(net_balance, 2)
        ))
    
    # Simplify debts
    settlements = []
    balances = sorted(balances, key=lambda b: b.net_balance)
    i, j = 0, len(balances) - 1
    while i < j:
        debtor = balances[i]
        creditor = balances[j]
        if abs(debtor.net_balance) < 1e-2 or abs(creditor.net_balance) < 1e-2:
            if abs(debtor.net_balance) < 1e-2:
                i += 1
            if abs(creditor.net_balance) < 1e-2:
                j -= 1
            continue
        amount = min(-debtor.net_balance, creditor.net_balance)
        settlements.append(Settlement(
            from_user_id=debtor.user_id,
            from_user_name=debtor.name,
            to_user_id=creditor.user_id,
            to_user_name=creditor.name,
            amount=round(amount, 2)
        ))
        debtor.net_balance += amount
        creditor.net_balance -= amount
    
    return GroupBalancesResponse(
        group_id=db_group.id,
        name=db_group.name,
        balances=balances,
        settlements=settlements
    )
@router.get("/groups", response_model=List[GroupResponse])
def get_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    return [
        GroupResponse(
            id=group.id,
            name=group.name,
            users=[UserResponse.from_orm(gm.user) for gm in group.members],
            total_expenses=sum(expense.amount for expense in group.expenses)
        )
        for group in groups
    ]
@router.get("/users/{user_id}/balances", response_model=UserBalancesResponse)
def get_user_balances(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    balances = []
    for gm in user.group_members:
        group = gm.group
        total_paid = sum(
            e.amount for e in group.expenses if e.paid_by_id == user_id
        )
        total_owed = sum(
            s.share_amount for s in user.expense_splits
            if s.expense.group_id == group.id
        )
        net_balance = total_paid - total_owed
        balances.append({
            "group_id": group.id,
            "group_name": group.name,
            "net_balance": round(net_balance, 2)
        })
    
    return UserBalancesResponse(
        user_id=user.id,
        name=user.name,
        balances=balances
    )