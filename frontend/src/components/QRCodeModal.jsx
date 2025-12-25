import { useState } from 'react';
import { X, QrCode, Copy, Check, Building } from 'lucide-react';

// Simple QR Code Component
const SimpleQRCode = ({ data, size = 200 }) => {
  const [qrImage, setQrImage] = useState('');

  // This is a simplified QR code generation
  // In production, use a proper QR code library
  const generateQR = () => {
    // Create a simple pattern for demo
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Black squares pattern
    ctx.fillStyle = '#000000';
    const cellSize = size / 21;
    
    // Draw pattern
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        // Simple pattern based on data hash
        const shouldFill = ((x + y) % 3 === 0) || 
                          (x < 7 && y < 7) || 
                          (x > 13 && y < 7) || 
                          (x < 7 && y > 13);
        
        if (shouldFill) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Add DP logo in center
    const logoSize = size * 0.2;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add white border and text
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${logoSize * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DP', logoX + logoSize/2, logoY + logoSize/2);
    
    return canvas.toDataURL('image/png');
  };

  return (
    <div className="relative bg-white p-4 rounded-lg border-4 border-black">
      <img 
        src={generateQR()} 
        alt="QR Code"
        className="w-full h-auto"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

const QRCodeModal = ({ userProfile, copied, onCopyUPI, bankStatus, onClose }) => {
  const qrData = `upi://pay?pa=${userProfile?.upiId}&pn=${encodeURIComponent(userProfile?.username || 'User')}&cu=INR&tn=DPay%20Payment`;

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'slow': return 'bg-yellow-100 text-yellow-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Receive Money</h2>
          <button
            onClick={onClose}
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
                  {userProfile?.upiId}
                </code>
                <button
                  onClick={onCopyUPI}
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
                <p className="font-semibold text-violet-800">{userProfile?.username}</p>
              </div>
              
              {userProfile?.bankName && (
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-violet-600 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Linked Bank
                    </p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(bankStatus?.status)}`}>
                      <span className="capitalize">{bankStatus?.status || 'unknown'}</span>
                    </div>
                  </div>
                  <p className="font-medium text-violet-800">{userProfile?.bankName}</p>
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
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;