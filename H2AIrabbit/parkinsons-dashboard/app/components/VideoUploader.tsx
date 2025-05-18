'use client';

import { useState, useRef } from 'react';

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
}

export default function VideoUploader({ onVideoUpload }: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setVideoPreview(URL.createObjectURL(file));
      onVideoUpload(file);
    } else {
      alert('Please upload a video file');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="video/*"
          onChange={handleChange}
        />

        {videoPreview ? (
          <div className="space-y-4">
            <video
              src={videoPreview}
              controls
              className="w-full rounded-lg"
            />
            <button
              onClick={() => {
                setVideoPreview(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove Video
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center space-y-4 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <div className="p-4 rounded-full bg-blue-100">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                Drop your video here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, WebM, and other video formats
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 