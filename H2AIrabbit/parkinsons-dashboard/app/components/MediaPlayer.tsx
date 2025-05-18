'use client';

import { useState } from 'react';

interface MediaPlayerProps {
  type: 'audio' | 'video';
  src: string;
  title: string;
  date: string;
  onDelete?: () => void;
  onAddNew?: () => void;
}

export default function MediaPlayer({ type, src, title, date, onDelete, onAddNew }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">Recorded: {date}</p>
        </div>
        <div className="flex space-x-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          )}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add New
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {type === 'video' ? (
          <video
            src={src}
            controls
            className="w-full rounded-lg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <audio
            src={src}
            controls
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{isPlaying ? 'Playing' : 'Paused'}</span>
        <span>{type === 'video' ? 'Video Recording' : 'Voice Recording'}</span>
      </div>
    </div>
  );
} 