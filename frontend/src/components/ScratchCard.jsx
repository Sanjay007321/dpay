import { useRef, useState, useEffect } from 'react';
import { Trophy, X, Star, Award } from 'lucide-react';

const ScratchCard = ({ card, isScratched, onScratch, onClaim, onClose }) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || isScratched) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw silver scratch surface
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.5, '#d0d0d0');
    gradient.addColorStop(1, '#b0b0b0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = '#666';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width/2, canvas.height/2);

    // Draw circles pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 8 + 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Event listeners for scratching
    const handleMouseDown = () => setIsScratching(true);
    const handleMouseUp = () => setIsScratching(false);
    const handleMouseMove = (e) => {
      if (!isScratching) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
      }
      
      const percentage = (transparentPixels / (pixels.length / 4)) * 100;
      setScratchedPercentage(percentage);

      if (percentage > 50 && !isScratched) {
        onScratch();
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      setIsScratching(true);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!isScratching) return;

      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
      }
      
      const percentage = (transparentPixels / (pixels.length / 4)) * 100;
      setScratchedPercentage(percentage);

      if (percentage > 50 && !isScratched) {
        onScratch();
      }
    };

    const handleTouchEnd = () => setIsScratching(false);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScratched, isScratching, onScratch]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-700">Scratch Card Reward</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-64 h-40 mx-auto rounded-xl overflow-hidden bg-gradient-to-r from-amber-400 to-yellow-500 p-1">
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center relative">
                {isScratched ? (
                  <div className="p-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-600">Congratulations!</p>
                    <p className="text-lg font-bold text-amber-700 mt-2">You Won ₹{card.reward} Cashback!</p>
                    <p className="text-sm text-gray-600 mt-2">Cashback will be added to your App Balance</p>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair touch-none"
                  />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isScratched ? 'Reward unlocked!' : 'Scratch the silver area to reveal your reward'}
            </p>
            {!isScratched && (
              <p className="text-xs text-amber-600 mt-1">
                Scratched: {Math.round(scratchedPercentage)}%
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700 flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                You get 1 scratch card for every 3 successful payments
              </p>
            </div>
            
            {isScratched && (
              <button
                onClick={onClaim}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Claim ₹{card.reward} Cashback
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-2 text-violet-600 font-medium hover:text-violet-700"
            >
              {isScratched ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchCard;