const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

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

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String },
  mobile: { type: String, required: true, unique: true },
  dob: { type: Date },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  atmCardNumber: { type: String, required: true },
  upiPin: { type: String, required: true },
  upiId: { type: String, unique: true },
  referralCode: { type: String, unique: true },
  photo: { type: String },
  balance: { type: Number, default: 1000.00 },
  appBalance: { type: Number, default: 0 },
  registrationDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

userSchema.pre('save', function(next) {
  if (!this.upiId) {
    this.upiId = generateUPIId(this.username, this.mobile);
  }
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.username, this.mobile);
  }
  // next();
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receiverDetails: { type: Object },
  senderBankStatus: { type: String },
  receiverBankStatus: { type: String },
  category: { type: String, enum: ['payment', 'mobile_recharge', 'bill_payment', 'loan', 'reward', 'other'], default: 'payment' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

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

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, mobile, dob, bankName, accountNumber, atmCardNumber, upiPin, referralCode, photo } = req.body;
    
    // Check if mobile already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered.' });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      mobile,
      dob,
      bankName,
      accountNumber,
      atmCardNumber,
      upiPin,
      referralCode,
      photo,
      balance: 1000.00,
      appBalance: 0
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, mobile: newUser.mobile },
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
        upiId: newUser.upiId,
        referralCode: newUser.referralCode,
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    // For demo purposes, accept any OTP
    // In production, you would verify the OTP
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required.' });
    }
    
    // Find user
    const user = await User.findOne({ mobile, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, mobile: user.mobile },
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
        upiId: user.upiId,
        referralCode: user.referralCode,
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

app.post('/api/auth/logout', verifyToken, (req, res) => {
  // In a real app, you might want to add token to a blacklist
  // For this demo, we'll just acknowledge the logout
  res.json({ success: true, message: 'Logged out successfully.' });
});

// User Routes
app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const user = await User.findById(userId).select('-upiPin');
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
    delete updates.balance;
    delete updates.appBalance;
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
    
    // Soft delete - mark as inactive
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
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
    const { userId, type, amount, description, receiverDetails, senderBankStatus, receiverBankStatus, category, status } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get user to check balance and update it
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Check balance for debit transactions
    if (type === 'debit' && user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }
    
    // Create transaction
    const newTransaction = new Transaction({
      userId,
      type,
      amount,
      description,
      receiverDetails,
      senderBankStatus,
      receiverBankStatus,
      category,
      status: status || 'completed'
    });
    
    await newTransaction.save();
    
    // Update user balance
    if (type === 'debit') {
      user.balance -= amount;
    } else if (type === 'credit') {
      user.balance += amount;
    }
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      transaction: newTransaction,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Pending Transactions
app.get('/api/transactions/pending/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const pendingTransactions = await Transaction.find({
      userId,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, transactions: pendingTransactions });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/transactions/pending/:transactionId', verifyToken, async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const { status } = req.body;
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    
    // Check if user owns this transaction
    if (req.user.userId !== transaction.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    transaction.status = status;
    await transaction.save();
    
    res.json({ success: true, message: 'Transaction status updated.', transaction });
  } catch (error) {
    console.error('Update pending transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Payment processing
app.post('/api/payments', verifyToken, async (req, res) => {
  try {
    const { userId, amount, description, receiverDetails, category } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Check balance
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      type: 'debit',
      amount,
      description,
      receiverDetails,
      category: category || 'payment',
      status: 'completed'
    });
    
    await transaction.save();
    
    // Update user balance
    user.balance -= amount;
    await user.save();
    
    res.json({
      success: true,
      message: 'Payment processed successfully.',
      transaction,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;