import { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, Send, User, Smartphone, Gift, Receipt, Landmark, Wallet, History, Upload, Eye, EyeOff, CreditCard, Building, Copy, Check, X, DollarSign, CreditCard as Card, Calendar, AlertCircle, Edit, Camera, Home, GraduationCap, Sprout, Gem, Stethoscope, Shield, Zap, Tv, Tag, Flame, Battery, Wifi, Phone, FileText, Search, ChevronRight, ShieldCheck, Clock, Percent, TrendingUp, Server, Activity, WifiOff, CreditCard as AtmCard, Image as ImageIcon, Loader2, Save, Key, Mail, LogOut, Trash2, Scissors, Star, Award, Trophy, Coffee, Pizza, ShowerHead, Dumbbell, Book, Gamepad2, Music, Film, Car, ShoppingBag, Plane, Heart, Bell, BellOff, AlertTriangle, BatteryCharging, Users, Settings } from 'lucide-react';

const API_BASE_URL = "https://dpay-l8dw.onrender.com/api";

// List of popular Indian banks
const INDIAN_BANKS = [
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

// Initial Bank Server Status
const initialBankServerStatus = {
  "State Bank of India (SBI)": { status: "active", lastChecked: new Date().toISOString(), responseTime: "120ms" },
  "HDFC Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "95ms" },
  "ICICI Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "110ms" },
  "Axis Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "85ms" },
  "Kotak Mahindra Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "105ms" },
  "Punjab National Bank (PNB)": { status: "active", lastChecked: new Date().toISOString(), responseTime: "130ms" },
  "Bank of Baroda": { status: "active", lastChecked: new Date().toISOString(), responseTime: "100ms" },
  "Canara Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "115ms" },
  "Union Bank of India": { status: "active", lastChecked: new Date().toISOString(), responseTime: "125ms" },
  "Bank of India": { status: "active", lastChecked: new Date().toISOString(), responseTime: "90ms" },
  "IndusInd Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "75ms" },
  "IDFC First Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "105ms" },
  "Yes Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "95ms" },
  "Federal Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "85ms" },
  "Indian Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "115ms" },
  "Central Bank of India": { status: "active", lastChecked: new Date().toISOString(), responseTime: "140ms" },
  "Indian Overseas Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "80ms" },
  "UCO Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "150ms" },
  "Bandhan Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "88ms" },
  "IDBI Bank": { status: "active", lastChecked: new Date().toISOString(), responseTime: "125ms" }
};

// Indian Telecom Operators
const TELECOM_OPERATORS = [
  { id: 'airtel', name: 'Airtel', color: 'bg-red-100 text-red-700' },
  { id: 'jio', name: 'Jio', color: 'bg-purple-100 text-purple-700' },
  { id: 'vi', name: 'Vi (Vodafone Idea)', color: 'bg-orange-100 text-orange-700' },
  { id: 'bsnl', name: 'BSNL', color: 'bg-blue-100 text-blue-700' },
  { id: 'mtnl', name: 'MTNL', color: 'bg-yellow-100 text-yellow-700' }
];

// Mobile Recharge Plans
const RECHARGE_PLANS = {
  airtel: [
    { id: 1, amount: 179, validity: '28 days', data: '1.5GB/day', description: 'Popular Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Unlimited Calls' },
    { id: 3, amount: 399, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 499, validity: '56 days', data: '2GB/day', description: 'Best Value' },
  ],
  jio: [
    { id: 1, amount: 155, validity: '28 days', data: '1.5GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Popular Plan' },
    { id: 3, amount: 395, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 666, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' },
  ],
  vi: [
    { id: 1, amount: 199, validity: '28 days', data: '1.5GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Popular Plan' },
    { id: 3, amount: 399, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
  ],
  bsnl: [
    { id: 1, amount: 199, validity: '28 days', data: '2GB/day', description: 'STV 199' },
    { id: 2, amount: 299, validity: '28 days', data: '3GB/day', description: 'STV 299' },
    { id: 3, amount: 399, validity: '56 days', data: '2GB/day', description: 'STV 399' },
  ],
  mtnl: [
    { id: 1, amount: 199, validity: '28 days', data: '1GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '1.5GB/day', description: 'Popular Plan' },
    { id: 3, amount: 399, validity: '56 days', data: '1GB/day', description: 'Long Term' }
  ]
};

// Bills Categories
const BILLS_CATEGORIES = [
  { id: 'electricity', name: 'Electricity Bill', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'dth', name: 'DTH Recharge', icon: Tv, color: 'bg-purple-100 text-purple-600' },
  { id: 'fastag', name: 'Fastag Recharge', icon: Tag, color: 'bg-blue-100 text-blue-600' },
  { id: 'gas', name: 'Gas Bill', icon: Flame, color: 'bg-orange-100 text-orange-600' },
  { id: 'water', name: 'Water Bill', icon: Battery, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'broadband', name: 'Broadband', icon: Wifi, color: 'bg-indigo-100 text-indigo-600' }
];

// Fun loading messages
const FUN_LOADING_MESSAGES = [
  "Brewing coffee for DPay... ☕",
  "Polishing digital coins... ✨",
  "Feeding the transaction hamsters... 🐹",
  "Charging the payment lasers... 🔋",
  "Washing dishes with blockchain... 🍽️",
  "Doing digital yoga... 🧘",
  "Counting virtual rupees... 💰",
  "Buffering happiness... 😊",
  "Synchronizing with the moneyverse... 🌌",
  "Training AI bankers... 🤖",
  "Warming up the server engines... 🔥",
  "Calibrating payment portals... 🚀",
  "Polishing the UPI crystals... 💎",
  "Charging the financial forcefield... ⚡",
  "Meditating with money trees... 🌳",
  "Baking digital cookies... 🍪",
  "Taming wild transactions... 🦁",
  "Polishing the QR codes... 📱",
  "Charging the happiness battery... 🔋",
  "Doing financial pushups... 💪"
];

// Simple QR Code Pattern Generator
const SimpleQRCode = ({ data, size = 200 }) => {
  const qrSize = 21;
  
  const generatePattern = (text) => {
    const pattern = [];
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < qrSize * qrSize; i++) {
      const x = i % qrSize;
      const y = Math.floor(i / qrSize);
      
      const isPositionMarker = 
        (x < 8 && y < 8) || 
        (x > qrSize - 9 && y < 8) || 
        (x < 8 && y > qrSize - 9);
      
      const isTimingPattern = x === 6 || y === 6;
      
      const isDataCell = ((hash + x + y * qrSize) % 3) === 0;
      
      pattern.push(isPositionMarker || isTimingPattern || isDataCell);
    }
    
    return pattern;
  };

  const generateQRImage = () => {
    const pattern = generatePattern(data);
    const cellSize = Math.floor(size / qrSize);
    const canvasSize = cellSize * qrSize;
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    ctx.fillStyle = '#000000';
    for (let y = 0; y < qrSize; y++) {
      for (let x = 0; x < qrSize; x++) {
        if (pattern[y * qrSize + x]) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
    
    const logoSize = Math.floor(canvasSize * 0.2);
    const logoX = (canvasSize - logoSize) / 2;
    const logoY = (canvasSize - logoSize) / 2;
    
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(logoSize * 0.4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DP', logoX + logoSize/2, logoY + logoSize/2);
    
    return canvas.toDataURL('image/png');
  };

  const qrImage = generateQRImage();

  return (
    <div className="relative bg-white p-4 rounded-lg border-4 border-black">
      <img 
        src={qrImage} 
        alt="QR Code"
        className="w-full h-auto"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

// Bank Status Indicator Component
const BankStatusIndicator = ({ bankName, status }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'slow': return 'bg-yellow-100 text-yellow-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return <Activity className="w-3 h-3" />;
      case 'slow': return <Clock className="w-3 h-3" />;
      case 'down': return <WifiOff className="w-3 h-3" />;
      default: return <Server className="w-3 h-3" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="capitalize">{status || 'Unknown'}</span>
    </div>
  );
};

// Loading Component with Fun Messages
const LoadingSpinner = ({ size = "normal", text = null }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    normal: "w-6 h-6",
    large: "w-8 h-8"
  };

  const loadingText = text || FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-violet-600 animate-spin mb-3`} />
      <p className="text-violet-600 text-sm text-center">{loadingText}</p>
    </div>
  );
};

// Bank Downtime Notification Component
const BankDowntimeNotification = ({ 
  isOpen, 
  onClose, 
  message, 
  transactionId,
  amount,
  type = 'info'
}) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
    
    if (isOpen) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, type]);

  const getIcon = () => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'success': return <Check className="w-6 h-6 text-green-600" />;
      default: return <Bell className="w-6 h-6 text-violet-600" />;
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-violet-50 border-violet-200';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 w-96 z-50 animate-slide-in">
      <div className={`${getBgColor()} border rounded-xl shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium text-gray-800">{message}</p>
            {transactionId && (
              <p className="text-xs text-gray-600 mt-1">Transaction ID: {transactionId}</p>
            )}
            {amount && (
              <p className="text-sm font-semibold mt-1">Amount: ₹{amount}</p>
            )}
          </div>
          <button
            onClick={() => {
              setShow(false);
              onClose?.();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// API Service Functions
const apiService = {
  // Auth APIs
  async sendOTP(identifier, method) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        [method]: identifier 
      })
    });
    return response.json();
  },

  async login(identifier, otp, method) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        [method]: identifier, 
        otp 
      })
    });
    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async logout(token) {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // User APIs
  async getUserProfile(token, userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async updateUserProfile(token, userId, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async deleteUser(token, userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Transaction APIs
  async getTransactions(token, userId) {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createTransaction(token, transactionData) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  },

  // Payment APIs
  async processPayment(token, paymentData) {
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },

  // Get receiver details
  async getReceiverDetails(upiId, mobile) {
    const response = await fetch(`${API_BASE_URL}/users/find`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ upiId, mobile })
    });
    return response.json();
  },

  // Bank status APIs
  async getBankStatus(bankName = null) {
    const url = bankName 
      ? `${API_BASE_URL}/banks/status?bank=${encodeURIComponent(bankName)}`
      : `${API_BASE_URL}/banks/status`;
    
    const response = await fetch(url);
    return response.json();
  },

  async updateBankStatus(token, bankName, status) {
    const response = await fetch(`${API_BASE_URL}/admin/update-bank-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bankName, status })
    });
    return response.json();
  },

  // Admin APIs
  async getAllUsers(token) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async updateUserByAdmin(token, userId, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
};

export default function DPayApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [step, setStep] = useState('identifier');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpMethod, setOtpMethod] = useState('mobile');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAppBalance, setShowAppBalance] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showMobileRecharge, setShowMobileRecharge] = useState(false);
  const [showBills, setShowBills] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // UPI PIN Modal States
  const [showUPIPinModal, setShowUPIPinModal] = useState(false);
  const [upiPinAction, setUpiPinAction] = useState(null);
  const [upiPinValue, setUpiPinValue] = useState('');
  
  // Change UPI PIN States
  const [showChangeUPIPin, setShowChangeUPIPin] = useState(false);
  const [oldUPIPin, setOldUPIPin] = useState('');
  const [newUPIPin, setNewUPIPin] = useState('');
  const [confirmNewUPIPin, setConfirmNewUPIPin] = useState('');
  
  // Logout Confirmation Modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  
  // QR Scanner States
  const [scannedData, setScannedData] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverUPI, setReceiverUPI] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendDescription, setSendDescription] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [qrImageFile, setQrImageFile] = useState(null);
  
  // Send Money States
  const [sendToUPI, setSendToUPI] = useState('');
  const [sendToMobile, setSendToMobile] = useState('');
  const [sendMoneyAmount, setSendMoneyAmount] = useState('');
  const [sendMoneyDescription, setSendMoneyDescription] = useState('');
  const [receiverDetails, setReceiverDetails] = useState(null);
  
  // Mobile Recharge States
  const [rechargeMobile, setRechargeMobile] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Bills States
  const [selectedBillCategory, setSelectedBillCategory] = useState(null);
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  
  // ATM Card States
  const [showAtmCard, setShowAtmCard] = useState(false);
  
  // Bank Downtime Notification States
  const [showDowntimeNotification, setShowDowntimeNotification] = useState(false);
  const [downtimeMessage, setDowntimeMessage] = useState('');
  const [downtimeType, setDowntimeType] = useState('info');
  const [downtimeTransactionId, setDowntimeTransactionId] = useState('');
  const [downtimeAmount, setDowntimeAmount] = useState(0);
  
  // Bank Server Status States
  const [bankServerStatus, setBankServerStatus] = useState(initialBankServerStatus);
  
  // Admin States
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  
  // Pending Transactions
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    mobile: '',
    panNumber: '',
    dob: '',
    bankName: '',
    accountNumber: '',
    atmCardNumber: '',
    upiPin: '',
    referralCode: '',
    photo: null
  });

  // Sample transaction history
  const [transactions, setTransactions] = useState([]);

  // Check if user has session token
  useEffect(() => {
    const token = localStorage.getItem('dpay_token');
    const userId = localStorage.getItem('dpay_user_id');
    
    if (token && userId) {
      loadUserProfile(token, userId);
    }
    
    // Load bank status
    loadBankStatus();
  }, []);

  // Load bank status
  const loadBankStatus = async () => {
    try {
      const response = await apiService.getBankStatus();
      if (response.success) {
        setBankServerStatus(response.status);
      }
    } catch (error) {
      console.error('Error loading bank status:', error);
    }
  };

  const loadUserProfile = async (token, userId) => {
    try {
      setIsLoading(true);
      setLoadingMessage("Loading your profile...");
      
      const profileResponse = await apiService.getUserProfile(token, userId);
      if (profileResponse.success) {
        setUserProfile(profileResponse.user);
        setLoggedIn(true);
        setShowAuth(false);
        
        // Load transactions
        const transactionsResponse = await apiService.getTransactions(token, userId);
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.transactions);
        }
        
        // Check if user is admin (mobile number 7825007490)
        if (profileResponse.user.mobile === '7825007490') {
          // Load all users for admin panel
          const usersResponse = await apiService.getAllUsers(token);
          if (usersResponse.success) {
            setAllUsers(usersResponse.users);
          }
        }
      } else {
        localStorage.removeItem('dpay_token');
        localStorage.removeItem('dpay_user_id');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      localStorage.removeItem('dpay_token');
      localStorage.removeItem('dpay_user_id');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const sendOTP = async () => {
    const identifier = otpMethod === 'mobile' ? mobile : email;
    
    if (otpMethod === 'mobile' && mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (otpMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Sending OTP...");
    
    try {
      const response = await apiService.sendOTP(identifier, otpMethod);
      
      if (response.success) {
        setGeneratedOTP(response.otp);
        setStep('otp');
        alert(`OTP sent to ${identifier}. For demo, OTP is: ${response.otp}`);
      } else {
        alert(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Logging in...");
    
    try {
      const identifier = otpMethod === 'mobile' ? mobile : email;
      const response = await apiService.login(identifier, otp, otpMethod);
      
      if (response.success) {
        setLoggedIn(true);
        setShowAuth(false);
        setUserProfile(response.user);
        
        // Save token and user ID
        localStorage.setItem('dpay_token', response.token);
        localStorage.setItem('dpay_user_id', response.user._id);
        
        setStep('identifier');
        setMobile('');
        setEmail('');
        setOtp('');
        setGeneratedOTP('');
        
        // Load transactions
        const transactionsResponse = await apiService.getTransactions(response.token, response.user._id);
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.transactions);
        }
        
        // Check if user is admin
        if (response.user.mobile === '7825007490') {
          const usersResponse = await apiService.getAllUsers(response.token);
          if (usersResponse.success) {
            setAllUsers(usersResponse.users);
          }
        }
        
        // Load bank status
        await loadBankStatus();
        
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem('dpay_token');
      if (token) {
        await apiService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggedIn(false);
      setShowAuth(true);
      setAuthMode('login');
      setStep('identifier');
      setMobile('');
      setEmail('');
      setOtp('');
      setGeneratedOTP('');
      setUserProfile(null);
      setShowBalance(false);
      setShowHistory(false);
      setShowQRCode(false);
      setShowAppBalance(false);
      setShowUserDetails(false);
      setShowQRScanner(false);
      setShowSendMoney(false);
      setShowRewards(false);
      setShowMobileRecharge(false);
      setShowBills(false);
      setShowAtmCard(false);
      setShowLogoutConfirm(false);
      setShowAdminPanel(false);
      
      localStorage.removeItem('dpay_token');
      localStorage.removeItem('dpay_user_id');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        setPhotoPreview(photoData);
        if (isEditingProfile) {
          setEditedProfile(prev => ({ ...prev, photo: photoData }));
        } else {
          setRegisterData(prev => ({ ...prev, photo: photoData }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Registration
  const handleRegister = async () => {
    // Validate required fields
    if (!registerData.username || !registerData.email || !registerData.mobile || 
        !registerData.panNumber || !registerData.bankName || !registerData.accountNumber || 
        !registerData.atmCardNumber || !registerData.upiPin) {
      alert('Please fill all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate mobile number
    if (registerData.mobile.length !== 10 || !/^\d+$/.test(registerData.mobile)) {
      alert('Mobile number must be exactly 10 digits');
      return;
    }

    // Validate PAN number
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(registerData.panNumber.toUpperCase())) {
      alert('PAN number must be in format: ABCDE1234F');
      return;
    }

    if (registerData.upiPin.length !== 4 || !/^\d+$/.test(registerData.upiPin)) {
      alert('UPI PIN must be exactly 4 digits');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Creating your account...");
    
    try {
      const response = await apiService.register(registerData);
      
      if (response.success) {
        setLoggedIn(true);
        setShowAuth(false);
        setUserProfile(response.user);
        
        // Save token and user ID
        localStorage.setItem('dpay_token', response.token);
        localStorage.setItem('dpay_user_id', response.user._id);
        
        setRegisterData({
          username: '',
          email: '',
          mobile: '',
          panNumber: '',
          dob: '',
          bankName: '',
          accountNumber: '',
          atmCardNumber: '',
          upiPin: '',
          referralCode: '',
          photo: null
        });
        setPhotoPreview(null);
        
        alert(`Registration successful!\nYour UPI ID: ${response.user.upiId}\nYour Referral Code: ${response.user.referralCode}`);
      } else {
        alert(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check balance
  const checkBalance = () => {
    if (!userProfile) return;
    
    setUpiPinAction({ type: 'check_balance', data: null });
    setShowUPIPinModal(true);
  };

  // View transaction history
  const viewTransactionHistory = () => {
    if (!userProfile) return;
    
    setUpiPinAction({ type: 'view_history', data: null });
    setShowUPIPinModal(true);
  };

  const handleCopyUPI = () => {
    if (userProfile?.upiId) {
      navigator.clipboard.writeText(userProfile.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyReferralCode = () => {
    if (userProfile?.referralCode) {
      navigator.clipboard.writeText(userProfile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle user profile button click
  const handleUserProfileClick = () => {
    setShowUserDetails(true);
    setShowBalance(false);
    setShowHistory(false);
    setShowQRCode(false);
    setShowAppBalance(false);
    setShowQRScanner(false);
    setShowSendMoney(false);
    setShowRewards(false);
    setShowMobileRecharge(false);
    setShowBills(false);
    setShowAtmCard(false);
    setShowAdminPanel(false);
  };

  // Get receiver details
  const fetchReceiverDetails = async () => {
    if (!sendToUPI && !sendToMobile) {
      setReceiverDetails(null);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiService.getReceiverDetails(sendToUPI, sendToMobile);
      
      if (response.success && response.user) {
        setReceiverDetails(response.user);
        
        // Also get bank status
        const bankStatusResponse = await apiService.getBankStatus(response.user.bankName);
        if (bankStatusResponse.success) {
          setBankServerStatus(prev => ({
            ...prev,
            [response.user.bankName]: bankStatusResponse.status
          }));
        }
      } else {
        setReceiverDetails(null);
      }
    } catch (error) {
      console.error('Error fetching receiver details:', error);
      setReceiverDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle QR Scanner with Image Upload
  const handleQRScan = () => {
    setShowQRScanner(true);
    setIsScanning(true);
    setScannedData('');
    setReceiverName('');
    setReceiverUPI('');
    setSendAmount('');
    setSendDescription('');
    setQrImageFile(null);
  };

  // Handle QR Image Upload
  const handleQRImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrImageFile(file);
      // For demo, simulate QR scan
      setTimeout(() => {
        simulateQRScan();
      }, 1000);
    }
  };

  // Simulate QR Code scanning
  const simulateQRScan = () => {
    const demoQRData = "upi://pay?pa=johndoe1234@dpay&pn=John%20Doe&am=500&cu=INR&tn=Payment%20for%20services";
    setScannedData(demoQRData);
    
    // Parse UPI data
    const params = new URLSearchParams(demoQRData.split('?')[1]);
    const upiId = params.get('pa') || 'johndoe1234@dpay';
    setReceiverUPI(upiId);
    setReceiverName(decodeURIComponent(params.get('pn') || 'John Doe'));
    setSendAmount(params.get('am') || '');
    
    // Fetch receiver details from API
    fetchReceiverDetailsByUPI(upiId);
  };

  const fetchReceiverDetailsByUPI = async (upiId) => {
    try {
      const response = await apiService.getReceiverDetails(upiId, null);
      if (response.success && response.user) {
        setReceiverName(response.user.username);
      }
    } catch (error) {
      console.error('Error fetching receiver details:', error);
    }
  };

  // Handle QR Scanner Payment
  const handleQRPayment = () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Request UPI PIN for payment
    setUpiPinAction({
      type: 'qr_payment',
      data: {
        amount: parseFloat(sendAmount),
        description: sendDescription || `Payment to ${receiverName}`,
        receiverDetails: { 
          name: receiverName, 
          upi: receiverUPI,
          bankName: receiverDetails?.bankName || 'Unknown Bank'
        }
      }
    });
    setShowUPIPinModal(true);
  };

  // Handle Send Money
  const handleSendMoney = () => {
    if (!sendMoneyAmount || parseFloat(sendMoneyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!sendToUPI && !sendToMobile) {
      alert('Please enter UPI ID or Mobile Number');
      return;
    }

    // Request UPI PIN for payment
    setUpiPinAction({
      type: 'send_money',
      data: {
        amount: parseFloat(sendMoneyAmount),
        description: sendMoneyDescription || `Payment to ${sendToUPI || sendToMobile}`,
        receiverDetails: { 
          upi: sendToUPI, 
          mobile: sendToMobile,
          bankName: receiverDetails?.bankName || 'Unknown Bank',
          name: receiverDetails?.username || 'Unknown User'
        }
      }
    });
    setShowUPIPinModal(true);
  };

  // Handle Mobile Recharge
  const handleMobileRecharge = () => {
    if (!rechargeMobile || rechargeMobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!selectedOperator) {
      alert('Please select a telecom operator');
      return;
    }

    if (!selectedPlan) {
      alert('Please select a recharge plan');
      return;
    }

    // Request UPI PIN for payment
    setUpiPinAction({
      type: 'mobile_recharge',
      data: {
        amount: selectedPlan.amount,
        description: `Mobile Recharge - ${selectedOperator.name} (${rechargeMobile})`
      }
    });
    setShowUPIPinModal(true);
  };

  // Handle Bill Payment
  const handleBillPayment = () => {
    if (!billNumber) {
      alert('Please enter bill number');
      return;
    }

    if (!billAmount || parseFloat(billAmount) <= 0) {
      alert('Please enter a valid bill amount');
      return;
    }

    // Request UPI PIN for payment
    setUpiPinAction({
      type: 'bill_payment',
      data: {
        amount: parseFloat(billAmount),
        description: `${selectedBillCategory?.name} - ${billNumber}`
      }
    });
    setShowUPIPinModal(true);
  };

  // Handle UPI PIN verification
  const handleUPIPinSubmit = async () => {
    if (!upiPinValue || upiPinValue.length !== 4 || !/^\d+$/.test(upiPinValue)) {
      alert('Please enter a valid 4-digit UPI PIN');
      return;
    }

    // Verify UPI PIN matches user's PIN
    if (upiPinValue !== userProfile.upiPin) {
      alert('Invalid UPI PIN');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Processing transaction...");
    
    try {
      const token = localStorage.getItem('dpay_token');
      const userId = localStorage.getItem('dpay_user_id');
      
      // Process based on action type
      switch (upiPinAction.type) {
        case 'qr_payment':
          await processPayment(upiPinAction.data);
          setShowQRScanner(false);
          break;
          
        case 'send_money':
          await processPayment(upiPinAction.data);
          setShowSendMoney(false);
          break;
          
        case 'mobile_recharge':
          await processPayment(upiPinAction.data);
          setShowMobileRecharge(false);
          break;
          
        case 'bill_payment':
          await processPayment(upiPinAction.data);
          setShowBills(false);
          break;
          
        case 'check_balance':
          setShowBalance(true);
          break;
          
        case 'view_history':
          setShowHistory(true);
          break;
          
        case 'view_atm_card':
          setShowAtmCard(true);
          break;
      }
      
      // Refresh user data
      if (token && userId) {
        const profileResponse = await apiService.getUserProfile(token, userId);
        if (profileResponse.success) {
          setUserProfile(profileResponse.user);
        }
        
        const transactionsResponse = await apiService.getTransactions(token, userId);
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.transactions);
        }
      }
      
      setUpiPinValue('');
      setShowUPIPinModal(false);
      setUpiPinAction(null);
      
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment
  const processPayment = async (paymentData) => {
    const token = localStorage.getItem('dpay_token');
    const userId = localStorage.getItem('dpay_user_id');
    
    const paymentRequest = {
      userId,
      amount: paymentData.amount,
      description: paymentData.description,
      receiverDetails: paymentData.receiverDetails,
      category: paymentData.category || 'payment',
      upiPin: upiPinValue
    };
    
    const response = await apiService.processPayment(token, paymentRequest);
    
    if (response.success) {
      // Show success notification
      setDowntimeMessage(`Payment successful: ${paymentData.description} - ₹${paymentData.amount}`);
      setDowntimeType('success');
      setDowntimeTransactionId(response.transaction?._id || '');
      setDowntimeAmount(paymentData.amount);
      setShowDowntimeNotification(true);
      
      return true;
    } else {
      alert(response.message || 'Payment failed');
      return false;
    }
  };

  // Handle View ATM Card Details
  const handleViewATMCard = () => {
    setUpiPinAction({ type: 'view_atm_card', data: null });
    setShowUPIPinModal(true);
  };

  // Handle Change UPI PIN
  const handleChangeUPIPin = async () => {
    if (!oldUPIPin || !newUPIPin || !confirmNewUPIPin) {
      alert('Please enter all PIN fields');
      return;
    }

    if (oldUPIPin.length !== 4 || !/^\d+$/.test(oldUPIPin)) {
      alert('Old UPI PIN must be exactly 4 digits');
      return;
    }

    if (newUPIPin.length !== 4 || !/^\d+$/.test(newUPIPin)) {
      alert('New UPI PIN must be exactly 4 digits');
      return;
    }

    if (newUPIPin !== confirmNewUPIPin) {
      alert('New PINs do not match');
      return;
    }

    if (newUPIPin === oldUPIPin) {
      alert('New PIN cannot be same as old PIN');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Changing UPI PIN...");

    try {
      const token = localStorage.getItem('dpay_token');
      const userId = localStorage.getItem('dpay_user_id');
      
      const response = await apiService.updateUserProfile(token, userId, { upiPin: newUPIPin });
      
      if (response.success) {
        const updatedProfile = { ...userProfile, upiPin: newUPIPin };
        setUserProfile(updatedProfile);
        setOldUPIPin('');
        setNewUPIPin('');
        setConfirmNewUPIPin('');
        setShowChangeUPIPin(false);
        alert('UPI PIN changed successfully!');
      } else {
        alert(response.message || 'Failed to change UPI PIN');
      }
    } catch (error) {
      console.error('Error changing UPI PIN:', error);
      alert('Failed to change UPI PIN');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setLoadingMessage("Deleting account...");
    
    try {
      const token = localStorage.getItem('dpay_token');
      const userId = localStorage.getItem('dpay_user_id');
      
      const response = await apiService.deleteUser(token, userId);
      
      if (response.success) {
        // Reset all states
        setLoggedIn(false);
        setShowAuth(true);
        setAuthMode('login');
        setStep('identifier');
        setMobile('');
        setEmail('');
        setOtp('');
        setGeneratedOTP('');
        setUserProfile(null);
        setShowBalance(false);
        setShowHistory(false);
        setShowQRCode(false);
        setShowAppBalance(false);
        setShowUserDetails(false);
        setShowQRScanner(false);
        setShowSendMoney(false);
        setShowRewards(false);
        setShowMobileRecharge(false);
        setShowBills(false);
        setShowAtmCard(false);
        setShowDeleteConfirm(false);
        setShowAdminPanel(false);
        
        // Clear local storage
        localStorage.removeItem('dpay_token');
        localStorage.removeItem('dpay_user_id');
        
        alert('Your account and all data have been deleted successfully.');
      } else {
        alert(response.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  // Format registration date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setEditedProfile({ ...userProfile });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile.username || !editedProfile.mobile || !editedProfile.email) {
      alert('Name, Email and Mobile are required');
      return;
    }

    if (editedProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedProfile.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Updating profile...");

    try {
      const token = localStorage.getItem('dpay_token');
      const userId = localStorage.getItem('dpay_user_id');
      
      const response = await apiService.updateUserProfile(token, userId, editedProfile);
      
      if (response.success) {
        setUserProfile(editedProfile);
        setIsEditingProfile(false);
        setEditedProfile(null);
        alert('Profile updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin functions
  const handleAdminPanel = () => {
    setShowAdminPanel(true);
    setShowUserDetails(false);
  };

  const handleUpdateBankStatus = async (bankName, status) => {
    try {
      const token = localStorage.getItem('dpay_token');
      const response = await apiService.updateBankStatus(token, bankName, status);
      
      if (response.success) {
        setBankServerStatus(prev => ({
          ...prev,
          [bankName]: response.status
        }));
        alert(`Bank status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating bank status:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const token = localStorage.getItem('dpay_token');
      const response = await apiService.updateUserByAdmin(token, editingUser._id, editingUser);
      
      if (response.success) {
        setAllUsers(prev => prev.map(u => u._id === editingUser._id ? response.user : u));
        setEditingUser(null);
        alert('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // UPI PIN Modal
  const UPIPinModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Enter UPI PIN</h2>
          <button
            onClick={() => {
              setShowUPIPinModal(false);
              setUpiPinValue('');
              setUpiPinAction(null);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
            <Key className="w-8 h-8 text-violet-600" />
          </div>
          
          <p className="text-sm text-violet-600 mb-2">
            Enter your 4-digit UPI PIN to continue
          </p>
          
          <div className="mb-6">
            <input
              type="password"
              value={upiPinValue}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setUpiPinValue(value);
              }}
              placeholder="Enter 4-digit PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <p className="text-xs text-violet-500 mt-2">Enter 4-digit UPI PIN</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (num === '⌫') {
                    setUpiPinValue(prev => prev.slice(0, -1));
                  } else if (num !== '') {
                    if (upiPinValue.length < 4) {
                      setUpiPinValue(prev => prev + num);
                    }
                  }
                }}
                className={`py-4 rounded-xl font-semibold text-lg transition ${
                  num === ''
                    ? 'invisible'
                    : num === '⌫'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                }`}
                disabled={num === ''}
              >
                {num}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleUPIPinSubmit}
            disabled={upiPinValue.length !== 4}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              upiPinValue.length !== 4
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            Verify & Continue
          </button>
          
          <button
            onClick={() => {
              setShowUPIPinModal(false);
              setUpiPinValue('');
              setUpiPinAction(null);
            }}
            className="w-full mt-3 py-2 text-violet-600 font-medium hover:text-violet-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Change UPI PIN Modal
  const ChangeUPIPinModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Change UPI PIN</h2>
          <button
            onClick={() => {
              setShowChangeUPIPin(false);
              setOldUPIPin('');
              setNewUPIPin('');
              setConfirmNewUPIPin('');
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              Old UPI PIN
            </label>
            <input
              type="password"
              value={oldUPIPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setOldUPIPin(value);
              }}
              placeholder="Enter old PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              New UPI PIN
            </label>
            <input
              type="password"
              value={newUPIPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setNewUPIPin(value);
              }}
              placeholder="Enter new PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              Confirm New PIN
            </label>
            <input
              type="password"
              value={confirmNewUPIPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setConfirmNewUPIPin(value);
              }}
              placeholder="Confirm new PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <button
            onClick={handleChangeUPIPin}
            disabled={!oldUPIPin || !newUPIPin || !confirmNewUPIPin}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              !oldUPIPin || !newUPIPin || !confirmNewUPIPin
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            Change UPI PIN
          </button>
          
          <button
            onClick={() => {
              setShowChangeUPIPin(false);
              setOldUPIPin('');
              setNewUPIPin('');
              setConfirmNewUPIPin('');
            }}
            className="w-full py-2 text-violet-600 font-medium hover:text-violet-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Delete Account Modal
  const DeleteAccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-violet-700 mb-2">Delete Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete your DPay account? This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Logout Confirmation Modal
  const LogoutConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-violet-700 mb-2">Logout Confirmation</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to logout from DPay?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ATM Card Modal
  const ATMCardModal = () => {
    if (!userProfile) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">ATM Card Details</h2>
            <button
              onClick={() => setShowAtmCard(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <div className="absolute top-4 right-4">
                <div className="w-12 h-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-md flex items-center justify-center">
                  <span className="text-xs font-bold text-black">VISA</span>
                </div>
              </div>
              
              <div className="text-left">
                <p className="text-sm opacity-80 mb-1">Card Number</p>
                <p className="text-2xl font-mono tracking-widest mb-6">
                  **** **** **** {userProfile.atmCardNumber?.slice(-4) || '****'}
                </p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-80 mb-1">Card Holder</p>
                    <p className="text-lg font-bold">{userProfile.username}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm opacity-80 mb-1">Valid Thru</p>
                    <p className="text-lg font-bold">12/28</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAtmCard(false)}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // QR Scanner Modal
  const QRScannerModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">QR Scanner</h2>
            <button
              onClick={() => {
                setShowQRScanner(false);
                setIsScanning(false);
                setScannedData('');
                setReceiverName('');
                setReceiverUPI('');
                setSendAmount('');
                setSendDescription('');
                setQrImageFile(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!scannedData ? (
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-64 h-64 mx-auto border-4 border-green-500 rounded-xl flex items-center justify-center bg-gray-100 overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-pulse"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 animate-pulse"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-green-500 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 animate-pulse"></div>
                    
                    <Camera className="w-16 h-16 text-green-500 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block mb-3 text-violet-700 font-medium">
                  Upload QR Code Image
                </label>
                <div className="border-2 border-dashed border-violet-300 rounded-xl p-6 text-center">
                  <Upload className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                  <p className="text-sm text-violet-600 mb-2">Upload QR code image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQRImageUpload}
                    className="hidden"
                    id="qr-upload"
                  />
                  <label
                    htmlFor="qr-upload"
                    className="inline-block px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                  {qrImageFile && (
                    <p className="text-xs text-violet-500 mt-2">
                      Selected: {qrImageFile.name}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={simulateQRScan}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Simulate QR Scan (Demo)
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-700">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-lg font-bold text-green-400 mb-2">QR Code Scanned Successfully!</p>
                <p className="text-sm text-gray-600">UPI Payment Request Detected</p>
              </div>
              
              <div className="mb-6 space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left">
                  <p className="text-sm text-gray-400 mb-1">Receiver Details</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{receiverName}</p>
                      <p className="text-sm text-gray-500">{receiverUPI}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Amount to Send (₹)
                  </label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={sendDescription}
                    onChange={(e) => setSendDescription(e.target.value)}
                    placeholder="e.g., For dinner"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setScannedData('');
                    setReceiverName('');
                    setReceiverUPI('');
                    setSendAmount('');
                    setSendDescription('');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleQRPayment}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Send Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Send Money Modal
  const SendMoneyModal = () => {
    useEffect(() => {
      if (sendToUPI || sendToMobile) {
        const timeoutId = setTimeout(() => {
          fetchReceiverDetails();
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }, [sendToUPI, sendToMobile]);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Send Money</h2>
            <button
              onClick={() => {
                setShowSendMoney(false);
                setSendToUPI('');
                setSendToMobile('');
                setSendMoneyAmount('');
                setSendMoneyDescription('');
                setReceiverDetails(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Send to UPI ID
              </label>
              <input
                type="text"
                value={sendToUPI}
                onChange={(e) => {
                  setSendToUPI(e.target.value);
                  if (e.target.value) setSendToMobile('');
                }}
                placeholder="e.g., username@dpay"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Send to Mobile Number
              </label>
              <input
                type="tel"
                value={sendToMobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setSendToMobile(value);
                  if (value) setSendToUPI('');
                }}
                placeholder="10-digit mobile number"
                maxLength="10"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            {/* Receiver Details */}
            {receiverDetails && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">{receiverDetails.username}</p>
                      <p className="text-sm text-green-600">
                        {receiverDetails.upiId || receiverDetails.mobile}
                      </p>
                    </div>
                  </div>
                  <BankStatusIndicator 
                    bankName={receiverDetails.bankName} 
                    status={bankServerStatus[receiverDetails.bankName]?.status}
                  />
                </div>
                <p className="text-xs text-green-600">
                  Bank: {receiverDetails.bankName}
                </p>
              </div>
            )}
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={sendMoneyAmount}
                onChange={(e) => setSendMoneyAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={sendMoneyDescription}
                onChange={(e) => setSendMoneyDescription(e.target.value)}
                placeholder="e.g., For groceries"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            {/* Sender Bank Status */}
            {userProfile && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-600">Your Bank Status</p>
                    <p className="font-medium text-blue-800">{userProfile.bankName}</p>
                  </div>
                  <BankStatusIndicator 
                    bankName={userProfile.bankName} 
                    status={bankServerStatus[userProfile.bankName]?.status}
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={handleSendMoney}
              disabled={!sendMoneyAmount || (!sendToUPI && !sendToMobile)}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !sendMoneyAmount || (!sendToUPI && !sendToMobile)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              Send Money
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Recharge Modal
  const MobileRechargeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Mobile Recharge</h2>
          <button
            onClick={() => {
              setShowMobileRecharge(false);
              setRechargeMobile('');
              setSelectedOperator(null);
              setSelectedPlan(null);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <label className="block text-sm font-medium text-violet-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={rechargeMobile}
              onChange={(e) => setRechargeMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              maxLength="10"
              className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <label className="block text-sm font-medium text-violet-700 mb-3">
              Select Operator
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TELECOM_OPERATORS.map((operator) => (
                <button
                  key={operator.id}
                  onClick={() => {
                    setSelectedOperator(operator);
                    setSelectedPlan(null);
                  }}
                  className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                    selectedOperator?.id === operator.id
                      ? 'border-violet-600 bg-violet-100'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${operator.color}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{operator.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {selectedOperator && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-3">
                Select Plan - {selectedOperator.name}
              </label>
              <div className="space-y-3">
                {RECHARGE_PLANS[selectedOperator.id]?.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 rounded-xl border-2 transition text-left ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xl font-bold text-blue-800">₹{plan.amount}</p>
                        <p className="text-sm text-blue-600">{plan.validity}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          plan.description === 'Popular Plan'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {plan.description}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Data: {plan.data}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedOperator && selectedPlan && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-700">Selected Plan</p>
                <p className="text-lg font-bold text-green-800">₹{selectedPlan.amount}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-green-600">Operator</p>
                  <p className="font-medium text-green-700">{selectedOperator.name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-green-600">Validity</p>
                  <p className="font-medium text-green-700">{selectedPlan.validity}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-green-600">Daily Data</p>
                  <p className="font-medium text-green-700">{selectedPlan.data}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleMobileRecharge}
            disabled={!rechargeMobile || !selectedOperator || !selectedPlan}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              !rechargeMobile || !selectedOperator || !selectedPlan
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {selectedPlan ? `Recharge for ₹${selectedPlan.amount}` : 'Proceed to Recharge'}
          </button>
        </div>
      </div>
    </div>
  );

  // Bills Modal
  const BillsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Pay Bills</h2>
          <button
            onClick={() => {
              setShowBills(false);
              setSelectedBillCategory(null);
              setBillNumber('');
              setBillAmount('');
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {!selectedBillCategory ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-sm text-violet-700 mb-3">Select Bill Category</p>
              <div className="grid grid-cols-2 gap-3">
                {BILLS_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedBillCategory(category)}
                    className={`p-4 rounded-xl border-2 transition flex flex-col items-center ${category.color.replace('text-', 'border-').replace('bg-', 'hover:bg-')} border-gray-200 hover:border-current`}
                  >
                    <category.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium text-center">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setSelectedBillCategory(null)}
                  className="text-violet-600 hover:text-violet-700"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBillCategory.color}`}>
                  <selectedBillCategory.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-violet-800">{selectedBillCategory.name}</h3>
                  <p className="text-xs text-violet-600">Enter bill details</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-violet-700 mb-2">
                    {selectedBillCategory.id === 'electricity' ? 'Consumer Number' : 
                     selectedBillCategory.id === 'dth' ? 'DTH Number' :
                     selectedBillCategory.id === 'fastag' ? 'Vehicle Number' :
                     selectedBillCategory.id === 'gas' ? 'Consumer Number' :
                     selectedBillCategory.id === 'water' ? 'Consumer Number' :
                     selectedBillCategory.id === 'broadband' ? 'Account Number' : 'Bill Number'}
                  </label>
                  <input
                    type="text"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    placeholder={`Enter ${selectedBillCategory.name.toLowerCase()} number`}
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-violet-700 mb-2">
                    Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="Enter bill amount"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleBillPayment}
              disabled={!billNumber || !billAmount}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !billNumber || !billAmount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              Pay Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Rewards Modal
  const RewardsModal = () => {
    const userRefCode = userProfile?.referralCode || 'DPREF123';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Rewards</h2>
            <button
              onClick={() => setShowRewards(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
              <Gift className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-violet-800 mb-2">Earn Rewards!</h3>
            
            <div className="mb-6 space-y-4">
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                <p className="text-sm text-violet-600 mb-2">Your Referral Code</p>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-violet-200">
                  <code className="text-violet-800 font-mono text-lg font-bold">
                    {userRefCode}
                  </code>
                  <button
                    onClick={handleCopyReferralCode}
                    className="ml-3 flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-violet-500 mt-2">
                  Share this code with friends when they sign up
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-sm text-green-600 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-green-700">₹{userProfile?.balance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowRewards(false)}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // App Balance Modal
  const AppBalanceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">App Balance</h2>
          <button
            onClick={() => setShowAppBalance(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-violet-800 mb-2">Current App Balance</h3>
          <p className={`text-4xl font-bold mb-6 ${(userProfile?.appBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹{(userProfile?.appBalance || 0).toFixed(2)}
          </p>
          
          <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-200">
            <p className="text-sm text-violet-600 mb-3">App Balance is used for:</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Bank downtime coverage</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Transaction buffer</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Rewards storage</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAppBalance(false)}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // User Details Modal with Admin Panel
  const UserDetailsModal = () => {
    if (!userProfile) return null;

    const currentProfile = isEditingProfile ? editedProfile : userProfile;
    const isAdmin = userProfile.mobile === '7825007490';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">
              {isEditingProfile ? 'Edit Profile' : 'My Profile'}
            </h2>
            <button
              onClick={() => {
                setShowUserDetails(false);
                setIsEditingProfile(false);
                setEditedProfile(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            {/* Profile Photo */}
            <div className="mb-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden border-4 border-violet-200">
                  {currentProfile?.photo ? (
                    <img 
                      src={currentProfile.photo} 
                      alt={currentProfile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-violet-600" />
                  )}
                </div>
                {isEditingProfile && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-700 transition">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditingProfile ? (
                <div className="mt-3">
                  <input
                    type="text"
                    value={currentProfile.username}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                    className="text-xl font-bold text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500 text-center"
                    placeholder="Enter your name"
                  />
                </div>
              ) : (
                <div className="mt-3">
                  <h3 className="text-xl font-bold text-violet-800">{currentProfile.username}</h3>
                  <p className="text-sm text-violet-600">DPay User</p>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Credit Score Section */}
                {userProfile.creditScore && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <p className="text-sm opacity-90 mb-1">Your Credit Score</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{userProfile.creditScore}</p>
                        <p className="text-xs opacity-90">CIBIL Score</p>
                      </div>
                      <div className="w-32 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400"
                          style={{ width: `${(userProfile.creditScore - 300) / 5.5}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs mt-2 opacity-90">
                      {userProfile.creditScore >= 750 ? 'Excellent' : 
                       userProfile.creditScore >= 700 ? 'Good' : 
                       userProfile.creditScore >= 650 ? 'Fair' : 'Poor'} - Updated monthly
                    </p>
                  </div>
                )}
                
                {/* Account Information */}
                <div className="mb-6 space-y-4">
                  <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-violet-600">Account Information</p>
                      {!isEditingProfile && (
                        <button
                          onClick={handleEditProfile}
                          className="text-violet-600 hover:text-violet-700 flex items-center gap-1 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-violet-500">Email Address</p>
                        {isEditingProfile ? (
                          <input
                            type="email"
                            value={currentProfile.email}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full font-medium text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500"
                          />
                        ) : (
                          <p className="font-medium text-violet-800">{currentProfile.email}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-violet-500">Mobile Number</p>
                        {isEditingProfile ? (
                          <input
                            type="tel"
                            value={currentProfile.mobile}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, mobile: e.target.value }))}
                            className="w-full font-medium text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500"
                            maxLength="10"
                          />
                        ) : (
                          <p className="font-medium text-violet-800">+91 {currentProfile.mobile}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-violet-500">PAN Number</p>
                        <p className="font-medium text-violet-800">{currentProfile.panNumber || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-violet-500">Member Since</p>
                        <p className="font-medium text-violet-800">
                          {currentProfile.registrationDate ? formatDate(currentProfile.registrationDate) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bank Information */}
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Bank Information
                      </p>
                      <BankStatusIndicator 
                        bankName={currentProfile.bankName} 
                        status={bankServerStatus[currentProfile.bankName]?.status}
                      />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-green-500">Bank Name</p>
                        <p className="font-medium text-green-800">{currentProfile.bankName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-500">Account Number</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-green-800">
                            •••• {currentProfile.accountNumber ? currentProfile.accountNumber.slice(-4) : '****'}
                          </p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Linked
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* UPI Information */}
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-left">
                    <p className="text-sm text-purple-600 mb-1 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      UPI Information
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-purple-500">UPI ID</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-purple-800 truncate mr-2">{currentProfile.upiId}</p>
                          <button
                            onClick={handleCopyUPI}
                            className="flex-shrink-0 text-purple-600 hover:text-purple-800"
                            title="Copy UPI ID"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-purple-500">Referral Code</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-purple-800">{currentProfile.referralCode}</p>
                          <button
                            onClick={handleCopyReferralCode}
                            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition"
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {isEditingProfile ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedProfile(null);
                        }}
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold border border-gray-400 hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowUserDetails(false);
                          checkBalance();
                        }}
                        className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2"
                      >
                        <Wallet className="w-5 h-5" />
                        Check Balance
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserDetails(false);
                          viewTransactionHistory();
                        }}
                        className="w-full py-3 rounded-xl bg-violet-100 text-violet-700 font-semibold border border-violet-400 hover:bg-violet-200 transition flex items-center justify-center gap-2"
                      >
                        <History className="w-5 h-5" />
                        View Transactions
                      </button>
                      
                      {isAdmin && (
                        <button
                          onClick={handleAdminPanel}
                          className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2"
                        >
                          <Settings className="w-5 h-5" />
                          Admin Panel
                        </button>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold border border-red-200 hover:bg-red-100 transition flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-3 rounded-xl bg-red-100 text-red-700 font-semibold border border-red-300 hover:bg-red-200 transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete Account
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Admin Panel Modal
  const AdminPanelModal = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [bankStatusEdit, setBankStatusEdit] = useState(null);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Admin Panel</h2>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  activeTab === 'users' 
                    ? 'text-violet-600 border-b-2 border-violet-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('banks')}
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  activeTab === 'banks' 
                    ? 'text-violet-600 border-b-2 border-violet-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building className="w-4 h-4 inline-block mr-2" />
                Bank Status
              </button>
            </div>
          </div>
          
          {activeTab === 'users' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-violet-800">All Users ({allUsers.length})</h3>
                <div className="text-sm text-violet-600">
                  Admin: {userProfile?.username}
                </div>
              </div>
              
              <div className="space-y-3">
                {allUsers.map((user) => (
                  <div key={user._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Mobile: {user.mobile}</p>
                        <p className="text-xs text-gray-500">UPI: {user.upiId}</p>
                        <p className="text-xs text-gray-500">Bank: {user.bankName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{user.balance?.toFixed(2)}</p>
                        <p className={`text-xs ${user.appBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          App: ₹{user.appBalance?.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="mt-2 text-xs bg-violet-600 text-white px-3 py-1 rounded hover:bg-violet-700"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-violet-700">Edit User</h3>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-violet-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={editingUser.username}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-3 py-2 border border-violet-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-violet-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-violet-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-violet-700 mb-1">Mobile</label>
                        <input
                          type="tel"
                          value={editingUser.mobile}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, mobile: e.target.value }))}
                          className="w-full px-3 py-2 border border-violet-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-violet-700 mb-1">Balance</label>
                        <input
                          type="number"
                          value={editingUser.balance}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-violet-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-violet-700 mb-1">App Balance</label>
                        <input
                          type="number"
                          value={editingUser.appBalance}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, appBalance: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-violet-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleSaveUser}
                          className="flex-1 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-violet-800 mb-4">Bank Server Status Management</h3>
              
              <div className="space-y-3">
                {Object.entries(bankServerStatus).map(([bankName, status]) => (
                  <div key={bankName} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{bankName}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={`font-medium ${
                            status.status === 'active' ? 'text-green-600' :
                            status.status === 'slow' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {status.status}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Response: {status.responseTime}
                        </p>
                      </div>
                      
                      <div className="space-x-2">
                        <button
                          onClick={() => handleUpdateBankStatus(bankName, 'active')}
                          className={`px-3 py-1 rounded text-xs ${
                            status.status === 'active' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => handleUpdateBankStatus(bankName, 'slow')}
                          className={`px-3 py-1 rounded text-xs ${
                            status.status === 'slow' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          Slow
                        </button>
                        <button
                          onClick={() => handleUpdateBankStatus(bankName, 'down')}
                          className={`px-3 py-1 rounded text-xs ${
                            status.status === 'down' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Down
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAdminPanel(false)}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Close Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // QR Code Modal
  const QRCodeModal = () => {
    if (!userProfile) return null;
    
    const qrData = `upi://pay?pa=${userProfile.upiId}&pn=${encodeURIComponent(userProfile.username)}&cu=INR`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Receive Money</h2>
            <button
              onClick={() => setShowQRCode(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-violet-600 mb-4">Scan this QR code to pay</p>
              
              <div className="flex justify-center mb-6">
                <SimpleQRCode data={qrData} size={220} />
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-violet-600 mb-2">Your UPI ID</p>
                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-200">
                  <code className="text-violet-800 font-mono text-sm break-all flex-1 text-left">
                    {userProfile.upiId}
                  </code>
                  <button
                    onClick={handleCopyUPI}
                    className="ml-3 flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition min-w-[80px]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowQRCode(false)}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Balance Modal
  const BalanceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Account Balance</h2>
          <button
            onClick={() => setShowBalance(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-green-600" />
          </div>
          
          <p className="text-sm text-violet-600 mb-2">Available Balance</p>
          <p className="text-4xl font-bold text-violet-800 mb-6">₹{userProfile?.balance?.toFixed(2) || '0.00'}</p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-sm text-violet-600 mb-1">Account Holder</p>
              <p className="font-semibold text-violet-800">{userProfile?.username}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-sm text-violet-600 mb-1">UPI ID</p>
              <p className="font-semibold text-violet-800">{userProfile?.upiId}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-violet-600">Bank Account</p>
                <BankStatusIndicator 
                  bankName={userProfile?.bankName} 
                  status={bankServerStatus[userProfile?.bankName]?.status}
                />
              </div>
              <p className="font-medium text-violet-800">{userProfile?.bankName}</p>
            </div>
            
            <div className={`p-4 rounded-xl border ${
              (userProfile?.appBalance || 0) < 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm">App Balance</p>
                <BatteryCharging className={`w-4 h-4 ${
                  (userProfile?.appBalance || 0) < 0 ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              <p className={`text-xl font-bold ${
                (userProfile?.appBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ₹{(userProfile?.appBalance || 0).toFixed(2)}
              </p>
              <p className="text-xs mt-1">
                {(userProfile?.appBalance || 0) < 0 
                  ? 'Negative balance will be recovered when bank is active'
                  : 'Available for transactions'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowBalance(false)}
            className="w-full mt-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Transaction History Modal
  const HistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Transaction History</h2>
          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-violet-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-violet-800">₹{userProfile?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-violet-600 mb-1">Bank Status</p>
              <BankStatusIndicator 
                bankName={userProfile?.bankName} 
                status={bankServerStatus[userProfile?.bankName]?.status}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction._id} className="p-4 rounded-xl border border-violet-200 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-violet-800">{transaction.description}</p>
                    <p className="text-sm text-violet-500">
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN')} • {new Date(transaction.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </p>
                    <p className="text-sm text-violet-500">Status: {transaction.status}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-violet-300 mx-auto mb-3" />
              <p className="text-violet-600">No transactions yet</p>
              <p className="text-sm text-violet-400 mt-1">Your transactions will appear here</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowHistory(false)}
          className="w-full mt-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Show auth screen if not logged in
  if (!loggedIn || showAuth) {
    if (authMode === 'register') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-violet-700">Create Account</h1>
              {loggedIn && (
                <button
                  onClick={() => setShowAuth(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            <p className="text-sm text-violet-600 mb-4">Register to use DPay services</p>

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                    placeholder="Full Name *"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="Email Address *"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    value={registerData.mobile}
                    onChange={(e) => setRegisterData({...registerData, mobile: e.target.value})}
                    placeholder="Mobile Number *"
                    maxLength="10"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    value={registerData.panNumber}
                    onChange={(e) => setRegisterData({...registerData, panNumber: e.target.value.toUpperCase()})}
                    placeholder="PAN Number * (Format: ABCDE1234F)"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="date"
                    value={registerData.dob}
                    onChange={(e) => setRegisterData({...registerData, dob: e.target.value})}
                    placeholder="Date of Birth (Optional)"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <div className="relative">
                    <select
                      value={registerData.bankName}
                      onChange={(e) => setRegisterData({...registerData, bankName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none bg-white"
                      required
                    >
                      <option value="">Select Bank *</option>
                      {INDIAN_BANKS.map((bank, index) => (
                        <option key={index} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <Building className="absolute right-3 top-3.5 w-5 h-5 text-violet-500 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={registerData.accountNumber}
                    onChange={(e) => setRegisterData({...registerData, accountNumber: e.target.value})}
                    placeholder="Bank Account Number *"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    value={registerData.atmCardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setRegisterData({...registerData, atmCardNumber: value});
                    }}
                    placeholder="ATM Card Number (16 digits) *"
                    maxLength="19"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                    required
                  />
                </div>
                
                <div>
                  <div className="relative">
                    <input
                      type={showUpiPin ? "text" : "password"}
                      value={registerData.upiPin}
                      onChange={(e) => setRegisterData({...registerData, upiPin: e.target.value})}
                      placeholder="Set 4-digit UPI PIN *"
                      maxLength="4"
                      className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowUpiPin(!showUpiPin)}
                      className="absolute right-3 top-3.5 text-violet-500"
                    >
                      {showUpiPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={registerData.referralCode}
                    onChange={(e) => setRegisterData({...registerData, referralCode: e.target.value})}
                    placeholder="Referral Code (Optional)"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-violet-700">
                    Profile Photo (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-violet-300 hover:border-violet-500 cursor-pointer transition">
                      <Upload className="w-5 h-5 text-violet-600" />
                      <span className="text-sm text-violet-600">Choose Photo (Optional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {photoPreview && (
                    <div className="mt-3 flex justify-center">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-violet-300" />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRegister}
                  className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition mt-4"
                >
                  Create Account
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-violet-600 hover:text-violet-700 font-medium text-sm"
                  >
                    Already have an account? Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Login Screen
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-violet-700">DPay</h1>
          </div>

          <p className="text-sm text-violet-600 mb-6 text-center">
            {step === 'identifier' ? 'Login to access DPay services' : 'Enter OTP to continue'}
          </p>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {step === 'identifier' ? (
                <>
                  <div className="mb-4">
                    <div className="flex border border-violet-300 rounded-xl overflow-hidden mb-4">
                      <button
                        onClick={() => setOtpMethod('mobile')}
                        className={`flex-1 py-3 text-center font-medium transition ${
                          otpMethod === 'mobile' 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-violet-50 text-violet-700'
                        }`}
                      >
                        Mobile OTP
                      </button>
                      <button
                        onClick={() => setOtpMethod('email')}
                        className={`flex-1 py-3 text-center font-medium transition ${
                          otpMethod === 'email' 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-violet-50 text-violet-700'
                        }`}
                      >
                        Email OTP
                      </button>
                    </div>
                    
                    {otpMethod === 'mobile' ? (
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    ) : (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    )}
                  </div>
                  
                  <button
                    onClick={sendOTP}
                    className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
                  >
                    Send OTP
                  </button>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-violet-500 mb-2">New to DPay?</p>
                    <button
                      onClick={() => setAuthMode('register')}
                      className="text-violet-600 hover:text-violet-700 font-medium border border-violet-300 px-4 py-2 rounded-lg hover:bg-violet-50 transition"
                    >
                      Create Account
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-violet-600 mb-2">
                    OTP sent to {otpMethod === 'mobile' ? `+91 ${mobile}` : email}
                  </p>
                  <p className="text-xs text-violet-400 mb-4">
                    For demo, OTP is: {generatedOTP}
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full mb-4 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-center text-lg"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
                  >
                    Login to DPay
                  </button>
                  <button
                    onClick={() => {
                      setStep('identifier');
                      setOtp('');
                    }}
                    className="w-full mt-3 py-2 text-violet-600 font-medium hover:text-violet-700"
                  >
                    Change {otpMethod === 'mobile' ? 'Number' : 'Email'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Main App
  return (
    <>
      <div className="min-h-screen scroll-smooth bg-violet-50 flex items-center justify-center">
        <div className="w-full mt-1 max-w-sm bg-white rounded-2xl shadow-lg p-6 pb-28">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-violet-700">DPay</h1>
              {userProfile && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-violet-600">
                    Hi, {userProfile.username}!
                  </p>
                  <BankStatusIndicator 
                    bankName={userProfile.bankName} 
                    status={bankServerStatus[userProfile.bankName]?.status}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={handleUserProfileClick}
                className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition overflow-hidden border-2 border-violet-300"
                title="View Profile"
              >
                {userProfile?.photo ? (
                  <img 
                    src={userProfile.photo} 
                    alt={userProfile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-violet-700" />
                )}
              </button>
              {userProfile && (
                <p className="text-xs text-violet-500 mt-1">
                  {userProfile.upiId?.split('@')[0]}...
                </p>
              )}
            </div>
          </div>

          {/* QR Scanner */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={handleQRScan}
              className="w-56 h-56 border-4 border-dashed border-violet-500 rounded-xl flex items-center justify-center bg-violet-100 hover:bg-violet-200 transition cursor-pointer active:scale-95"
            >
              <div className="text-center">
                <div className="relative">
                  <ScanLine className="w-16 h-16 text-violet-600 mx-auto animate-pulse" />
                  <div className="absolute -inset-4 border-4 border-green-500 rounded-xl animate-ping opacity-20"></div>
                </div>
                <p className="mt-3 text-violet-600 font-medium">Scan & Pay</p>
                <p className="text-xs text-violet-500 mt-1">Tap to scan QR code</p>
              </div>
            </button>
          </div>

          {/* Main Actions */}
          <div className="space-y-4 mb-6">
            <button
              onClick={() => setShowSendMoney(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              <Send className="w-5 h-5" />
              Send Money
            </button>

            <button
              onClick={() => setShowQRCode(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-100 text-violet-700 font-semibold border border-violet-400 hover:bg-violet-200 transition"
            >
              <QrCode className="w-5 h-5" />
              Receive Money (QR)
            </button>
          </div>

          {/* More Services */}
          <h2 className="text-violet-700 font-semibold mb-3">More Services</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowMobileRecharge(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition"
            >
              <Smartphone className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Mobile Recharge</span>
            </button>
            <button
              onClick={() => setShowRewards(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
            >
              <Gift className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Rewards</span>
            </button>
            <button
              onClick={() => setShowBills(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition"
            >
              <Receipt className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Bills</span>
            </button>
            
            {/* App Balance Button */}
            <button
              onClick={() => setShowAppBalance(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition"
            >
              <Wallet className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">App Balance</span>
            </button>
            
            {/* ATM Card Button */}
            <button
              onClick={handleViewATMCard}
              className="flex flex-col items-center p-4 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              <AtmCard className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">ATM Card</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-violet-200 p-4">
          <div className="max-w-sm mx-auto flex gap-3">
            <button
              onClick={checkBalance}
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Check Balance
            </button>
            <button
              onClick={viewTransactionHistory}
              className="flex-1 py-3 rounded-xl bg-violet-100 text-violet-700 font-semibold border border-violet-400 hover:bg-violet-200 transition flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              Transaction History
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBalance && <BalanceModal />}
      {showHistory && <HistoryModal />}
      {showQRCode && <QRCodeModal />}
      {showAppBalance && <AppBalanceModal />}
      {showUserDetails && <UserDetailsModal />}
      {showQRScanner && <QRScannerModal />}
      {showSendMoney && <SendMoneyModal />}
      {showRewards && <RewardsModal />}
      {showMobileRecharge && <MobileRechargeModal />}
      {showBills && <BillsModal />}
      {showAtmCard && <ATMCardModal />}
      {showUPIPinModal && <UPIPinModal />}
      {showChangeUPIPin && <ChangeUPIPinModal />}
      {showLogoutConfirm && <LogoutConfirmModal />}
      {showDeleteConfirm && <DeleteAccountModal />}
      {showAdminPanel && <AdminPanelModal />}
      {showDowntimeNotification && (
        <BankDowntimeNotification
          isOpen={showDowntimeNotification}
          onClose={() => setShowDowntimeNotification(false)}
          message={downtimeMessage}
          transactionId={downtimeTransactionId}
          amount={downtimeAmount}
          type={downtimeType}
        />
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <LoadingSpinner />
          </div>
        </div>
      )}
    </>
  );
}
