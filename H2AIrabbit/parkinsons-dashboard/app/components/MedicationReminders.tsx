'use client';

import { useState, useEffect } from 'react';
import { Medication, ReminderPreference } from '../types';

interface MedicationRemindersProps {
  medication: Medication;
  currentUserId: string;
  onUpdatePreferences: (preferences: ReminderPreference) => void;
}

export default function MedicationReminders({
  medication,
  currentUserId,
  onUpdatePreferences,
}: MedicationRemindersProps) {
  const [preferences, setPreferences] = useState<ReminderPreference>({
    id: `${currentUserId}-${medication.id}`,
    userId: currentUserId,
    medicationId: medication.id,
    notificationTypes: ['calendar'],
    reminderTimes: {
      minutesBefore: 15,
    },
    enabled: true,
  });

  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleNotificationTypeChange = (type: 'calendar' | 'sms' | 'email') => {
    const currentTypes = preferences.notificationTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    setPreferences({
      ...preferences,
      notificationTypes: newTypes,
      ...(type === 'sms' && { phoneNumber }),
      ...(type === 'email' && { email }),
    });
  };

  const handleReminderTimeChange = (minutes: number) => {
    setPreferences({
      ...preferences,
      reminderTimes: {
        minutesBefore: minutes,
      },
    });
  };

  const handleSubmit = () => {
    onUpdatePreferences(preferences);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Reminder Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notification Types
          </label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={preferences.notificationTypes.includes('calendar')}
                onChange={() => handleNotificationTypeChange('calendar')}
              />
              <span className="ml-2">Calendar</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={preferences.notificationTypes.includes('sms')}
                onChange={() => handleNotificationTypeChange('sms')}
              />
              <span className="ml-2">SMS</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={preferences.notificationTypes.includes('email')}
                onChange={() => handleNotificationTypeChange('email')}
              />
              <span className="ml-2">Email</span>
            </label>
          </div>
        </div>

        {preferences.notificationTypes.includes('sms') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        )}

        {preferences.notificationTypes.includes('email') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Remind Me
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={preferences.reminderTimes.minutesBefore}
            onChange={(e) => handleReminderTimeChange(Number(e.target.value))}
          >
            <option value={5}>5 minutes before</option>
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={60}>1 hour before</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
} 