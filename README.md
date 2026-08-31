# DueAI

Frozen architecture for the personal fintech project described in the project source document.

## Architecture rule
Do not rename, move, or restructure the folders/files in this repository during development. Add files only when explicitly required by the frozen architecture. Financial truth stays in the backend/database; AI only interprets conversation and proposes structured intent.

## Stack
- Client: React + Vite + JavaScript + Tailwind CSS + React Router + Zustand + Axios + Framer Motion + Recharts + Lucide + React Hook Form
- Server: Node.js + Express
- Database: MongoDB + Mongoose
- Payments: Razorpay Orders/Checkout/Webhooks
- AI: LLM API with deterministic fallback
- Jobs: Redis/BullMQ architecture; current worker has a safe interval fallback
- Notifications: Resend email
- Auth: JWT in HTTP-only cookie + bcrypt
- Validation: Zod
- Security: Helmet + express-rate-limit
- Realtime: Socket.IO

## Run
1. Install Node.js 20+ and MongoDB.
2. `cd server && npm install && copy .env.example .env` (Windows) or `cp .env.example .env`.
3. Fill `MONGODB_URI` and `JWT_SECRET`.
4. `npm run dev`.
5. In another terminal: `cd client && npm install && copy .env.example .env`.
6. `npm run dev`.
7. Register two users. Create an obligation from user A using user B's email. Login as B and accept it.
8. Without Razorpay credentials, the app uses a development-only mock-success endpoint so the complete obligation loop can be tested locally. For actual test payments, add Razorpay test keys and load Razorpay Checkout in the frontend.

## Important production changes before deployment
- Use Redis + BullMQ Queue/Worker instead of interval scheduling.
- Configure Razorpay webhook endpoint and secret.
- Add stronger audit/idempotency handling and transactional balance updates.
- Add CSP, CSRF strategy appropriate to cookie auth, structured logging, observability and automated tests.
- Never enable the mock payment route in production.
