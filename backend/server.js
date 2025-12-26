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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
  "Bank of India": { status: "active", lastChecked: new Date(), responseTime: "90ms" }
};

// OTP storage
const otpStore = new Map();

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
  isActive: { type: Boolean, default: true }
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

// Helper Functions
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

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// JWT Verification Middleware
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

// Check if user is admin
const isAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Check if mobile is 7825007490
    User.findById(decoded.userId).then(user => {
      if (user && user.mobile === '7825007490') {
        req.admin = user;
        next();
      } else {
        return res.status(403).json({ success: false, message: 'Admin access only.' });
      }
    }).catch(err => {
      return res.status(403).json({ success: false, message: 'Admin access only.' });
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

// Routes

// Generate OTP
app.post('/api/auth/generate-otp', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    const identifier = mobile || email;
    const method = mobile ? 'mobile' : 'email';
    
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp (valid for 5 minutes)
    otpStore.set(identifier, {
      otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    console.log(`OTP for ${identifier}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP generated successfully.',
      otp // In production, send via SMS/Email
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const otpData = otpStore.get(identifier);
  if (!otpData) return false;
  
  // Check if OTP is expired
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(identifier);
    return false;
  }
  
  // Verify OTP
  if (otpData.otp === otp) {
    otpStore.delete(identifier);
    return true;
  }
  
  return false;
};

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    const identifier = mobile || email;
    const method = mobile ? 'mobile' : 'email';
    
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Identifier and OTP are required.' });
    }
    
    // Verify OTP
    if (!verifyOTP(identifier, otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    
    // Find user
    let user;
    if (method === 'mobile') {
      user = await User.findOne({ mobile: identifier });
    } else {
      user = await User.findOne({ email: identifier });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register.' });
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
        upiPin: user.upiPin,
        photo: user.photo,
        dob: user.dob,
        registrationDate: user.registrationDate
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, mobile, panNumber, dob, bankName, accountNumber, atmCardNumber, upiPin, referralCode, photo } = req.body;
    
    // Validate required fields
    if (!username || !email || !mobile || !panNumber || !bankName || !accountNumber || !atmCardNumber || !upiPin) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled.' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or Mobile already registered.' 
      });
    }
    
    // Generate credit score
    const creditScore = Math.floor(Math.random() * 200) + 650;
    
    // Create user
    const user = new User({
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
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
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
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Get user profile
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
    
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Lookup user by UPI or mobile
app.get('/api/users/lookup/:identifier', verifyToken, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    
    let user;
    if (identifier.includes('@')) {
      // Lookup by UPI ID
      user = await User.findOne({ upiId: identifier });
    } else {
      // Lookup by mobile
      user = await User.findOne({ mobile: identifier });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Return limited info
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        mobile: user.mobile,
        email: user.email,
        upiId: user.upiId,
        bankName: user.bankName,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Get transactions
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
    const { userId, type, amount, description, receiverDetails, senderBank, receiverBank, senderBankStatus, receiverBankStatus, category, status, metadata } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const transaction = new Transaction({
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
      status,
      metadata
    });
    
    await transaction.save();
    
    res.status(201).json({
      success: true,
      message: 'Transaction created.',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Process QR code
app.post('/api/payments/process-qr', verifyToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR data (UPI format)
    const params = new URLSearchParams(qrData.split('?')[1]);
    const upiId = params.get('pa');
    const name = decodeURIComponent(params.get('pn') || 'Unknown');
    const amount = params.get('am');
    
    // Find receiver
    const receiver = await User.findOne({ upiId });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    res.json({
      success: true,
      receiver: {
        _id: receiver._id,
        username: receiver.username,
        mobile: receiver.mobile,
        upiId: receiver.upiId,
        bankName: receiver.bankName
      },
      amount: amount || null
    });
  } catch (error) {
    console.error('Process QR error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Payment with downtime handling
app.post('/api/payments/downtime', verifyToken, async (req, res) => {
  try {
    const { userId, amount, description, receiverDetails, category, upiPin, senderBankStatus, receiverBankStatus } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get sender and receiver
    const sender = await User.findById(userId);
    const receiver = await User.findOne({ 
      $or: [
        { upiId: receiverDetails?.upiId },
        { mobile: receiverDetails?.mobile }
      ] 
    });
    
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Sender not found.' });
    }
    
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    // Verify UPI PIN
    if (upiPin !== sender.upiPin) {
      return res.status(400).json({ success: false, message: 'Invalid UPI PIN.' });
    }
    
    // Check bank status
    const senderBankActive = BANK_SERVER_STATUS[sender.bankName]?.status === 'active';
    const receiverBankActive = BANK_SERVER_STATUS[receiver.bankName]?.status === 'active';
    
    let transaction;
    let message = '';
    
    if (!senderBankActive && receiverBankActive) {
      // Case 1: Sender's bank down
      sender.appBalance -= amount;
      message = 'Payment advanced by DPay due to sender bank downtime.';
      
      transaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced)`,
        receiverDetails: {
          userId: receiver._id,
          username: receiver.username,
          upiId: receiver.upiId,
          mobile: receiver.mobile
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'active',
        category,
        status: 'completed',
        metadata: { downtimeHandled: true, senderBankDown: true }
      });
      
      // Also credit receiver
      receiver.balance += amount;
      await receiver.save();
      
    } else if (senderBankActive && !receiverBankActive) {
      // Case 2: Receiver's bank down
      if (sender.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      sender.balance -= amount;
      message = 'Payment held by DPay due to receiver bank downtime.';
      
      transaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Holding)`,
        receiverDetails: {
          userId: receiver._id,
          username: receiver.username,
          upiId: receiver.upiId,
          mobile: receiver.mobile
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'down',
        category,
        status: 'held_by_dpay',
        metadata: { downtimeHandled: true, receiverBankDown: true }
      });
      
    } else if (!senderBankActive && !receiverBankActive) {
      // Case 3: Both banks down
      sender.appBalance -= amount;
      message = 'Payment advanced and held by DPay due to both banks downtime.';
      
      transaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced & Holding)`,
        receiverDetails: {
          userId: receiver._id,
          username: receiver.username,
          upiId: receiver.upiId,
          mobile: receiver.mobile
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'down',
        receiverBankStatus: 'down',
        category,
        status: 'held_by_dpay',
        metadata: { downtimeHandled: true, bothBanksDown: true }
      });
      
    } else {
      // Case 4: Both banks active (normal transaction)
      if (sender.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      sender.balance -= amount;
      receiver.balance += amount;
      
      message = 'Payment processed successfully.';
      
      transaction = new Transaction({
        userId: sender._id,
        type: 'debit',
        amount,
        description,
        receiverDetails: {
          userId: receiver._id,
          username: receiver.username,
          upiId: receiver.upiId,
          mobile: receiver.mobile
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category,
        status: 'completed',
        metadata: { normalTransaction: true }
      });
      
      await receiver.save();
      
      // Also create credit transaction for receiver
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        senderDetails: {
          userId: sender._id,
          username: sender.username,
          upiId: sender.upiId,
          mobile: sender.mobile
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category,
        status: 'completed',
        metadata: { normalTransaction: true }
      });
      
      await receiverTransaction.save();
    }
    
    // Save transaction and update sender
    await transaction.save();
    await sender.save();
    
    res.json({
      success: true,
      message,
      transaction,
      newBalance: sender.balance,
      newAppBalance: sender.appBalance
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Bank Status APIs
app.get('/api/banks/status', (req, res) => {
  res.json({ success: true, status: BANK_SERVER_STATUS });
});

app.put('/api/banks/status/:bankName', isAdmin, (req, res) => {
  try {
    const { bankName } = req.params;
    const { status } = req.body;
    
    if (!BANK_SERVER_STATUS[bankName]) {
      return res.status(404).json({ success: false, message: 'Bank not found.' });
    }
    
    BANK_SERVER_STATUS[bankName] = {
      ...BANK_SERVER_STATUS[bankName],
      status,
      lastChecked: new Date(),
      responseTime: status === 'active' ? '100ms' : 
                   status === 'slow' ? '400ms' : 'Timeout'
    };
    
    res.json({ success: true, message: 'Bank status updated.', status: BANK_SERVER_STATUS[bankName] });
  } catch (error) {
    console.error('Update bank status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin APIs
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-upiPin').sort({ registrationDate: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates._id;
    delete updates.registrationDate;
    delete updates.upiId;
    delete updates.referralCode;
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User updated.', user });
  } catch (error) {
    console.error('Admin update user error:', error);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
