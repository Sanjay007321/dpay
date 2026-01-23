import { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, Send, User, Smartphone, Gift, Receipt, Landmark, Wallet, History, Upload, Eye, EyeOff, CreditCard, Building, Copy, Check, X, DollarSign, CreditCard as Card, Calendar, AlertCircle, Edit, Camera, Home, GraduationCap, Sprout, Gem, Stethoscope, Shield, Zap, Tv, Tag, Flame, Battery, Wifi, Phone, FileText, Search, ChevronRight, ShieldCheck, Clock, Percent, TrendingUp, Server, Activity, WifiOff, CreditCard as AtmCard, Image as ImageIcon, Loader2, Save, Key, Mail, LogOut, Trash2, Scissors, Star, Award, Trophy, Coffee, Pizza, ShowerHead, Dumbbell, Book, Gamepad2, Music, Film, Car, ShoppingBag, Plane, Heart, Bell, BellOff, AlertTriangle, BatteryCharging } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000/api";

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
    { id: 5, amount: 799, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' }
  ],
  jio: [
    { id: 1, amount: 155, validity: '28 days', data: '1.5GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Popular Plan' },
    { id: 3, amount: 395, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 666, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' },
    { id: 5, amount: 999, validity: '84 days', data: '2.5GB/day', description: 'Premium' }
  ],
  vi: [
    { id: 1, amount: 199, validity: '28 days', data: '1.5GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Popular Plan' },
    { id: 3, amount: 399, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 599, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' }
  ],
  bsnl: [
    { id: 1, amount: 199, validity: '28 days', data: '2GB/day', description: 'STV 199' },
    { id: 2, amount: 299, validity: '28 days', data: '3GB/day', description: 'STV 299' },
    { id: 3, amount: 399, validity: '56 days', data: '2GB/day', description: 'STV 399' },
    { id: 4, amount: 549, validity: '84 days', data: '2GB/day', description: 'STV 549' }
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
const BankStatusIndicator = ({ bankName, serverStatus }) => {
  const status = serverStatus || { status: 'unknown', isActive: false };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'slow': return 'bg-yellow-100 text-yellow-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Activity className="w-3 h-3" />;
      case 'slow': return <Clock className="w-3 h-3" />;
      case 'down': return <WifiOff className="w-3 h-3" />;
      default: return <Server className="w-3 h-3" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(status.status)}`}>
      {getStatusIcon(status.status)}
      <span className="capitalize">{status.status}</span>
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
    
    // Auto-hide after 5 seconds for info messages
    if (isOpen && type === 'info') {
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

  const getTextColor = () => {
    switch(type) {
      case 'warning': return 'text-amber-800';
      case 'error': return 'text-red-800';
      case 'success': return 'text-green-800';
      default: return 'text-violet-800';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 w-96 z-50 animate-slide-in">
      <div className={`${getBgColor()} border rounded-xl shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className={`font-medium ${getTextColor()}`}>{message}</p>
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
  // Bank Status APIs
  async getBankStatus(bankName = null) {
    const url = bankName 
      ? `${API_BASE_URL}/banks/status?bank=${encodeURIComponent(bankName)}`
      : `${API_BASE_URL}/banks/status`;
    const response = await fetch(url);
    return response.json();
  },

  // Auth APIs
  async sendOTP(identifier, method) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [method]: identifier })
    });
    return response.json();
  },

  async verifyOTP(identifier, otp, method) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
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

  // Search Users (for receiver details)
  async searchUser(token, identifier) {
    const response = await fetch(`${API_BASE_URL}/users/search/${identifier}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Admin APIs
  async adminUpdateBankStatus(token, bankName, status) {
    const response = await fetch(`${API_BASE_URL}/admin/bank-status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bankName, status })
    });
    return response.json();
  },

  async adminGetAllUsers(token) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async adminUpdateUser(token, userId, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
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

  // Payment APIs with Bank Downtime Handling
  async processPayment(token, paymentData) {
    const response = await fetch(`${API_BASE_URL}/payments/downtime`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },

  // Pending Transactions APIs
  async getPendingTransactions(token, userId) {
    const response = await fetch(`${API_BASE_URL}/transactions/pending/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async recoverTransactions(token, userId) {
    const response = await fetch(`${API_BASE_URL}/payments/recover`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
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
  const [videoStream, setVideoStream] = useState(null);
  const [receiverDetails, setReceiverDetails] = useState(null);
  const videoRef = useRef(null);
  
  // Send Money States
  const [sendToUPI, setSendToUPI] = useState('');
  const [sendToMobile, setSendToMobile] = useState('');
  const [sendMoneyAmount, setSendMoneyAmount] = useState('');
  const [sendMoneyDescription, setSendMoneyDescription] = useState('');
  const [searchedReceiver, setSearchedReceiver] = useState(null);
  
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
  const [bankServerStatus, setBankServerStatus] = useState({});
  
  // Pending Transactions
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
  // Admin States
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [adminAction, setAdminAction] = useState('');
  
  // Transactions
  const [transactions, setTransactions] = useState([]);
  
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

  // Check if user is admin
  useEffect(() => {
    if (userProfile && userProfile.mobile === '7825007490') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userProfile]);

  // Fetch bank server status periodically
  useEffect(() => {
    const fetchBankStatus = async () => {
      try {
        const response = await apiService.getBankStatus();
        if (response.success) {
          setBankServerStatus(response.status);
        }
      } catch (error) {
        console.error('Error fetching bank status:', error);
      }
    };

    fetchBankStatus();
    const interval = setInterval(fetchBankStatus, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Check for pending transactions to recover
  useEffect(() => {
    const checkAndRecoverTransactions = async () => {
      if (!loggedIn || !userProfile || pendingTransactions.length === 0) return;
      
      const token = localStorage.getItem('dpay_token');
      if (!token) return;
      
      try {
        // Check if any bank is active for pending transactions
        const canRecover = pendingTransactions.some(tx => {
          const senderBankStatus = bankServerStatus[tx.senderBank];
          const receiverBankStatus = bankServerStatus[tx.receiverBank];
          return senderBankStatus?.isActive && receiverBankStatus?.isActive;
        });
        
        if (canRecover) {
          const response = await apiService.recoverTransactions(token, userProfile._id);
          if (response.success && response.recoveredTransactions.length > 0) {
            setDowntimeMessage(`Recovered ${response.recoveredTransactions.length} pending transaction(s)`);
            setDowntimeType('success');
            setShowDowntimeNotification(true);
            
            // Update user profile
            const profileResponse = await apiService.getUserProfile(token, userProfile._id);
            if (profileResponse.success) {
              setUserProfile(profileResponse.user);
            }
            
            // Update pending transactions
            const pendingResponse = await apiService.getPendingTransactions(token, userProfile._id);
            if (pendingResponse.success) {
              setPendingTransactions(pendingResponse.transactions);
            }
            
            // Update transactions
            const txResponse = await apiService.getTransactions(token, userProfile._id);
            if (txResponse.success) {
              setTransactions(txResponse.transactions);
            }
          }
        }
      } catch (error) {
        console.error('Error recovering transactions:', error);
      }
    };

    checkAndRecoverTransactions();
  }, [loggedIn, userProfile, pendingTransactions, bankServerStatus]);

  // Check if user has session token
  useEffect(() => {
    const token = localStorage.getItem('dpay_token');
    const userId = localStorage.getItem('dpay_user_id');
    
    if (token && userId) {
      loadUserProfile(token, userId);
    }
  }, []);

  const loadUserProfile = async (token, userId) => {
    try {
      setIsLoading(true);
      setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);
      
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
        
        // Load pending transactions
        const pendingResponse = await apiService.getPendingTransactions(token, userId);
        if (pendingResponse.success) {
          setPendingTransactions(pendingResponse.transactions || []);
        }
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
    setIsLoading(true);
    setLoadingMessage("Sending OTP...");
    
    try {
      const identifier = otpMethod === 'mobile' ? mobile : email;
      const response = await apiService.sendOTP(identifier, otpMethod);
      
      if (response.success) {
        setGeneratedOTP(response.otp);
        alert(`OTP sent! For demo, use OTP: ${response.otp}`);
        setStep('otp');
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

  // Generate QR code data for UPI
  const generateQRCodeData = (upiId, name, amount = '') => {
    const amountParam = amount ? `&am=${amount}` : '';
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}${amountParam}&cu=INR&tn=DPay%20Payment`;
  };

  // Format ATM Card Number with spaces
  const formatATMCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Mask ATM Card Number
  const maskATMCardNumber = (cardNumber) => {
    if (!cardNumber) return '**** **** **** ****';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 12) return '**** **** **** ****';
    const last4 = cleaned.slice(-4);
    return `**** **** **** ${last4}`;
  };

  // Search receiver by UPI ID or Mobile
  const searchReceiver = async (identifier) => {
    if (!identifier) return;
    
    const token = localStorage.getItem('dpay_token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.searchUser(token, identifier);
      
      if (response.success && response.user) {
        setSearchedReceiver(response.user);
        return response.user;
      } else {
        setSearchedReceiver(null);
        return null;
      }
    } catch (error) {
      console.error('Error searching receiver:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle money transfer
  const handleMoneyTransfer = async (amount, description, receiverDetails) => {
    const token = localStorage.getItem('dpay_token');
    const userId = localStorage.getItem('dpay_user_id');
    
    if (!token || !userId) {
      alert('Session expired. Please login again.');
      return false;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Processing payment...');
      
      const paymentData = {
        userId,
        amount: parseFloat(amount),
        description,
        receiverDetails,
        category: 'payment',
        upiPin: upiPinValue
      };
      
      const response = await apiService.processPayment(token, paymentData);
      
      if (response.success) {
        // Update local state
        setTransactions(prev => [response.transaction, ...prev]);
        
        // Update user profile
        const profileResponse = await apiService.getUserProfile(token, userId);
        if (profileResponse.success) {
          setUserProfile(profileResponse.user);
        }
        
        // Update pending transactions
        const pendingResponse = await apiService.getPendingTransactions(token, userId);
        if (pendingResponse.success) {
          setPendingTransactions(pendingResponse.transactions);
        }
        
        setDowntimeMessage(response.message);
        setDowntimeType('success');
        setDowntimeTransactionId(response.transaction._id);
        setDowntimeAmount(amount);
        setShowDowntimeNotification(true);
        
        return true;
      } else {
        alert(response.message || 'Transaction failed');
        return false;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Transaction failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle QR Scanner with Camera Access
  const handleQRScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setVideoStream(stream);
      setShowQRScanner(true);
      setIsScanning(true);
      setScannedData('');
      setReceiverName('');
      setReceiverUPI('');
      setSendAmount('');
      setSendDescription('');
      setReceiverDetails(null);
    } catch (error) {
      alert('Camera access denied. Using demo mode instead.');
      
      // Fallback to simulated scan
      setShowQRScanner(true);
      setIsScanning(true);
      setScannedData('');
      setReceiverName('');
      setReceiverUPI('');
      setSendAmount('');
      setSendDescription('');
      setReceiverDetails(null);
      
      setTimeout(() => {
        simulateQRScan();
      }, 1000);
    }
  };

  // Clean up video stream
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  // Simulate QR Code scanning
  const simulateQRScan = () => {
    // For demo, use current user's QR data
    if (userProfile) {
      const demoQRData = generateQRCodeData(userProfile.upiId, userProfile.username, '500');
      setScannedData(demoQRData);
      
      // Parse UPI data
      const params = new URLSearchParams(demoQRData.split('?')[1]);
      setReceiverUPI(params.get('pa') || userProfile.upiId);
      setReceiverName(decodeURIComponent(params.get('pn') || userProfile.username));
      setSendAmount(params.get('am') || '500');
      
      // Set receiver details
      setReceiverDetails({
        name: userProfile.username,
        upi: userProfile.upiId,
        mobile: userProfile.mobile,
        bankName: userProfile.bankName
      });
    }
  };

  // Handle QR Scanner Payment
  const handleQRPayment = async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!receiverDetails) {
      alert('Receiver details not found');
      return;
    }

    // Request UPI PIN for payment
    setUpiPinAction({
      type: 'qr_payment',
      data: {
        amount: parseFloat(sendAmount),
        description: sendDescription || `Payment to ${receiverDetails.name}`,
        receiverDetails: receiverDetails
      }
    });
    setShowUPIPinModal(true);
  };

  // Handle Send Money
  const handleSendMoney = async () => {
    if (!sendMoneyAmount || parseFloat(sendMoneyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!sendToUPI && !sendToMobile) {
      alert('Please enter UPI ID or Mobile Number');
      return;
    }

    // Search for receiver
    const receiver = await searchReceiver(sendToUPI || sendToMobile);
    if (!receiver) {
      alert('Receiver not found. Please check the UPI ID or Mobile Number');
      return;
    }

    // Request UPI PIN for payment
    setUpiPinAction({
      type: 'send_money',
      data: {
        amount: parseFloat(sendMoneyAmount),
        description: sendMoneyDescription || `Payment to ${receiver.username}`,
        receiverDetails: {
          name: receiver.username,
          upi: receiver.upiId,
          mobile: receiver.mobile,
          bankName: receiver.bankName
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
        description: `Mobile Recharge - ${selectedOperator.name} (${rechargeMobile})`,
        receiverDetails: {
          mobile: rechargeMobile,
          operator: selectedOperator.name
        }
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
        description: `${selectedBillCategory?.name} - ${billNumber}`,
        receiverDetails: {
          billNumber,
          category: selectedBillCategory.name
        }
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

    // Verify UPI PIN
    if (userProfile.upiPin !== upiPinValue) {
      alert('Invalid UPI PIN. Please try again.');
      return;
    }

    // Process based on action type
    let success = false;
    
    switch (upiPinAction.type) {
      case 'qr_payment':
        success = await handleMoneyTransfer(
          upiPinAction.data.amount,
          upiPinAction.data.description,
          upiPinAction.data.receiverDetails
        );
        
        if (success) {
          setShowQRScanner(false);
          setSendAmount('');
          setSendDescription('');
          setScannedData('');
          setReceiverName('');
          setReceiverUPI('');
          setReceiverDetails(null);
          // Clean up video stream
          if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
          }
        }
        break;
        
      case 'send_money':
        success = await handleMoneyTransfer(
          upiPinAction.data.amount,
          upiPinAction.data.description,
          upiPinAction.data.receiverDetails
        );
        
        if (success) {
          setShowSendMoney(false);
          setSendMoneyAmount('');
          setSendMoneyDescription('');
          setSendToUPI('');
          setSendToMobile('');
          setSearchedReceiver(null);
        }
        break;
        
      case 'mobile_recharge':
        success = await handleMoneyTransfer(
          upiPinAction.data.amount,
          upiPinAction.data.description,
          upiPinAction.data.receiverDetails
        );
        
        if (success) {
          setShowMobileRecharge(false);
          setRechargeMobile('');
          setSelectedOperator(null);
          setSelectedPlan(null);
        }
        break;
        
      case 'bill_payment':
        success = await handleMoneyTransfer(
          parseFloat(billAmount),
          upiPinAction.data.description,
          upiPinAction.data.receiverDetails
        );
        
        if (success) {
          setShowBills(false);
          setSelectedBillCategory(null);
          setBillNumber('');
          setBillAmount('');
        }
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
        
      case 'admin_access':
        setShowAdminPanel(true);
        break;
    }
    
    setUpiPinValue('');
    setShowUPIPinModal(false);
    setUpiPinAction(null);
  };

  // Handle View ATM Card Details
  const handleViewATMCard = () => {
    setUpiPinAction({ type: 'view_atm_card', data: null });
    setShowUPIPinModal(true);
  };

  // Handle Admin Access
  const handleAdminAccess = () => {
    setUpiPinAction({ type: 'admin_access', data: null });
    setShowUPIPinModal(true);
  };

  // Load all users for admin
  const loadAllUsers = async () => {
    const token = localStorage.getItem('dpay_token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.adminGetAllUsers(token);
      if (response.success) {
        setAllUsers(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
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

    if (oldUPIPin !== userProfile.upiPin) {
      alert('Old UPI PIN is incorrect');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);

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
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);
    
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
        setShowAdminPanel(false);
        setShowAtmCard(false);
        setShowDeleteConfirm(false);
        setPendingTransactions([]);
        
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

  // Handle Login with OTP verification
  const handleLogin = async () => {
    setIsLoading(true);
    setLoadingMessage('Verifying OTP...');
    
    try {
      const identifier = otpMethod === 'mobile' ? mobile : email;
      const response = await apiService.verifyOTP(identifier, otp, otpMethod);
      
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
        
        // Load user's transactions
        const transactionsResponse = await apiService.getTransactions(response.token, response.user._id);
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.transactions);
        }
        
        // Load pending transactions
        const pendingResponse = await apiService.getPendingTransactions(response.token, response.user._id);
        if (pendingResponse.success) {
          setPendingTransactions(pendingResponse.transactions || []);
        }
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
      setShowAdminPanel(false);
      setShowAtmCard(false);
      setShowLogoutConfirm(false);
      setPendingTransactions([]);
      
      localStorage.removeItem('dpay_token');
      localStorage.removeItem('dpay_user_id');
      
      // Clean up video stream
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
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
      alert('Please fill all required fields (Name, Email, Mobile, PAN Number, Bank, Account Number, ATM Card Number, UPI PIN)');
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

    // Validate PAN number (format: ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(registerData.panNumber.toUpperCase())) {
      alert('PAN number must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)');
      return;
    }

    if (registerData.upiPin.length !== 4 || !/^\d+$/.test(registerData.upiPin)) {
      alert('UPI PIN must be exactly 4 digits');
      return;
    }

    // Validate ATM Card Number (16 digits)
    const cleanedCardNumber = registerData.atmCardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length !== 16 || !/^\d+$/.test(cleanedCardNumber)) {
      alert('ATM Card Number must be exactly 16 digits');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);
    
    try {
      const upiId = generateUPIId(registerData.username, registerData.mobile);
      const referralCode = generateReferralCode(registerData.username, registerData.mobile);
      
      // Generate random credit score between 650-850
      const creditScore = Math.floor(Math.random() * 200) + 650;
      
      const userData = {
        ...registerData,
        panNumber: registerData.panNumber.toUpperCase(),
        upiId,
        referralCode,
        creditScore,
        balance: 1000.00,
        appBalance: 0
      };
      
      const response = await apiService.register(userData);
      
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
        
        alert(`Registration successful!\nYour UPI ID: ${upiId}\nYour Referral Code: ${referralCode}\nYour Credit Score: ${creditScore}`);
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

  const checkBalance = () => {
    if (!userProfile) return;
    
    setUpiPinAction({ type: 'check_balance', data: null });
    setShowUPIPinModal(true);
  };

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
    setShowAdminPanel(false);
    setShowAtmCard(false);
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
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);

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

  // Admin: Update bank status
  const handleUpdateBankStatus = async (bankName, status) => {
    const token = localStorage.getItem('dpay_token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.adminUpdateBankStatus(token, bankName, status);
      
      if (response.success) {
        // Update local bank status
        setBankServerStatus(prev => ({
          ...prev,
          [bankName]: { ...prev[bankName], status, isActive: status === 'active' }
        }));
        
        alert(`Bank status updated to: ${status}`);
      } else {
        alert(response.message || 'Failed to update bank status');
      }
    } catch (error) {
      console.error('Error updating bank status:', error);
      alert('Failed to update bank status');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Update user
  const handleAdminUpdateUser = async (userId, userData) => {
    const token = localStorage.getItem('dpay_token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.adminUpdateUser(token, userId, userData);
      
      if (response.success) {
        alert('User updated successfully!');
        loadAllUsers();
      } else {
        alert(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setIsLoading(false);
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
          
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              <span className="font-medium">Note:</span> Your new UPI PIN must be exactly 4 digits and different from your current PIN.
            </p>
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
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium mb-2">All your data will be permanently deleted:</p>
              <ul className="text-xs text-red-600 space-y-1 text-left">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Profile information
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Transaction history
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  UPI ID and linked bank account
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  All rewards and cashback
                </li>
              </ul>
            </div>
            
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
            {/* ATM Card Design */}
            <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <div className="absolute top-4 right-4">
                <div className="w-12 h-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-md flex items-center justify-center">
                  <span className="text-xs font-bold text-black">VISA</span>
                </div>
              </div>
              
              <div className="text-left">
                <p className="text-sm opacity-80 mb-1">Card Number</p>
                <p className="text-2xl font-mono tracking-widest mb-6">
                  {formatATMCardNumber(userProfile.atmCardNumber)}
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
            
            <div className="mb-6 space-y-4">
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                <p className="text-sm text-violet-600 mb-2">Linked Bank Account</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-violet-800">{userProfile.bankName}</p>
                  <BankStatusIndicator 
                    bankName={userProfile.bankName} 
                    serverStatus={bankServerStatus[userProfile.bankName]} 
                  />
                </div>
                <p className="text-xs text-violet-500 mt-1">
                  Account: •••• {userProfile.accountNumber ? userProfile.accountNumber.slice(-4) : '****'}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-700 mb-1">Security Tips</p>
                    <ul className="text-xs text-amber-600 space-y-1">
                      <li>• Never share your card details with anyone</li>
                      <li>• Keep your UPI PIN confidential</li>
                      <li>• Report lost cards immediately</li>
                      <li>• Use secure networks for transactions</li>
                    </ul>
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

  // QR Scanner Modal with Camera
  const QRScannerModal = () => {
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (videoStream && videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    }, [videoStream]);

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // Simulate QR scan from uploaded image
          if (userProfile) {
            const demoQRData = generateQRCodeData(userProfile.upiId, userProfile.username, '500');
            setScannedData(demoQRData);
            
            const params = new URLSearchParams(demoQRData.split('?')[1]);
            setReceiverUPI(params.get('pa') || userProfile.upiId);
            setReceiverName(decodeURIComponent(params.get('pn') || userProfile.username));
            setSendAmount(params.get('am') || '500');
            
            setReceiverDetails({
              name: userProfile.username,
              upi: userProfile.upiId,
              mobile: userProfile.mobile,
              bankName: userProfile.bankName
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-black rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">QR Scanner</h2>
            <button
              onClick={() => {
                setShowQRScanner(false);
                setIsScanning(false);
                setScannedData('');
                setReceiverName('');
                setReceiverUPI('');
                setSendAmount('');
                setSendDescription('');
                setReceiverDetails(null);
                if (videoStream) {
                  videoStream.getTracks().forEach(track => track.stop());
                  setVideoStream(null);
                }
              }}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-gray-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!scannedData ? (
            <div className="text-center">
              <div className="relative mb-6">
                {videoStream ? (
                  <div className="relative w-64 h-64 mx-auto border-4 border-green-500 rounded-xl overflow-hidden bg-gray-900">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-green-400 animate-ping opacity-20"></div>
                  </div>
                ) : (
                  <div className="w-64 h-64 mx-auto border-4 border-green-500 rounded-xl flex items-center justify-center bg-gray-900 overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-pulse"></div>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 animate-pulse"></div>
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-green-500 animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 animate-pulse"></div>
                      
                      <div className="absolute w-48 h-48 border-2 border-green-400 animate-ping opacity-20"></div>
                      
                      <Camera className="w-16 h-16 text-green-400 animate-pulse" />
                    </div>
                  </div>
                )}
                
                {!isScanning && !videoStream && (
                  <p className="text-sm text-gray-300 mt-4">Camera access needed for scanning</p>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <p className="text-sm text-gray-300 mb-2">Scanning UPI QR codes will automatically fill:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Receiver's Name
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Receiver's UPI ID
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Amount (if pre-filled in QR)
                    </li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  {!videoStream && (
                    <button
                      onClick={() => {
                        setIsScanning(true);
                        setTimeout(simulateQRScan, 2000);
                      }}
                      disabled={isScanning}
                      className={`flex-1 py-3 rounded-xl font-semibold transition ${
                        isScanning 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isScanning ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Simulating Scan...</span>
                        </div>
                      ) : 'Simulate QR Scan (Demo)'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Upload QR Image
                  </button>
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 p-4 rounded-xl bg-gray-900 border border-green-700">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-lg font-bold text-green-400 mb-2">QR Code Scanned Successfully!</p>
                <p className="text-sm text-gray-300">UPI Payment Request Detected</p>
              </div>
              
              <div className="mb-6 space-y-4">
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-left">
                  <p className="text-sm text-gray-400 mb-1">Receiver Details</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{receiverDetails?.name || receiverName}</p>
                      <p className="text-sm text-gray-300">{receiverDetails?.upi || receiverUPI}</p>
                      {receiverDetails?.bankName && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">{receiverDetails.bankName}</p>
                          <BankStatusIndicator 
                            bankName={receiverDetails.bankName} 
                            serverStatus={bankServerStatus[receiverDetails.bankName]} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Amount to Send (₹)
                  </label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={sendDescription}
                    onChange={(e) => setSendDescription(e.target.value)}
                    placeholder="e.g., For dinner"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    setReceiverDetails(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition"
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
    const senderBankStatus = userProfile?.bankName ? bankServerStatus[userProfile.bankName] : null;
    const receiverBankStatus = searchedReceiver?.bankName ? bankServerStatus[searchedReceiver.bankName] : null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Send Money</h2>
            <button
              onClick={() => {
                setShowSendMoney(false);
                setSendToUPI('');
                setSendToMobile('');
                setSendMoneyAmount('');
                setSendMoneyDescription('');
                setSearchedReceiver(null);
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sendToUPI}
                  onChange={(e) => {
                    setSendToUPI(e.target.value);
                    setSendToMobile('');
                    if (e.target.value) {
                      searchReceiver(e.target.value);
                    } else {
                      setSearchedReceiver(null);
                    }
                  }}
                  placeholder="e.g., username@dpay"
                  className="flex-1 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={() => searchReceiver(sendToUPI)}
                  className="px-4 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-violet-500 mt-1">Enter receiver's UPI ID</p>
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
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={sendToMobile}
                  onChange={(e) => {
                    setSendToMobile(e.target.value);
                    setSendToUPI('');
                    if (e.target.value) {
                      searchReceiver(e.target.value);
                    } else {
                      setSearchedReceiver(null);
                    }
                  }}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className="flex-1 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={() => searchReceiver(sendToMobile)}
                  className="px-4 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-violet-500 mt-1">Enter receiver's mobile number</p>
            </div>
            
            {searchedReceiver && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">{searchedReceiver.username}</p>
                    <p className="text-sm text-green-600">{searchedReceiver.upiId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-green-500">{searchedReceiver.bankName}</p>
                      <BankStatusIndicator 
                        bankName={searchedReceiver.bankName} 
                        serverStatus={bankServerStatus[searchedReceiver.bankName]} 
                      />
                    </div>
                  </div>
                </div>
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
            
            {/* Bank Server Status */}
            {userProfile && searchedReceiver && sendMoneyAmount && (
              <div className={`p-4 rounded-xl border ${
                senderBankStatus?.isActive && receiverBankStatus?.isActive 
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <p className="text-sm font-medium mb-2">Bank Server Status</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs">Your Bank</p>
                      <p className="text-sm font-medium">{userProfile.bankName}</p>
                    </div>
                    <BankStatusIndicator 
                      bankName={userProfile.bankName} 
                      serverStatus={senderBankStatus} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs">Receiver's Bank</p>
                      <p className="text-sm font-medium">{searchedReceiver.bankName}</p>
                    </div>
                    <BankStatusIndicator 
                      bankName={searchedReceiver.bankName} 
                      serverStatus={receiverBankStatus} 
                    />
                  </div>
                </div>
                {(!senderBankStatus?.isActive || !receiverBankStatus?.isActive) && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-100 border border-amber-300">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-amber-800">
                          {!senderBankStatus?.isActive && !receiverBankStatus?.isActive 
                            ? "Both banks are down. DPay will handle the transaction temporarily."
                            : !senderBankStatus?.isActive 
                            ? "Your bank is down. DPay will pay for you temporarily."
                            : "Receiver's bank is down. DPay will hold the amount temporarily."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={handleSendMoney}
              disabled={!sendMoneyAmount || !searchedReceiver}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !sendMoneyAmount || !searchedReceiver
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
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
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
              onChange={(e) => setRechargeMobile(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength="10"
              className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-violet-500 mt-1">Enter mobile number to recharge</p>
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
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
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
            
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Recently Paid Bills</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Electricity Bill</p>
                      <p className="text-xs text-gray-500">Paid on 15 Jan</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">₹1,250</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gas Bill</p>
                      <p className="text-xs text-gray-500">Paid on 10 Jan</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">₹850</p>
                </div>
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
                
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">Note:</span> Bill amount will be verified before processing payment
                  </p>
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
          
          {pendingTransactions.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <p className="font-medium text-amber-700">Pending Transactions</p>
              </div>
              <div className="space-y-2">
                {pendingTransactions.slice(0, 3).map((transaction, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white border border-amber-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-amber-800">{transaction.description}</p>
                        <p className="text-xs text-amber-600">
                          {transaction.senderBank} → {transaction.receiverBank}
                        </p>
                      </div>
                      <p className="font-bold text-amber-700">₹{transaction.amount}</p>
                    </div>
                    <p className="text-xs text-amber-500 mt-1">
                      Waiting for banks to come online
                    </p>
                  </div>
                ))}
                {pendingTransactions.length > 3 && (
                  <p className="text-xs text-amber-600 text-center">
                    +{pendingTransactions.length - 3} more pending transactions
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-200">
            <p className="text-sm text-violet-600 mb-3">App Balance is used for:</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Bank downtime coverage</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Holding payments during receiver bank downtime</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Rewards and cashback storage</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Temporary transaction buffer</p>
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

  // User Details Modal with Credit Score
  const UserDetailsModal = () => {
    if (!userProfile) return null;

    const currentProfile = isEditingProfile ? editedProfile : userProfile;

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
            {/* Profile Photo with Edit Option */}
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
                        <p className="text-xs text-violet-500">Email Address *</p>
                        {isEditingProfile ? (
                          <input
                            type="email"
                            value={currentProfile.email}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full font-medium text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500"
                            required
                          />
                        ) : (
                          <p className="font-medium text-violet-800">{currentProfile.email}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-violet-500">Mobile Number *</p>
                        {isEditingProfile ? (
                          <input
                            type="tel"
                            value={currentProfile.mobile}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, mobile: e.target.value }))}
                            className="w-full font-medium text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500"
                            maxLength="10"
                            required
                          />
                        ) : (
                          <p className="font-medium text-violet-800">+91 {currentProfile.mobile}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-violet-500">PAN Number *</p>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={currentProfile.panNumber || ''}
                            onChange={(e) => setEditedProfile(prev => ({ 
                              ...prev, 
                              panNumber: e.target.value.toUpperCase() 
                            }))}
                            className="w-full font-medium text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500 uppercase"
                            placeholder="ABCDE1234F"
                          />
                        ) : (
                          <p className="font-medium text-violet-800">{currentProfile.panNumber || 'Not set'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-violet-500">Date of Birth</p>
                        {isEditingProfile ? (
                          <input
                            type="date"
                            value={currentProfile.dob || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, dob: e.target.value }))}
                            className="w-full font-medium text-violet-800 bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500"
                          />
                        ) : (
                          <p className="font-medium text-violet-800">
                            {currentProfile.dob ? new Date(currentProfile.dob).toLocaleDateString('en-IN') : 'Not set'}
                          </p>
                        )}
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
                        serverStatus={bankServerStatus[currentProfile.bankName]} 
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
                  
                  {/* UPI PIN Change Section */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-amber-600 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        UPI PIN Security
                      </p>
                      <button
                        onClick={() => setShowChangeUPIPin(true)}
                        className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition"
                      >
                        Change PIN
                      </button>
                    </div>
                    <p className="text-xs text-amber-500">
                      Keep your UPI PIN confidential. Change it regularly for security.
                    </p>
                  </div>
                  
                  {/* Admin Access Section (Only for 7825007490) */}
                  {isAdmin && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-red-600 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin Controls
                        </p>
                        <button
                          onClick={handleAdminAccess}
                          className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                        >
                          Admin Panel
                        </button>
                      </div>
                      <p className="text-xs text-red-500">
                        You have administrative privileges to manage all users and bank status.
                      </p>
                    </div>
                  )}
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
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    Need help? Contact support: support@dpay.com
                  </p>
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
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedBankStatus, setSelectedBankStatus] = useState('active');
    const [userSearch, setUserSearch] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(allUsers);

    useEffect(() => {
      if (showAdminPanel) {
        loadAllUsers();
      }
    }, [showAdminPanel]);

    useEffect(() => {
      if (userSearch) {
        const filtered = allUsers.filter(user => 
          user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.mobile.includes(userSearch) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.upiId?.toLowerCase().includes(userSearch.toLowerCase())
        );
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers(allUsers);
      }
    }, [userSearch, allUsers]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Admin Panel</h2>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Bank Status Management */}
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <h3 className="text-lg font-bold text-violet-800 mb-4">Bank Server Status Management</h3>
              
              <div className="mb-4">
                <div className="flex gap-3 mb-3">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Bank</option>
                    {INDIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedBankStatus}
                    onChange={(e) => setSelectedBankStatus(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="active">Active</option>
                    <option value="slow">Slow</option>
                    <option value="down">Down</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      if (selectedBank) {
                        handleUpdateBankStatus(selectedBank, selectedBankStatus);
                      }
                    }}
                    disabled={!selectedBank}
                    className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INDIAN_BANKS.map((bank) => (
                  <div key={bank} className="p-3 rounded-lg bg-white border border-violet-100">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-violet-800">{bank}</p>
                      <BankStatusIndicator 
                        bankName={bank} 
                        serverStatus={bankServerStatus[bank]} 
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateBankStatus(bank, 'active')}
                        className="flex-1 py-1 px-2 rounded-lg text-xs bg-green-100 text-green-700 hover:bg-green-200 transition"
                      >
                        Set Active
                      </button>
                      <button
                        onClick={() => handleUpdateBankStatus(bank, 'slow')}
                        className="flex-1 py-1 px-2 rounded-lg text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                      >
                        Set Slow
                      </button>
                      <button
                        onClick={() => handleUpdateBankStatus(bank, 'down')}
                        className="flex-1 py-1 px-2 rounded-lg text-xs bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Set Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* User Management */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-4">User Management</h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name, mobile, email, or UPI ID..."
                  className="w-full px-4 py-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="p-4 rounded-lg bg-white border border-blue-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-blue-800">{user.username}</p>
                        <p className="text-sm text-blue-600">{user.email}</p>
                        <p className="text-sm text-blue-600">Mobile: {user.mobile}</p>
                        <p className="text-xs text-blue-500">UPI: {user.upiId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{user.balance?.toFixed(2)}</p>
                        <p className={`text-sm ${user.appBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          App: ₹{user.appBalance?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500">Bank</p>
                        <p className="text-sm font-medium text-gray-800">{user.bankName}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500">Credit Score</p>
                        <p className="text-sm font-medium text-gray-800">{user.creditScore}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedUserForEdit(user);
                          setAdminAction('edit');
                        }}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Edit User
                      </button>
                      <button
                        onClick={() => {
                          const newBalance = prompt(`Enter new balance for ${user.username}:`, user.balance);
                          if (newBalance && !isNaN(newBalance)) {
                            handleAdminUpdateUser(user._id, { balance: parseFloat(newBalance) });
                          }
                        }}
                        className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                      >
                        Update Balance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    INDIAN_BANKS.forEach(bank => {
                      handleUpdateBankStatus(bank, 'active');
                    });
                  }}
                  className="py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Set All Banks Active
                </button>
                <button
                  onClick={() => {
                    INDIAN_BANKS.forEach(bank => {
                      handleUpdateBankStatus(bank, 'down');
                    });
                  }}
                  className="py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  Set All Banks Down
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // QR Code Modal
  const QRCodeModal = () => {
    if (!userProfile) return null;
    
    const qrData = generateQRCodeData(userProfile.upiId, userProfile.username);

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
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                <p className="text-sm text-violet-600">Account Holder</p>
                <p className="font-semibold text-violet-800">{userProfile.username}</p>
              </div>
              
              {userProfile.bankName && (
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-violet-600">Linked Bank</p>
                    <BankStatusIndicator 
                      bankName={userProfile.bankName} 
                      serverStatus={bankServerStatus[userProfile.bankName]} 
                    />
                  </div>
                  <p className="font-medium text-violet-800">{userProfile.bankName}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-violet-500 mb-4 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              This QR code is linked to your UPI ID
            </p>
            <p className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Anyone can scan and send money to you
            </p>
            <p className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              No need to share bank details
            </p>
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
                  serverStatus={bankServerStatus[userProfile?.bankName]} 
                />
              </div>
              <p className="font-medium text-violet-800">{userProfile?.bankName}</p>
              <p className="text-xs text-violet-500 mt-1">
                Account: ••••{userProfile?.accountNumber?.slice(-4) || '****'}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">ATM Card</p>
              <p className="font-mono text-blue-800">{maskATMCardNumber(userProfile?.atmCardNumber)}</p>
              <p className="text-xs text-blue-500 mt-1">VISA Debit Card</p>
            </div>
            
            <div className={`p-4 rounded-xl border ${(userProfile?.appBalance || 0) < 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm">App Balance</p>
                <BatteryCharging className={`w-4 h-4 ${(userProfile?.appBalance || 0) < 0 ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <p className={`text-xl font-bold ${(userProfile?.appBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{(userProfile?.appBalance || 0).toFixed(2)}
              </p>
              <p className="text-xs mt-1">
                {(userProfile?.appBalance || 0) < 0 
                  ? 'Negative balance indicates DPay advanced payments during bank downtime'
                  : 'Available for rewards and buffer'}
              </p>
            </div>
            
            {pendingTransactions.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-medium text-amber-700">Pending Transactions</p>
                </div>
                <p className="text-xs text-amber-600">
                  {pendingTransactions.length} transaction(s) waiting for bank recovery
                </p>
              </div>
            )}
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
                serverStatus={bankServerStatus[userProfile?.bankName]} 
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
                {transaction.metadata?.downtimeHandled && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-600">
                      {transaction.metadata?.senderBankDown && transaction.metadata?.receiverBankDown 
                        ? 'Both banks were down - DPay handled temporarily'
                        : transaction.metadata?.senderBankDown 
                        ? 'Your bank was down - DPay advanced payment'
                        : 'Receiver bank was down - DPay holding amount'}
                    </p>
                  </div>
                )}
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required - For login and notifications</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required - 10 digits</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required - For credit score calculation</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Optional</p>
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
                          {bank} - {bankServerStatus[bank]?.status === 'active' ? '✅' : 
                                   bankServerStatus[bank]?.status === 'slow' ? '⚠️' : 
                                   bankServerStatus[bank]?.status === 'down' ? '❌' : '❓'}
                        </option>
                      ))}
                    </select>
                    <Building className="absolute right-3 top-3.5 w-5 h-5 text-violet-500 pointer-events-none" />
                  </div>
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required - Check bank server status</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required - 16 digit card number</p>
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
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required - 4 digits for transactions</p>
                </div>
                
                {/* Referral Code Field */}
                <div>
                  <input
                    type="text"
                    value={registerData.referralCode}
                    onChange={(e) => setRegisterData({...registerData, referralCode: e.target.value})}
                    placeholder="Referral Code (Optional)"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-xs text-violet-500 mt-1 ml-1">Optional - Enter if referred by a friend</p>
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

    // Login Screen with OTP options
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
                  {/* OTP Method Selection */}
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
                    Enter the 6-digit OTP received
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
          {/* Header with Profile Picture at Top Right */}
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
                    serverStatus={bankServerStatus[userProfile.bankName]} 
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

          {/* QR Scanner - Clickable */}
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
