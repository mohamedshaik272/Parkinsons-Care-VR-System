'use client';

import { useState } from 'react';
import { Medication, ReminderPreference } from '../types';
import MedicationReminders from './MedicationReminders';

interface MedicationListProps {
  patientId: string;
  isDoctor: boolean;
  currentUserId?: string;
}

export default function MedicationList({
  patientId,
  isDoctor,
  currentUserId = patientId,
}: MedicationListProps) {
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

  const [showReminders, setShowReminders] = useState<string | null>(null);

  const handleUpdatePreferences = (preferences: ReminderPreference) => {
    // In a real application, this would make an API call to save the preferences
    console.log('Saving preferences:', preferences);
    setShowReminders(null);
  };

  const formatTimes = (frequency: Medication['frequency']) => {
    return frequency.specificTimes.join(', ');
  };

  const formatDays = (frequency: Medication['frequency']) => {
    if (!frequency.daysOfWeek) return 'Every day';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return frequency.daysOfWeek.map(day => days[day]).join(', ');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Medications</h2>
      
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {medications.map((medication) => (
            <li key={medication.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {medication.name}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Dosage</p>
                        <p className="text-sm font-medium text-gray-900">
                          {medication.dosage}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Frequency</p>
                        <p className="text-sm font-medium text-gray-900">
                          {medication.frequency.timesPerDay}x daily
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Times</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatTimes(medication.frequency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Days</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDays(medication.frequency)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Instructions</p>
                      <p className="text-sm text-gray-900">{medication.instructions}</p>
                    </div>
                    {!isDoctor && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowReminders(medication.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Manage Reminders
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {showReminders === medication.id && (
                  <div className="mt-4">
                    <MedicationReminders
                      medication={medication}
                      currentUserId={currentUserId}
                      onUpdatePreferences={handleUpdatePreferences}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 