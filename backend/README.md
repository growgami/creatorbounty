# Creator Bounty Payment Backend

Flask API for processing payments on the Plasma testnet.

## Features

- Native XPL and ERC-20 token transfers
- Secure transaction signing
- Real-time balance checking
- Production-ready with security headers
- RESTful API for frontend integration

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your private key

# Run
python src/main.py          # Development
python wsgi.py              # Production
```

## API Endpoints

### Payment Endpoints
- `GET /api/payment/health` - Service health check
- `GET /api/payment/balance` - Get account balance
- `POST /api/payment/send-native` - Send XPL tokens
- `POST /api/payment/send-token` - Send ERC-20 tokens
- `GET /api/payment/transaction-status/<hash>` - Check transaction status

### User Endpoints
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/<id>` - Get user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

## Configuration

Required environment variables in `.env`:

```env
SECRET_KEY=your-secret-key
PRIVATE_KEY=your-private-key-without-0x
PLASMA_RPC_URL=https://testnet-rpc.plasma.to
```

## Security

- Environment variable configuration
- Security headers (CSP, HSTS)
- Input validation and sanitization
- CORS protection
- Secure error handling

## Architecture

```
backend/
├── src/
│   ├── main.py           # Flask application
│   ├── models/user.py    # Database models
│   ├── routes/
│   │   ├── payment.py    # Payment endpoints
│   │   └── user.py       # User management
│   └── static/index.html # Demo interface
├── wsgi.py              # Production server
├── requirements.txt     # Dependencies
└── env.example         # Environment template
```
