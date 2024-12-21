# UniPay - College Fee Payment System

UniPay is a modern, web-based college fee payment system that allows students to manage and pay their academic fees online. The platform provides a secure, efficient, and user-friendly interface for handling various types of college payments.

![Screenshot 2024-11-26 152150](https://github.com/user-attachments/assets/07b59c76-d794-4a01-a179-5d97bde68b04)

![Screenshot 2024-11-26 152651](https://github.com/user-attachments/assets/b36b38b1-6862-4685-8ba6-297994513135)

![Screenshot 2024-11-26 152851](https://github.com/user-attachments/assets/7b4f3969-be6e-42f7-a7b8-346dfc4777b2)

![Screenshot 2024-11-23 131043](https://github.com/user-attachments/assets/f51857a6-2326-405a-8c4f-aba8cb8bd18f)

## Features

- **Multiple Fee Types Support**
  - Semester Fees
  - Transportation Fees
  - Hostel Fees
  - Exam Fees

- **Diverse Payment Methods**
  - Credit/Debit Card
  - UPI
  - Net Banking

- **Real-time Balance Tracking**
  - View current account balance
  - Track pending transactions
  - Monitor payment history

- **Payment Status Management**
  - View paid/unpaid fees
  - Transaction IDs for reference
  - Payment timestamps

- **Secure Payment Processing**
  - Encrypted payment information
  - Secure authentication
  - Transaction verification

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Axios for API integration

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/unipay.git
cd unipay
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables
Create `.env` files in both frontend and backend directories with necessary configurations.

Backend `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/unipay
JWT_SECRET=your_jwt_secret_key
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

For MongoDB Atlas users, your MONGODB_URI will look like this:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/unipay
```

> Note: Replace `<username>`, `<password>`, and the cluster details with your MongoDB Atlas credentials.

5. Start the Development Servers

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

## API Endpoints

- `GET /api/v1/account/balance` - Get current balance
- `GET /api/v1/account/pending-transactions` - Get pending transactions
- `GET /api/v1/account/payment-status` - Get payment status
- `POST /api/v1/account/pay-fees` - Process fee payment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors who have helped with the project

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/unipay
