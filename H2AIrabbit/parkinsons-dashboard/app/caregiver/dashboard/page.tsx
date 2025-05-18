'use client';

import { useState } from 'react';
import Link from 'next/link';
import VoiceRecorder from '../../components/VoiceRecorder';
import VideoUploader from '../../components/VideoUploader';
import Calendar from '../../components/Calendar';
import ChatBox from '../../components/ChatBox';
import MediaPlayer from '../../components/MediaPlayer';
import AppointmentList from '../../components/AppointmentList';
import MedicationList from '../../components/MedicationList';
import AppointmentRequest from '../../components/AppointmentRequest';
import { CalendarEvent, Medication } from '../../types';

interface MediaRecord {
  id: string;
  type: 'audio' | 'video';
  title: string;
  date: string;
  url: string;
}

interface CarePatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastAssessment: string;
  mediaRecords: MediaRecord[];
  doctorId: string;
  doctorName: string;
}

export default function CaregiverDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'messages' | 'appointments' | 'medications'>('overview');
  const [showRecorder, setShowRecorder] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Levodopa',
      dosage: '100mg',
      frequency: {
        timesPerDay: 3,
        specificTimes: ['09:00', '14:00', '20:00'],
      },
      instructions: 'Take with food',
      startDate: '2024-03-01',
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'John Doe'
    },
    {
      id: '2',
      name: 'Carbidopa',
      dosage: '25mg',
      frequency: {
        timesPerDay: 2,
        specificTimes: ['09:00', '20:00'],
        daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
      },
      instructions: 'Take 30 minutes before meals',
      startDate: '2024-03-01',
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'John Doe'
    }
  ]);

  // Mock caregiver data
  const currentCaregiver = {
    id: 'C001',
    name: 'Emily Davis',
    role: 'caregiver' as const
  };

  // Mock patient data
  const patients: CarePatient[] = [
    {
      id: 'P001',
      name: 'John Doe',
      age: 65,
      condition: 'Early Stage',
      lastAssessment: '2024-03-10',
      mediaRecords: [
        {
          id: '1',
          type: 'audio',
          title: 'Voice Sample 1',
          date: '2024-03-10',
          url: '/samples/voice1.mp3'
        },
        {
          id: '2',
          type: 'video',
          title: 'Movement Assessment 1',
          date: '2024-03-09',
          url: '/samples/video1.mp4'
        }
      ],
      doctorId: 'D001',
      doctorName: 'Dr. Sarah Chen'
    }
  ];

  const recipients = [
    { id: 'D001', name: 'Dr. Sarah Chen', role: 'doctor' as const },
    { id: 'P001', name: 'John Doe', role: 'patient' as const }
  ];

  const handleVoiceRecordingComplete = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'voice-recording.wav');
      console.log('Voice recording completed, size:', blob.size);
      setShowRecorder(false);
      alert('Voice recording uploaded successfully!');
    } catch (error) {
      console.error('Error uploading voice recording:', error);
      alert('Error uploading voice recording. Please try again.');
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      console.log('Video uploaded, size:', file.size);
      setShowVideoUploader(false);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    }
  };

  const handleDeleteMedia = (mediaId: string) => {
    // Implement media deletion logic
    console.log('Deleting media:', mediaId);
  };

  const handleAddNewMedia = () => {
    setShowVideoUploader(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    alert(`Event: ${event.title}\nTime: ${new Date(event.start).toLocaleString()}\nDescription: ${event.description}`);
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-green-800">Caregiver Dashboard</h1>
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
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-green-100">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-4">
                    Patient: {patient.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-green-600">Age: {patient.age}</p>
                      <p className="text-sm text-green-600">
                        Condition: {patient.condition}
                      </p>
                      <p className="text-sm text-green-600">
                        Last Assessment: {patient.lastAssessment}
                      </p>
                      <p className="text-sm text-green-600">
                        Doctor: {patient.doctorName}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setShowRecorder(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                      >
                        Record Voice Sample
                      </button>
                      <button
                        onClick={() => setShowVideoUploader(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                      >
                        Upload Video Assessment
                      </button>
                    </div>
                  </div>

                  {showRecorder && (
                    <div className="mt-4">
                      <VoiceRecorder
                        onRecordingComplete={handleVoiceRecordingComplete}
                      />
                    </div>
                  )}

                  {showVideoUploader && (
                    <div className="mt-4">
                      <VideoUploader onVideoUpload={handleVideoUpload} />
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-green-800 mb-2">Recent Recordings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patient.mediaRecords.map((record) => (
                        <div
                          key={record.id}
                          className="p-4 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-sm font-medium text-green-900">{record.title}</h5>
                              <p className="text-xs text-green-600">{record.date}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteMedia(record.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                          <MediaPlayer 
                            type={record.type} 
                            src={record.url}
                            title={record.title}
                            date={record.date}
                            onDelete={() => handleDeleteMedia(record.id)}
                            onAddNew={handleAddNewMedia}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Appointments for {patient.name}
                  </h3>
                  <AppointmentRequest
                    currentUserId={currentCaregiver.id}
                    currentUserName={currentCaregiver.name}
                    currentUserRole="caregiver"
                    doctorId={patient.doctorId}
                    doctorName={patient.doctorName}
                    patientId={patient.id}
                    patientName={patient.name}
                  />
                  <div className="mt-6">
                    <AppointmentList
                      currentUserId={currentCaregiver.id}
                      currentUserRole="caregiver"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="grid grid-cols-1 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Medications for {patient.name}
                  </h3>
                  <MedicationList
                    patientId={patient.id}
                    isDoctor={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calendar' && (
          <Calendar
            currentUserId={currentCaregiver.id}
            currentUserRole="caregiver"
            events={events}
            medications={medications}
            onEventClick={handleEventClick}
            onEventAdd={handleAddEvent}
          />
        )}

        {activeTab === 'messages' && (
          <ChatBox
            currentUserId={currentCaregiver.id}
            currentUserName={currentCaregiver.name}
            currentUserRole={currentCaregiver.role}
            recipients={recipients}
          />
        )}
      </main>
    </div>
  );
} 