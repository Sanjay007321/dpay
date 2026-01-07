DPay - Digital Payment Platform
A full-stack digital payment application that simulates UPI transactions with intelligent bank downtime handling. DPay demonstrates how payment systems can remain functional even when banking servers are down, providing uninterrupted service to users.

Live Demo
https://dpayapp-dusr.onrender.com/
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/8695f54f-4bb3-4ba2-85b2-12781fbe5034" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/f4ccef2a-5bf0-4f29-92c9-951032d9fd20" />
![WhatsApp Image 2026-01-07 at 1 35 29 PM](https://github.com/user-attachments/assets/d8203c90-0c29-42f8-abfb-d9a357c0ef9c)



Features
Core Features
Smart Bank Downtime Handling: Automatically manages payments when banks are unavailable

UPI Payments: Send and receive money using UPI IDs or mobile numbers

QR Code Integration: Generate, scan, and parse QR codes for payments

Multi-Service Platform: Mobile recharge, bill payments, loan information

Secure Authentication: JWT-based auth with OTP verification

Admin Dashboard: Manage users and monitor bank statuses

Bank Downtime Management
DPay intelligently handles three scenarios:

Sender's bank down: DPay advances the payment temporarily

Receiver's bank down: DPay holds the payment until the bank recovers

Both banks down: DPay advances and holds the payment

Additional Features
Real-time bank status monitoring

Transaction history with detailed records

Scratch card rewards system

Credit score simulation

ATM card information display

Referral system

Responsive mobile-first design

Technology Stack
Frontend
React.js with Hooks

Tailwind CSS for styling

Lucide React for icons

Canvas API for interactive elements

Vibration API for mobile feedback

Backend
Node.js with Express.js

MongoDB with Mongoose

JWT for authentication

QR Code generation library

API Endpoints
Authentication
POST /api/auth/register - User registration

POST /api/auth/login - User login with OTP

POST /api/auth/logout - User logout

Payments
POST /api/payments/downtime - Process payments with downtime handling

POST /api/payments/recover - Recover pending transactions

Users
GET /api/users/:id - Get user profile

PUT /api/users/:id - Update user profile

GET /api/users/search/upi/:upiId - Search by UPI ID

GET /api/users/search/mobile/:mobile - Search by mobile

Transactions
GET /api/transactions/user/:userId - Get user transactions

GET /api/transactions/pending/:userId - Get pending transactions

Admin
GET /api/admin/users - Get all users (admin only)

PUT /api/admin/banks/:bankName - Update bank status (admin only)

Bank Status
GET /api/banks/status - Get all bank statuses

GET /api/banks/status?bank={name} - Get specific bank status

Installation
Prerequisites
Node.js (v14 or higher)

MongoDB (v4 or higher)

npm or yarn

Backend Setup
Clone the repository

bash
git clone https://github.com/yourusername/dpay.git
cd dpay/backend
Install dependencies

bash
npm install
Create a .env file in the backend directory

env
MONGODB_URI=mongodb://localhost:27017/dpay
JWT_SECRET=your-secret-key-here
PORT=5000
Start the backend server

bash
npm start
Frontend Setup
Navigate to the frontend directory

bash
cd ../frontend
Install dependencies

bash
npm install
Update the API base URL in frontend.js if needed

javascript
const API_BASE_URL = "http://localhost:5000/api";
Start the frontend development server

bash
npm start
Database Schema
User Model
username: Full name of the user

email: Email address (unique)

mobile: Mobile number (unique)

panNumber: PAN card number

upiId: Generated UPI ID

upiPin: 4-digit UPI PIN

bankName: User's bank

accountNumber: Bank account number

atmCardNumber: 16-digit ATM card number

creditScore: Simulated credit score (650-850)

balance: Account balance

appBalance: DPay app balance for downtime handling

pendingTransactions: Array of pending transactions

Transaction Model
userId: Reference to user

type: 'credit' or 'debit'

amount: Transaction amount

description: Transaction description

receiverDetails: Receiver information

status: Transaction status

metadata: Additional transaction data

senderBankStatus: Status of sender's bank

receiverBankStatus: Status of receiver's bank

How It Works
Bank Downtime Handling
Before every transaction, DPay checks the status of both sender's and receiver's banks

If both banks are active: Normal transaction processing

If any bank is down: DPay intervenes with temporary solutions

When banks recover: DPay automatically recovers pending transactions

Transaction Flow
User initiates a payment

System verifies UPI PIN

System checks bank server statuses

Based on bank status, appropriate action is taken

Transaction is recorded with metadata

User receives confirmation

Testing
Test Accounts
Admin Account: Mobile 7825007490 (has admin privileges)

Demo OTP: Use 123456 for any OTP verification

Bank Status Testing
You can simulate different bank statuses:

Login as admin (mobile: 7825007490)

Navigate to Admin Panel

Change bank status to test different scenarios:

Active: Normal transactions

Slow: Simulated delays

Down: Triggers downtime handling

Development Notes
Key Design Decisions
State Management: Used React Hooks for simplicity and clarity

Error Handling: Comprehensive error handling at all levels

Security: JWT tokens, input validation, sensitive data masking

User Experience: Mobile-first design with clear feedback

Challenges Solved
Real-time bank status: Implemented polling mechanism

QR code handling: Built custom QR generation and parsing

Transaction recovery: Created robust recovery system

State synchronization: Managed complex state across components

Future Enhancements
Implement real SMS/email OTP delivery

Add biometric authentication

Integrate with actual banking APIs

Add transaction analytics dashboard

Implement WebSocket for real-time updates

Add multi-language support

Implement end-to-end testing

Contributing
Fork the repository

Create a feature branch

Make your changes

Add tests if applicable

Submit a pull request

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Inspired by real-world UPI payment systems

Thanks to all open-source libraries used in this project

Special thanks to contributors and testers

Contact
For questions or feedback, please open an issue in the GitHub repository.

Note: This is a demonstration project. It uses simulated data and does not connect to real banking systems. Do not use real financial information.
