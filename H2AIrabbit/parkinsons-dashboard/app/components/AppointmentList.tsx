'use client';

import { useState, useEffect } from 'react';
import { AppointmentRequest } from '../types';
import { medicalStore } from '../utils/medicalStore';

interface AppointmentListProps {
  currentUserId: string;
  currentUserRole: 'patient' | 'doctor' | 'caregiver';
}

export default function AppointmentList({
  currentUserId,
  currentUserRole
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [suggestedDateTime, setSuggestedDateTime] = useState('');
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = medicalStore.subscribe((type) => {
      if (type === 'appointments') {
        setAppointments(medicalStore.getAppointments(currentUserId, currentUserRole));
      }
    });

    // Initial load
    setAppointments(medicalStore.getAppointments(currentUserId, currentUserRole));

    return () => unsubscribe();
  }, [currentUserId, currentUserRole]);

  const handleAccept = (appointmentId: string) => {
    medicalStore.respondToAppointment(appointmentId, 'accepted');
  };

  const handleReject = (appointmentId: string) => {
    medicalStore.respondToAppointment(appointmentId, 'rejected');
  };

  const handleSuggest = (appointmentId: string) => {
    if (suggestedDateTime) {
      medicalStore.respondToAppointment(appointmentId, 'suggested', suggestedDateTime);
      setSuggestedDateTime('');
      setEditingAppointmentId(null);
    }
  };

  const handleAcceptSuggestion = (appointmentId: string) => {
    medicalStore.acceptSuggestedTime(appointmentId);
  };

  const getStatusBadgeColor = (status: AppointmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'suggested':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {currentUserRole === 'doctor' ? appointment.patientName : appointment.doctorName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(appointment.requestedDateTime).toLocaleString()}
                </p>
                <p className="text-sm">{appointment.reason}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            {appointment.suggestedDateTime && (
              <div className="text-sm text-gray-600">
                Suggested time: {new Date(appointment.suggestedDateTime).toLocaleString()}
              </div>
            )}

            {currentUserRole === 'doctor' && appointment.status === 'pending' && (
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(appointment.id)}
                    className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(appointment.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
                <button
                  onClick={() => setEditingAppointmentId(appointment.id)}
                  className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Suggest Different Time
                </button>
              </div>
            )}

            {editingAppointmentId === appointment.id && (
              <div className="flex space-x-2">
                <input
                  type="datetime-local"
                  value={suggestedDateTime}
                  onChange={(e) => setSuggestedDateTime(e.target.value)}
                  className="flex-1 rounded border-gray-300"
                />
                <button
                  onClick={() => handleSuggest(appointment.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Send Suggestion
                </button>
              </div>
            )}

            {currentUserRole === 'patient' && appointment.status === 'suggested' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcceptSuggestion(appointment.id)}
                  className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Accept Suggested Time
                </button>
                <button
                  onClick={() => setEditingAppointmentId(appointment.id)}
                  className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Request Different Time
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
} 