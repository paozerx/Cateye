# PostgreSQL + SQLAlchemy ORM

ใช้ SQLAlchemy 2.x ORM, Psycopg 3 และ Alembic สำหรับ migrations

## เริ่มฐานข้อมูลสำหรับ development

ใช้ PostgreSQL ที่ติดตั้งในเครื่อง เปิด service ให้ทำงาน แล้วตั้งค่าใน `Backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/cateye
```

เปลี่ยน username, password, port และชื่อ database ให้ตรงกับที่สร้างไว้ใน PostgreSQL
ตัวอย่างใช้ database `cateye`, user `postgres`, port `5432` ไม่ต้องใช้ Docker

จากโฟลเดอร์ `Backend`:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

เพิ่ม `DATABASE_URL` ใน `.env` ตาม `.env.example` โดยคงค่าเดิมอื่น ๆ ไว้
หากยังไม่มี `.env` ให้คัดลอกจาก `.env.example`
รหัสผ่านที่มีอักขระพิเศษใน URL ต้อง percent-encode

ตรวจสอบการเชื่อมต่อจากโฟลเดอร์ `Backend`:

```powershell
.\.venv\Scripts\python.exe -m app.db.check
```

คำสั่งนี้อ่านค่าจาก `.env` และทดสอบ query โดยไม่เปลี่ยนข้อมูลในฐานข้อมูล

## สร้าง model และ query ด้วย ORM

ตัวอย่างนี้ใช้ตาราง `items` เพื่ออธิบายเท่านั้น ยังไม่ได้สร้างตารางธุรกิจให้โปรเจค
สร้าง `app/models/item.py`:

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
```

เพิ่ม `from app.models.item import Item` ใน `app/models/__init__.py`
เพื่อให้ Alembic มองเห็น model แล้วสร้าง migration:

```powershell
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "create items"
# ตรวจสอบไฟล์ migration ก่อนนำไปใช้
.\.venv\Scripts\python.exe -m alembic upgrade head
```

ตัวอย่าง service ที่ใช้ ORM:

```python
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.item import Item

def list_items(db: Session) -> list[Item]:
    return list(db.scalars(select(Item).order_by(Item.id).limit(100)))

def create_item(db: Session, name: str) -> Item:
    item = Item(name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
```

ใน FastAPI route ใช้ parameter `db: DbSession` โดย import จาก `app.db.session`
และใช้ `def` สำหรับ route ที่เรียก ORM แบบ synchronous นี้
แต่ละ request มี session ของตัวเอง ปิด session อัตโนมัติ และ rollback เมื่อเกิด exception
ฝั่ง service ต้อง `commit()` เมื่อบันทึกสำเร็จ
กำหนด Pydantic response schema พร้อม `from_attributes=True` เมื่อต้องส่ง model กลับผ่าน API

ไม่สร้างตารางอัตโนมัติเมื่อแอปเริ่มทำงาน ให้ใช้ Alembic จัดการ schema
ขณะนี้ metadata ยังว่าง จึงยังไม่มี migration เริ่มต้น
`/api/health` ตรวจเฉพาะการทำงานของ API ไม่ได้ตรวจการเชื่อมต่อฐานข้อมูล

## เอกสาร

- [SQLAlchemy sessions](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)
- [Alembic autogenerate](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)
