import { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, Send, User, Smartphone, Gift, Receipt, Landmark, Wallet, History, Upload, Eye, EyeOff, CreditCard, Building, Copy, Check, X, DollarSign, CreditCard as Card, Calendar, AlertCircle, Edit, Camera, Home, GraduationCap, Sprout, Gem, Stethoscope, Shield, Zap, Tv, Tag, Flame, Battery, Wifi, Phone, FileText, Search, ChevronRight, ShieldCheck, Clock, Percent, TrendingUp, Server, Activity, WifiOff, CreditCard as AtmCard, Image as ImageIcon, Loader2, Save, Key, Mail, LogOut, Trash2, Scissors, Star, Award, Trophy, Coffee, Pizza, ShowerHead, Dumbbell, Book, Gamepad2, Music, Film, Car, ShoppingBag, Plane, Heart, Bell, BellOff, AlertTriangle, BatteryCharging, Lock } from 'lucide-react';

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

// Bank Server Status (Simulated - This will be periodically updated)
let BANK_SERVER_STATUS = {
  "State Bank of India (SBI)": { status: "active", lastChecked: "2 mins ago", responseTime: "120ms" },
  "HDFC Bank": { status: "active", lastChecked: "1 min ago", responseTime: "95ms" },
  "ICICI Bank": { status: "slow", lastChecked: "3 mins ago", responseTime: "450ms" },
  "Axis Bank": { status: "active", lastChecked: "30 secs ago", responseTime: "85ms" },
  "Kotak Mahindra Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "110ms" },
  "Punjab National Bank (PNB)": { status: "down", lastChecked: "5 mins ago", responseTime: "Timeout" },
  "Bank of Baroda": { status: "active", lastChecked: "1 min ago", responseTime: "100ms" },
  "Canara Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "130ms" },
  "Union Bank of India": { status: "slow", lastChecked: "4 mins ago", responseTime: "380ms" },
  "Bank of India": { status: "active", lastChecked: "1 min ago", responseTime: "90ms" },
  "IndusInd Bank": { status: "active", lastChecked: "30 secs ago", responseTime: "75ms" },
  "IDFC First Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "105ms" },
  "Yes Bank": { status: "down", lastChecked: "10 mins ago", responseTime: "Timeout" },
  "Federal Bank": { status: "active", lastChecked: "1 min ago", responseTime: "95ms" },
  "Indian Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "115ms" },
  "Central Bank of India": { status: "slow", lastChecked: "3 mins ago", responseTime: "420ms" },
  "Indian Overseas Bank": { status: "active", lastChecked: "30 secs ago", responseTime: "80ms" },
  "UCO Bank": { status: "down", lastChecked: "15 mins ago", responseTime: "Timeout" },
  "Bandhan Bank": { status: "active", lastChecked: "1 min ago", responseTime: "88ms" },
  "IDBI Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "125ms" }
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

// Loan Categories
const LOAN_CATEGORIES = [
  { id: 'home', name: 'Home Loan', icon: Home, color: 'bg-blue-100 text-blue-600' },
  { id: 'education', name: 'Education Loan', icon: GraduationCap, color: 'bg-green-100 text-green-600' },
  { id: 'agriculture', name: 'Agriculture Loan', icon: Sprout, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'gold', name: 'Gold Loan', icon: Gem, color: 'bg-amber-100 text-amber-600' },
  { id: 'healthcare', name: 'Medical Loan', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
  { id: 'insurance', name: 'Insurance', icon: Shield, color: 'bg-purple-100 text-purple-600' },
  { id: 'personal', name: 'Personal Loan', icon: Wallet, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'business', name: 'Business Loan', icon: TrendingUp, color: 'bg-cyan-100 text-cyan-600' }
];

// Sample Loans Data from Banks
const LOANS_DATA = {
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
  "Training AI bankers... 🤖"
];

// Bank Status Indicator Component
const BankStatusIndicator = ({ bankName }) => {
  const status = BANK_SERVER_STATUS[bankName] || { status: 'unknown', lastChecked: 'Unknown', responseTime: 'N/A' };
  
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

// API Service Functions
const apiService = {
  // Generate OTP
  async generateOTP(identifier, method) {
    const response = await fetch(`${API_BASE_URL}/auth/generate-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [method]: identifier })
    });
    return response.json();
  },

  // Auth APIs
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

  // Payment APIs with Bank Downtime Handling
  async processPaymentWithDowntime(token, paymentData) {
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

  // Loan APIs
  async getLoans(token, userId) {
    const response = await fetch(`${API_BASE_URL}/loans/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Admin APIs
  async getAllUsers(token) {
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

  async updateBankServerStatus(token, bankName, status) {
    const response = await fetch(`${API_BASE_URL}/admin/bank-status/${bankName}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  async getUserByUPIOrMobile(token, identifier) {
    const response = await fetch(`${API_BASE_URL}/users/lookup/${identifier}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // QR Scanner APIs
  async processQRCode(token, qrData) {
    const response = await fetch(`${API_BASE_URL}/payments/process-qr`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ qrData })
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
  const [showLoans, setShowLoans] = useState(false);
  const [showLoanCategory, setShowLoanCategory] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // UPI PIN Modal States
  const [showUPIPinModal, setShowUPIPinModal] = useState(false);
  const [upiPinAction, setUpiPinAction] = useState(null);
  const [upiPinValue, setUpiPinValue] = useState('');
  
  // Admin States
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // QR Scanner States
  const [scannedData, setScannedData] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [sendAmount, setSendAmount] = useState('');
  const [sendDescription, setSendDescription] = useState('');
  const [qrImage, setQrImage] = useState(null);
  
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
  
  // Loan Application States
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [userLoans, setUserLoans] = useState([]);
  
  // Bank Downtime Notification States
  const [showDowntimeNotification, setShowDowntimeNotification] = useState(false);
  const [downtimeMessage, setDowntimeMessage] = useState('');
  const [downtimeType, setDowntimeType] = useState('info');
  const [downtimeTransactionId, setDowntimeTransactionId] = useState('');
  const [downtimeAmount, setDowntimeAmount] = useState(0);
  
  // Bank Server Status States
  const [bankServerStatus, setBankServerStatus] = useState(BANK_SERVER_STATUS);
  
  // Pending Transactions
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
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
        
        // Check if user is admin (mobile number 7825007490)
        if (profileResponse.user.mobile === '7825007490') {
          setIsAdmin(true);
        }
        
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
        
        // Load bank server status
        updateBankServerStatus();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      localStorage.removeItem('dpay_token');
      localStorage.removeItem('dpay_user_id');
    } finally {
      setIsLoading(false);
    }
  };

  // Update bank server status
  const updateBankServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/banks/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBankServerStatus(data.status);
        }
      }
    } catch (error) {
      console.error('Error fetching bank status:', error);
    }
  };

  // Generate and send OTP
  const handleSendOTP = async () => {
    if (otpMethod === 'mobile' && mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (otpMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Generating OTP...");
    
    try {
      const identifier = otpMethod === 'mobile' ? mobile : email;
      const response = await apiService.generateOTP(identifier, otpMethod);
      
      if (response.success) {
        setGeneratedOTP(response.otp);
        setStep('otp');
        alert(`OTP sent successfully: ${response.otp} (For demo purposes)`);
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
    if (otp !== generatedOTP) {
      alert('Invalid OTP. Please enter the correct OTP.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);
    
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
        
        // Check if user is admin
        if (response.user.mobile === '7825007490') {
          setIsAdmin(true);
        }
        
        // Reset form
        setStep('identifier');
        setMobile('');
        setEmail('');
        setOtp('');
        setGeneratedOTP('');
        
        // Load user data
        await loadUserProfile(response.token, response.user._id);
        
        alert('Login successful!');
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

  // Handle Registration
  const handleRegister = async () => {
    // Validate required fields
    if (!registerData.username || !registerData.email || !registerData.mobile || 
        !registerData.panNumber || !registerData.bankName || !registerData.accountNumber || 
        !registerData.atmCardNumber || !registerData.upiPin) {
      alert('Please fill all required fields');
      return;
    }

    if (registerData.upiPin.length !== 4 || !/^\d+$/.test(registerData.upiPin)) {
      alert('UPI PIN must be exactly 4 digits');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(FUN_LOADING_MESSAGES[Math.floor(Math.random() * FUN_LOADING_MESSAGES.length)]);
    
    try {
      const response = await apiService.register(registerData);
      
      if (response.success) {
        setLoggedIn(true);
        setShowAuth(false);
        setUserProfile(response.user);
        
        // Save token and user ID
        localStorage.setItem('dpay_token', response.token);
        localStorage.setItem('dpay_user_id', response.user._id);
        
        // Check if user is admin
        if (response.user.mobile === '7825007490') {
          setIsAdmin(true);
        }
        
        // Reset form
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

  // Handle Logout
  const handleLogout = async () => {
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
      setUserProfile(null);
      setIsAdmin(false);
      localStorage.removeItem('dpay_token');
      localStorage.removeItem('dpay_user_id');
    }
  };

  // Handle Check Balance
  const checkBalance = () => {
    if (!userProfile) return;
    
    setUpiPinAction({ type: 'check_balance', data: null });
    setShowUPIPinModal(true);
  };

  // Handle View History
  const viewTransactionHistory = () => {
    if (!userProfile) return;
    
    setUpiPinAction({ type: 'view_history', data: null });
    setShowUPIPinModal(true);
  };

  // Handle QR Scan
  const handleQRScan = async () => {
    setShowQRScanner(true);
    setScannedData('');
    setReceiverInfo(null);
    setSendAmount('');
    setSendDescription('');
  };

  // Handle QR Image Upload
  const handleQRImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setQrImage(imageData);
        // For demo, simulate QR data
        setTimeout(() => {
          const demoQRData = "upi://pay?pa=johndoe1234@dpay&pn=John%20Doe&am=500&cu=INR&tn=Payment%20for%20services";
          processQRCodeData(demoQRData);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process QR Code Data
  const processQRCodeData = async (qrData) => {
    try {
      const token = localStorage.getItem('dpay_token');
      if (!token) return;

      const response = await apiService.processQRCode(token, qrData);
      if (response.success) {
        setReceiverInfo(response.receiver);
        setScannedData(qrData);
      } else {
        alert('Failed to process QR code');
      }
    } catch (error) {
      console.error('Error processing QR:', error);
      // Fallback to manual parsing
      const params = new URLSearchParams(qrData.split('?')[1]);
      const upiId = params.get('pa');
      const name = decodeURIComponent(params.get('pn') || 'Unknown');
      const amount = params.get('am');
      
      setReceiverInfo({
        upiId,
        name,
        bankName: 'Unknown Bank',
        mobile: 'N/A'
      });
      setScannedData(qrData);
      if (amount) setSendAmount(amount);
    }
  };

  // Handle Send Money
  const handleSendMoney = async () => {
    if (!sendToUPI && !sendToMobile) {
      alert('Please enter UPI ID or Mobile Number');
      return;
    }

    if (!sendMoneyAmount || parseFloat(sendMoneyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('dpay_token');
      const identifier = sendToUPI || sendToMobile;
      
      // Lookup receiver details
      const response = await apiService.getUserByUPIOrMobile(token, identifier);
      if (response.success) {
        setReceiverDetails(response.user);
        
        // Request UPI PIN
        setUpiPinAction({
          type: 'send_money',
          data: {
            amount: parseFloat(sendMoneyAmount),
            description: sendMoneyDescription || `Payment to ${response.user.username}`,
            receiverDetails: response.user,
            receiverBank: response.user.bankName
          }
        });
        setShowUPIPinModal(true);
      } else {
        alert('Receiver not found. Please check the UPI ID or mobile number.');
      }
    } catch (error) {
      console.error('Error looking up receiver:', error);
      alert('Failed to verify receiver details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Payment with Bank Downtime
  const handlePayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('dpay_token');
      const userId = localStorage.getItem('dpay_user_id');
      
      if (!token || !userId) {
        alert('Session expired. Please login again.');
        return false;
      }

      const response = await apiService.processPaymentWithDowntime(token, {
        ...paymentData,
        userId,
        upiPin: upiPinValue
      });

      if (response.success) {
        // Update local state
        const updatedTransactions = [response.transaction, ...transactions];
        setTransactions(updatedTransactions);
        
        // Update user balance
        const updatedUser = {
          ...userProfile,
          balance: response.newBalance,
          appBalance: response.newAppBalance
        };
        setUserProfile(updatedUser);
        
        // Show notification
        setDowntimeMessage(response.message);
        setDowntimeType('success');
        setDowntimeTransactionId(response.transaction._id);
        setDowntimeAmount(paymentData.amount);
        setShowDowntimeNotification(true);
        
        return true;
      } else {
        alert(response.message || 'Transaction failed');
        return false;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Transaction failed. Please try again.');
      return false;
    }
  };

  // Handle UPI PIN Verification
  const handleUPIPinSubmit = async () => {
    if (!upiPinValue || upiPinValue.length !== 4 || !/^\d+$/.test(upiPinValue)) {
      alert('Please enter a valid 4-digit UPI PIN');
      return;
    }

    // Verify UPI PIN
    if (upiPinValue !== userProfile.upiPin) {
      alert('Invalid UPI PIN');
      return;
    }

    setIsLoading(true);
    
    try {
      let success = false;
      
      switch (upiPinAction.type) {
        case 'check_balance':
          setShowBalance(true);
          success = true;
          break;
          
        case 'view_history':
          setShowHistory(true);
          success = true;
          break;
          
        case 'send_money':
          success = await handlePayment(upiPinAction.data);
          if (success) {
            setShowSendMoney(false);
            setSendMoneyAmount('');
            setSendMoneyDescription('');
            setSendToUPI('');
            setSendToMobile('');
            setReceiverDetails(null);
          }
          break;
          
        case 'qr_payment':
          success = await handlePayment(upiPinAction.data);
          if (success) {
            setShowQRScanner(false);
            setSendAmount('');
            setSendDescription('');
            setScannedData('');
            setReceiverInfo(null);
          }
          break;
          
        case 'view_atm_card':
          setShowAtmCard(true);
          success = true;
          break;
          
        case 'admin_access':
          await loadAllUsers();
          setShowAdminPanel(true);
          success = true;
          break;
      }
      
      if (success) {
        setUpiPinValue('');
        setShowUPIPinModal(false);
        setUpiPinAction(null);
      }
    } catch (error) {
      console.error('UPI PIN verification error:', error);
      alert('Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Load all users for admin
  const loadAllUsers = async () => {
    try {
      const token = localStorage.getItem('dpay_token');
      if (!token) return;
      
      const response = await apiService.getAllUsers(token);
      if (response.success) {
        setAllUsers(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Admin update user
  const handleAdminUpdateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('dpay_token');
      const response = await apiService.adminUpdateUser(token, userId, updates);
      
      if (response.success) {
        alert('User updated successfully');
        await loadAllUsers();
      } else {
        alert(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  // Admin update bank status
  const handleAdminUpdateBankStatus = async (bankName, status) => {
    try {
      const token = localStorage.getItem('dpay_token');
      const response = await apiService.updateBankServerStatus(token, bankName, status);
      
      if (response.success) {
        alert('Bank status updated successfully');
        updateBankServerStatus();
      } else {
        alert(response.message || 'Failed to update bank status');
      }
    } catch (error) {
      console.error('Error updating bank status:', error);
      alert('Failed to update bank status');
    }
  };

  // UPI PIN Modal
  const UPIPinModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">
            {upiPinAction?.type === 'admin_access' ? 'Admin Access' : 'Enter UPI PIN'}
          </h2>
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
            {upiPinAction?.type === 'admin_access' 
              ? 'Enter your UPI PIN for admin access' 
              : 'Enter your 4-digit UPI PIN to continue'}
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

  // Admin Panel Component
  const AdminPanel = () => (
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
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-700 mb-3">Bank Server Status Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(bankServerStatus).map(([bankName, status]) => (
                <div key={bankName} className="p-3 rounded-lg bg-white border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-blue-800">{bankName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      status.status === 'active' ? 'bg-green-100 text-green-700' :
                      status.status === 'slow' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {status.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdminUpdateBankStatus(bankName, 'active')}
                      className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleAdminUpdateBankStatus(bankName, 'slow')}
                      className="flex-1 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm"
                    >
                      Slow
                    </button>
                    <button
                      onClick={() => handleAdminUpdateBankStatus(bankName, 'down')}
                      className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* User Management */}
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
            <h3 className="text-lg font-bold text-violet-700 mb-3">User Management</h3>
            <div className="space-y-3">
              {allUsers.map((user) => (
                <div key={user._id} className="p-4 rounded-lg bg-white border border-violet-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-violet-800">{user.username}</p>
                      <p className="text-sm text-violet-600">{user.email}</p>
                      <p className="text-sm text-violet-600">Mobile: {user.mobile}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-violet-700">Balance: ₹{user.balance}</p>
                      <p className="text-sm text-violet-600">App: ₹{user.appBalance}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-violet-500 mb-1">Balance</label>
                      <input
                        type="number"
                        defaultValue={user.balance}
                        onBlur={(e) => handleAdminUpdateUser(user._id, { balance: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-violet-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-violet-500 mb-1">App Balance</label>
                      <input
                        type="number"
                        defaultValue={user.appBalance}
                        onBlur={(e) => handleAdminUpdateUser(user._id, { appBalance: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-violet-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-violet-500 mb-1">Mobile</label>
                      <input
                        type="text"
                        defaultValue={user.mobile}
                        onBlur={(e) => handleAdminUpdateUser(user._id, { mobile: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-violet-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-violet-500 mb-1">Bank</label>
                      <select
                        defaultValue={user.bankName}
                        onChange={(e) => handleAdminUpdateUser(user._id, { bankName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-violet-300 text-sm"
                      >
                        {INDIAN_BANKS.map(bank => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // QR Scanner Modal
  const QRScannerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">QR Scanner</h2>
          <button
            onClick={() => setShowQRScanner(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {!scannedData ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-64 h-64 mx-auto border-4 border-green-500 rounded-xl flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <ScanLine className="w-16 h-16 text-green-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-green-600 font-medium">Ready to Scan</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Simulate QR scan for demo
                  const demoQRData = "upi://pay?pa=johndoe1234@dpay&pn=John%20Doe&am=500&cu=INR&tn=Payment%20for%20services";
                  processQRCodeData(demoQRData);
                }}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Simulate QR Scan (Demo)
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  id="qr-upload"
                  accept="image/*"
                  onChange={handleQRImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="qr-upload"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Upload QR Image
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-bold text-green-700">QR Code Scanned!</p>
              {receiverInfo && (
                <div className="mt-3 p-3 rounded-lg bg-white border border-green-100 text-left">
                  <p className="font-medium text-gray-800">{receiverInfo.name}</p>
                  <p className="text-sm text-gray-600">{receiverInfo.upiId}</p>
                  <p className="text-xs text-gray-500 mt-1">Bank: {receiverInfo.bankName}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-violet-700 mb-2 text-left">Amount (₹)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-violet-700 mb-2 text-left">Description (Optional)</label>
                <input
                  type="text"
                  value={sendDescription}
                  onChange={(e) => setSendDescription(e.target.value)}
                  placeholder="e.g., For dinner"
                  className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              
              <button
                onClick={() => {
                  if (!sendAmount || parseFloat(sendAmount) <= 0) {
                    alert('Please enter a valid amount');
                    return;
                  }
                  
                  setUpiPinAction({
                    type: 'qr_payment',
                    data: {
                      amount: parseFloat(sendAmount),
                      description: sendDescription || `Payment to ${receiverInfo?.name}`,
                      receiverDetails: receiverInfo,
                      receiverBank: receiverInfo?.bankName || 'Unknown Bank'
                    }
                  });
                  setShowUPIPinModal(true);
                }}
                className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Send Money Modal
  const SendMoneyModal = () => {
    const senderBankActive = bankServerStatus[userProfile?.bankName]?.status === 'active';
    const receiverBankActive = receiverDetails ? 
      bankServerStatus[receiverDetails.bankName]?.status === 'active' : true;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Send Money</h2>
            <button
              onClick={() => setShowSendMoney(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-violet-700 mb-2">Send to UPI ID or Mobile</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sendToUPI}
                  onChange={(e) => {
                    setSendToUPI(e.target.value);
                    setSendToMobile('');
                  }}
                  placeholder="UPI ID"
                  className="flex-1 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="py-3 text-gray-400">OR</span>
                <input
                  type="tel"
                  value={sendToMobile}
                  onChange={(e) => {
                    setSendToMobile(e.target.value);
                    setSendToUPI('');
                  }}
                  placeholder="Mobile"
                  maxLength="10"
                  className="flex-1 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-violet-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={sendMoneyAmount}
                onChange={(e) => setSendMoneyAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-violet-700 mb-2">Description (Optional)</label>
              <input
                type="text"
                value={sendMoneyDescription}
                onChange={(e) => setSendMoneyDescription(e.target.value)}
                placeholder="e.g., For groceries"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            {receiverDetails && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-green-600 mb-2">Receiver Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">{receiverDetails.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank:</span>
                    <span className="font-medium">{receiverDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <BankStatusIndicator bankName={receiverDetails.bankName} />
                  </div>
                </div>
              </div>
            )}
            
            {userProfile && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-600 mb-2">Your Bank Status</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{userProfile.bankName}</span>
                  <BankStatusIndicator bankName={userProfile.bankName} />
                </div>
                {!senderBankActive && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Your bank is currently down. DPay will advance the payment.
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={handleSendMoney}
              disabled={!sendMoneyAmount || parseFloat(sendMoneyAmount) <= 0}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !sendMoneyAmount || parseFloat(sendMoneyAmount) <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              Continue to Payment
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
              <p className="text-sm text-violet-600 mb-1">App Balance</p>
              <p className={`text-xl font-bold ${(userProfile?.appBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{(userProfile?.appBalance || 0).toFixed(2)}
              </p>
              <p className="text-xs text-violet-500 mt-1">
                {userProfile?.appBalance < 0 
                  ? 'Negative balance indicates DPay advanced payments'
                  : 'Available for rewards and transactions'}
              </p>
            </div>
            
            {pendingTransactions.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-sm text-amber-600 mb-2">Pending Transactions</p>
                <p className="text-xs text-amber-500">
                  {pendingTransactions.length} transaction(s) waiting for bank recovery
                </p>
              </div>
            )}
            
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">Bank Status</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">{userProfile?.bankName}</span>
                <BankStatusIndicator bankName={userProfile?.bankName} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loans Modal
  const LoansModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Available Loans</h2>
          <button
            onClick={() => {
              setShowLoans(false);
              setShowLoanCategory(null);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {!showLoanCategory ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-sm text-violet-700 mb-3">Select Loan Category</p>
              <div className="grid grid-cols-2 gap-3">
                {LOAN_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setShowLoanCategory(category.id)}
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
                  onClick={() => setShowLoanCategory(null)}
                  className="text-violet-600 hover:text-violet-700"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  LOAN_CATEGORIES.find(c => c.id === showLoanCategory)?.color
                }`}>
                  {React.createElement(LOAN_CATEGORIES.find(c => c.id === showLoanCategory)?.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="font-bold text-violet-800">
                    {LOAN_CATEGORIES.find(c => c.id === showLoanCategory)?.name}
                  </h3>
                  <p className="text-xs text-violet-600">Available offers from top providers</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {LOANS_DATA[showLoanCategory]?.map((loan, index) => (
                  <div key={index} className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{loan.bank || loan.provider}</p>
                        <p className="text-sm text-gray-600">{loan.type || 'Loan'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-1">
                          {loan.interest || 'View Details'}
                        </span>
                        {loan.bank && <BankStatusIndicator bankName={loan.bank} />}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-gray-800">{loan.amount}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500">Tenure</p>
                        <p className="font-medium text-gray-800">{loan.tenure}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
                    placeholder="PAN Number * (ABCDE1234F)"
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
                  />
                </div>
                
                <div>
                  <select
                    value={registerData.bankName}
                    onChange={(e) => setRegisterData({...registerData, bankName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  >
                    <option value="">Select Bank *</option>
                    {INDIAN_BANKS.map((bank, index) => (
                      <option key={index} value={bank}>{bank}</option>
                    ))}
                  </select>
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
                    onChange={(e) => setRegisterData({...registerData, atmCardNumber: e.target.value})}
                    placeholder="ATM Card Number (16 digits) *"
                    maxLength="16"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
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

                <button
                  onClick={handleRegister}
                  className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
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
                    onClick={handleSendOTP}
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
                    For demo: Use OTP <span className="font-bold">{generatedOTP}</span>
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
          {/* Header with Profile Picture */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-violet-700">DPay</h1>
              {userProfile && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-violet-600">
                    Hi, {userProfile.username}!
                  </p>
                  <BankStatusIndicator bankName={userProfile.bankName} />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (isAdmin) {
                  setUpiPinAction({ type: 'admin_access', data: null });
                  setShowUPIPinModal(true);
                } else {
                  setShowUserDetails(true);
                }
              }}
              className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center hover:bg-violet-200 transition overflow-hidden border-2 border-violet-300"
              title={isAdmin ? "Admin Panel" : "View Profile"}
            >
              {isAdmin ? (
                <Lock className="w-6 h-6 text-violet-700" />
              ) : userProfile?.photo ? (
                <img 
                  src={userProfile.photo} 
                  alt={userProfile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-violet-700" />
              )}
            </button>
          </div>

          {/* QR Scanner */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={handleQRScan}
              className="w-56 h-56 border-4 border-dashed border-violet-500 rounded-xl flex items-center justify-center bg-violet-100 hover:bg-violet-200 transition cursor-pointer active:scale-95"
            >
              <div className="text-center">
                <ScanLine className="w-16 h-16 text-violet-600 mx-auto animate-pulse" />
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
            <button
              onClick={() => setShowLoans(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition"
            >
              <Landmark className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Loans</span>
            </button>
            <button
              onClick={() => setShowAppBalance(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition"
            >
              <Wallet className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">App Balance</span>
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
      {showQRScanner && <QRScannerModal />}
      {showSendMoney && <SendMoneyModal />}
      {showUPIPinModal && <UPIPinModal />}
      {showAdminPanel && <AdminPanel />}
      {showLoans && <LoansModal />}
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
