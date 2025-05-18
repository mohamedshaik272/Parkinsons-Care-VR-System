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

// ... rest of the existing types ... 