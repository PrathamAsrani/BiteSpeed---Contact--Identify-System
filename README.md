
# Bitespeed Identity Reconciliation API

A robust Node.js backend service for customer identity reconciliation across multiple purchases, built for FluxKart.com's customer experience platform.

---

## 🚀 Features

- **Identity Reconciliation**: Link customer contacts across different email addresses and phone numbers  
- **Scalable Architecture**: Modular design with clear separation of concerns  
- **Database Optimization**: Efficient PostgreSQL queries with proper indexing  
- **Input Validation**: Comprehensive request validation using Joi  
- **Error Handling**: Robust error handling and logging  
- **Security**: Helmet.js for security headers, CORS configuration  
- **Documentation**: Built-in API documentation endpoint  

---

## 📋 Requirements

- Docker  
- Docker Compose  

---

## 🐳 Docker Setup (Recommended)

### 🔧 Steps to Run

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PrathamAsrani/BiteSpeed---Contact--Identify-System.git
   cd BiteSpeed---Contact--Identify-System
   ```

2. **Build and Run with Docker**
   ```bash
   docker-compose down -v          # Optional: Clean previous volumes
   docker-compose up --build
   ```

3. **Access the API**
   - API URL: [http://localhost:3000](http://localhost:3000)
   - Health Check: [http://localhost:3000/health](http://localhost:3000/health)

4. **Access PostgreSQL**
   ```bash
   docker exec -it bitespeed_postgres psql -U bitespeed_user_pratham_asrani -d bitespeed_db
   ```

---

## 🧪 Testing via Postman

A Postman collection is included in the repository. You can import the `bitespeed.postman_collection.json` file into Postman to test different scenarios.

---

## 🔧 Configuration (for non-Docker setup)

If you want to run locally (outside Docker):

1. Install Node.js & PostgreSQL manually
2. Copy and edit environment config:
   ```bash
   cp .env.example .env
   ```
3. Create DB manually:
   ```bash
   createdb bitespeed_db
   npm install
   npm run setup-db
   npm run dev
   ```

---

## 🔄 API Endpoints

### POST `/identify`

**Request Body**:
```json
{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}
```

**Response**:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

### GET `/health`

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-07-03T00:00:00.000Z",
  "service": "Bitespeed Identity Reconciliation"
}
```

---

## 🏗️ Folder Structure

```
src/
├── config/
├── controllers/
├── services/
├── models/
├── routes/
├── middleware/
├── utils/
├── database/
└── app.js
```

---

## 🧠 Contact Linking Rules

1. **New Contact**: If no email/phone match → create new primary contact  
2. **Partial Match**: Match on one field only → create secondary contact  
3. **Multiple Primaries**: Merge to oldest primary, link others as secondary  

---

## 🧪 Sample CURL Test

```bash
curl -X POST http://localhost:3000/identify   -H "Content-Type: application/json"   -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
```

---

## 🐘 Database Schema

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  linked_id INTEGER REFERENCES contacts(id),
  link_precedence VARCHAR(10) CHECK (link_precedence IN ('primary', 'secondary')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);
```

---

## 🛡️ Security & Monitoring

- Helmet for HTTP headers  
- CORS enabled  
- Morgan logging  
- `/health` endpoint for uptime monitoring  

---

## 🚀 Deployment

### 🔄 Render.com (Free Hosting)

1. Connect your GitHub repo on [Render](https://render.com)
2. Choose:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Build Context Directory**: `.`
   - **Docker Command**: `npm start` *(or your start command)*
3. Add the following Environment Variables:

| Key           | Value                              |
|---------------|------------------------------------|
| DATABASE_URL  | `postgres://...` (Render Postgres) |
| PORT          | `10000` or default `3000`          |
| NODE_ENV      | `production`                       |
| JWT_SECRET    | `I_LOVE_BITESPEED`                 |

4. Done! Your API will be live at `https://<your-app>.onrender.com`

---

## 👨‍💻 Author

**Pratham Asrani**  
GitHub: [@PrathamAsrani](https://github.com/PrathamAsrani)

---

Built with ❤️ for Bitespeed's Identity Reconciliation Challenge
