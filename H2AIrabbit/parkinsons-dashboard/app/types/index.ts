export interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  requestedDateTime: string;
  reason: string;
  status: 'pending' | 'accepted' | 'suggested' | 'rejected';
  suggestedDateTime?: string;
  finalDateTime?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: {
    timesPerDay: number;
    specificTimes: string[]; // 24-hour format, e.g., "09:00", "13:00"
    daysOfWeek?: number[]; // 0-6, where 0 is Sunday
  };
  instructions: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  prescribedFor: string;
  purpose?: string;
  reminders?: boolean;
  reminderTimes?: string[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phoneNumber?: string;
  medications: Medication[];
  appointmentRequests: AppointmentRequest[];
  caregiverId: string;
  doctorId: string;
}

export interface ReminderPreference {
  id: string;
  userId: string;
  medicationId: string;
  notificationTypes: ('calendar' | 'sms' | 'email')[];
  reminderTimes: {
    minutesBefore: number;
  };
  phoneNumber?: string;
  email?: string;
  enabled: boolean;
}

export interface CalendarEvent {
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
  status?: boolean;
  medicationId?: string;
  patientId?: string;
  accepted?: boolean;
}

export interface MedicationStatus {
  medicationId: string;
  date: string;
  time: string;
  taken: boolean;
  responseTime?: string;
} 