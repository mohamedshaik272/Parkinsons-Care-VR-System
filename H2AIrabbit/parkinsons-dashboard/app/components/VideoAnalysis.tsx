'use client';

import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface VideoAnalysisProps {
  videoUrl: string;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

interface AnalysisResults {
  tremorFrequency: number;
  movementAmplitude: number;
  symmetryScore: number;
  updrsEstimate: number;
}

export default function VideoAnalysis({ videoUrl, onAnalysisComplete }: VideoAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector>();

  useEffect(() => {
    const initializeDetector = async () => {
      await tf.ready();
      const model = poseDetection.SupportedModels.BlazePose;
      const detector = await poseDetection.createDetector(model, {
        runtime: 'tfjs',
        modelType: 'full'
      });
      detectorRef.current = detector;
    };

    initializeDetector();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  const analyzeFrame = async (video: HTMLVideoElement, timestamp: number) => {
    if (!detectorRef.current || !canvasRef.current) return;

    const poses = await detectorRef.current.estimatePoses(video);
    
    if (poses.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw keypoints and connections
      poses.forEach(pose => {
        pose.keypoints.forEach(keypoint => {
          if (keypoint.score && keypoint.score > 0.3) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
      });
    }

    return poses;
  };

  const startAnalysis = async () => {
    if (!videoRef.current || !detectorRef.current) return;

    setIsAnalyzing(true);
    setProgress(0);

    const video = videoRef.current;
    const duration = video.duration;
    const frameRate = 30;
    const totalFrames = duration * frameRate;
    let currentFrame = 0;
    
    const poseData: poseDetection.Pose[][] = [];

    video.currentTime = 0;

    const processFrame = async () => {
      if (currentFrame >= totalFrames) {
        const results = calculateResults(poseData);
        onAnalysisComplete(results);
        setIsAnalyzing(false);
        return;
      }

      const poses = await analyzeFrame(video, video.currentTime);
      if (poses) poseData.push(poses);

      currentFrame++;
      setProgress((currentFrame / totalFrames) * 100);
      video.currentTime = currentFrame / frameRate;

      // Wait for the video to update
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      requestAnimationFrame(() => processFrame());
    };

    await processFrame();
  };

  const calculateResults = (poseData: poseDetection.Pose[][]): AnalysisResults => {
    // This is a simplified analysis - in a real application, you would implement
    // more sophisticated algorithms for movement analysis
    
    // Example tremor analysis (simplified)
    const tremorFrequency = calculateTremorFrequency(poseData);
    const movementAmplitude = calculateMovementAmplitude(poseData);
    const symmetryScore = calculateSymmetryScore(poseData);
    
    // Estimate UPDRS score based on analyzed movements
    const updrsEstimate = estimateUPDRS(tremorFrequency, movementAmplitude, symmetryScore);

    return {
      tremorFrequency,
      movementAmplitude,
      symmetryScore,
      updrsEstimate
    };
  };

  const calculateTremorFrequency = (poseData: poseDetection.Pose[][]): number => {
    // Simplified tremor frequency calculation
    return Math.random() * 5 + 2; // Replace with actual calculation
  };

  const calculateMovementAmplitude = (poseData: poseDetection.Pose[][]): number => {
    // Simplified movement amplitude calculation
    return Math.random() * 10; // Replace with actual calculation
  };

  const calculateSymmetryScore = (poseData: poseDetection.Pose[][]): number => {
    // Simplified symmetry score calculation
    return Math.random() * 100; // Replace with actual calculation
  };

  const estimateUPDRS = (
    tremorFreq: number,
    amplitude: number,
    symmetry: number
  ): number => {
    // Simplified UPDRS estimation
    return Math.round((tremorFreq + amplitude + (100 - symmetry)) / 3);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full rounded-lg"
          controls
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      {isAnalyzing ? (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Analyzing video: {Math.round(progress)}%
          </p>
        </div>
      ) : (
        <button
          onClick={startAnalysis}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start Analysis
        </button>
      )}
    </div>
  );
} 