const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MDB');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

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
const BANK_SERVER_STATUS = {
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
  
  // Simulate random status changes for demo
  const random = Math.random();
  if (random < 0.1) { // 10% chance to change status
    if (bankStatus.status === 'active') {
      bankStatus.status = Math.random() < 0.5 ? 'slow' : 'down';
    } else if (bankStatus.status === 'slow') {
      bankStatus.status = Math.random() < 0.5 ? 'active' : 'down';
    } else {
      bankStatus.status = Math.random() < 0.5 ? 'active' : 'slow';
    }
    bankStatus.lastChecked = new Date();
    bankStatus.responseTime = bankStatus.status === 'active' ? 
      `${Math.floor(Math.random() * 150) + 50}ms` : 
      bankStatus.status === 'slow' ? 
      `${Math.floor(Math.random() * 500) + 300}ms` : 
      'Timeout';
  }
  
  return {
    ...bankStatus,
    isActive: bankStatus.status === 'active'
  };
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
  // next();
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
      upiPin, // Store plain UPI PIN for demo (in production, hash it)
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
    
    // For demo purposes, accept any OTP starting with 1234
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

// Payment processing with downtime handling
app.post('/api/payments/downtime', verifyToken, async (req, res) => {
  try {
    const { userId, amount, description, receiverDetails, category, upiPin, senderBankStatus, receiverBankStatus, isRecovery, originalTransactionId } = req.body;
    
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
    
    // Check bank server status
    const senderBankStatusInfo = checkBankServerStatus(user.bankName);
    let receiverBank = receiverDetails?.bank || 'Unknown Bank';
    const receiverBankStatusInfo = checkBankServerStatus(receiverBank);
    
    // Case 1: Sender's bank is down
    if (!senderBankStatusInfo.isActive && receiverBankStatusInfo.isActive) {
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
      await user.save();
      
      // Add to pending transactions for recovery
      user.pendingTransactions.push({
        transactionId: transaction._id,
        amount,
        description,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
        status: 'pending',
        metadata: {
          type: 'sender_bank_down',
          recovered: false,
          recoveryAttempts: 0
        }
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
    else if (senderBankStatusInfo.isActive && !receiverBankStatusInfo.isActive) {
      // Check sender balance
      if (user.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
      // Deduct from sender
      user.balance -= amount;
      
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
        status: 'held_by_dpay',
        metadata: {
          downtimeHandled: true,
          receiverBankDown: true,
          amountHeldByDPay: true,
          timestamp: new Date()
        }
      });
      
      await transaction.save();
      await user.save();
      
      // Add to pending transactions for recovery
      user.pendingTransactions.push({
        transactionId: transaction._id,
        amount,
        description,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
        status: 'pending',
        metadata: {
          type: 'receiver_bank_down',
          recovered: false,
          recoveryAttempts: 0
        }
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
    else if (!senderBankStatusInfo.isActive && !receiverBankStatusInfo.isActive) {
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
      
      // Update user app balance (negative)
      user.appBalance = (user.appBalance || 0) - amount;
      
      // Add to pending transactions for recovery
      user.pendingTransactions.push({
        transactionId: transaction._id,
        amount,
        description,
        receiverDetails,
        senderBank: user.bankName,
        receiverBank: receiverBank,
        status: 'pending',
        metadata: {
          type: 'both_banks_down',
          recovered: false,
          recoveryAttempts: 0
        }
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
      // Check balance
      if (user.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance.' });
      }
      
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
          // Amount was already deducted from sender, now mark as completed
          await Transaction.findByIdAndUpdate(pendingTx.transactionId, {
            status: 'completed',
            metadata: {
              ...metadata,
              recovered: true,
              recoveryDate: new Date()
            }
          });
          
          recoveredTransactions.push({
            transactionId: pendingTx.transactionId,
            amount: pendingTx.amount,
            type: 'receiver_bank_recovery'
          });
        }
        else if (metadata.type === 'both_banks_down') {
          // Both banks down case: deduct from sender's balance and recover app balance
          if (user.balance >= pendingTx.amount) {
            user.balance -= pendingTx.amount;
            user.appBalance += pendingTx.amount;
            
            await Transaction.findByIdAndUpdate(pendingTx.transactionId, {
              status: 'completed',
              metadata: {
                ...metadata,
                recovered: true,
                recoveryDate: new Date()
              }
            });
            
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
app.post('/api/loans/apply', verifyToken, async (req, res) => {
  try {
    const { userId, loanType, bankName, amount, interestRate, tenure } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    
    // Create loan application
    const newLoan = new Loan({
      userId,
      loanType,
      bankName,
      amount,
      interestRate,
      tenure,
      status: 'pending'
    });
    
    await newLoan.save();
    
    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully!',
      loan: newLoan
    });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
