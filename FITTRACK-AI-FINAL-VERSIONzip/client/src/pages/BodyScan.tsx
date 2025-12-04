import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Scan, 
  AlertCircle, 
  CheckCircle, 
  Crown,
  ArrowRight,
  RefreshCcw,
  Loader2,
  X,
  Shield,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { ProgressRing } from '../components/fitness/ProgressRing';
import { GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal } from '../components/fitness/ScrollReveal';
import { analyzePosture, type PostureAnalysisResult, type PostureLandmark } from '../lib/postureAnalysis';
import { useToast } from '../hooks/use-toast';

type ScanStatus = 'idle' | 'initializing' | 'ready' | 'scanning' | 'analyzing' | 'complete' | 'error';

export function BodyScan() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PostureAnalysisResult | null>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const [capturedLandmarks, setCapturedLandmarks] = useState<PostureLandmark[] | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: canScanData, isLoading: checkingPermission } = useQuery({
    queryKey: ['/api/can-scan'],
    queryFn: async () => {
      const res = await fetch('/api/can-scan', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to check permissions');
      return res.json();
    },
  });

  const { data: previousScans } = useQuery({
    queryKey: ['/api/body-scans'],
    queryFn: async () => {
      const res = await fetch('/api/body-scans', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch scans');
      return res.json();
    },
  });

  const saveScanMutation = useMutation({
    mutationFn: async (scanData: any) => {
      const res = await fetch('/api/body-scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(scanData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/body-scans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/can-scan'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trial-usage'] });
    },
  });

  const initializePoseLandmarker = useCallback(async () => {
    try {
      setScanStatus('initializing');
      
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      
      setPoseLandmarker(landmarker);
      return landmarker;
    } catch (error: any) {
      console.error('Failed to initialize pose detection:', error);
      setCameraError(
        'Failed to load AI model. Please check your internet connection and try again. ' +
        'If the problem persists, try using a different browser (Chrome or Edge recommended).'
      );
      setScanStatus('error');
      throw error;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      
      const landmarker = poseLandmarker || await initializePoseLandmarker();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanStatus('ready');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError(
        error.name === 'NotAllowedError' 
          ? 'Camera access denied. Please allow camera access to use the body scan feature.'
          : 'Failed to access camera. Please make sure your device has a camera.'
      );
      setScanStatus('error');
    }
  }, [poseLandmarker, initializePoseLandmarker]);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !poseLandmarker) return;
    
    setScanStatus('scanning');
    
    let lastTime = -1;
    const detectPose = async (timestamp: number) => {
      if (lastTime === timestamp) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }
      lastTime = timestamp;
      
      try {
        const result = poseLandmarker.detectForVideo(videoRef.current, timestamp);
        
        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0] as PostureLandmark[];
          
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              ctx.strokeStyle = '#8b5cf6';
              ctx.lineWidth = 2;
              
              const connections = [
                [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
                [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
                [25, 27], [26, 28],
              ];
              
              connections.forEach(([start, end]) => {
                const startPoint = landmarks[start];
                const endPoint = landmarks[end];
                ctx.beginPath();
                ctx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height);
                ctx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height);
                ctx.stroke();
              });
              
              landmarks.forEach((landmark, idx) => {
                if ([0, 11, 12, 23, 24, 25, 26, 27, 28].includes(idx)) {
                  ctx.beginPath();
                  ctx.arc(
                    landmark.x * canvasRef.current!.width,
                    landmark.y * canvasRef.current!.height,
                    5,
                    0,
                    2 * Math.PI
                  );
                  ctx.fillStyle = '#a855f7';
                  ctx.fill();
                }
              });
            }
          }
          
          setCapturedLandmarks(landmarks);
        }
        
        animationRef.current = requestAnimationFrame(detectPose);
      } catch (error) {
        console.error('Pose detection error:', error);
      }
    };
    
    animationRef.current = requestAnimationFrame(detectPose);
    
    setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      performAnalysis();
    }, 3000);
  }, [poseLandmarker]);

  const performAnalysis = useCallback(async () => {
    setScanStatus('analyzing');
    
    if (!capturedLandmarks || capturedLandmarks.length < 33) {
      toast({
        title: 'Scan Failed',
        description: 'Could not detect your full body. Please stand further back and try again.',
        variant: 'destructive',
      });
      setScanStatus('ready');
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = analyzePosture(capturedLandmarks);
      setAnalysisResult(result);
      
      await saveScanMutation.mutateAsync({
        postureScore: result.postureScore,
        shoulderAlignment: result.shoulderAlignment,
        hipAlignment: result.hipAlignment,
        spineAlignment: result.spineAlignment,
        headPosition: result.headPosition,
        bodySymmetry: result.bodySymmetry,
        overallAssessment: result.overallAssessment,
        recommendations: result.recommendations,
        landmarks: capturedLandmarks,
      });
      
      stopCamera();
      setScanStatus('complete');
      
      toast({
        title: 'Scan Complete!',
        description: 'Your posture analysis is ready.',
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      if (error.message?.includes('Premium subscription required')) {
        toast({
          title: 'Upgrade Required',
          description: 'You\'ve used your free trial. Upgrade to Premium for unlimited scans.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Analysis Failed',
          description: error.message || 'Failed to complete the analysis. Please try again.',
          variant: 'destructive',
        });
      }
      setScanStatus('ready');
    }
  }, [capturedLandmarks, saveScanMutation, stopCamera, toast]);

  const resetScan = useCallback(() => {
    setAnalysisResult(null);
    setCapturedLandmarks(null);
    setScanStatus('idle');
    stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (poseLandmarker) {
        poseLandmarker.close();
      }
    };
  }, [stopCamera, poseLandmarker]);

  if (checkingPermission) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </Layout>
    );
  }

  const canScan = canScanData?.canScan;
  const isPremium = canScanData?.isPremium;
  const trialAvailable = canScanData?.trialAvailable;

  return (
    <Layout>
      <div className="relative">
        <GlowOrb color="purple" position="top-right" size="lg" />
        
        <motion.header 
          className="page-header mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Scan className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-page-title text-white">AI Body Scan</h1>
                <p className="text-sm text-gray-400">Analyze your posture and body alignment</p>
              </div>
            </div>
          </div>
          
          {isPremium ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Premium</span>
            </div>
          ) : trialAvailable ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">1 Free Trial Available</span>
            </div>
          ) : (
            <Link href="/premium">
              <FitnessButton size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-500">
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </FitnessButton>
            </Link>
          )}
        </motion.header>

        <AnimatePresence mode="wait">
          {scanStatus === 'complete' && analysisResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ScrollReveal>
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  <FitnessCard className="lg:col-span-2" variant="animated">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-section-title text-white">Posture Analysis Results</h2>
                      <FitnessButton variant="outline" size="sm" onClick={resetScan}>
                        <RefreshCcw className="w-4 h-4" />
                        New Scan
                      </FitnessButton>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                      <ProgressRing 
                        progress={analysisResult.postureScore} 
                        size={160} 
                        strokeWidth={12}
                        color={analysisResult.postureScore >= 80 ? '#22c55e' : analysisResult.postureScore >= 60 ? '#f59e0b' : '#ef4444'}
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{analysisResult.postureScore}</div>
                          <div className="text-gray-400 text-sm">Overall Score</div>
                        </div>
                      </ProgressRing>
                      
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        {[
                          { label: 'Shoulders', value: analysisResult.shoulderAlignment },
                          { label: 'Hips', value: analysisResult.hipAlignment },
                          { label: 'Spine', value: analysisResult.spineAlignment },
                          { label: 'Head', value: analysisResult.headPosition },
                          { label: 'Symmetry', value: analysisResult.bodySymmetry },
                        ].map((item) => (
                          <div key={item.label} className="bg-white/5 rounded-lg p-3">
                            <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    item.value >= 80 ? 'bg-green-500' : item.value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${item.value}%` }}
                                />
                              </div>
                              <span className="text-white text-sm font-medium w-8">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                      <h3 className="text-white font-medium mb-2">Assessment</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{analysisResult.overallAssessment}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {analysisResult.issues
                        .filter(issue => issue.type !== 'good')
                        .map((issue, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-start gap-3 p-3 rounded-lg ${
                              issue.type === 'concern' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                            }`}
                          >
                            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${issue.type === 'concern' ? 'text-red-400' : 'text-amber-400'}`} />
                            <div>
                              <div className={`text-sm font-medium ${issue.type === 'concern' ? 'text-red-400' : 'text-amber-400'}`}>
                                {issue.area}
                              </div>
                              <div className="text-gray-400 text-sm">{issue.message}</div>
                            </div>
                          </div>
                        ))}
                      
                      {analysisResult.issues.filter(i => i.type === 'good').map((issue, idx) => (
                        <div 
                          key={`good-${idx}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-green-400">{issue.area}</div>
                            <div className="text-gray-400 text-sm">{issue.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FitnessCard>
                  
                  <FitnessCard variant="animated">
                    <h3 className="text-card-title text-white mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-400 text-xs font-medium">{idx + 1}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                    
                    {!isPremium && (
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <Link href="/premium">
                          <FitnessButton className="w-full bg-gradient-to-r from-amber-500 to-yellow-500">
                            <Crown className="w-4 h-4" />
                            Unlock Unlimited Scans
                          </FitnessButton>
                        </Link>
                      </div>
                    )}
                  </FitnessCard>
                </div>
              </ScrollReveal>
            </motion.div>
          ) : (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                <FitnessCard className="lg:col-span-2" variant="animated">
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    {scanStatus === 'idle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Camera className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-gray-400 text-center max-w-sm">
                          Position yourself in front of the camera with your full body visible
                        </p>
                      </div>
                    )}
                    
                    {scanStatus === 'initializing' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                        <p className="text-gray-400">Initializing AI model...</p>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <p className="text-red-400 text-center">{cameraError}</p>
                      </div>
                    )}
                    
                    <video
                      ref={videoRef}
                      className={`w-full h-full object-cover ${scanStatus === 'ready' || scanStatus === 'scanning' ? 'block' : 'hidden'}`}
                      playsInline
                      muted
                    />
                    
                    <canvas
                      ref={canvasRef}
                      className={`absolute inset-0 w-full h-full ${scanStatus === 'scanning' ? 'block' : 'hidden'}`}
                    />
                    
                    {scanStatus === 'scanning' && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-purple-500/80 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium">Scanning...</span>
                      </div>
                    )}
                    
                    {scanStatus === 'analyzing' && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                        <p className="text-white font-medium">Analyzing your posture...</p>
                        <p className="text-gray-400 text-sm">This may take a few seconds</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-6">
                    {scanStatus === 'idle' && canScan && (
                      <FitnessButton size="lg" onClick={startCamera} className="btn-shimmer">
                        <Camera className="w-5 h-5" />
                        Start Camera
                      </FitnessButton>
                    )}
                    
                    {scanStatus === 'idle' && !canScan && (
                      <Link href="/premium">
                        <FitnessButton size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500">
                          <Crown className="w-5 h-5" />
                          Upgrade to Scan
                        </FitnessButton>
                      </Link>
                    )}
                    
                    {scanStatus === 'ready' && (
                      <>
                        <FitnessButton variant="outline" onClick={stopCamera}>
                          <X className="w-5 h-5" />
                          Cancel
                        </FitnessButton>
                        <FitnessButton size="lg" onClick={captureAndAnalyze} className="btn-shimmer">
                          <Scan className="w-5 h-5" />
                          {trialAvailable && !isPremium ? 'Use Free Trial Scan' : 'Start Scan'}
                        </FitnessButton>
                      </>
                    )}
                    
                    {scanStatus === 'error' && (
                      <FitnessButton onClick={startCamera}>
                        <RefreshCcw className="w-5 h-5" />
                        Try Again
                      </FitnessButton>
                    )}
                  </div>
                </FitnessCard>
                
                <div className="space-y-6">
                  <FitnessCard variant="animated">
                    <h3 className="text-card-title text-white mb-4">How It Works</h3>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Position yourself', desc: 'Stand 6-8 feet from your camera with full body visible' },
                        { step: 2, title: 'Stay still', desc: 'Hold a natural standing position for 3 seconds' },
                        { step: 3, title: 'Get results', desc: 'AI analyzes 33 body points to assess your posture' },
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-400 font-medium">{item.step}</span>
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{item.title}</div>
                            <div className="text-gray-400 text-xs">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FitnessCard>
                  
                  <FitnessCard variant="animated" className="border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <h3 className="text-card-title text-white">Privacy First</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      All analysis happens directly on your device. Your images are never uploaded or stored on any server.
                    </p>
                  </FitnessCard>
                  
                  {previousScans && previousScans.length > 0 && (
                    <FitnessCard variant="animated">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-card-title text-white">Recent Scans</h3>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        {previousScans.slice(0, 3).map((scan: any) => (
                          <div key={scan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <div className="text-white text-sm font-medium">Score: {scan.postureScore}</div>
                              <div className="text-gray-400 text-xs">
                                {new Date(scan.scanDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              scan.postureScore >= 80 ? 'bg-green-500/20 text-green-400' : 
                              scan.postureScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {scan.postureScore}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FitnessCard>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
