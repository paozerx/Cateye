# Cateye

โปรเจคเริ่มต้น Next.js (TypeScript + App Router) และ FastAPI

```text
Cateye/
├── Frontend/
│   ├── public/
│   └── src/
│       ├── app/          # หน้าเว็บและ layout
│       ├── components/   # UI components
│       └── lib/          # utilities และ API configuration
├── Backend/
│   ├── app/
│   │   ├── api/routes/   # API endpoints
│   │   ├── core/         # settings
│   │   ├── models/       # database models
│   │   ├── schemas/      # request/response schemas
│   │   ├── services/     # business logic
│   │   └── main.py
│   └── requirements.txt
└── README.md
```

## สิ่งที่ต้องติดตั้ง

- แนะนำ Node.js 22.13 ขึ้นไป เพื่อรองรับ dependencies ของเครื่องมือตรวจสอบโค้ด (Next.js ต้องการอย่างน้อย 20.9)
- Python 3.10 ขึ้นไป และ pip
- Git

## Frontend

เปิด PowerShell ที่โฟลเดอร์โปรเจค:

```powershell
cd Frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

เปิด http://localhost:3000

ตรวจสอบโค้ด: `npm run lint`, `npm run typecheck`, `npm run build`

## Backend

เปิด PowerShell อีกหน้าต่างที่โฟลเดอร์โปรเจค:

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

หากเครื่องใช้ Python Launcher ให้แทน `python` ด้วย `py` ในคำสั่งสร้าง virtual environment

- API health: http://localhost:8000/api/health
- Swagger UI: http://localhost:8000/docs
- ค่า CORS ปรับได้ผ่าน `CORS_ORIGINS` ใน `Backend/.env` โดยใช้ JSON array
- URL ของ API ปรับได้ผ่าน `NEXT_PUBLIC_API_URL` ใน `Frontend/.env.local`

## Git

Repository อยู่ที่รากโปรเจค ครอบคลุมทั้ง Frontend และ Backend
ไฟล์ secrets, dependencies และ build artifacts ถูกยกเว้นด้วย `.gitignore`

```powershell
git status
git add .
git commit -m "chore: initialize Cateye project"
```

## เอกสารอ้างอิง

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [FastAPI first steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
