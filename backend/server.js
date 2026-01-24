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
const JWT_SECRET = process.env.JWT_SECRET || 'dpay-secret-key-2024';

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
let BANK_SERVER_STATUS = {
  "State Bank of India (SBI)": { status: "active", lastChecked: new Date(), responseTime: "120ms" },
  "HDFC Bank": { status: "active", lastChecked: new Date(), responseTime: "95ms" },
  "ICICI Bank": { status: "active", lastChecked: new Date(), responseTime: "110ms" },
  "Axis Bank": { status: "active", lastChecked: new Date(), responseTime: "85ms" },
  "Kotak Mahindra Bank": { status: "active", lastChecked: new Date(), responseTime: "105ms" },
  "Punjab National Bank (PNB)": { status: "active", lastChecked: new Date(), responseTime: "130ms" },
  "Bank of Baroda": { status: "active", lastChecked: new Date(), responseTime: "100ms" },
  "Canara Bank": { status: "active", lastChecked: new Date(), responseTime: "115ms" },
  "Union Bank of India": { status: "active", lastChecked: new Date(), responseTime: "125ms" },
  "Bank of India": { status: "active", lastChecked: new Date(), responseTime: "90ms" },
  "IndusInd Bank": { status: "active", lastChecked: new Date(), responseTime: "75ms" },
  "IDFC First Bank": { status: "active", lastChecked: new Date(), responseTime: "105ms" },
  "Yes Bank": { status: "active", lastChecked: new Date(), responseTime: "95ms" },
  "Federal Bank": { status: "active", lastChecked: new Date(), responseTime: "85ms" },
  "Indian Bank": { status: "active", lastChecked: new Date(), responseTime: "115ms" },
  "Central Bank of India": { status: "active", lastChecked: new Date(), responseTime: "140ms" },
  "Indian Overseas Bank": { status: "active", lastChecked: new Date(), responseTime: "80ms" },
  "UCO Bank": { status: "active", lastChecked: new Date(), responseTime: "150ms" },
  "Bandhan Bank": { status: "active", lastChecked: new Date(), responseTime: "88ms" },
  "IDBI Bank": { status: "active", lastChecked: new Date(), responseTime: "125ms" }
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
  balance: { type: Number, default: 10000.00 },
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
  category: { type: String, enum: ['payment', 'mobile_recharge', 'bill_payment', 'other'], default: 'payment' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
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

// Update Bank Status (Admin only)
app.post('/api/admin/update-bank-status', verifyToken, async (req, res) => {
  try {
    const { bankName, status } = req.body;
    
    // Verify admin - mobile number 7825007490
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.mobile !== '7825007490') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    if (!BANK_SERVER_STATUS[bankName]) {
      return res.status(404).json({ success: false, message: 'Bank not found' });
    }
    
    BANK_SERVER_STATUS[bankName] = {
      status: status,
      lastChecked: new Date(),
      responseTime: status === 'active' ? `${Math.floor(Math.random() * 150) + 50}ms` : 
                   status === 'slow' ? `${Math.floor(Math.random() * 500) + 300}ms` : 
                   'Timeout'
    };
    
    res.json({ 
      success: true, 
      message: `Bank status updated to ${status}`,
      status: BANK_SERVER_STATUS[bankName]
    });
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
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // For demo, just return the OTP
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp,
      identifier: mobile || email
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    
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
    
    // For demo, accept any OTP
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
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
        message: 'All required fields must be filled' 
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
      balance: 10000.00,
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

// Find user by UPI or mobile
app.post('/api/users/find', async (req, res) => {
  try {
    const { upiId, mobile } = req.body;
    
    let user;
    if (upiId) {
      user = await User.findOne({ upiId, isActive: true }).select('-upiPin');
    } else if (mobile) {
      user = await User.findOne({ mobile, isActive: true }).select('-upiPin');
    } else {
      return res.status(400).json({ success: false, message: 'UPI ID or Mobile is required.' });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Find user error:', error);
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
    const { userId, type, amount, description, receiverDetails, senderBank, receiverBank, category, status } = req.body;
    
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
      category,
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
    const { userId, amount, description, receiverDetails, category, upiPin } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Get sender
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
    
    // Check bank status
    const senderBankStatus = BANK_SERVER_STATUS[sender.bankName];
    const receiverBankStatus = BANK_SERVER_STATUS[receiverDetails?.bankName];
    
    // Case 1: Sender's bank is down - use app balance
    if (senderBankStatus.status !== 'active') {
      // Deduct from app balance (negative)
      sender.appBalance -= amount;
      await sender.save();
      
      // Create transaction
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        description: `${description} (Bank Down - App Balance Used)`,
        receiverDetails,
        senderBank: sender.bankName,
        receiverBank: receiverDetails?.bankName,
        category: category || 'payment',
        status: 'completed'
      });
      
      await transaction.save();
      
      return res.json({
        success: true,
        message: 'Payment processed using app balance (bank down).',
        transaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    
    // Case 2: Normal transaction
    // Deduct from sender
    sender.balance -= amount;
    await sender.save();
    
    // Find receiver and credit amount
    let receiver = null;
    if (receiverDetails?.upi) {
      receiver = await User.findOne({ upiId: receiverDetails.upi });
    } else if (receiverDetails?.mobile) {
      receiver = await User.findOne({ mobile: receiverDetails.mobile });
    }
    
    if (receiver) {
      // Credit to receiver
      receiver.balance += amount;
      await receiver.save();
      
      // Create receiver transaction
      const receiverTransaction = new Transaction({
        userId: receiver._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        receiverDetails: {
          name: sender.username,
          upi: sender.upiId,
          bankName: sender.bankName
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        category: category || 'payment',
        status: 'completed'
      });
      
      await receiverTransaction.save();
    }
    
    // Create sender transaction
    const senderTransaction = new Transaction({
      userId,
      type: 'debit',
      amount,
      description,
      receiverDetails,
      senderBank: sender.bankName,
      receiverBank: receiverDetails?.bankName,
      category: category || 'payment',
      status: 'completed'
    });
    
    await senderTransaction.save();
    
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

// Recover app balance when bank is active
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
    
    // Check if bank is active and app balance is negative
    const bankStatus = BANK_SERVER_STATUS[user.bankName];
    
    if (bankStatus.status === 'active' && user.appBalance < 0) {
      const recoveryAmount = Math.abs(user.appBalance);
      
      // Check if user has enough balance
      if (user.balance >= recoveryAmount) {
        // Recover from bank balance
        user.balance -= recoveryAmount;
        user.appBalance = 0;
        await user.save();
        
        // Create recovery transaction
        const transaction = new Transaction({
          userId,
          type: 'debit',
          amount: recoveryAmount,
          description: 'App Balance Recovery',
          category: 'other',
          status: 'completed'
        });
        
        await transaction.save();
        
        return res.json({
          success: true,
          message: `Recovered ₹${recoveryAmount} from bank balance`,
          newBalance: user.balance,
          newAppBalance: user.appBalance
        });
      }
    }
    
    res.json({
      success: false,
      message: 'No recovery needed or insufficient balance'
    });
    
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin Routes
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    // Verify admin - mobile number 7825007490
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.mobile !== '7825007490') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    
    const users = await User.find({ isActive: true }).select('-upiPin');
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/admin/users/:id', verifyToken, async (req, res) => {
  try {
    // Verify admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.mobile !== '7825007490') {
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
    ).select('-upiPin');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Update user by admin error:', error);
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
      '/api/auth/send-otp',
      '/api/auth/login',
      '/api/auth/register',
      '/api/users/:id',
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
