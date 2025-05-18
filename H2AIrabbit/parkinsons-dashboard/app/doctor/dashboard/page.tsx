'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VideoAnalysis from '../../components/VideoAnalysis';
import MediaPlayer from '../../components/MediaPlayer';
import Calendar from '../../components/Calendar';
import ChatBox from '../../components/ChatBox';
import AppointmentList from '../../components/AppointmentList';
import MedicationList from '../../components/MedicationList';

interface MediaRecord {
  id: string;
  type: 'audio' | 'video';
  src: string;
  title: string;
  date: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  updrsScore: number;
  status: 'Stable' | 'Needs Attention' | 'Critical';
  videoUrl?: string;
  mediaRecords: MediaRecord[];
}

interface AnalysisResults {
  tremorFrequency: number;
  movementAmplitude: number;
  symmetryScore: number;
  updrsEstimate: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'medication' | 'exercise' | 'assessment';
  description: string;
  participants: Array<{
    id: string;
    name: string;
    role: 'patient' | 'doctor' | 'caregiver';
  }>;
}

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'messages' | 'appointments' | 'medications'>('overview');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [patients] = useState<Patient[]>([
    {
      id: 'P001',
      name: 'John Doe',
      age: 65,
      lastVisit: '2024-03-10',
      updrsScore: 15,
      status: 'Stable',
      videoUrl: '/sample-video.mp4',
      mediaRecords: [
        {
          id: '1',
          type: 'video',
          src: '/sample-video.mp4',
          title: 'Movement Assessment',
          date: '2024-03-10'
        },
        {
          id: '2',
          type: 'audio',
          src: '/sample-audio.wav',
          title: 'Voice Recording',
          date: '2024-03-10'
        }
      ]
    },
    {
      id: 'P002',
      name: 'Jane Smith',
      age: 58,
      lastVisit: '2024-03-12',
      updrsScore: 25,
      status: 'Needs Attention',
      videoUrl: '/sample-video.mp4',
      mediaRecords: []
    },
    {
      id: 'P003',
      name: 'Robert Johnson',
      age: 72,
      lastVisit: '2024-03-15',
      updrsScore: 35,
      status: 'Critical',
      videoUrl: '/sample-video.mp4',
      mediaRecords: []
    },
  ]);

  const currentDoctor = {
    id: 'D001',
    name: 'Dr. Sarah Chen',
    role: 'doctor' as const
  };

  const recipients = [
    ...patients.map(p => ({ id: p.id, name: p.name, role: 'patient' as const })),
    { id: 'C001', name: 'Emily Davis', role: 'caregiver' as const },
    { id: 'C002', name: 'James Wilson', role: 'caregiver' as const }
  ];

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Stable':
        return 'text-green-700 bg-green-100 border border-green-200';
      case 'Needs Attention':
        return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
      case 'Critical':
        return 'text-red-700 bg-red-100 border border-red-200';
    }
  };

  const handleAnalysisComplete = (results: AnalysisResults) => {
    setAnalysisResults(results);
  };

  const handleDeleteMedia = (patientId: string, mediaId: string) => {
    console.log('Deleting media:', mediaId, 'for patient:', patientId);
  };

  const handleAddNewMedia = (patientId: string, type: 'audio' | 'video') => {
    console.log('Adding new', type, 'for patient:', patientId);
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
  };

  const handleEventClick = (event: CalendarEvent) => {
    alert(`Event: ${event.title}\nTime: ${new Date(event.start).toLocaleString()}\nDescription: ${event.description}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-green-800">Doctor Dashboard</h1>
              </div>
              <div className="ml-6 flex space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'bg-green-100 text-green-900'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'appointments'
                      ? 'bg-green-100 text-green-900'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setActiveTab('medications')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'medications'
                      ? 'bg-green-100 text-green-900'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  Medications
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'calendar'
                      ? 'bg-green-100 text-green-900'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'messages'
                      ? 'bg-green-100 text-green-900'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-green-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-green-800">Patients</h3>
                <div className="mt-4 divide-y divide-green-200">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="py-4 flex items-center justify-between hover:bg-green-50 cursor-pointer transition-colors duration-150"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div>
                        <h4 className="text-lg font-medium text-green-900">{patient.name}</h4>
                        <p className="text-sm text-green-600">
                          Age: {patient.age} | Last Visit: {patient.lastVisit}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          patient.status
                        )}`}
                      >
                        {patient.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedPatient && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Patient Details: {selectedPatient.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        UPDRS Score: {selectedPatient.updrsScore}
                      </p>
                    </div>
                    {selectedPatient.videoUrl && (
                      <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                      </button>
                    )}
                  </div>

                  {showAnalysis && selectedPatient.videoUrl && (
                    <div className="mt-4">
                      <VideoAnalysis
                        videoUrl={selectedPatient.videoUrl}
                        onAnalysisComplete={handleAnalysisComplete}
                      />
                      {analysisResults && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <pre className="text-sm">
                            {JSON.stringify(analysisResults, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <AppointmentList
                  currentUserId={currentDoctor.id}
                  currentUserRole="doctor"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medications' && selectedPatient && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <MedicationList
                  patientId={selectedPatient.id}
                  isDoctor={true}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <Calendar
            currentUserId={currentDoctor.id}
            currentUserRole="doctor"
            events={events}
            onEventClick={handleEventClick}
            onEventAdd={handleAddEvent}
          />
        )}

        {activeTab === 'messages' && (
          <ChatBox
            currentUserId={currentDoctor.id}
            currentUserName={currentDoctor.name}
            currentUserRole={currentDoctor.role}
            recipients={recipients}
          />
        )}
      </main>
    </div>
  );
} 