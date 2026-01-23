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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dpay', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

// Check bank server status
const checkBankServerStatus = (bankName) => {
  const bankStatus = BANK_SERVER_STATUS[bankName];
  if (!bankStatus) return { status: 'unknown', isActive: false };
  
  return {
    ...bankStatus,
    isActive: bankStatus.status === 'active'
  };
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
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receiverDetails: { type: Object },
  senderBank: { type: String },
  receiverBank: { type: String },
  category: { type: String, enum: ['payment', 'mobile_recharge', 'bill_payment', 'reward', 'other'], default: 'payment' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// OTP Storage for demo
const otpStore = new Map();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
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
const isAdmin = (mobile) => {
  return mobile === '7825007490';
};

// Routes

// Bank Status API
app.get('/api/banks/status', (req, res) => {
  res.json({ success: true, status: BANK_SERVER_STATUS });
});

// Send OTP API
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = mobile || email;
    
    // Store OTP (in production, send via SMS/Email)
    otpStore.set(identifier, { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 minutes
    
    // For demo, just return the OTP
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp // In production, don't return OTP
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const stored = otpStore.get(identifier);
  if (!stored) return false;
  
  // Check if OTP is expired
  if (Date.now() > stored.expires) {
    otpStore.delete(identifier);
    return false;
  }
  
  // Check if OTP matches
  if (stored.otp === otp) {
    otpStore.delete(identifier);
    return true;
  }
  
  return false;
};

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
        upiPin: newUser.upiPin,
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
    if (mobile) {
      user = await User.findOne({ mobile, isActive: true });
    } else if (email) {
      user = await User.findOne({ email, isActive: true });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // Verify OTP
    const identifier = mobile || email;
    if (!verifyOTP(identifier, otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
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
    
    if (req.user.userId !== userId && !isAdmin(req.user.mobile)) {
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

// Search user by UPI, mobile, or email
app.get('/api/users/search/:query', verifyToken, async (req, res) => {
  try {
    const query = req.params.query;
    
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

app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (req.user.userId !== userId && !isAdmin(req.user.mobile)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const updates = req.body;
    
    // Don't allow updating certain fields unless admin
    if (!isAdmin(req.user.mobile)) {
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
    }
    
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

// Transaction Routes
app.get('/api/transactions/user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId && !isAdmin(req.user.mobile)) {
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
    const { userId, type, amount, description, receiverDetails, category, status } = req.body;
    
    if (req.user.userId !== userId && !isAdmin(req.user.mobile)) {
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
      senderBank: user.bankName,
      receiverBank: receiverDetails?.bankName || 'Unknown',
      category: category || 'payment',
      status: status || 'completed'
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
    const { userId, amount, description, receiverDetails, upiPin, senderBank, receiverBank } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get sender
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Sender not found.' });
    }
    
    // Verify UPI PIN
    if (sender.upiPin !== upiPin) {
      return res.status(400).json({ success: false, message: 'Invalid UPI PIN.' });
    }
    
    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }
    
    // Find receiver
    const receiver = await User.findOne({
      $or: [
        { upiId: receiverDetails.upi },
        { mobile: receiverDetails.mobile },
        { _id: receiverDetails.userId }
      ],
      isActive: true
    });
    
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    // Check bank status
    const senderBankStatus = checkBankServerStatus(senderBank || sender.bankName);
    const receiverBankStatus = checkBankServerStatus(receiverBank || receiver.bankName);
    
    // Case 1: Sender's bank is down
    if (!senderBankStatus.isActive && receiverBankStatus.isActive) {
      // Deduct from sender's app balance (make it negative)
      sender.appBalance = (sender.appBalance || 0) - amount;
      
      // Add to receiver's balance
      receiver.balance = (receiver.balance || 0) + amount;
      
      // Create transaction for sender (debit)
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced - Bank Down)`,
        receiverDetails: {
          name: receiver.username,
          upi: receiver.upiId,
          mobile: receiver.mobile,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        category: 'payment',
        status: 'completed'
      });
      
      // Create transaction for receiver (credit)
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        receiverId: sender._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        receiverDetails: {
          name: sender.username,
          upi: sender.upiId,
          mobile: sender.mobile,
          bankName: sender.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        category: 'payment',
        status: 'completed'
      });
      
      await Promise.all([
        sender.save(),
        receiver.save(),
        senderTransaction.save(),
        receiverTransaction.save()
      ]);
      
      return res.json({
        success: true,
        message: 'Payment processed with DPay advance (sender bank down).',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    
    // Case 2: Receiver's bank is down
    if (senderBankStatus.isActive && !receiverBankStatus.isActive) {
      // Deduct from sender's balance
      sender.balance -= amount;
      
      // Add to receiver's app balance (negative for them, means DPay is holding)
      receiver.appBalance = (receiver.appBalance || 0) - amount;
      
      // Create transaction for sender (debit)
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Holding - Receiver Bank Down)`,
        receiverDetails: {
          name: receiver.username,
          upi: receiver.upiId,
          mobile: receiver.mobile,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        category: 'payment',
        status: 'completed'
      });
      
      await Promise.all([
        sender.save(),
        receiver.save(),
        senderTransaction.save()
      ]);
      
      return res.json({
        success: true,
        message: 'Payment processed with DPay hold (receiver bank down).',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    
    // Case 3: Both banks are down
    if (!senderBankStatus.isActive && !receiverBankStatus.isActive) {
      // Deduct from sender's app balance
      sender.appBalance = (sender.appBalance || 0) - amount;
      
      // Add to receiver's app balance (negative)
      receiver.appBalance = (receiver.appBalance || 0) - amount;
      
      // Create transaction for sender (debit)
      const senderTransaction = new Transaction({
        userId: sender._id,
        receiverId: receiver._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced & Holding - Both Banks Down)`,
        receiverDetails: {
          name: receiver.username,
          upi: receiver.upiId,
          mobile: receiver.mobile,
          bankName: receiver.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        category: 'payment',
        status: 'completed'
      });
      
      await Promise.all([
        sender.save(),
        receiver.save(),
        senderTransaction.save()
      ]);
      
      return res.json({
        success: true,
        message: 'Payment processed with DPay advance and hold (both banks down).',
        transaction: senderTransaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    
    // Normal case: Both banks are active
    // Deduct from sender's balance
    sender.balance -= amount;
    
    // Add to receiver's balance
    receiver.balance = (receiver.balance || 0) + amount;
    
    // Create transaction for sender (debit)
    const senderTransaction = new Transaction({
      userId: sender._id,
      receiverId: receiver._id,
      type: 'debit',
      amount,
      description,
      receiverDetails: {
        name: receiver.username,
        upi: receiver.upiId,
        mobile: receiver.mobile,
        bankName: receiver.bankName
      },
      senderBank: sender.bankName,
      receiverBank: receiver.bankName,
      category: 'payment',
      status: 'completed'
    });
    
    // Create transaction for receiver (credit)
    const receiverTransaction = new Transaction({
      userId: receiver._id,
      receiverId: sender._id,
      type: 'credit',
      amount,
      description: `Received from ${sender.username}`,
      receiverDetails: {
        name: sender.username,
        upi: sender.upiId,
        mobile: sender.mobile,
        bankName: sender.bankName
      },
      senderBank: sender.bankName,
      receiverBank: receiver.bankName,
      category: 'payment',
      status: 'completed'
    });
    
    await Promise.all([
      sender.save(),
      receiver.save(),
      senderTransaction.save(),
      receiverTransaction.save()
    ]);
    
    res.json({
      success: true,
      message: 'Payment processed successfully.',
      transaction: senderTransaction,
      newBalance: sender.balance,
      newAppBalance: sender.appBalance
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin Routes
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user.mobile)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    const users = await User.find({ isActive: true })
      .select('-upiPin')
      .sort({ registrationDate: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/admin/update-bank-status', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user.mobile)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    const { bankName, status } = req.body;
    
    if (!bankName || !status) {
      return res.status(400).json({ success: false, message: 'Bank name and status are required.' });
    }
    
    if (!BANK_SERVER_STATUS[bankName]) {
      return res.status(404).json({ success: false, message: 'Bank not found.' });
    }
    
    // Update bank status
    BANK_SERVER_STATUS[bankName] = {
      ...BANK_SERVER_STATUS[bankName],
      status,
      lastChecked: new Date(),
      responseTime: status === 'active' ? '100ms' : status === 'slow' ? '400ms' : 'Timeout'
    };
    
    res.json({
      success: true,
      message: 'Bank status updated successfully.',
      bankName,
      status: BANK_SERVER_STATUS[bankName]
    });
  } catch (error) {
    console.error('Update bank status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/admin/users/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user.mobile)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
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
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/send-otp',
      '/api/users/:id',
      '/api/users/search/:query',
      '/api/transactions/user/:userId',
      '/api/payments/process',
      '/api/admin/users',
      '/api/admin/update-bank-status'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
