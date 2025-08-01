import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface ScratchCardProps {
  result: number;
  onComplete: () => void;
}

export const ScratchCard = ({ result, onComplete }: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState("");

  const encouragementMessages = [
    "Keep scratching! 🎯",
    "You're getting there! ✨",
    "Almost revealed! 🌟",
    "So close! 🎉",
    "Just a bit more! 💫"
  ];

  const formatResult = (num: number): string => {
    // Handle very large or very small numbers
    if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.001 && num !== 0)) {
      return num.toExponential(3);
    }
    
    // Round to avoid floating point precision issues
    const rounded = Math.round(num * 100000000) / 100000000;
    
    // Format with commas for large numbers
    return rounded.toLocaleString();
  };

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Create scratch surface with metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#c0c0c0");
    gradient.addColorStop(0.5, "#e8e8e8");
    gradient.addColorStop(1, "#a8a8a8");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add some texture
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
      ctx.fillRect(x, y, 2, 1);
    }

    // Add "SCRATCH HERE" text
    ctx.fillStyle = "#666";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2 - 10);
    ctx.font = "14px sans-serif";
    ctx.fillText("to reveal result", rect.width / 2, rect.height / 2 + 15);
  }, []);

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) {
        transparentPixels++;
      }
    }

    return (transparentPixels / (data.length / 4)) * 100;
  }, []);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(
      (x - rect.left) * scaleX,
      (y - rect.top) * scaleY,
      20 * window.devicePixelRatio,
      0,
      2 * Math.PI
    );
    ctx.fill();

    if (!hasStartedScratching) {
      setHasStartedScratching(true);
      toast("Great! Keep scratching! 🎯");
    }

    const percentage = calculateScratchPercentage();
    setScratchPercentage(percentage);

    // Show encouragement messages
    if (percentage > 20 && percentage < 40 && encouragementMessage !== encouragementMessages[0]) {
      setEncouragementMessage(encouragementMessages[0]);
    } else if (percentage > 40 && percentage < 60 && encouragementMessage !== encouragementMessages[1]) {
      setEncouragementMessage(encouragementMessages[1]);
    } else if (percentage > 60 && percentage < 80 && encouragementMessage !== encouragementMessages[2]) {
      setEncouragementMessage(encouragementMessages[2]);
    } else if (percentage > 80 && percentage < 95 && encouragementMessage !== encouragementMessages[3]) {
      setEncouragementMessage(encouragementMessages[3]);
    }

    // Complete when 70% is scratched
    if (percentage > 70) {
      setTimeout(() => onComplete(), 500);
    }
  }, [hasStartedScratching, encouragementMessage, calculateScratchPercentage, onComplete]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isScratching) {
      const touch = e.touches[0];
      scratch(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
  };

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  useEffect(() => {
    // Add global mouse up listener
    const handleGlobalMouseUp = () => setIsScratching(false);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          🎊 Your Result is Ready! 🎊
        </h3>
        {encouragementMessage && (
          <p className="text-sm text-muted-foreground animate-bounce-in">
            {encouragementMessage}
          </p>
        )}
        {scratchPercentage > 0 && (
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-fun h-2 rounded-full transition-all duration-300"
                style={{ width: `${scratchPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(scratchPercentage)}% revealed
            </p>
          </div>
        )}
      </div>

      <div className="relative bg-scratch-bg rounded-2xl p-8 shadow-card overflow-hidden">
        {/* Result underneath */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-fun">
          <div className="text-center text-white">
            <div className="text-6xl font-bold font-mono mb-2">
              {formatResult(result)}
            </div>
            <div className="text-lg font-medium">
              🎉 Your Answer! 🎉
            </div>
          </div>
        </div>

        {/* Scratch surface */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer select-none"
          style={{ touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Invisible content for sizing */}
        <div className="opacity-0 pointer-events-none">
          <div className="text-6xl font-bold font-mono mb-2">
            {formatResult(result)}
          </div>
          <div className="text-lg font-medium">
            🎉 Your Answer! 🎉
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        💡 Tip: Use your finger or mouse to scratch off the silver area!
      </div>
    </div>
  );
};