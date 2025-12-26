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

// OTP Storage (in production, use Redis or similar)
const otpStore = new Map();

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
  "Bank of India": { status: "active", lastChecked: new Date(), responseTime: "90ms" }
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

// OTP Schema
const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  method: { type: String, enum: ['mobile', 'email'], required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

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

// Admin middleware (only for mobile: 7825007490)
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.mobile !== '7825007490') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'DPay API',
    version: '1.0.0'
  });
});

// Bank Status API
app.get('/api/banks/status', (req, res) => {
  const bankName = req.query.bank;
  
  if (bankName) {
    const status = BANK_SERVER_STATUS[bankName] || { status: 'unknown', lastChecked: new Date(), responseTime: 'N/A' };
    res.json({ success: true, bankName, status });
  } else {
    res.json({ success: true, status: BANK_SERVER_STATUS });
  }
});

// Admin: Update bank status
app.post('/api/admin/banks/status', verifyToken, verifyAdmin, (req, res) => {
  try {
    const { bankName, status } = req.body;
    
    if (!bankName || !status) {
      return res.status(400).json({ success: false, message: 'Bank name and status are required.' });
    }
    
    if (!BANK_SERVER_STATUS[bankName]) {
      return res.status(404).json({ success: false, message: 'Bank not found.' });
    }
    
    BANK_SERVER_STATUS[bankName] = {
      ...BANK_SERVER_STATUS[bankName],
      status: status,
      lastChecked: new Date(),
      responseTime: status === 'active' ? '120ms' : 
                   status === 'slow' ? '450ms' : 'Timeout'
    };
    
    res.json({ success: true, message: 'Bank status updated successfully.', status: BANK_SERVER_STATUS[bankName] });
  } catch (error) {
    console.error('Update bank status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Auth Routes
// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    const method = mobile ? 'mobile' : 'email';
    const identifier = mobile || email;
    
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to database
    await OTP.findOneAndDelete({ identifier });
    await OTP.create({
      identifier,
      otp,
      method,
      expiresAt
    });
    
    // In production, send OTP via SMS or Email
    console.log(`OTP for ${identifier}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully.',
      otp: otp // For demo purposes only, remove in production
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Verify OTP and Login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    const method = mobile ? 'mobile' : 'email';
    const identifier = mobile || email;
    
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Identifier and OTP are required.' });
    }
    
    // Find OTP
    const otpRecord = await OTP.findOne({ 
      identifier, 
      method 
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired.' });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }
    
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    
    // Find or create user
    let user = await User.findOne({ 
      [method]: identifier,
      isActive: true 
    });
    
    // For demo: Create user if not exists (for testing)
    if (!user && method === 'mobile') {
      // Generate random username
      const username = `User${Math.floor(Math.random() * 10000)}`;
      const email = `${username.toLowerCase()}@example.com`;
      
      user = new User({
        username,
        email,
        mobile: identifier,
        panNumber: 'ABCDE1234F',
        bankName: 'HDFC Bank',
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        atmCardNumber: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
        upiPin: '1234',
        balance: 1000.00,
        appBalance: 0
      });
      
      await user.save();
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // Delete used OTP
    await OTP.findByIdAndDelete(otpRecord._id);
    
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
        upiPin: user.upiPin, // For demo only
        photo: user.photo,
        dob: user.dob,
        registrationDate: user.registrationDate
      },
      token
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

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

// Find user by UPI ID
app.get('/api/users/upi/:upiId', verifyToken, async (req, res) => {
  try {
    const upiId = req.params.upiId;
    
    const user = await User.findOne({ upiId, isActive: true }).select('-upiPin');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Find user by UPI error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Find user by mobile
app.get('/api/users/mobile/:mobile', verifyToken, async (req, res) => {
  try {
    const mobile = req.params.mobile;
    
    const user = await User.findOne({ mobile, isActive: true }).select('-upiPin');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Find user by mobile error:', error);
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
    
    // Delete user and all associated data
    await User.findByIdAndDelete(userId);
    await Transaction.deleteMany({ userId });
    
    res.json({ success: true, message: 'Account and all data deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin Routes
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-upiPin').sort({ registrationDate: -1 });
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

// Check bank server status
const checkBankServerStatus = (bankName) => {
  const bankStatus = BANK_SERVER_STATUS[bankName];
  if (!bankStatus) return { isActive: false, status: 'unknown' };
  
  return {
    isActive: bankStatus.status === 'active',
    status: bankStatus.status
  };
};

// Payment processing with downtime handling
app.post('/api/payments/downtime', verifyToken, async (req, res) => {
  try {
    const { userId, amount, description, receiverDetails, category, upiPin } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get sender user
    const senderUser = await User.findById(userId);
    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'Sender not found.' });
    }
    
    // Verify UPI PIN
    if (upiPin !== senderUser.upiPin) {
      return res.status(400).json({ success: false, message: 'Invalid UPI PIN.' });
    }
    
    // Get receiver user
    let receiverUser;
    if (receiverDetails.upi) {
      receiverUser = await User.findOne({ upiId: receiverDetails.upi, isActive: true });
    } else if (receiverDetails.mobile) {
      receiverUser = await User.findOne({ mobile: receiverDetails.mobile, isActive: true });
    } else if (receiverDetails.receiverId) {
      receiverUser = await User.findById(receiverDetails.receiverId);
    }
    
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    // Check bank server status
    const senderBankStatus = checkBankServerStatus(senderUser.bankName);
    const receiverBankStatus = checkBankServerStatus(receiverUser.bankName);
    
    // Case 1: Sender's bank is down
    if (!senderBankStatus.isActive && receiverBankStatus.isActive) {
      // DPay advances the payment
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced - Sender Bank Down)`,
        receiverDetails: {
          ...receiverDetails,
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        senderBankStatus: senderBankStatus.status,
        receiverBankStatus: receiverBankStatus.status,
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
      
      // Update sender app balance (negative)
      senderUser.appBalance = (senderUser.appBalance || 0) - amount;
      
      // Add to pending transactions for recovery
      senderUser.pendingTransactions.push({
        transactionId: transaction._id,
        amount,
        description,
        receiverDetails: {
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        status: 'pending',
        metadata: {
          type: 'sender_bank_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      await senderUser.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced by DPay due to sender bank downtime.',
        transaction,
        newBalance: senderUser.balance,
        newAppBalance: senderUser.appBalance
      });
    }
    
    // Case 2: Receiver's bank is down
    else if (senderBankStatus.isActive && !receiverBankStatus.isActive) {
      // Check sender balance
      if (senderUser.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      // Deduct from sender
      senderUser.balance -= amount;
      
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (DPay Holding - Receiver Bank Down)`,
        receiverDetails: {
          ...receiverDetails,
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        senderBankStatus: senderBankStatus.status,
        receiverBankStatus: receiverBankStatus.status,
        category: category || 'payment',
        status: 'held_by_dpay',
        metadata: {
          downtimeHandled: true,
          receiverBankDown: true,
          amountHeldByDPay: true,
          timestamp: new Date()
        }
      });
      
      await transaction.save();
      
      // Add to pending transactions for recovery
      senderUser.pendingTransactions.push({
        transactionId: transaction._id,
        amount,
        description,
        receiverDetails: {
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        status: 'pending',
        metadata: {
          type: 'receiver_bank_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      await senderUser.save();
      
      return res.json({
        success: true,
        message: 'Payment held by DPay due to receiver bank downtime.',
        transaction,
        newBalance: senderUser.balance,
        newAppBalance: senderUser.appBalance
      });
    }
    
    // Case 3: Both banks are down
    else if (!senderBankStatus.isActive && !receiverBankStatus.isActive) {
      // DPay advances and holds the payment
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced & Holding - Both Banks Down)`,
        receiverDetails: {
          ...receiverDetails,
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        senderBankStatus: senderBankStatus.status,
        receiverBankStatus: receiverBankStatus.status,
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
      
      await transaction.save();
      
      // Update sender app balance (negative)
      senderUser.appBalance = (senderUser.appBalance || 0) - amount;
      
      // Add to pending transactions for recovery
      senderUser.pendingTransactions.push({
        transactionId: transaction._id,
        amount,
        description,
        receiverDetails: {
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        status: 'pending',
        metadata: {
          type: 'both_banks_down',
          recovered: false,
          recoveryAttempts: 0
        }
      });
      
      await senderUser.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced and held by DPay due to both banks downtime.',
        transaction,
        newBalance: senderUser.balance,
        newAppBalance: senderUser.appBalance
      });
    }
    
    // Normal case: Both banks are active
    else {
      // Check balance
      if (senderUser.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      // Process normal payment
      senderUser.balance -= amount;
      receiverUser.balance += amount;
      
      // Create transaction for sender
      const senderTransaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description,
        receiverDetails: {
          ...receiverDetails,
          receiverId: receiverUser._id,
          receiverName: receiverUser.username,
          receiverBank: receiverUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          normalTransaction: true,
          timestamp: new Date()
        }
      });
      
      // Create transaction for receiver
      const receiverTransaction = new Transaction({
        userId: receiverUser._id,
        type: 'credit',
        amount,
        description: `Received from ${senderUser.username}`,
        receiverDetails: {
          senderId: senderUser._id,
          senderName: senderUser.username,
          senderBank: senderUser.bankName
        },
        senderBank: senderUser.bankName,
        receiverBank: receiverUser.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category: 'payment',
        status: 'completed',
        metadata: {
          normalTransaction: true,
          timestamp: new Date()
        }
      });
      
      await senderTransaction.save();
      await receiverTransaction.save();
      await senderUser.save();
      await receiverUser.save();
      
      return res.json({
        success: true,
        message: 'Payment processed successfully.',
        transaction: senderTransaction,
        newBalance: senderUser.balance,
        newAppBalance: senderUser.appBalance
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
          // Deduct from user's bank balance (since DPay advanced it earlier)
          if (user.balance >= pendingTx.amount) {
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount; // Recover app balance
            
            // Update original transaction
            await Transaction.findByIdAndUpdate(pendingTx.transactionId, {
              status: 'completed',
              metadata: {
                ...metadata,
                recovered: true,
                recoveryDate: new Date()
              }
            });
            
            // Find receiver and credit the amount
            const receiverUser = await User.findById(pendingTx.receiverDetails.receiverId);
            if (receiverUser) {
              receiverUser.balance += pendingTx.amount;
              
              // Create transaction for receiver
              const receiverTransaction = new Transaction({
                userId: receiverUser._id,
                type: 'credit',
                amount: pendingTx.amount,
                description: `Recovered payment from ${user.username}`,
                receiverDetails: {
                  senderId: user._id,
                  senderName: user.username,
                  senderBank: pendingTx.senderBank
                },
                senderBank: pendingTx.senderBank,
                receiverBank: pendingTx.receiverBank,
                senderBankStatus: 'active',
                receiverBankStatus: 'active',
                category: 'payment',
                status: 'completed',
                metadata: {
                  recovery: true,
                  originalTransactionId: pendingTx.transactionId,
                  timestamp: new Date()
                }
              });
              
              await receiverTransaction.save();
              await receiverUser.save();
            }
            
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
          // Amount was already deducted from sender, now credit to receiver
          const receiverUser = await User.findById(pendingTx.receiverDetails.receiverId);
          if (receiverUser) {
            receiverUser.balance += pendingTx.amount;
            
            // Update original transaction
            await Transaction.findByIdAndUpdate(pendingTx.transactionId, {
              status: 'completed',
              metadata: {
                ...metadata,
                recovered: true,
                recoveryDate: new Date()
              }
            });
            
            // Create transaction for receiver
            const receiverTransaction = new Transaction({
              userId: receiverUser._id,
              type: 'credit',
              amount: pendingTx.amount,
              description: `Recovered payment from ${user.username}`,
              receiverDetails: {
                senderId: user._id,
                senderName: user.username,
                senderBank: pendingTx.senderBank
              },
              senderBank: pendingTx.senderBank,
              receiverBank: pendingTx.receiverBank,
              senderBankStatus: 'active',
              receiverBankStatus: 'active',
              category: 'payment',
              status: 'completed',
              metadata: {
                recovery: true,
                originalTransactionId: pendingTx.transactionId,
                timestamp: new Date()
              }
            });
            
            await receiverTransaction.save();
            await receiverUser.save();
            
            recoveredTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              type: 'receiver_bank_recovery'
            });
          } else {
            failedTransactions.push({
              transactionId: pendingTx.transactionId,
              amount: pendingTx.amount,
              reason: 'Receiver not found'
            });
          }
        }
        else if (metadata.type === 'both_banks_down') {
          // Both banks down case: deduct from sender's balance and credit to receiver
          if (user.balance >= pendingTx.amount) {
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount;
            
            const receiverUser = await User.findById(pendingTx.receiverDetails.receiverId);
            if (receiverUser) {
              receiverUser.balance += pendingTx.amount;
              
              // Update original transaction
              await Transaction.findByIdAndUpdate(pendingTx.transactionId, {
                status: 'completed',
                metadata: {
                  ...metadata,
                  recovered: true,
                  recoveryDate: new Date()
                }
              });
              
              // Create transaction for receiver
              const receiverTransaction = new Transaction({
                userId: receiverUser._id,
                type: 'credit',
                amount: pendingTx.amount,
                description: `Recovered payment from ${user.username}`,
                receiverDetails: {
                  senderId: user._id,
                  senderName: user.username,
                  senderBank: pendingTx.senderBank
                },
                senderBank: pendingTx.senderBank,
                receiverBank: pendingTx.receiverBank,
                senderBankStatus: 'active',
                receiverBankStatus: 'active',
                category: 'payment',
                status: 'completed',
                metadata: {
                  recovery: true,
                  originalTransactionId: pendingTx.transactionId,
                  timestamp: new Date()
                }
              });
              
              await receiverTransaction.save();
              await receiverUser.save();
              
              recoveredTransactions.push({
                transactionId: pendingTx.transactionId,
                amount: pendingTx.amount,
                type: 'both_banks_recovery'
              });
            } else {
              failedTransactions.push({
                transactionId: pendingTx.transactionId,
                amount: pendingTx.amount,
                reason: 'Receiver not found'
              });
            }
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DPay API is working!',
    endpoints: [
      '/api/health',
      '/api/auth/send-otp',
      '/api/auth/verify-otp',
      '/api/auth/register',
      '/api/users/:id',
      '/api/transactions/user/:userId',
      '/api/payments/downtime',
      '/api/admin/users',
      '/api/admin/banks/status'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
