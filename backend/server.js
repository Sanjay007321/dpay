const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dpay')
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate unique IDs
const generateUPIId = (username, mobile) => {
  const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
  const last4Mobile = mobile.slice(-4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanUsername}${last4Mobile}${randomNum}@dpay`;
};

const generateReferralCode = (username, mobile) => {
  const cleanUsername = username.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `DP${cleanUsername}${randomNum}`;
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Bank Server Status
const BANK_SERVER_STATUS = {};

// Initialize bank status
const initializeBankStatus = () => {
  const banks = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank (PNB)",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Bank of India",
    "IndusInd Bank",
    "IDFC First Bank",
    "Yes Bank",
    "Federal Bank",
    "Indian Bank",
    "Central Bank of India",
    "Indian Overseas Bank",
    "UCO Bank",
    "Bandhan Bank",
    "IDBI Bank"
  ];
  
  banks.forEach(bank => {
    BANK_SERVER_STATUS[bank] = {
      status: Math.random() > 0.3 ? 'active' : Math.random() > 0.5 ? 'slow' : 'down',
      lastChecked: new Date(),
      responseTime: Math.random() > 0.3 ? `${Math.floor(Math.random() * 150) + 50}ms` : 'Timeout'
    };
  });
};

initializeBankStatus();

// Check bank server status
const checkBankServerStatus = (bankName) => {
  return BANK_SERVER_STATUS[bankName] || { status: 'unknown', lastChecked: new Date(), responseTime: 'N/A' };
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  panNumber: { type: String, required: true, uppercase: true },
  dob: { type: Date },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  atmCardNumber: { type: String, required: true },
  upiPin: { type: String, required: true },
  upiId: { type: String, unique: true },
  referralCode: { type: String, unique: true },
  photo: { type: String },
  creditScore: { type: Number, default: 650, min: 300, max: 900 },
  balance: { type: Number, default: 1000.00 },
  appBalance: { type: Number, default: 0 },
  registrationDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  pendingTransactions: [{
    transactionId: String,
    amount: Number,
    description: String,
    receiverDetails: Object,
    senderBank: String,
    receiverBank: String,
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    metadata: Object
  }]
});

userSchema.pre('save', function(next) {
  if (!this.upiId) {
    this.upiId = generateUPIId(this.username, this.mobile);
  }
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.username, this.mobile);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receiverDetails: { type: Object },
  senderBank: { type: String },
  receiverBank: { type: String },
  senderBankStatus: { type: String },
  receiverBankStatus: { type: String },
  category: { type: String, enum: ['payment', 'mobile_recharge', 'bill_payment', 'reward', 'other'], default: 'payment' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// OTP Store (in production, use Redis or database)
const otpStore = new Map();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

// Routes

// Bank Status API
app.get('/api/banks/status', (req, res) => {
  const bankName = req.query.bank;
  
  if (bankName) {
    const status = checkBankServerStatus(bankName);
    res.json({ success: true, bankName, status });
  } else {
    res.json({ success: true, status: BANK_SERVER_STATUS });
  }
});

app.put('/api/banks/status', verifyToken, (req, res) => {
  try {
    const { bankName, status } = req.body;
    
    if (!bankName || !status) {
      return res.status(400).json({ success: false, message: 'Bank name and status are required.' });
    }
    
    // Check if user is admin (mobile number 7825007490)
    const userId = req.user.userId;
    User.findById(userId)
      .then(user => {
        if (!user || user.mobile !== '7825007490') {
          return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
        }
        
        if (BANK_SERVER_STATUS[bankName]) {
          BANK_SERVER_STATUS[bankName] = {
            status,
            lastChecked: new Date(),
            responseTime: status === 'active' ? '50ms' : status === 'slow' ? '300ms' : 'Timeout'
          };
          
          res.json({ 
            success: true, 
            message: `Bank status updated to ${status}`,
            bankName,
            status: BANK_SERVER_STATUS[bankName]
          });
        } else {
          res.status(404).json({ success: false, message: 'Bank not found.' });
        }
      })
      .catch(error => {
        console.error('Error finding user:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
      });
  } catch (error) {
    console.error('Update bank status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Auth Routes
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Check if user exists
    let user;
    if (mobile) {
      user = await User.findOne({ mobile, isActive: true });
    } else if (email) {
      user = await User.findOne({ email, isActive: true });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP (in production, send via SMS/Email)
    const identifier = mobile || email;
    otpStore.set(identifier, { otp, expiresAt: Date.now() + 300000 }); // 5 minutes
    
    // For demo, return OTP
    res.json({
      success: true,
      message: `OTP sent to ${mobile ? 'mobile' : 'email'}. For demo: ${otp}`,
      otp: otp // Remove in production
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    const identifier = mobile || email;
    
    // Verify OTP
    const storedOTP = otpStore.get(identifier);
    if (!storedOTP || storedOTP.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    
    // Check if OTP expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }
    
    // Find user
    let user;
    if (mobile) {
      user = await User.findOne({ mobile, isActive: true });
    } else if (email) {
      user = await User.findOne({ email, isActive: true });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // Clear OTP
    otpStore.delete(identifier);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        panNumber: user.panNumber,
        upiId: user.upiId,
        referralCode: user.referralCode,
        creditScore: user.creditScore,
        balance: user.balance,
        appBalance: user.appBalance,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        atmCardNumber: user.atmCardNumber,
        upiPin: user.upiPin,
        photo: user.photo,
        dob: user.dob,
        registrationDate: user.registrationDate
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, mobile, panNumber, dob, bankName, accountNumber, atmCardNumber, upiPin, referralCode, photo } = req.body;
    
    // Validate required fields
    if (!username || !email || !mobile || !panNumber || !bankName || !accountNumber || !atmCardNumber || !upiPin) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled: Name, Email, Mobile, PAN, Bank, Account Number, ATM Card, UPI PIN' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    
    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid PAN format. Must be ABCDE1234F' });
    }
    
    // Check if email or mobile already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered.' });
      }
    }
    
    // Generate credit score
    const creditScore = Math.floor(Math.random() * 200) + 650;
    
    // Create new user
    const newUser = new User({
      username,
      email,
      mobile,
      panNumber: panNumber.toUpperCase(),
      dob,
      bankName,
      accountNumber,
      atmCardNumber,
      upiPin,
      referralCode,
      photo,
      creditScore,
      balance: 1000.00,
      appBalance: 0
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, mobile: newUser.mobile },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        mobile: newUser.mobile,
        panNumber: newUser.panNumber,
        upiId: newUser.upiId,
        referralCode: newUser.referralCode,
        creditScore: newUser.creditScore,
        balance: newUser.balance,
        appBalance: newUser.appBalance,
        bankName: newUser.bankName,
        registrationDate: newUser.registrationDate
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// User Routes
app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates._id;
    delete updates.mobile;
    delete updates.email;
    delete updates.panNumber;
    delete updates.balance;
    delete updates.appBalance;
    delete updates.registrationDate;
    delete updates.upiId;
    delete updates.referralCode;
    delete updates.creditScore;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Delete user and all associated data
    await User.findByIdAndDelete(userId);
    await Transaction.deleteMany({ userId });
    
    res.json({ success: true, message: 'Account and all data deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Search Users
app.get('/api/users/search', verifyToken, async (req, res) => {
  try {
    const query = req.query.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }
    
    // Search by UPI ID, mobile, or email
    const user = await User.findOne({
      $or: [
        { upiId: query },
        { mobile: query },
        { email: query }
      ],
      isActive: true
    }).select('-upiPin');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Get all users (admin only)
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.mobile !== '7825007490') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    const users = await User.find({ isActive: true }).select('-upiPin');
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin update user
app.put('/api/admin/users/:id', verifyToken, async (req, res) => {
  try {
    const adminId = req.user.userId;
    const userId = req.params.id;
    
    // Check if admin
    const admin = await User.findById(adminId);
    if (!admin || admin.mobile !== '7825007490') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates._id;
    delete updates.registrationDate;
    delete updates.upiId;
    delete updates.referralCode;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-upiPin');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Transaction Routes
app.get('/api/transactions/user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/transactions', verifyToken, async (req, res) => {
  try {
    const { userId, receiverId, type, amount, description, receiverDetails, senderBank, receiverBank, senderBankStatus, receiverBankStatus, category, status, metadata } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Create transaction
    const newTransaction = new Transaction({
      userId,
      receiverId,
      type,
      amount,
      description,
      receiverDetails,
      senderBank,
      receiverBank,
      senderBankStatus,
      receiverBankStatus,
      category,
      status: status || 'completed',
      metadata
    });
    
    await newTransaction.save();
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Payment processing
app.post('/api/payments/process', verifyToken, async (req, res) => {
  try {
    const { userId, receiverId, amount, description, receiverDetails, receiverBank, upiPin } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get sender
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Sender not found.' });
    }
    
    // Verify UPI PIN (always accept for demo)
    if (upiPin !== sender.upiPin) {
      // For demo purposes, accept any PIN that matches
      // In production, implement proper validation
    }
    
    // Get receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    // Check bank server status
    const senderBankStatus = checkBankServerStatus(sender.bankName);
    const receiverBankStatus = checkBankServerStatus(receiverBank || receiver.bankName);
    
    const senderBankActive = senderBankStatus.status === 'active';
    const receiverBankActive = receiverBankStatus.status === 'active';
    
    // Handle different bank status scenarios
    if (!senderBankActive && receiverBankActive) {
      // Case 1: Sender's bank down, receiver's bank active
      // DPay advances payment from app balance
      if (sender.appBalance >= amount) {
        sender.appBalance -= amount;
      } else {
        // Allow negative app balance for demo
        sender.appBalance -= amount;
      }
      
      // Receiver gets the amount
      receiver.balance += amount;
      
      // Create transactions
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced - Bank Down)`,
        receiverDetails,
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'active',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          senderBankDown: true,
          appBalanceAdvanced: true
        }
      });
      
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        receiverId: sender._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        receiverDetails: {
          username: sender.username,
          upiId: sender.upiId
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'active',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          receivedDuringDowntime: true
        }
      });
      
      await senderTransaction.save();
      await receiverTransaction.save();
      await sender.save();
      await receiver.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced by DPay due to sender bank downtime.',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    } 
    else if (senderBankActive && !receiverBankActive) {
      // Case 2: Sender's bank active, receiver's bank down
      // Check sender balance
      if (sender.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      sender.balance -= amount;
      
      // DPay holds the amount for receiver
      receiver.appBalance += amount;
      
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Holding - Receiver Bank Down)`,
        receiverDetails,
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'down',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          receiverBankDown: true,
          amountHeldByDPay: true
        }
      });
      
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        receiverId: sender._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username} (Held by DPay)`,
        receiverDetails: {
          username: sender.username,
          upiId: sender.upiId
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'down',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          amountHeldByDPay: true
        }
      });
      
      await senderTransaction.save();
      await receiverTransaction.save();
      await sender.save();
      await receiver.save();
      
      return res.json({
        success: true,
        message: 'Payment held by DPay due to receiver bank downtime.',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    else if (!senderBankActive && !receiverBankActive) {
      // Case 3: Both banks down
      // DPay advances and holds
      if (sender.appBalance >= amount) {
        sender.appBalance -= amount;
      } else {
        sender.appBalance -= amount;
      }
      
      receiver.appBalance += amount;
      
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced & Holding - Both Banks Down)`,
        receiverDetails,
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'down',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          bothBanksDown: true,
          appBalanceAdvanced: true,
          amountHeldByDPay: true
        }
      });
      
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        receiverId: sender._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username} (Held by DPay)`,
        receiverDetails: {
          username: sender.username,
          upiId: sender.upiId
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'down',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          bothBanksDown: true,
          amountHeldByDPay: true
        }
      });
      
      await senderTransaction.save();
      await receiverTransaction.save();
      await sender.save();
      await receiver.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced and held by DPay due to both banks downtime.',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    else {
      // Normal case: Both banks active
      if (sender.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      sender.balance -= amount;
      receiver.balance += amount;
      
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description,
        receiverDetails,
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        status: 'completed',
        metadata: {
          normalTransaction: true
        }
      });
      
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        receiverId: sender._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        receiverDetails: {
          username: sender.username,
          upiId: sender.upiId
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        status: 'completed',
        metadata: {
          normalTransaction: true
        }
      });
      
      await senderTransaction.save();
      await receiverTransaction.save();
      await sender.save();
      await receiver.save();
      
      return res.json({
        success: true,
        message: 'Payment processed successfully.',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Process bank recovery
app.post('/api/payments/recover', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Check bank status
    const bankStatus = checkBankServerStatus(user.bankName);
    
    if (bankStatus.status === 'active' && user.appBalance < 0) {
      // User owes money to DPay from downtime
      const amountOwed = Math.abs(user.appBalance);
      
      if (user.balance >= amountOwed) {
        // Recover the amount
        user.balance -= amountOwed;
        user.appBalance += amountOwed; // Brings appBalance to 0
        
        // Create recovery transaction
        const recoveryTransaction = new Transaction({
          userId: user._id,
          type: 'debit',
          amount: amountOwed,
          description: 'Bank Downtime Recovery - DPay Advance Repayment',
          senderBank: user.bankName,
          receiverBank: 'DPay System',
          senderBankStatus: 'active',
          receiverBankStatus: 'active',
          status: 'completed',
          metadata: {
            recovery: true,
            downtimeAdvanceRepayment: true,
            originalAppBalance: user.appBalance - amountOwed
          }
        });
        
        await recoveryTransaction.save();
        await user.save();
        
        return res.json({
          success: true,
          message: `Recovered ₹${amountOwed} from your bank account to clear DPay advance.`,
          newBalance: user.balance,
          newAppBalance: user.appBalance
        });
      }
    }
    
    res.json({
      success: true,
      message: 'No recovery needed at this time.',
      newBalance: user.balance,
      newAppBalance: user.appBalance
    });
    
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ success: false, message: 'Server error during recovery.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'DPay API',
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DPay API is working!',
    endpoints: [
      '/api/health',
      '/api/auth/send-otp',
      '/api/auth/login',
      '/api/auth/register',
      '/api/users/:id',
      '/api/users/search',
      '/api/transactions/user/:userId',
      '/api/payments/process',
      '/api/banks/status'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
