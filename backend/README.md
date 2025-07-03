# Bitespeed Identity Reconciliation API

A robust Node.js backend service for customer identity reconciliation across multiple purchases, built for FluxKart.com's customer experience platform.

## 🚀 Features

- **Identity Reconciliation**: Link customer contacts across different email addresses and phone numbers
- **Scalable Architecture**: Modular design with clear separation of concerns
- **Database Optimization**: Efficient PostgreSQL queries with proper indexing
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Robust error handling and logging
- **Security**: Helmet.js for security headers, CORS configuration
- **Documentation**: Built-in API documentation endpoint

## 📋 Requirements

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bitespeed-identity-reconciliation
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Create your PostgreSQL database first
   createdb bitespeed_db
   
   # Run the setup script
   npm run setup-db
   \`\`\`

5. **Start the server**
   \`\`\`bash
   # Development
   npm run dev
   
   # Production
   npm start
   \`\`\`

## 🔧 Configuration

### Environment Variables

\`\`\`env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bitespeed_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bitespeed_db
DB_USER=username
DB_PASSWORD=password

# Server Configuration
PORT=3000
NODE_ENV=development
\`\`\`

## 📡 API Endpoints

### POST /identify

Identifies and reconciles customer contact information.

**Request Body:**
\`\`\`json
{
  "email": "string (optional)",
  "phoneNumber": "string|number (optional)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@email.com", "secondary@email.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
\`\`\`

### GET /health

Health check endpoint.

**Response:**
\`\`\`json
{
  "status": "OK",
  "timestamp": "2023-04-01T00:00:00.000Z",
  "service": "Bitespeed Identity Reconciliation"
}
\`\`\`

## 🏗️ Architecture

\`\`\`
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Data models
├── routes/          # Route definitions
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── database/        # Database setup and migrations
└── app.js          # Application entry point
\`\`\`

## 🔄 Business Logic

### Contact Linking Rules

1. **New Contact**: If no existing contact matches email or phone, create a new primary contact
2. **Partial Match**: If email or phone matches but contains new information, create a secondary contact
3. **Primary Linking**: When two primary contacts share common information, the older one remains primary

### Example Scenarios

**Scenario 1: New Customer**
\`\`\`json
Request: {"email": "new@customer.com", "phoneNumber": "1234567890"}
Result: Creates new primary contact
\`\`\`

**Scenario 2: Existing Customer with New Info**
\`\`\`json
Request: {"email": "existing@customer.com", "phoneNumber": "9876543210"}
Result: Creates secondary contact linked to existing primary
\`\`\`

**Scenario 3: Linking Separate Customers**
\`\`\`json
Request: {"email": "customer1@email.com", "phoneNumber": "customer2-phone"}
Result: Links two separate primary contacts, older becomes primary
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Test the API manually
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
\`\`\`

## 🚀 Deployment

### Using Render.com (Free Hosting)

1. **Prepare for deployment**
   - Ensure all environment variables are set
   - Database should be accessible from the internet

2. **Deploy to Render**
   - Connect your GitHub repository
   - Set environment variables in Render dashboard
   - Deploy the service

3. **Database Setup**
   - Use Render's PostgreSQL service or external provider
   - Run database setup after deployment

### Environment Variables for Production

\`\`\`env
NODE_ENV=production
DATABASE_URL=your-production-database-url
PORT=10000
\`\`\`

## 📊 Database Schema

\`\`\`sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    linked_id INTEGER REFERENCES contacts(id),
    link_precedence VARCHAR(10) CHECK (link_precedence IN ('primary', 'secondary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
\`\`\`

## 🔍 Monitoring and Logging

- Request/Response logging with Morgan
- Error tracking and handling
- Database connection monitoring
- Health check endpoint for uptime monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Pratham Asrani**
- GitHub: [@prathamasrani](https://github.com/prathamasrani)

## 🔗 Live API

**Endpoint**: `https://your-app-name.onrender.com/identify`

Test the live API:
\`\`\`bash
curl -X POST https://your-app-name.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
\`\`\`

---

Built with ❤️ for Bitespeed's Identity Reconciliation Challenge
