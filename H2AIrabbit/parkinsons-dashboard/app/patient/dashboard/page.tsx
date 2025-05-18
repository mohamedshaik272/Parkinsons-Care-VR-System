'use client';

import { useState } from 'react';
import Link from 'next/link';
import VoiceRecorder from '../../components/VoiceRecorder';
import VideoUploader from '../../components/VideoUploader';
import Calendar from '../../components/Calendar';
import ChatBox from '../../components/ChatBox';
import AppointmentList from '../../components/AppointmentList';
import MedicationList from '../../components/MedicationList';
import AppointmentRequest from '../../components/AppointmentRequest';
import { CalendarEvent, Medication } from '../../types';

interface TestResult {
  id: string;
  type: string;
  date: string;
  score: number;
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'messages' | 'appointments' | 'medications'>('overview');
  const [showRecorder, setShowRecorder] = useState(false);
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

  // Mock patient data
  const currentPatient = {
    id: 'P001',
    name: 'John Doe',
    role: 'patient' as const
  };

  const assignedDoctor = {
    id: 'D001',
    name: 'Dr. Sarah Chen',
    role: 'doctor' as const
  };

  const recipients = [
    { id: 'D001', name: 'Dr. Sarah Chen', role: 'doctor' as const },
    { id: 'C001', name: 'Emily Davis', role: 'caregiver' as const }
  ];

  const testHistory: TestResult[] = [
    { id: '1', type: 'VR Assessment', date: '2024-03-10', score: 85 },
    { id: '2', type: 'Voice Analysis', date: '2024-03-08', score: 78 },
    { id: '3', type: 'Movement Test', date: '2024-03-05', score: 82 }
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
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    }
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

  const parkinsonsManagementTips = [
    'Exercise regularly - aim for at least 30 minutes daily',
    'Practice speech exercises and vocal warmups',
    'Maintain a balanced diet rich in antioxidants',
    'Stay hydrated throughout the day',
    'Get adequate rest and maintain a regular sleep schedule',
    'Join a support group or community',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-green-800">Patient Dashboard</h1>
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
                <h3 className="text-lg font-medium text-green-800 mb-4">Today's Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowRecorder(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    Record Voice Sample
                  </button>
                  <VideoUploader onVideoUpload={handleVideoUpload} />
                  <button
                    onClick={() => window.location.href = '/patient/vr-test'}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    Start VR Assessment
                  </button>
                </div>

                {showRecorder && (
                  <div className="mt-4">
                    <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-green-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-green-800 mb-4">Recent Test History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-green-50 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Test Type
                        </th>
                        <th className="px-6 py-3 bg-green-50 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-green-50 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-200">
                      {testHistory.map((test) => (
                        <tr key={test.id} className="hover:bg-green-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">
                            {test.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                            {test.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                            {test.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <AppointmentRequest
                  currentUserId={currentPatient.id}
                  currentUserName={currentPatient.name}
                  currentUserRole="patient"
                  doctorId={assignedDoctor.id}
                  doctorName={assignedDoctor.name}
                  patientId={currentPatient.id}
                  patientName={currentPatient.name}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <AppointmentList
                  currentUserId={currentPatient.id}
                  currentUserRole="patient"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <MedicationList
                  patientId={currentPatient.id}
                  isDoctor={false}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <Calendar
              currentUserId={currentPatient.id}
              currentUserRole={currentPatient.role}
              events={events}
              medications={medications}
              onEventClick={handleEventClick}
              onEventAdd={handleAddEvent}
            />
          </div>
        )}

        {activeTab === 'messages' && (
          <ChatBox
            currentUserId={currentPatient.id}
            currentUserName={currentPatient.name}
            currentUserRole={currentPatient.role}
            recipients={recipients}
          />
        )}
      </main>
    </div>
  );
} 