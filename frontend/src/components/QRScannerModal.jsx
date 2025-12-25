import { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, Loader2, ScanLine } from 'lucide-react';

const QRScannerModal = ({ onClose, onSendMoney }) => {
  const [scannedData, setScannedData] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverUPI, setReceiverUPI] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendDescription, setSendDescription] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const handleQRScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setVideoStream(stream);
      setIsScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Camera access denied. Using demo mode.');
      
      setIsScanning(true);
      setTimeout(() => {
        simulateQRScan();
      }, 1000);
    }
  };

  const simulateQRScan = () => {
    const demoQRData = "upi://pay?pa=johndoe1234@dpay&pn=John%20Doe&am=500&cu=INR&tn=Payment%20for%20services";
    setScannedData(demoQRData);
    
    // Parse UPI data
    const params = new URLSearchParams(demoQRData.split('?')[1]);
    setReceiverUPI(params.get('pa') || 'johndoe1234@dpay');
    setReceiverName(decodeURIComponent(params.get('pn') || 'John Doe'));
    setSendAmount(params.get('am') || '');
  };

  const handleQRPayment = () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSendMoney({
      receiverUPI,
      receiverName,
      amount: parseFloat(sendAmount),
      description: sendDescription || `Payment to ${receiverName}`
    });

    // Clean up
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-black rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">QR Scanner</h2>
          <button
            onClick={() => {
              onClose();
              if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
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
            
            <div className="mt-6 p-4 rounded-xl bg-gray-900 border border-gray-700">
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
            
            {!videoStream && (
              <button
                onClick={() => {
                  setIsScanning(true);
                  setTimeout(simulateQRScan, 2000);
                }}
                disabled={isScanning}
                className={`w-full mt-4 py-3 rounded-xl font-semibold transition ${
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
                ) : (
                  <>
                    <ScanLine className="w-5 h-5 inline mr-2" />
                    Simulate QR Scan (Demo)
                  </>
                )}
              </button>
            )}
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
                    <ScanLine className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{receiverName}</p>
                    <p className="text-sm text-gray-300">{receiverUPI}</p>
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

export default QRScannerModal;