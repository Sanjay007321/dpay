const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check bank server status
const checkBankServerStatus = (bankName) => {
  const bankStatus = BANK_SERVER_STATUS[bankName];
  if (!bankStatus) return { status: 'unknown', lastChecked: new Date(), responseTime: 'N/A', isActive: false };
  
  return {
    ...bankStatus,
    isActive: bankStatus.status === 'active'
  };
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
  isActive: { type: Boolean, default: true }
});

userSchema.pre('save', function(next) {
  if (!this.upiId) {
    const cleanUsername = this.username.toLowerCase().replace(/\s+/g, '');
    const last4Mobile = this.mobile.slice(-4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.upiId = `${cleanUsername}${last4Mobile}${randomNum}@dpay`;
  }
  if (!this.referralCode) {
    const cleanUsername = this.username.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    this.referralCode = `DP${cleanUsername}${randomNum}`;
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
  category: { type: String, enum: ['payment', 'mobile_recharge', 'bill_payment', 'loan', 'reward', 'other'], default: 'payment' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'held_by_dpay'], default: 'pending' },
  metadata: { type: Object },
  isRecovery: { type: Boolean, default: false },
  originalTransactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// OTP Store for temporary storage
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

// Admin middleware
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    // Check if user is admin (mobile number 7825007490)
    if (req.user.mobile === '7825007490') {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Admin access only.' });
    }
  });
};

// Routes

// Bank Status API
app.get('/api/banks/status', (req, res) => {
  const bankName = req.query.bank;
  
  if (bankName) {
    const status = checkBankServerStatus(bankName);
    res.json({ success: true, bankName, status });
  } else {
    const allStatus = {};
    Object.keys(BANK_SERVER_STATUS).forEach(bank => {
      allStatus[bank] = checkBankServerStatus(bank);
    });
    res.json({ success: true, status: allStatus });
  }
});

// Send OTP endpoint
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile, email } = req.body;
    
    if (!mobile && !email) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
    }
    
    const otp = generateOTP();
    let identifier;
    
    if (mobile) {
      identifier = mobile;
      // In production, send SMS via Twilio
      console.log(`OTP for ${mobile}: ${otp}`);
    } else if (email) {
      identifier = email;
      // In production, send email
      console.log(`OTP for ${email}: ${otp}`);
    }
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(identifier, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });
    
    // Clean up expired OTPs
    setTimeout(() => {
      if (otpStore.get(identifier)?.otp === otp) {
        otpStore.delete(identifier);
      }
    }, 5 * 60 * 1000);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully.',
      otp // In production, don't send OTP in response
    });
  } catch (error) {
    console.error('Send OTP error:', error);
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
        message: 'All required fields must be filled.' 
      });
    }
    
    // Check if email or mobile already exists
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
      upiPin, // In production, hash this
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
    
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }
    
    let user;
    if (mobile) {
      user = await User.findOne({ mobile, isActive: true });
    } else if (email) {
      user = await User.findOne({ email, isActive: true });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Verify OTP from store
    const otpData = otpStore.get(mobile || email);
    if (!otpData || otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    
    // Remove used OTP
    otpStore.delete(mobile || email);
    
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

// Search user by UPI
app.get('/api/users/search/upi', async (req, res) => {
  try {
    const { upiId } = req.query;
    
    if (!upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID is required.' });
    }
    
    const user = await User.findOne({ upiId, isActive: true }).select('-upiPin');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Search user by mobile
app.get('/api/users/search/mobile', async (req, res) => {
  try {
    const { mobile } = req.query;
    
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }
    
    const user = await User.findOne({ mobile, isActive: true }).select('-upiPin');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Search error:', error);
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
    
    await User.findByIdAndDelete(userId);
    await Transaction.deleteMany({ $or: [{ userId }, { receiverId: userId }] });
    
    res.json({ success: true, message: 'Account and all data deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
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
    
    const transactions = await Transaction.find({ 
      $or: [{ userId }, { receiverId: userId }] 
    })
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
    const { userId, receiverId, type, amount, description, receiverDetails, category, status, metadata } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    const newTransaction = new Transaction({
      userId,
      receiverId,
      type,
      amount,
      description,
      receiverDetails,
      category: category || 'payment',
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

// Payment processing with downtime handling
app.post('/api/payments/downtime', verifyToken, async (req, res) => {
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
    
    // Get receiver
    let receiver = null;
    if (receiverDetails?.userId) {
      receiver = await User.findById(receiverDetails.userId);
    } else if (receiverDetails?.upi) {
      receiver = await User.findOne({ upiId: receiverDetails.upi });
    } else if (receiverDetails?.mobile) {
      receiver = await User.findOne({ mobile: receiverDetails.mobile });
    }
    
    if (!receiver && category === 'payment') {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    
    // Check bank status
    const senderBankStatus = checkBankServerStatus(sender.bankName);
    const receiverBankStatus = receiver ? checkBankServerStatus(receiver.bankName) : { isActive: true };
    
    // Case 1: Sender's bank is down
    if (!senderBankStatus.isActive && receiverBankStatus.isActive) {
      // DPay advances the payment
      sender.appBalance -= amount;
      if (receiver) {
        receiver.balance += amount;
      }
      
      const transaction = new Transaction({
        userId: sender._id,
        receiverId: receiver?._id,
        type: 'debit',
        amount,
        description: `${description} (DPay Advanced)`,
        receiverDetails,
        senderBank: sender.bankName,
        receiverBank: receiver?.bankName || 'Utility',
        senderBankStatus: 'down',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          downtimeHandled: true,
          senderBankDown: true,
          appBalanceAdvanced: true
        }
      });
      
      await transaction.save();
      
      // Also create credit transaction for receiver
      if (receiver) {
        const creditTransaction = new Transaction({
          userId: receiver._id,
          receiverId: sender._id,
          type: 'credit',
          amount,
          description: `Received from ${sender.username}`,
          receiverDetails: {
            name: sender.username,
            upi: sender.upiId
          },
          senderBank: sender.bankName,
          receiverBank: receiver.bankName,
          senderBankStatus: 'down',
          receiverBankStatus: 'active',
          category: category || 'payment',
          status: 'completed',
          metadata: {
            downtimeHandled: true,
            receivedViaDPay: true
          }
        });
        
        await creditTransaction.save();
      }
      
      await sender.save();
      if (receiver) await receiver.save();
      
      return res.json({
        success: true,
        message: 'Payment advanced by DPay due to bank downtime.',
        transaction,
        newBalance: sender.balance,
        newAppBalance: sender.appBalance
      });
    }
    
    // Case 2: Normal transaction
    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }
    
    sender.balance -= amount;
    if (receiver) {
      receiver.balance += amount;
    }
    
    const transaction = new Transaction({
      userId: sender._id,
      receiverId: receiver?._id,
      type: 'debit',
      amount,
      description,
      receiverDetails,
      senderBank: sender.bankName,
      receiverBank: receiver?.bankName || 'Utility',
      senderBankStatus: 'active',
      receiverBankStatus: 'active',
      category: category || 'payment',
      status: 'completed',
      metadata: {
        normalTransaction: true
      }
    });
    
    await transaction.save();
    
    // Also create credit transaction for receiver
    if (receiver) {
      const creditTransaction = new Transaction({
        userId: receiver._id,
        receiverId: sender._id,
        type: 'credit',
        amount,
        description: `Received from ${sender.username}`,
        receiverDetails: {
          name: sender.username,
          upi: sender.upiId
        },
        senderBank: sender.bankName,
        receiverBank: receiver.bankName,
        senderBankStatus: 'active',
        receiverBankStatus: 'active',
        category: category || 'payment',
        status: 'completed',
        metadata: {
          normalTransaction: true
        }
      });
      
      await creditTransaction.save();
    }
    
    await sender.save();
    if (receiver) await receiver.save();
    
    return res.json({
      success: true,
      message: 'Payment processed successfully.',
      transaction,
      newBalance: sender.balance,
      newAppBalance: sender.appBalance
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Process recovery when banks come back online
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
    
    // Find transactions where appBalance was negative
    const transactions = await Transaction.find({
      userId,
      'metadata.appBalanceAdvanced': true,
      'metadata.recovered': { $ne: true }
    });
    
    let totalRecovered = 0;
    for (const transaction of transactions) {
      const senderBankStatus = checkBankServerStatus(transaction.senderBank);
      
      if (senderBankStatus.isActive) {
        // Recover from bank balance
        if (user.balance >= transaction.amount) {
          user.balance -= transaction.amount;
          user.appBalance += transaction.amount;
          totalRecovered += transaction.amount;
          
          transaction.metadata.recovered = true;
          transaction.metadata.recoveryDate = new Date();
          await transaction.save();
        }
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: `Recovered ₹${totalRecovered} from bank balance.`,
      newBalance: user.balance,
      newAppBalance: user.appBalance
    });
    
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ success: false, message: 'Server error during recovery.' });
  }
});

// Admin routes
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-upiPin').sort({ registrationDate: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-upiPin');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/admin/banks/status', verifyAdmin, async (req, res) => {
  try {
    const { bankName, status } = req.body;
    
    if (!BANK_SERVER_STATUS[bankName]) {
      return res.status(404).json({ success: false, message: 'Bank not found.' });
    }
    
    BANK_SERVER_STATUS[bankName] = {
      status,
      lastChecked: new Date(),
      responseTime: status === 'active' ? '100ms' : status === 'slow' ? '400ms' : 'Timeout'
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
