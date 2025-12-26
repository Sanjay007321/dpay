import { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, Send, User, Smartphone, Gift, Receipt, Landmark, Wallet, History, Upload, Eye, EyeOff, CreditCard, Building, Copy, Check, X, DollarSign, CreditCard as Card, Calendar, AlertCircle, Edit, Camera, Home, GraduationCap, Sprout, Gem, Stethoscope, Shield, Zap, Tv, Tag, Flame, Battery, Wifi, Phone, FileText, Search, ChevronRight, ShieldCheck, Clock, Percent, TrendingUp, Server, Activity, WifiOff, CreditCard as AtmCard, Image as ImageIcon, Loader2, Save, Key, Mail, LogOut, Trash2, Scissors, Star, Award, Trophy, Coffee, Pizza, ShowerHead, Dumbbell, Book, Gamepad2, Music, Film, Car, ShoppingBag, Plane, Heart, Bell, BellOff, AlertTriangle, BatteryCharging, Users, Lock, Unlock } from 'lucide-react';

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

// Bank Server Status (Will be fetched from backend)
const INITIAL_BANK_SERVER_STATUS = {
  "State Bank of India (SBI)": { status: "active", lastChecked: "2 mins ago", responseTime: "120ms" },
  "HDFC Bank": { status: "active", lastChecked: "1 min ago", responseTime: "95ms" },
  "ICICI Bank": { status: "slow", lastChecked: "3 mins ago", responseTime: "450ms" },
  "Axis Bank": { status: "active", lastChecked: "30 secs ago", responseTime: "85ms" },
  "Kotak Mahindra Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "110ms" },
  "Punjab National Bank (PNB)": { status: "down", lastChecked: "5 mins ago", responseTime: "Timeout" },
  "Bank of Baroda": { status: "active", lastChecked: "1 min ago", responseTime: "100ms" },
  "Canara Bank": { status: "active", lastChecked: "2 mins ago", responseTime: "130ms" },
  "Union Bank of India": { status: "slow", lastChecked: "4 mins ago", responseTime: "380ms" },
  "Bank of India": { status: "active", lastChecked: "1 min ago", responseTime: "90ms" }
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
const BankStatusIndicator = ({ bankName, bankServerStatus }) => {
  const status = bankServerStatus?.[bankName] || { status: 'unknown', lastChecked: 'Unknown', responseTime: 'N/A' };
  
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
    
    if (isOpen) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

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
            <p className="font-medium">{message}</p>
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

  async updateBankStatus(token, bankName, status) {
    const response = await fetch(`${API_BASE_URL}/admin/banks/status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bankName, status })
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

  async recoverPendingTransactions(token, userId) {
    const response = await fetch(`${API_BASE_URL}/payments/recover`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  // QR Code APIs
  async findUserByUPI(token, upiId) {
    const response = await fetch(`${API_BASE_URL}/users/upi/${upiId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async findUserByMobile(token, mobile) {
    const response = await fetch(`${API_BASE_URL}/users/mobile/${mobile}`, {
      headers: { 'Authorization': `Bearer ${token}` }
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
  const [showQRUpload, setShowQRUpload] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  
  // Send Money States
  const [sendToUPI, setSendToUPI] = useState('');
  const [sendToMobile, setSendToMobile] = useState('');
  const [sendMoneyAmount, setSendMoneyAmount] = useState('');
  const [sendMoneyDescription, setSendMoneyDescription] = useState('');
  
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
  
  // Admin States
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [showBankStatusEdit, setShowBankStatusEdit] = useState(false);
  const [selectedBankForEdit, setSelectedBankForEdit] = useState(null);
  
  // Bank Downtime Notification States
  const [showDowntimeNotification, setShowDowntimeNotification] = useState(false);
  const [downtimeMessage, setDowntimeMessage] = useState('');
  const [downtimeType, setDowntimeType] = useState('info');
  const [downtimeTransactionId, setDowntimeTransactionId] = useState('');
  const [downtimeAmount, setDowntimeAmount] = useState(0);
  
  // Bank Server Status States
  const [bankServerStatus, setBankServerStatus] = useState(INITIAL_BANK_SERVER_STATUS);
  
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

  // Simulate mobile vibration
  const vibrateMobile = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Check bank server status
  const checkBankServerStatus = (bankName) => {
    return bankServerStatus[bankName]?.status === 'active';
  };

  // Load bank status from backend
  useEffect(() => {
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

    loadBankStatus();
    const interval = setInterval(loadBankStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
        
        // Check if user is admin (mobile: 7825007490)
        if (profileResponse.user.mobile === '7825007490') {
          // Load all users for admin panel
          const usersResponse = await apiService.getAllUsers(token);
          if (usersResponse.success) {
            setAdminUsers(usersResponse.users);
          }
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

  // Send OTP to mobile/email
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
    setLoadingMessage('Sending OTP...');
    
    try {
      const response = await apiService.sendOTP(identifier, otpMethod);
      
      if (response.success) {
        // For demo, generate a random OTP
        const demoOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(demoOTP);
        alert(`OTP sent successfully! For demo, use: ${demoOTP}`);
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

  // Process pending transactions when banks come back online
  const processPendingTransactions = async () => {
    if (!userProfile || pendingTransactions.length === 0) return;
    
    const token = localStorage.getItem('dpay_token');
    const userId = localStorage.getItem('dpay_user_id');
    if (!token || !userId) return;

    try {
      const response = await apiService.recoverPendingTransactions(token, userId);
      
      if (response.success && response.recoveredTransactions.length > 0) {
        // Update local state
        setUserProfile(prev => ({
          ...prev,
          balance: response.newBalance,
          appBalance: response.newAppBalance
        }));
        
        // Clear pending transactions
        setPendingTransactions([]);
        
        // Show notification
        setDowntimeMessage(`${response.recoveredTransactions.length} pending transaction(s) recovered successfully!`);
        setDowntimeType('success');
        setShowDowntimeNotification(true);
        
        // Reload transactions
        const transactionsResponse = await apiService.getTransactions(token, userId);
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.transactions);
        }
      }
    } catch (error) {
      console.error('Error processing pending transactions:', error);
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
      // Check if receiver exists
      let receiverUser = null;
      if (receiverDetails.upi) {
        const response = await apiService.findUserByUPI(token, receiverDetails.upi);
        if (response.success) {
          receiverUser = response.user;
        }
      } else if (receiverDetails.mobile) {
        const response = await apiService.findUserByMobile(token, receiverDetails.mobile);
        if (response.success) {
          receiverUser = response.user;
        }
      }

      if (!receiverUser) {
        alert('Receiver not found. Please check the UPI ID or mobile number.');
        return false;
      }

      // Check bank status
      const senderBankActive = checkBankServerStatus(userProfile.bankName);
      const receiverBankActive = checkBankServerStatus(receiverUser.bankName);

      const paymentData = {
        userId,
        amount,
        description,
        receiverDetails: {
          ...receiverDetails,
          receiverId: receiverUser._id,
          receiverBank: receiverUser.bankName
        },
        category: 'payment',
        upiPin: upiPinValue
      };

      const response = await apiService.processPayment(token, paymentData);
      
      if (response.success) {
        // Update local state
        const updatedUser = {
          ...userProfile,
          balance: response.newBalance,
          appBalance: response.newAppBalance
        };
        setUserProfile(updatedUser);
        
        // Add to transactions
        setTransactions(prev => [response.transaction, ...prev]);
        
        // Update pending transactions if any
        if (response.transaction.status === 'held_by_dpay') {
          setPendingTransactions(prev => [...prev, {
            transactionId: response.transaction._id,
            amount: amount,
            description: description,
            receiverDetails: receiverDetails,
            senderBank: userProfile.bankName,
            receiverBank: receiverUser.bankName,
            status: 'pending'
          }]);
        }
        
        // Show notification
        setDowntimeMessage(response.message);
        setDowntimeType('success');
        setDowntimeTransactionId(response.transaction._id);
        setDowntimeAmount(amount);
        setShowDowntimeNotification(true);
        
        // If banks are down, schedule recovery check
        if (!senderBankActive || !receiverBankActive) {
          setTimeout(processPendingTransactions, 10000);
        }
        
        return true;
      } else {
        alert(response.message || 'Transaction failed');
        return false;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Transaction failed. Please try again.');
      return false;
    }
  };

  // Handle QR Scanner
  const handleQRScan = () => {
    setShowQRScanner(true);
    setScannedData('');
    setReceiverName('');
    setReceiverUPI('');
    setSendAmount('');
    setSendDescription('');
  };

  // Handle QR Code Upload
  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setQrImage(imageData);
        // Simulate QR code parsing
        setTimeout(() => {
          parseQRCode(imageData);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse QR Code (simulated)
  const parseQRCode = (imageData) => {
    // For demo purposes, simulate QR code parsing
    const demoQRData = "upi://pay?pa=johndoe1234@dpay&pn=John%20Doe&am=500&cu=INR&tn=Payment%20for%20services";
    setScannedData(demoQRData);
    
    // Parse UPI data
    const params = new URLSearchParams(demoQRData.split('?')[1]);
    setReceiverUPI(params.get('pa') || 'johndoe1234@dpay');
    setReceiverName(decodeURIComponent(params.get('pn') || 'John Doe'));
    setSendAmount(params.get('am') || '');
    
    // Simulate receiver mobile vibration
    vibrateMobile();
    setShowQRUpload(false);
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
        receiverDetails: { name: receiverName, upi: receiverUPI }
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
        receiverDetails: { upi: sendToUPI, mobile: sendToMobile }
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

    // Verify UPI PIN
    if (upiPinValue !== userProfile.upiPin) {
      alert('Invalid UPI PIN');
      return;
    }

    // Process based on action type
    switch (upiPinAction.type) {
      case 'qr_payment':
        const qrSuccess = await handleMoneyTransfer(
          upiPinAction.data.amount,
          upiPinAction.data.description,
          upiPinAction.data.receiverDetails
        );
        
        if (qrSuccess) {
          setShowQRScanner(false);
          setSendAmount('');
          setSendDescription('');
          setScannedData('');
          setReceiverName('');
          setReceiverUPI('');
        }
        break;
        
      case 'send_money':
        const sendSuccess = await handleMoneyTransfer(
          upiPinAction.data.amount,
          upiPinAction.data.description,
          upiPinAction.data.receiverDetails
        );
        
        if (sendSuccess) {
          setShowSendMoney(false);
          setSendMoneyAmount('');
          setSendMoneyDescription('');
          setSendToUPI('');
          setSendToMobile('');
        }
        break;
        
      case 'mobile_recharge':
        const rechargeSuccess = await handleMoneyTransfer(
          upiPinAction.data.amount,
          upiPinAction.data.description,
          { mobile: rechargeMobile, operator: selectedOperator.name }
        );
        
        if (rechargeSuccess) {
          setShowMobileRecharge(false);
          setRechargeMobile('');
          setSelectedOperator(null);
          setSelectedPlan(null);
        }
        break;
        
      case 'bill_payment':
        const billSuccess = await handleMoneyTransfer(
          parseFloat(billAmount),
          `${selectedBillCategory?.name} - ${billNumber}`,
          { billNumber, category: selectedBillCategory.name }
        );
        
        if (billSuccess) {
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
        
      case 'admin_panel':
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

  // Handle Admin Panel Access
  const handleAdminPanel = () => {
    setUpiPinAction({ type: 'admin_panel', data: null });
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

    if (oldUPIPin !== userProfile.upiPin) {
      alert('Invalid old UPI PIN');
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
        setShowLoans(false);
        setShowLoanCategory(null);
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
        
        // Load admin users if admin
        if (response.user.mobile === '7825007490') {
          const usersResponse = await apiService.getAllUsers(response.token);
          if (usersResponse.success) {
            setAdminUsers(usersResponse.users);
          }
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
      setShowLoans(false);
      setShowLoanCategory(null);
      setShowAtmCard(false);
      setShowLogoutConfirm(false);
      setPendingTransactions([]);
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
      const userData = {
        ...registerData,
        panNumber: registerData.panNumber.toUpperCase()
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
        
        alert(`Registration successful!\nYour UPI ID: ${response.user.upiId}\nYour Referral Code: ${response.user.referralCode}\nYour Credit Score: ${response.user.creditScore}`);
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
    setShowLoans(false);
    setShowAtmCard(false);
    setShowAdminPanel(false);
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

  // Admin: Update user profile
  const handleAdminUpdateUser = async () => {
    if (!selectedUserForEdit) return;
    
    setIsLoading(true);
    setLoadingMessage('Updating user...');
    
    try {
      const token = localStorage.getItem('dpay_token');
      const response = await apiService.adminUpdateUser(token, selectedUserForEdit._id, selectedUserForEdit);
      
      if (response.success) {
        // Update local state
        setAdminUsers(prev => prev.map(user => 
          user._id === selectedUserForEdit._id ? selectedUserForEdit : user
        ));
        
        // If editing current user, update userProfile
        if (userProfile._id === selectedUserForEdit._id) {
          setUserProfile(selectedUserForEdit);
        }
        
        setSelectedUserForEdit(null);
        alert('User updated successfully!');
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

  // Admin: Update bank status
  const handleAdminUpdateBankStatus = async () => {
    if (!selectedBankForEdit) return;
    
    setIsLoading(true);
    setLoadingMessage('Updating bank status...');
    
    try {
      const token = localStorage.getItem('dpay_token');
      const response = await apiService.updateBankStatus(token, selectedBankForEdit.bankName, selectedBankForEdit.status);
      
      if (response.success) {
        // Update local state
        setBankServerStatus(prev => ({
          ...prev,
          [selectedBankForEdit.bankName]: {
            ...prev[selectedBankForEdit.bankName],
            status: selectedBankForEdit.status,
            lastChecked: new Date().toLocaleString(),
            responseTime: selectedBankForEdit.status === 'active' ? '120ms' : 
                        selectedBankForEdit.status === 'slow' ? '450ms' : 'Timeout'
          }
        }));
        
        setSelectedBankForEdit(null);
        setShowBankStatusEdit(false);
        alert('Bank status updated successfully!');
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
                  <BankStatusIndicator bankName={userProfile.bankName} bankServerStatus={bankServerStatus} />
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
                setQrImage(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!scannedData ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-64 h-64 mx-auto border-4 border-green-500 rounded-xl flex items-center justify-center bg-gray-100 overflow-hidden">
                  {qrImage ? (
                    <img src={qrImage} alt="QR Code" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Upload or capture QR code</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => document.getElementById('qr-upload').click()}
                  className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
                >
                  Upload QR Code Image
                </button>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => {
                    setIsScanning(true);
                    setTimeout(() => {
                      parseQRCode(null);
                    }, 2000);
                  }}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Simulate QR Scan
                </button>
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Scanning UPI QR codes will automatically fill:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
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
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-bold text-green-700 mb-2">QR Code Scanned Successfully!</p>
                <p className="text-sm text-green-600">UPI Payment Request Detected</p>
              </div>
              
              <div className="mb-6 space-y-4">
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-left">
                  <p className="text-sm text-violet-600 mb-1">Receiver Details</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-violet-800 text-lg">{receiverName}</p>
                      <p className="text-sm text-violet-500">{receiverUPI}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <label className="block text-sm font-medium text-violet-700 mb-2 text-left">
                    Amount to Send (₹)
                  </label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <label className="block text-sm font-medium text-violet-700 mb-2 text-left">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={sendDescription}
                    onChange={(e) => setSendDescription(e.target.value)}
                    placeholder="e.g., For dinner"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                    setQrImage(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
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
    const [receiverDetails, setReceiverDetails] = useState(null);
    const [searching, setSearching] = useState(false);

    const searchReceiver = async () => {
      if (!sendToUPI && !sendToMobile) {
        alert('Please enter UPI ID or Mobile Number');
        return;
      }

      setSearching(true);
      try {
        const token = localStorage.getItem('dpay_token');
        let response;

        if (sendToUPI) {
          response = await apiService.findUserByUPI(token, sendToUPI);
        } else {
          response = await apiService.findUserByMobile(token, sendToMobile);
        }

        if (response.success) {
          setReceiverDetails(response.user);
        } else {
          alert('Receiver not found. Please check the UPI ID or mobile number.');
          setReceiverDetails(null);
        }
      } catch (error) {
        console.error('Error searching receiver:', error);
        alert('Failed to search receiver. Please try again.');
        setReceiverDetails(null);
      } finally {
        setSearching(false);
      }
    };

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
                  setReceiverDetails(null);
                }}
                placeholder="e.g., username@dpay"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
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
              <input
                type="tel"
                value={sendToMobile}
                onChange={(e) => {
                  setSendToMobile(e.target.value);
                  setReceiverDetails(null);
                }}
                placeholder="10-digit mobile number"
                maxLength="10"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-xs text-violet-500 mt-1">Enter receiver's mobile number</p>
            </div>
            
            <button
              onClick={searchReceiver}
              disabled={searching || (!sendToUPI && !sendToMobile)}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                searching || (!sendToUPI && !sendToMobile)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {searching ? 'Searching...' : 'Verify Receiver'}
            </button>
            
            {receiverDetails && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800">{receiverDetails.username}</p>
                    <p className="text-sm text-green-600">{receiverDetails.upiId}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-green-600">Bank</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-green-700">{receiverDetails.bankName}</p>
                      <BankStatusIndicator bankName={receiverDetails.bankName} bankServerStatus={bankServerStatus} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-green-600">Mobile</p>
                    <p className="font-medium text-green-700">+91 {receiverDetails.mobile}</p>
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
            {receiverDetails && (
              <div className={`p-4 rounded-xl border ${
                checkBankServerStatus(userProfile.bankName) && checkBankServerStatus(receiverDetails.bankName)
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
                    <BankStatusIndicator bankName={userProfile.bankName} bankServerStatus={bankServerStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs">Receiver's Bank</p>
                      <p className="text-sm font-medium">{receiverDetails.bankName}</p>
                    </div>
                    <BankStatusIndicator bankName={receiverDetails.bankName} bankServerStatus={bankServerStatus} />
                  </div>
                </div>
                {(!checkBankServerStatus(userProfile.bankName) || !checkBankServerStatus(receiverDetails.bankName)) && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-100 border border-amber-300">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-amber-800">
                          {!checkBankServerStatus(userProfile.bankName) && !checkBankServerStatus(receiverDetails.bankName)
                            ? "Both banks are down. DPay will handle the transaction temporarily."
                            : !checkBankServerStatus(userProfile.bankName)
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
              disabled={!receiverDetails || !sendMoneyAmount}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !receiverDetails || !sendMoneyAmount
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

  // Loans Modal
  const LoansModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Loans</h2>
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
              
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-700">Why DPay Loans?</p>
                </div>
                <ul className="text-sm text-green-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Lowest interest rates from top banks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Quick approval within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>100% digital process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Minimal documentation</span>
                  </li>
                </ul>
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
                          {loan.bank && <BankStatusIndicator bankName={loan.bank} bankServerStatus={bankServerStatus} />}
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
                      
                      {loan.processing && (
                        <div className="mt-3 p-2 rounded-lg bg-blue-50">
                          <p className="text-xs text-blue-600">Processing Fee: {loan.processing}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-700 mb-1">Important Information</p>
                    <ul className="text-xs text-amber-600 space-y-1">
                      <li>• Interest rates are subject to change</li>
                      <li>• Final approval is at the discretion of the bank</li>
                      <li>• Processing fee is non-refundable</li>
                      <li>• Terms and conditions apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rewards Modal
  const RewardsModal = () => {
    const userRefCode = userProfile?.referralCode || 'DPREF123';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
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
              <Award className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-violet-800 mb-2">Earn Rewards!</h3>
            <p className="text-sm text-violet-600 mb-6">
              Refer friends and earn cashback rewards
            </p>
            
            <div className="mb-6 space-y-4">
              {/* Referral Section */}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-green-700">₹150</p>
                </div>
                
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1">Referrals</p>
                  <p className="text-2xl font-bold text-blue-700">3</p>
                </div>
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
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-violet-600">Temporary transaction buffer</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setShowAppBalance(false);
              setShowRewards(true);
            }}
            className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition mb-3"
          >
            Earn Rewards
          </button>
          
          <button
            onClick={() => setShowAppBalance(false)}
            className="w-full py-2 text-violet-600 font-medium hover:text-violet-700"
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
                      <BankStatusIndicator bankName={currentProfile.bankName} bankServerStatus={bankServerStatus} />
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
                      
                      {/* Admin Panel Button (only for mobile: 7825007490) */}
                      {userProfile.mobile === '7825007490' && (
                        <button
                          onClick={handleAdminPanel}
                          className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                        >
                          <Users className="w-5 h-5" />
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
                      <BankStatusIndicator bankName={userProfile.bankName} bankServerStatus={bankServerStatus} />
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
                <BankStatusIndicator bankName={userProfile?.bankName} bankServerStatus={bankServerStatus} />
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
              <BankStatusIndicator bankName={userProfile?.bankName} bankServerStatus={bankServerStatus} />
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

  // Admin Panel Modal
  const AdminPanelModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-violet-700">Admin Panel</h2>
              <p className="text-sm text-violet-600">Manage users and bank server status</p>
            </div>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-violet-800">Users Management</h3>
                <span className="bg-violet-100 text-violet-700 text-sm px-3 py-1 rounded-full">
                  {adminUsers.length} users
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-violet-50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Name</th>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Mobile</th>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Bank</th>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{user.username}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-gray-700">+91 {user.mobile}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-700">{user.bankName}</p>
                            <BankStatusIndicator bankName={user.bankName} bankServerStatus={bankServerStatus} />
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedUserForEdit(user)}
                            className="px-3 py-1 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Bank Server Status Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-violet-800">Bank Server Status</h3>
                <button
                  onClick={() => setShowBankStatusEdit(true)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Manage Status
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-violet-50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Bank Name</th>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Status</th>
                      <th className="p-3 text-left text-sm font-medium text-violet-700">Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bankServerStatus).map(([bankName, status]) => (
                      <tr key={bankName} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">
                          <p className="text-sm font-medium text-gray-800">{bankName}</p>
                        </td>
                        <td className="p-3">
                          <BankStatusIndicator bankName={bankName} bankServerStatus={bankServerStatus} />
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-gray-700">{status.responseTime}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
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

  // Edit User Modal (Admin)
  const EditUserModal = () => {
    if (!selectedUserForEdit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Edit User</h2>
            <button
              onClick={() => setSelectedUserForEdit(null)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={selectedUserForEdit.username}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={selectedUserForEdit.mobile}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, mobile: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                maxLength="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={selectedUserForEdit.email}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Bank Name
              </label>
              <select
                value={selectedUserForEdit.bankName}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, bankName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select Bank</option>
                {INDIAN_BANKS.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={selectedUserForEdit.accountNumber}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Balance (₹)
              </label>
              <input
                type="number"
                value={selectedUserForEdit.balance}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                App Balance (₹)
              </label>
              <input
                type="number"
                value={selectedUserForEdit.appBalance}
                onChange={(e) => setSelectedUserForEdit(prev => ({ ...prev, appBalance: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminUpdateUser}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Bank Status Modal (Admin)
  const EditBankStatusModal = () => {
    if (!showBankStatusEdit) return null;

    const [selectedBank, setSelectedBank] = useState('');
    const [status, setStatus] = useState('active');

    const handleSubmit = () => {
      if (!selectedBank) {
        alert('Please select a bank');
        return;
      }

      setSelectedBankForEdit({
        bankName: selectedBank,
        status: status
      });
      handleAdminUpdateBankStatus();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-violet-700">Update Bank Status</h2>
            <button
              onClick={() => setShowBankStatusEdit(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Select Bank
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select Bank</option>
                {INDIAN_BANKS.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStatus('active')}
                  className={`py-3 rounded-xl font-semibold transition ${
                    status === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatus('slow')}
                  className={`py-3 rounded-xl font-semibold transition ${
                    status === 'slow'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  Slow
                </button>
                <button
                  onClick={() => setStatus('down')}
                  className={`py-3 rounded-xl font-semibold transition ${
                    status === 'down'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Down
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBankStatusEdit(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedBank}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  !selectedBank
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                          {bank}
                        </option>
                      ))}
                    </select>
                    <Building className="absolute right-3 top-3.5 w-5 h-5 text-violet-500 pointer-events-none" />
                  </div>
                  <p className="text-xs text-violet-500 mt-1 ml-1">Required</p>
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
                    onClick={() => {
                      if (otpMethod === 'mobile' && mobile.length >= 10) {
                        sendOTP();
                      } else if (otpMethod === 'email' && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        sendOTP();
                      } else {
                        alert(`Please enter a valid ${otpMethod === 'mobile' ? '10-digit mobile number' : 'email address'}`);
                      }
                    }}
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
          {/* Header with Profile Picture at Top Right */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-violet-700">DPay</h1>
              {userProfile && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-violet-600">
                    Hi, {userProfile.username}!
                  </p>
                  <BankStatusIndicator bankName={userProfile.bankName} bankServerStatus={bankServerStatus} />
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
            <button
              onClick={() => setShowLoans(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition"
            >
              <Landmark className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Loans</span>
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
      {showLoans && <LoansModal />}
      {showAtmCard && <ATMCardModal />}
      {showUPIPinModal && <UPIPinModal />}
      {showChangeUPIPin && <ChangeUPIPinModal />}
      {showLogoutConfirm && <LogoutConfirmModal />}
      {showDeleteConfirm && <DeleteAccountModal />}
      {showAdminPanel && <AdminPanelModal />}
      {selectedUserForEdit && <EditUserModal />}
      {showBankStatusEdit && <EditBankStatusModal />}
      {selectedBankForEdit && showBankStatusEdit && <EditBankStatusModal />}
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
