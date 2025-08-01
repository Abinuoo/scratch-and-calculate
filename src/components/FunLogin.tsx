import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const CORRECT_USERNAME = "rockuser";
const CORRECT_PASSWORD = "theeyebrow123";

export const FunLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [grimaceDetected, setGrimaceDetected] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Make a grimace face!");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize TensorFlow.js and face detection model
  useEffect(() => {
    const initModel = async () => {
      await tf.ready();
      await tf.setBackend('webgl');
    };
    initModel();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        detectGrimace();
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      setShowVideo(true);
    }
  };

  const detectGrimace = async () => {
    try {
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'mediapipe' as const,
        refineLandmarks: true,
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      };
      const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      
      const checkFace = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const faces = await detector.estimateFaces(videoRef.current);
          
          if (faces.length > 0) {
            // Simple grimace detection - check if mouth corners are down
            const keypoints = faces[0].keypoints;
            const leftMouth = keypoints[61]; // Left mouth corner
            const rightMouth = keypoints[291]; // Right mouth corner
            const topLip = keypoints[13]; // Top lip center
            
            // Check if mouth corners are below the top lip (indicating frown)
            const isGrimacing = leftMouth.y > topLip.y && rightMouth.y > topLip.y;
            
            if (isGrimacing) {
              setGrimaceDetected(true);
              setCameraMessage("Perfect grimace! 😤");
              setTimeout(() => {
                setShowCamera(false);
                const stream = videoRef.current?.srcObject as MediaStream;
                stream?.getTracks().forEach(track => track.stop());
              }, 2000);
              return;
            }
          }
          
          // Continue checking if no grimace detected
          setTimeout(checkFace, 100);
        }
      };
      
      // Start checking after video loads
      setTimeout(checkFace, 1000);
      
      // If no grimace after 10 seconds, show video
      setTimeout(() => {
        if (!grimaceDetected) {
          setShowVideo(true);
          const stream = videoRef.current?.srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
        }
      }, 10000);
      
    } catch (error) {
      console.error("Face detection error:", error);
      setShowVideo(true);
    }
  };

  const handleLogin = () => {
    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      setShowConfirmDialog(true);
    } else {
      toast({
        title: "WRONG CREDENTIALS! 😱",
        description: "Time to make a grimace face!",
        variant: "destructive",
      });
      setShowCamera(true);
      setGrimaceDetected(false);
      setCameraMessage("Make a grimace face!");
      startCamera();
    }
  };

  const handleConfirmYes = () => {
    setIsLoggedIn(true);
    setShowConfirmDialog(false);
  };

  const handleConfirmNo = () => {
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-8xl font-black text-primary-foreground mb-8 animate-pulse">
            🎉 WELCOME, LEGEND! 🎉
          </h1>
          <p className="text-2xl text-primary-foreground/80">
            You have successfully completed the most ridiculous login process ever created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive via-warning to-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-4 border-primary shadow-2xl transform hover:scale-105 transition-transform">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardTitle className="text-4xl font-black animate-bounce">
            🪨 THE ROCK LOGIN 🤨
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xl font-bold text-primary">Username:</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter the legendary username..."
                className="text-lg border-2 border-primary"
              />
            </div>
            
            <div>
              <label className="text-xl font-bold text-primary">Password:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="The eyebrow knows..."
                className="text-lg border-2 border-primary"
              />
            </div>
            
            <Button 
              onClick={handleLogin}
              className="w-full text-xl font-black py-6 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary transform hover:scale-105 transition-all"
            >
              🚀 ATTEMPT LOGIN 🚀
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-destructive">
              {cameraMessage}
            </h2>
            <video 
              ref={videoRef} 
              className="w-full rounded-lg mb-4"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
            {!grimaceDetected && (
              <p className="text-muted-foreground">
                Come on, give me your best angry face! 😠
              </p>
            )}
          </div>
        </div>
      )}

      {/* Funny Video Fallback */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg text-center max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-destructive">
              No grimace detected! Here's something funny instead:
            </h2>
            <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-xl text-muted-foreground">
                📹 [Funny video would play here]
              </p>
            </div>
            <Button 
              onClick={() => setShowVideo(false)}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black text-center text-primary">
              🤨 ARE YOU SURE? 🤨
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="text-center py-8">
            <div className="w-64 h-64 bg-muted rounded-lg mx-auto flex items-center justify-center">
              <p className="text-lg text-muted-foreground">
                🤨 [The Rock eyebrow GIF goes here]
              </p>
            </div>
          </div>
          
          <AlertDialogFooter className="flex gap-4">
            <AlertDialogAction 
              onClick={handleConfirmYes}
              className="flex-1 text-xl font-bold py-4 bg-primary hover:bg-primary/90"
            >
              💪 YES, I'M SURE!
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={handleConfirmNo}
              className="flex-1 text-xl font-bold py-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              😅 NO, GET ME OUT!
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};