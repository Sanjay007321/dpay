// backend.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dpay', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// OTP Storage for demo
const otpStorage = {};

// Bank Server Status
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

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate unique UPI ID
const generateUPIId = (username, mobile) => {
  const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
  const last4Mobile = mobile.slice(-4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanUsername}${last4Mobile}${randomNum}@dpay`;
};

// Generate referral code
const generateReferralCode = (username, mobile) => {
  const cleanUsername = username.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `DP${cleanUsername}${randomNum}`;
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
    id: String,
    senderBank: String,
    receiverBank: String,
    amount: Number,
    description: String,
    receiverDetails: Object,
    category: String,
    timestamp: Date,
    type: String,
    status: { type: String, default: 'pending' }
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

// Admin middleware - check if user is admin (mobile: 7825007490)
const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    if (user.mobile !== '7825007490') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin verification.' });
  }
};

// Routes

// Bank Status API
app.get('/api/banks/status', verifyToken, async (req, res) => {
  try {
    const bankName = req.query.bank;
    
    if (bankName) {
      const status = BANK_SERVER_STATUS[bankName] || { status: 'unknown', lastChecked: new Date(), responseTime: 'N/A' };
      res.json({ success: true, bankName, status });
    } else {
      res.json({ success: true, status: BANK_SERVER_STATUS });
    }
  } catch (error) {
    console.error('Bank status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// OTP Generation and Verification APIs
app.post('/api/otp/send', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    const otp = generateOTP();
    const identifier = mobile || email;
    
    // Store OTP for verification (in production, send via SMS/Email)
    otpStorage[identifier] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };
    
    // In production, send OTP via SMS/Email
    // For demo, we'll just return it
    res.json({
      success: true,
      message: 'OTP sent successfully.',
      otp: otp, // For demo only - remove in production
      identifier,
      expiresIn: '5 minutes'
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }
    
    const identifier = mobile || email;
    const storedOtp = otpStorage[identifier];
    
    if (!storedOtp) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new OTP.' });
    }
    
    if (Date.now() > storedOtp.expiresAt) {
      delete otpStorage[identifier];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
    }
    
    if (storedOtp.attempts >= 3) {
      delete otpStorage[identifier];
      return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }
    
    storedOtp.attempts++;
    
    if (storedOtp.otp !== otp && otp !== '123456') { // 123456 for demo
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    
    // OTP verified successfully
    delete otpStorage[identifier];
    
    res.json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Auth Routes
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
        accountNumber: newUser.accountNumber,
        atmCardNumber: newUser.atmCardNumber,
        upiPin: newUser.upiPin, // Send UPI PIN for demo (in production, don't send)
        photo: newUser.photo,
        dob: newUser.dob,
        registrationDate: newUser.registrationDate
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login with OTP verification
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
    if (mobile) {
      user = await User.findOne({ mobile, isActive: true });
    } else if (email) {
      user = await User.findOne({ email, isActive: true });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // For demo purposes, accept any OTP starting with 123456
    // In production, implement proper OTP verification
    if (otp !== '123456') {
      // Check if OTP matches the generated one
      const identifier = mobile || email;
      const storedOtp = otpStorage[identifier];
      
      if (!storedOtp || storedOtp.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
      }
      
      // Clean up OTP
      delete otpStorage[identifier];
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
    delete updates.upiId;
    delete updates.referralCode;
    delete updates.creditScore;
    delete updates.registrationDate;
    
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
    await Loan.deleteMany({ userId });
    
    res.json({ success: true, message: 'Account and all data deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// User Search APIs
app.get('/api/users/search/upi/:upiId', verifyToken, async (req, res) => {
  try {
    const upiId = req.params.upiId;
    
    const user = await User.findOne({ upiId, isActive: true }).select('-upiPin -pendingTransactions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Search user by UPI error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/api/users/search/mobile/:mobile', verifyToken, async (req, res) => {
  try {
    const mobile = req.params.mobile;
    
    const user = await User.findOne({ mobile, isActive: true }).select('-upiPin -pendingTransactions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Search user by mobile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin Routes
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

app.put('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates._id;
    delete updates.upiId;
    delete updates.referralCode;
    delete updates.registrationDate;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/admin/banks/:bankName', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const bankName = req.params.bankName;
    const { status } = req.body;
    
    if (!BANK_SERVER_STATUS[bankName]) {
      return res.status(404).json({ success: false, message: 'Bank not found.' });
    }
    
    if (!['active', 'slow', 'down'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active, slow, or down.' });
    }
    
    // Update bank status
    BANK_SERVER_STATUS[bankName] = {
      status,
      lastChecked: new Date(),
      responseTime: status === 'active' ? `${Math.floor(Math.random() * 150) + 50}ms` : 
                   status === 'slow' ? `${Math.floor(Math.random() * 500) + 300}ms` : 
                   'Timeout'
    };
    
    res.json({
      success: true,
      message: `Bank status updated to ${status}.`,
      status: BANK_SERVER_STATUS[bankName]
    });
  } catch (error) {
    console.error('Update bank status error:', error);
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

// Pending Transactions
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
    
    res.json({ success: true, transactions: user.pendingTransactions || [] });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Payment processing with downtime handling
app.post('/api/payments/downtime', verifyToken, async (req, res) => {
  try {
    const { userId, amount, description, receiverDetails, category, upiPin, senderBankStatus, receiverBankStatus } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Verify UPI PIN
    if (upiPin !== user.upiPin) {
      return res.status(400).json({ success: false, message: 'Invalid UPI PIN.' });
    }
    
    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in your account.' });
    }
    
    // Check bank server status
    const senderBankActive = BANK_SERVER_STATUS[user.bankName]?.status === 'active';
    let receiverBank = receiverDetails?.bank || 'Unknown Bank';
    const receiverBankActive = BANK_SERVER_STATUS[receiverBank]?.status === 'active';
    
    // Case 1: Sender's bank is down
    if (!senderBankActive && receiverBankActive) {
      // DPay advances the payment
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced - Sender Bank Down)`,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
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
      
      await transaction.save();
      
      // Update user app balance (negative)
      user.appBalance = (user.appBalance || 0) - amount;
      
      // Add to pending transactions for recovery
      user.pendingTransactions.push({
        id: transaction._id.toString(),
        senderBank: user.bankName,
        receiverBank: receiverBank,
        amount,
        description,
        receiverDetails,
        category: category || 'payment',
        timestamp: new Date(),
        type: 'sender_bank_down',
        status: 'pending'
      });
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced by DPay due to sender bank downtime.',
        transaction,
        newBalance: user.balance,
        newAppBalance: user.appBalance
      });
    }
    
    // Case 2: Receiver's bank is down
    else if (senderBankActive && !receiverBankActive) {
      // Deduct from sender's balance and add to app balance
      user.balance -= amount;
      user.appBalance = (user.appBalance || 0) + amount;
      
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (DPay Holding - Receiver Bank Down)`,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
        senderBankStatus: 'active',
        receiverBankStatus: 'down',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          receiverBankDown: true,
          amountHeldByDPay: true,
          timestamp: new Date()
        }
      });
      
      await transaction.save();
      
      // Add to pending transactions for recovery
      user.pendingTransactions.push({
        id: transaction._id.toString(),
        senderBank: user.bankName,
        receiverBank: receiverBank,
        amount,
        description,
        receiverDetails,
        category: category || 'payment',
        timestamp: new Date(),
        type: 'receiver_bank_down',
        status: 'pending'
      });
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'Payment held by DPay due to receiver bank downtime.',
        transaction,
        newBalance: user.balance,
        newAppBalance: user.appBalance
      });
    }
    
    // Case 3: Both banks are down
    else if (!senderBankActive && !receiverBankActive) {
      // DPay advances and holds the payment
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced & Holding - Both Banks Down)`,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
        senderBankStatus: 'down',
        receiverBankStatus: 'down',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          bothBanksDown: true,
          appBalanceAdvanced: true,
          amountHeldByDPay: true,
          timestamp: new Date()
        }
      });
      
      await transaction.save();
      
      // Update user app balance (negative)
      user.appBalance = (user.appBalance || 0) - amount;
      
      // Add to pending transactions for recovery
      user.pendingTransactions.push({
        id: transaction._id.toString(),
        senderBank: user.bankName,
        receiverBank: receiverBank,
        amount,
        description,
        receiverDetails,
        category: category || 'payment',
        timestamp: new Date(),
        type: 'both_banks_down',
        status: 'pending'
      });
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced and held by DPay due to both banks downtime.',
        transaction,
        newBalance: user.balance,
        newAppBalance: user.appBalance
      });
    }
    
    // Normal case: Both banks are active
    else {
      // Process normal payment
      user.balance -= amount;
      
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          normalTransaction: true,
          timestamp: new Date()
        }
      });
      
      await transaction.save();
      await user.save();
      
      return res.json({
        success: true,
        message: 'Payment processed successfully.',
        transaction,
        newBalance: user.balance,
        newAppBalance: user.appBalance
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
      const senderBankStatus = BANK_SERVER_STATUS[pendingTx.senderBank]?.status === 'active';
      const receiverBankStatus = BANK_SERVER_STATUS[pendingTx.receiverBank]?.status === 'active';
      
      // Only recover if both banks are active
      if (senderBankStatus && receiverBankStatus) {
        // Handle based on transaction type
        if (pendingTx.type === 'sender_bank_down') {
          // Deduct from user's bank balance (since DPay advanced it earlier)
          if (user.balance >= pendingTx.amount) {
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount; // Recover app balance
            
            recoveredTransactions.push({
              transactionId: pendingTx.id,
              amount: pendingTx.amount,
              type: 'sender_bank_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.id,
              amount: pendingTx.amount,
              reason: 'Insufficient balance for recovery'
            });
          }
        }
        else if (pendingTx.type === 'receiver_bank_down') {
          // Amount was already deducted from sender, now clear from app balance
          if (user.appBalance >= pendingTx.amount) {
            user.appBalance -= pendingTx.amount;
            
            recoveredTransactions.push({
              transactionId: pendingTx.id,
              amount: pendingTx.amount,
              type: 'receiver_bank_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.id,
              amount: pendingTx.amount,
              reason: 'Insufficient app balance for recovery'
            });
          }
        }
        else if (pendingTx.type === 'both_banks_down') {
          // Both banks down case: deduct from sender's balance and clear app balance
          if (user.balance >= pendingTx.amount && user.appBalance >= -pendingTx.amount) {
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount; // Clear negative app balance
            
            recoveredTransactions.push({
              transactionId: pendingTx.id,
              amount: pendingTx.amount,
              type: 'both_banks_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.id,
              amount: pendingTx.amount,
              reason: 'Insufficient balance for recovery'
            });
          }
        }
      }
    }
    
    // Remove recovered transactions from pending
    user.pendingTransactions = user.pendingTransactions.filter(tx => 
      !recoveredTransactions.some(rt => rt.transactionId === tx.id)
    );
    
    await user.save();
    
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

// QR Code APIs
app.get('/api/qr/generate/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    const qrData = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.username)}&cu=INR&tn=DPay%20Payment`;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrData);
    
    res.json({
      success: true,
      qrData,
      qrCode,
      user: {
        username: user.username,
        upiId: user.upiId
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/qr/parse', verifyToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR data is required.' });
    }
    
    // For demo purposes, parse a sample QR data
    // In production, you would use a QR code parsing library
    const demoQRData = "upi://pay?pa=johndoe1234@dpay&pn=John%20Doe&am=500&cu=INR&tn=Payment%20for%20services";
    
    // Parse UPI data
    const params = new URLSearchParams(demoQRData.split('?')[1]);
    const upiId = params.get('pa') || 'johndoe1234@dpay';
    const receiverName = decodeURIComponent(params.get('pn') || 'John Doe');
    const amount = params.get('am') || '';
    
    // Search for user by UPI ID
    const user = await User.findOne({ upiId, isActive: true }).select('-upiPin -pendingTransactions');
    
    res.json({
      success: true,
      qrData: demoQRData,
      upiId,
      receiverName: user ? user.username : receiverName,
      amount,
      user: user || null
    });
  } catch (error) {
    console.error('QR parse error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Loan Routes (only listing, no application)
app.get('/api/loans/offers/:loanType', verifyToken, async (req, res) => {
  try {
    const loanType = req.params.loanType;
    
    // Sample loan offers data
    const loanOffers = {
      home: [
        { bank: 'HDFC Bank', interest: '8.4% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 30 years', processing: '0.5%' },
        { bank: 'SBI', interest: '8.5% p.a.', amount: 'Up to ₹10 Cr', tenure: 'Up to 30 years', processing: '0.35% + GST' },
        { bank: 'ICICI Bank', interest: '8.6% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 30 years', processing: '0.5%' },
        { bank: 'Axis Bank', interest: '8.7% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 30 years', processing: '0.5%' },
        { bank: 'Kotak Mahindra Bank', interest: '8.8% p.a.', amount: 'Up to ₹10 Cr', tenure: 'Up to 25 years', processing: '0.5%' }
      ],
      education: [
        { bank: 'SBI', interest: '8.15% p.a.', amount: 'Up to ₹1.5 Cr', tenure: 'Up to 15 years', processing: 'Nil' },
        { bank: 'HDFC Bank', interest: '9.5% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 15 years', processing: '1%' },
        { bank: 'Axis Bank', interest: '10% p.a.', amount: 'Up to ₹75 Lakh', tenure: 'Up to 15 years', processing: '1%' },
        { bank: 'ICICI Bank', interest: '9.75% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 15 years', processing: '1%' }
      ],
      agriculture: [
        { bank: 'Bank of Baroda', interest: '7% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 7 years', processing: 'Nil' },
        { bank: 'PNB', interest: '7.3% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 10 years', processing: 'Nil' },
        { bank: 'Canara Bank', interest: '7.5% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 7 years', processing: '0.5%' },
        { bank: 'Union Bank of India', interest: '7.25% p.a.', amount: 'Up to ₹75 Lakh', tenure: 'Up to 10 years', processing: 'Nil' }
      ],
      gold: [
        { bank: 'Muthoot Finance', interest: '12% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 3 years', processing: '1%' },
        { bank: 'Manappuram Finance', interest: '12.5% p.a.', amount: 'Up to ₹10 Cr', tenure: 'Up to 3 years', processing: '1%' },
        { bank: 'HDFC Bank', interest: '9.5% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 3 years', processing: '1%' },
        { bank: 'ICICI Bank', interest: '10% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 3 years', processing: '1%' }
      ],
      healthcare: [
        { bank: 'Apollo Hospitals', interest: '11% p.a.', amount: 'Up to ₹25 Lakh', tenure: 'Up to 5 years', processing: '1%' },
        { bank: 'HDFC Bank', interest: '10.5% p.a.', amount: 'Up to ₹20 Lakh', tenure: 'Up to 5 years', processing: '1%' },
        { bank: 'ICICI Bank', interest: '11.5% p.a.', amount: 'Up to ₹30 Lakh', tenure: 'Up to 5 years', processing: '1%' }
      ],
      insurance: [
        { provider: 'LIC', type: 'Life Insurance', coverage: 'Up to ₹2 Cr', premium: '₹500/month', tenure: 'Up to 30 years' },
        { provider: 'HDFC Life', type: 'Term Insurance', coverage: 'Up to ₹5 Cr', premium: '₹600/month', tenure: 'Up to 40 years' },
        { provider: 'ICICI Prudential', type: 'Health Insurance', coverage: 'Up to ₹1 Cr', premium: '₹700/month', tenure: '1 year' },
        { provider: 'Bajaj Allianz', type: 'Motor Insurance', coverage: 'IDV based', premium: '₹2000/year', tenure: '1 year' }
      ],
      personal: [
        { bank: 'HDFC Bank', interest: '10.5% p.a.', amount: 'Up to ₹40 Lakh', tenure: 'Up to 7 years', processing: '2%' },
        { bank: 'SBI', interest: '10.25% p.a.', amount: 'Up to ₹20 Lakh', tenure: 'Up to 6 years', processing: '1%' },
        { bank: 'ICICI Bank', interest: '10.75% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 7 years', processing: '2%' },
        { bank: 'Axis Bank', interest: '11% p.a.', amount: 'Up to ₹40 Lakh', tenure: 'Up to 7 years', processing: '2%' }
      ],
      business: [
        { bank: 'SBI', interest: '9.2% p.a.', amount: 'Up to ₹50 Cr', tenure: 'Up to 15 years', processing: '0.5%' },
        { bank: 'HDFC Bank', interest: '9.5% p.a.', amount: 'Up to ₹50 Cr', tenure: 'Up to 15 years', processing: '1%' },
        { bank: 'ICICI Bank', interest: '9.8% p.a.', amount: 'Up to ₹100 Cr', tenure: 'Up to 20 years', processing: '1%' },
        { bank: 'Axis Bank', interest: '10% p.a.', amount: 'Up to ₹50 Cr', tenure: 'Up to 15 years', processing: '1%' }
      ]
    };
    
    const offers = loanOffers[loanType] || [];
    
    res.json({
      success: true,
      loanType,
      offers
    });
  } catch (error) {
    console.error('Get loan offers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
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
      '/api/otp/send',
      '/api/otp/verify',
      '/api/auth/register',
      '/api/auth/login',
      '/api/users/:id',
      '/api/users/search/upi/:upiId',
      '/api/users/search/mobile/:mobile',
      '/api/transactions/user/:userId',
      '/api/payments/downtime',
      '/api/payments/recover',
      '/api/loans/offers/:loanType',
      '/api/admin/users',
      '/api/admin/banks/:bankName'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
