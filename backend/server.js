const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

// Generate random OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

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

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Bank Server Status Simulation
let BANK_SERVER_STATUS = {
  "State Bank of India (SBI)": { status: "active", lastChecked: new Date(), responseTime: "120ms" },
  "HDFC Bank": { status: "active", lastChecked: new Date(), responseTime: "95ms" },
  "ICICI Bank": { status: "slow", lastChecked: new Date(), responseTime: "450ms" },
  "Axis Bank": { status: "active", lastChecked: new Date(), responseTime: "85ms" },
  "Kotak Mahindra Bank": { status: "active", lastChecked: new Date(), responseTime: "110ms" },
  "Punjab National Bank (PNB)": { status: "down", lastChecked: new Date(), responseTime: "Timeout" },
  "Bank of Baroda": { status: "active", lastChecked: new Date(), responseTime: "100ms" },
  "Canara Bank": { status: "active", lastChecked: new Date(), responseTime: "130ms" },
  "Union Bank of India": { status: "slow", lastChecked: new Date(), responseTime: "380ms" },
  "Bank of India": { status: "active", lastChecked: new Date(), responseTime: "90ms" },
  "IndusInd Bank": { status: "active", lastChecked: new Date(), responseTime: "75ms" },
  "IDFC First Bank": { status: "active", lastChecked: new Date(), responseTime: "105ms" },
  "Yes Bank": { status: "down", lastChecked: new Date(), responseTime: "Timeout" },
  "Federal Bank": { status: "active", lastChecked: new Date(), responseTime: "95ms" },
  "Indian Bank": { status: "active", lastChecked: new Date(), responseTime: "115ms" },
  "Central Bank of India": { status: "slow", lastChecked: new Date(), responseTime: "420ms" },
  "Indian Overseas Bank": { status: "active", lastChecked: new Date(), responseTime: "80ms" },
  "UCO Bank": { status: "down", lastChecked: new Date(), responseTime: "Timeout" },
  "Bandhan Bank": { status: "active", lastChecked: new Date(), responseTime: "88ms" },
  "IDBI Bank": { status: "active", lastChecked: new Date(), responseTime: "125ms" }
};

// Check bank server status
const checkBankServerStatus = (bankName) => {
  const bankStatus = BANK_SERVER_STATUS[bankName];
  if (!bankStatus) return { status: 'unknown', isActive: false };
  
  return {
    ...bankStatus,
    isActive: bankStatus.status === 'active'
  };
};

// Update bank server status
const updateBankServerStatus = (bankName, status) => {
  if (BANK_SERVER_STATUS[bankName]) {
    BANK_SERVER_STATUS[bankName].status = status;
    BANK_SERVER_STATUS[bankName].lastChecked = new Date();
    BANK_SERVER_STATUS[bankName].responseTime = status === 'active' ? 
      `${Math.floor(Math.random() * 150) + 50}ms` : 
      status === 'slow' ? 
      `${Math.floor(Math.random() * 500) + 300}ms` : 
      'Timeout';
    return true;
  }
  return false;
};

// User Schema with PAN and Credit Score
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
  }],
  isAdmin: { type: Boolean, default: false }
});

userSchema.pre('save', function(next) {
  if (!this.upiId) {
    this.upiId = generateUPIId(this.username, this.mobile);
  }
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.username, this.mobile);
  }
  // Set admin flag for mobile number 7825007490
  if (this.mobile === '7825007490') {
    this.isAdmin = true;
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Transaction Schema with downtime handling
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receiverDetails: { type: Object },
  senderBank: { type: String },
  receiverBank: { type: String },
  senderBankStatus: { type: String },
  receiverBankStatus: { type: String },
  category: { type: String, enum: ['payment', 'mobile_recharge', 'bill_payment', 'loan', 'reward', 'other'], default: 'payment' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'held_by_dpay'], default: 'pending' },
  metadata: { type: Object },
  isRecovery: { type: Boolean, default: false },
  originalTransactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Loan Schema
const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanType: { type: String, required: true },
  bankName: { type: String, required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenure: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'disbursed'], default: 'pending' },
  applicationDate: { type: Date, default: Date.now },
  metadata: { type: Object }
});

const Loan = mongoose.model('Loan', loanSchema);

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

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
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

// Auth Routes

// Send OTP endpoint
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with identifier
    const identifier = mobile || email;
    otpStore.set(identifier, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    
    // In production, send OTP via SMS/Email service
    // For demo, just return the OTP
    console.log(`OTP for ${identifier}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP sent successfully.',
      otp: otp // For demo only, remove in production
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error sending OTP.' });
  }
});

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const otpData = otpStore.get(identifier);
  if (!otpData) {
    return { valid: false, message: 'OTP not found or expired.' };
  }
  
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(identifier);
    return { valid: false, message: 'OTP has expired.' };
  }
  
  if (otpData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP.' };
  }
  
  // OTP verified successfully, remove from store
  otpStore.delete(identifier);
  return { valid: true, message: 'OTP verified successfully.' };
};

// Registration endpoint
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
    
    // Generate credit score (650-850 based on random)
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
      upiPin, // Store plain UPI PIN for demo (in production, hash it)
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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    
    // Validate input
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Find user by mobile or email
    let user;
    const identifier = mobile || email;
    
    if (mobile) {
      user = await User.findOne({ mobile, isActive: true });
    } else if (email) {
      user = await User.findOne({ email, isActive: true });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // Verify OTP
    const otpVerification = verifyOTP(identifier, otp);
    if (!otpVerification.valid) {
      return res.status(400).json({ success: false, message: otpVerification.message });
    }
    
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
        upiPin: user.upiPin, // Send UPI PIN for demo (in production, don't send)
        photo: user.photo,
        dob: user.dob,
        registrationDate: user.registrationDate,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// User Routes

// Get user profile
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

// Update user profile
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
    delete updates.isAdmin;
    
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

// Delete user account
app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Delete user and all associated data
    await User.findByIdAndDelete(userId);
    await Transaction.deleteMany({ userId });
    await Loan.deleteMany({ userId });
    
    res.json({ success: true, message: 'Account and all data deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Search user by mobile
app.get('/api/users/search/mobile/:mobile', verifyToken, async (req, res) => {
  try {
    const { mobile } = req.params;
    
    const user = await User.findOne({ mobile, isActive: true })
      .select('-upiPin -pendingTransactions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Search user by UPI ID
app.get('/api/users/search/upi/:upiId', verifyToken, async (req, res) => {
  try {
    const { upiId } = req.params;
    
    const user = await User.findOne({ upiId, isActive: true })
      .select('-upiPin -pendingTransactions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Transaction Routes

// Get user transactions
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

// Create transaction
app.post('/api/transactions', verifyToken, async (req, res) => {
  try {
    const { userId, type, amount, description, receiverDetails, senderBank, receiverBank, senderBankStatus, receiverBankStatus, category, status, metadata, isRecovery, originalTransactionId } = req.body;
    
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
      metadata,
      isRecovery,
      originalTransactionId
    });
    
    await newTransaction.save();
    
    // If this is a recovery transaction, update the original pending transaction
    if (isRecovery && originalTransactionId) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pendingTransactions: { transactionId: originalTransactionId } }
      });
    }
    
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

// Get pending transactions
app.get('/api/transactions/pending/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Also get transactions with status 'held_by_dpay'
    const heldTransactions = await Transaction.find({
      userId,
      status: 'held_by_dpay'
    }).sort({ createdAt: -1 });
    
    const pendingTransactions = [...user.pendingTransactions, ...heldTransactions.map(t => ({
      transactionId: t._id,
      amount: t.amount,
      description: t.description,
      receiverDetails: t.receiverDetails,
      senderBank: t.senderBank,
      receiverBank: t.receiverBank,
      status: t.status,
      createdAt: t.createdAt,
      metadata: t.metadata
    }))];
    
    res.json({ success: true, transactions: pendingTransactions });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Payment processing
app.post('/api/payments/process', verifyToken, async (req, res) => {
  try {
    const { userId, amount, description, receiverDetails, category, upiPin } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get sender user
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Sender not found.' });
    }
    
    // Verify UPI PIN
    if (upiPin !== sender.upiPin) {
      return res.status(400).json({ success: false, message: 'Invalid UPI PIN.' });
    }
    
    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }
    
    // Get receiver user
    const receiver = await User.findById(receiverDetails.userId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    // Check bank server status
    const senderBankStatus = checkBankServerStatus(sender.bankName);
    const receiverBankStatus = checkBankServerStatus(receiver.bankName);
    
    // Case 1: Both banks active - Normal transaction
    if (senderBankStatus.isActive && receiverBankStatus.isActive) {
      // Deduct from sender
      sender.balance -= amount;
      
      // Add to receiver
      receiver.balance += amount;
      
      // Create sender transaction
      const senderTransaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          normalTransaction: true,
          timestamp: new Date()
        }
      });
      
      // Create receiver transaction
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        receiverDetails: {
          userId: sender._id,
          name: sender.username,
          mobile: sender.mobile,
          upiId: sender.upiId,
          bankName: sender.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          normalTransaction: true,
          timestamp: new Date()
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
    
    // Case 2: Sender's bank down
    else if (!senderBankStatus.isActive && receiverBankStatus.isActive) {
      // DPay advances the payment from app balance
      sender.appBalance -= amount;
      
      // Add to receiver
      receiver.balance += amount;
      
      // Create sender transaction
      const senderTransaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced - Sender Bank Down)`,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          senderBankDown: true,
          appBalanceAdvanced: true,
          timestamp: new Date()
        }
      });
      
      // Create receiver transaction
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username} (DPay Advanced)`,
        receiverDetails: {
          userId: sender._id,
          name: sender.username,
          mobile: sender.mobile,
          upiId: sender.upiId,
          bankName: sender.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          senderBankDown: true,
          appBalanceAdvanced: true,
          timestamp: new Date()
        }
      });
      
      // Add to sender's pending transactions for recovery
      sender.pendingTransactions.push({
        transactionId: senderTransaction._id,
        amount,
        description,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        status: 'pending',
        metadata: {
          type: 'sender_bank_down',
          recovered: false,
          recoveryAttempts: 0
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
    
    // Case 3: Receiver's bank down
    else if (senderBankStatus.isActive && !receiverBankStatus.isActive) {
      // Deduct from sender
      sender.balance -= amount;
      
      // Hold amount in receiver's app balance
      receiver.appBalance += amount;
      
      // Create sender transaction
      const senderTransaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Holding - Receiver Bank Down)`,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'down',
        category: category || 'payment',
        status: 'held_by_dpay',
        metadata: {
          downtimeHandled: true,
          receiverBankDown: true,
          amountHeldByDPay: true,
          timestamp: new Date()
        }
      });
      
      // Add to both users' pending transactions for recovery
      sender.pendingTransactions.push({
        transactionId: senderTransaction._id,
        amount,
        description,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        status: 'pending',
        metadata: {
          type: 'receiver_bank_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      receiver.pendingTransactions.push({
        transactionId: senderTransaction._id,
        amount,
        description: `Pending from ${sender.username}`,
        receiverDetails: {
          userId: sender._id,
          name: sender.username,
          mobile: sender.mobile,
          upiId: sender.upiId,
          bankName: sender.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        status: 'pending',
        metadata: {
          type: 'receiver_bank_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      await senderTransaction.save();
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
    
    // Case 4: Both banks down
    else {
      // DPay advances from sender's app balance and holds for receiver
      sender.appBalance -= amount;
      receiver.appBalance += amount;
      
      // Create sender transaction
      const senderTransaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced & Holding - Both Banks Down)`,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'down',
        category: category || 'payment',
        status: 'held_by_dpay',
        metadata: {
          downtimeHandled: true,
          bothBanksDown: true,
          appBalanceAdvanced: true,
          amountHeldByDPay: true,
          timestamp: new Date()
        }
      });
      
      // Add to both users' pending transactions for recovery
      sender.pendingTransactions.push({
        transactionId: senderTransaction._id,
        amount,
        description,
        receiverDetails: {
          userId: receiver._id,
          name: receiver.username,
          mobile: receiver.mobile,
          upiId: receiver.upiId,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        status: 'pending',
        metadata: {
          type: 'both_banks_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      receiver.pendingTransactions.push({
        transactionId: senderTransaction._id,
        amount,
        description: `Pending from ${sender.username}`,
        receiverDetails: {
          userId: sender._id,
          name: sender.username,
          mobile: sender.mobile,
          upiId: sender.upiId,
          bankName: sender.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        status: 'pending',
        metadata: {
          type: 'both_banks_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      await senderTransaction.save();
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
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Process pending transactions when banks recover
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
    
    const recoveredTransactions = [];
    const failedTransactions = [];
    
    // Check each pending transaction
    for (const pendingTx of user.pendingTransactions) {
      const senderBankStatus = checkBankServerStatus(pendingTx.senderBank);
      const receiverBankStatus = checkBankServerStatus(pendingTx.receiverBank);
      
      // Only recover if both banks are active
      if (senderBankStatus.isActive && receiverBankStatus.isActive) {
        const metadata = pendingTx.metadata || {};
        
        // Handle based on transaction type
        if (metadata.type === 'sender_bank_down') {
          // Get the transaction
          const transaction = await Transaction.findById(pendingTx.transactionId);
          if (!transaction) continue;
          
          // Get receiver
          const receiver = await User.findById(transaction.receiverDetails.userId);
          if (!receiver) {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Receiver not found'
            });
            continue;
          }
          
          // Check if user has enough balance to recover
          if (user.balance >= pendingTx.amount) {
            // Deduct from user's bank balance (since DPay advanced it earlier)
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount; // Recover app balance
            
            // Update transaction status
            transaction.status = 'completed';
            transaction.metadata = {
              ...metadata,
              recovered: true,
              recoveryDate: new Date()
            };
            
            await transaction.save();
            
            recoveredTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              type: 'sender_bank_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Insufficient balance for recovery'
            });
          }
        }
        else if (metadata.type === 'receiver_bank_down') {
          // Get the transaction
          const transaction = await Transaction.findById(pendingTx.transactionId);
          if (!transaction) continue;
          
          // Get receiver
          const receiver = await User.findById(transaction.receiverDetails.userId);
          if (!receiver) {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Receiver not found'
            });
            continue;
          }
          
          // Move amount from receiver's app balance to main balance
          if (receiver.appBalance >= pendingTx.amount) {
            receiver.appBalance -= pendingTx.amount;
            receiver.balance += pendingTx.amount;
            
            // Update transaction status
            transaction.status = 'completed';
            transaction.metadata = {
              ...metadata,
              recovered: true,
              recoveryDate: new Date()
            };
            
            // Create credit transaction for receiver
            const receiverTransaction = new Transaction({
              userId: receiver._id,
              type: 'credit',
              amount: pendingTx.amount,
              description: `Recovered: ${transaction.description}`,
              receiverDetails: transaction.receiverDetails,
              senderBank: transaction.senderBank,
              receiverBank: transaction.receiverBank,
              senderBankStatus: 'active',
              receiverBankStatus: 'active',
              category: transaction.category,
              status: 'completed',
              metadata: {
                recovered: true,
                originalTransactionId: transaction._id,
                recoveryDate: new Date()
              }
            });
            
            await transaction.save();
            await receiverTransaction.save();
            await receiver.save();
            
            recoveredTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              type: 'receiver_bank_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Receiver has insufficient app balance'
            });
          }
        }
        else if (metadata.type === 'both_banks_down') {
          // Get the transaction
          const transaction = await Transaction.findById(pendingTx.transactionId);
          if (!transaction) continue;
          
          // Get receiver
          const receiver = await User.findById(transaction.receiverDetails.userId);
          if (!receiver) {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Receiver not found'
            });
            continue;
          }
          
          // Check if both users have enough balance
          if (user.balance >= pendingTx.amount && receiver.appBalance >= pendingTx.amount) {
            // Deduct from sender's balance and recover app balance
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount;
            
            // Move from receiver's app balance to main balance
            receiver.appBalance -= pendingTx.amount;
            receiver.balance += pendingTx.amount;
            
            // Update transaction status
            transaction.status = 'completed';
            transaction.metadata = {
              ...metadata,
              recovered: true,
              recoveryDate: new Date()
            };
            
            // Create credit transaction for receiver
            const receiverTransaction = new Transaction({
              userId: receiver._id,
              type: 'credit',
              amount: pendingTx.amount,
              description: `Recovered: ${transaction.description}`,
              receiverDetails: transaction.receiverDetails,
              senderBank: transaction.senderBank,
              receiverBank: transaction.receiverBank,
              senderBankStatus: 'active',
              receiverBankStatus: 'active',
              category: transaction.category,
              status: 'completed',
              metadata: {
                recovered: true,
                originalTransactionId: transaction._id,
                recoveryDate: new Date()
              }
            });
            
            await transaction.save();
            await receiverTransaction.save();
            await user.save();
            await receiver.save();
            
            recoveredTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              type: 'both_banks_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Insufficient balance for recovery'
            });
          }
        }
      }
    }
    
    // Remove recovered transactions from pending
    user.pendingTransactions = user.pendingTransactions.filter(tx => 
      !recoveredTransactions.some(rt => rt.transactionId === tx.transactionId)
    );
    
    await user.save();
    
    // Also remove from receiver's pending transactions
    for (const rt of recoveredTransactions) {
      const transaction = await Transaction.findById(rt.transactionId);
      if (transaction && transaction.receiverDetails.userId) {
        const receiver = await User.findById(transaction.receiverDetails.userId);
        if (receiver) {
          receiver.pendingTransactions = receiver.pendingTransactions.filter(tx => 
            tx.transactionId !== rt.transactionId
          );
          await receiver.save();
        }
      }
    }
    
    res.json({
      success: true,
      message: `Recovered ${recoveredTransactions.length} transaction(s), ${failedTransactions.length} failed.`,
      recoveredTransactions,
      failedTransactions,
      newBalance: user.balance,
      newAppBalance: user.appBalance
    });
    
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ success: false, message: 'Server error during recovery.' });
  }
});

// Loan Routes
app.get('/api/loans/user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const loans = await Loan.find({ userId }).sort({ applicationDate: -1 });
    
    res.json({ success: true, loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin Routes

// Get all users (admin only)
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-upiPin -pendingTransactions')
      .sort({ registrationDate: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update any user (admin only)
app.put('/api/admin/users/:userId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Don't allow updating sensitive fields
    delete updates._id;
    delete updates.registrationDate;
    delete updates.upiId;
    delete updates.referralCode;
    delete updates.isAdmin;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-upiPin -pendingTransactions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update bank status (admin only)
app.post('/api/admin/banks/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { bankName, status } = req.body;
    
    if (!bankName || !status) {
      return res.status(400).json({ success: false, message: 'Bank name and status are required.' });
    }
    
    if (!['active', 'slow', 'down'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use: active, slow, or down.' });
    }
    
    const updated = updateBankServerStatus(bankName, status);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Bank not found.' });
    }
    
    res.json({
      success: true,
      message: `Bank status updated to ${status}.`,
      bankName,
      status: BANK_SERVER_STATUS[bankName]
    });
  } catch (error) {
    console.error('Update bank status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// QR Code Processing
app.post('/api/qr/process', verifyToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR data is required.' });
    }
    
    // Parse UPI QR code data
    try {
      const url = new URL(qrData);
      const params = new URLSearchParams(url.search);
      
      const upiId = params.get('pa');
      const name = decodeURIComponent(params.get('pn') || '');
      const amount = params.get('am');
      
      if (!upiId) {
        return res.status(400).json({ success: false, message: 'Invalid QR code: UPI ID not found.' });
      }
      
      // Find user by UPI ID
      const user = await User.findOne({ upiId, isActive: true })
        .select('-upiPin -pendingTransactions');
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found for this UPI ID.' });
      }
      
      res.json({
        success: true,
        qrData: {
          upiId,
          name,
          amount: amount ? parseFloat(amount) : null,
          user
        }
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format.' });
    }
  } catch (error) {
    console.error('QR processing error:', error);
    res.status(500).json({ success: false, message: 'Server error processing QR code.' });
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
      '/api/auth/register',
      '/api/auth/login',
      '/api/users/:id',
      '/api/transactions/user/:userId',
      '/api/payments/process',
      '/api/payments/recover',
      '/api/admin/users',
      '/api/qr/process'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
