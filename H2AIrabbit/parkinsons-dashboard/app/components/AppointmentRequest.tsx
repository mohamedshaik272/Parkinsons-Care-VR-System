'use client';

import { useState } from 'react';
import { AppointmentRequest } from '../types';
import { medicalStore } from '../utils/medicalStore';

interface AppointmentRequestProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'patient' | 'doctor' | 'caregiver';
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
}

export default function AppointmentRequestComponent({
  currentUserId,
  currentUserName,
  currentUserRole,
  doctorId,
  doctorName,
  patientId,
  patientName
}: AppointmentRequestProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = `${selectedDate}T${selectedTime}`;
    
    medicalStore.requestAppointment({
      patientId,
      patientName,
      doctorId,
      doctorName,
      requestedDateTime: dateTime,
      reason
    });

    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Request Appointment
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for Appointment
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 