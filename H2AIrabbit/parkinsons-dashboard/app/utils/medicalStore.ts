'use client';

import { AppointmentRequest, Medication, Patient, ReminderPreference } from '../types';

// Initial test data for medications
const initialMedications: Record<string, Medication[]> = {
  'P001': [
    {
      id: 'm1',
      name: 'Levodopa/Carbidopa',
      dosage: '25/100 mg',
      frequency: {
        timesPerDay: 3,
        specificTimes: ['08:00', '13:00', '18:00']
      },
      purpose: 'Primary treatment for motor symptoms',
      startDate: '2024-01-15',
      instructions: 'Take with meals',
      reminders: true,
      reminderTimes: ['08:00', '13:00', '18:00'],
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'P001'
    },
    {
      id: 'm2',
      name: 'Amantadine',
      dosage: '100 mg',
      frequency: {
        timesPerDay: 2,
        specificTimes: ['09:00', '15:00']
      },
      purpose: 'Helps with dyskinesia',
      startDate: '2024-02-01',
      instructions: 'Take in the morning and afternoon',
      reminders: true,
      reminderTimes: ['09:00', '15:00'],
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'P001'
    }
  ],
  'P002': [
    {
      id: 'm3',
      name: 'Pramipexole',
      dosage: '0.5 mg',
      frequency: {
        timesPerDay: 3,
        specificTimes: ['08:00', '14:00', '20:00']
      },
      purpose: 'Dopamine agonist for early-stage symptoms',
      startDate: '2024-01-01',
      instructions: 'Take with or without food',
      reminders: true,
      reminderTimes: ['08:00', '14:00', '20:00'],
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'P002'
    }
  ],
  'P003': [
    {
      id: 'm4',
      name: 'Selegiline',
      dosage: '5 mg',
      frequency: {
        timesPerDay: 2,
        specificTimes: ['08:00', '14:00']
      },
      purpose: 'MAO-B inhibitor for motor fluctuations',
      startDate: '2024-02-15',
      instructions: 'Take in the morning and early afternoon',
      reminders: true,
      reminderTimes: ['08:00', '14:00'],
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'P003'
    },
    {
      id: 'm5',
      name: 'Levodopa/Carbidopa',
      dosage: '50/200 mg',
      frequency: {
        timesPerDay: 4,
        specificTimes: ['07:30', '11:30', '15:30', '19:30']
      },
      purpose: 'Advanced stage motor symptom management',
      startDate: '2024-01-15',
      instructions: 'Take 30 minutes before meals',
      reminders: true,
      reminderTimes: ['07:30', '11:30', '15:30', '19:30'],
      prescribedBy: 'Dr. Sarah Chen',
      prescribedFor: 'P003'
    }
  ]
};

class MedicalStore {
  private static instance: MedicalStore;
  private appointments: AppointmentRequest[] = [];
  private medications: Record<string, Medication[]> = initialMedications;
  private subscribers: ((type: 'appointments' | 'medications') => void)[] = [];
  private reminderPreferences: Record<string, ReminderPreference> = {};
  private initialized: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Initialize after DOM ready to avoid hydration issues
      if (document.readyState === 'complete') {
        this.initializeStore();
      } else {
        window.addEventListener('load', () => this.initializeStore());
      }
    }
  }

  private initializeStore() {
    if (this.initialized) return;
    
    try {
      // Load data from localStorage
      const savedAppointments = localStorage.getItem('appointments');
      const savedMedications = localStorage.getItem('medications');
      const savedPreferences = localStorage.getItem('reminderPreferences');

      if (savedAppointments) {
        try {
          this.appointments = JSON.parse(savedAppointments);
        } catch (e) {
          console.error('Error parsing appointments:', e);
        }
      }
      
      if (savedMedications) {
        try {
          this.medications = JSON.parse(savedMedications);
        } catch (e) {
          console.error('Error parsing medications:', e);
          // Keep initial medications as fallback
        }
      }
      
      if (savedPreferences) {
        try {
          this.reminderPreferences = JSON.parse(savedPreferences);
        } catch (e) {
          console.error('Error parsing reminder preferences:', e);
        }
      }

      // Set up periodic localStorage sync
      setInterval(() => this.syncToStorage(), 1000);
      
      this.initialized = true;
    } catch (e) {
      console.error('Error initializing MedicalStore:', e);
    }
  }

  static getInstance(): MedicalStore {
    if (!MedicalStore.instance) {
      MedicalStore.instance = new MedicalStore();
    }
    return MedicalStore.instance;
  }

  private syncToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('appointments', JSON.stringify(this.appointments));
      localStorage.setItem('medications', JSON.stringify(this.medications));
      localStorage.setItem('reminderPreferences', JSON.stringify(this.reminderPreferences));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  subscribe(callback: (type: 'appointments' | 'medications') => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(type: 'appointments' | 'medications') {
    this.subscribers.forEach(callback => callback(type));
  }

  // Appointment methods
  requestAppointment(request: Omit<AppointmentRequest, 'id' | 'status'>): void {
    const appointment: AppointmentRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending'
    };
    this.appointments.push(appointment);
    this.notifySubscribers('appointments');
    this.syncToStorage();
  }

  respondToAppointment(appointmentId: string, status: 'accepted' | 'suggested' | 'rejected', suggestedDateTime?: string): void {
    this.appointments = this.appointments.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status,
          suggestedDateTime,
          finalDateTime: status === 'accepted' ? apt.requestedDateTime : undefined
        };
      }
      return apt;
    });
    this.notifySubscribers('appointments');
    this.syncToStorage();
  }

  acceptSuggestedTime(appointmentId: string): void {
    this.appointments = this.appointments.map(apt => {
      if (apt.id === appointmentId && apt.suggestedDateTime) {
        return {
          ...apt,
          status: 'accepted',
          finalDateTime: apt.suggestedDateTime
        };
      }
      return apt;
    });
    this.notifySubscribers('appointments');
    this.syncToStorage();
  }

  getAppointments(userId: string, role: 'patient' | 'doctor' | 'caregiver'): AppointmentRequest[] {
    return this.appointments.filter(apt => {
      if (role === 'doctor') return apt.doctorId === userId;
      if (role === 'patient') return apt.patientId === userId;
      // For caregiver, we'll need to check if they're assigned to the patient
      return false; // Implement caregiver logic
    });
  }

  // Medication methods
  addMedication(patientId: string, medication: Omit<Medication, 'id'>): void {
    const newMed: Medication = {
      ...medication,
      id: Date.now().toString()
    };
    
    if (!this.medications[patientId]) {
      this.medications[patientId] = [];
    }
    this.medications[patientId].push(newMed);
    this.notifySubscribers('medications');
    this.syncToStorage();
  }

  removeMedication(patientId: string, medicationId: string): void {
    if (this.medications[patientId]) {
      this.medications[patientId] = this.medications[patientId].filter(
        med => med.id !== medicationId
      );
      this.notifySubscribers('medications');
      this.syncToStorage();
    }
  }

  updateMedication(patientId: string, medicationId: string, updates: Partial<Medication>): void {
    if (this.medications[patientId]) {
      this.medications[patientId] = this.medications[patientId].map(med => {
        if (med.id === medicationId) {
          return { ...med, ...updates };
        }
        return med;
      });
      this.notifySubscribers('medications');
      this.syncToStorage();
    }
  }

  getMedications(patientId: string): Medication[] {
    return this.medications[patientId] || [];
  }

  // Reminder preferences methods
  setReminderPreferences(patientId: string, preferences: ReminderPreference): void {
    this.reminderPreferences[patientId] = preferences;
    this.syncToStorage();
  }

  getReminderPreferences(patientId: string): ReminderPreference | null {
    return this.reminderPreferences[patientId] || null;
  }

  // SMS reminder simulation
  async sendMedicationReminder(phoneNumber: string, medication: Medication): Promise<void> {
    // In a real implementation, this would integrate with a SMS service
    console.log(`Sending reminder to ${phoneNumber} for medication: ${medication.name}`);
    console.log(`Dose: ${medication.dosage}, Time: ${new Date().toLocaleTimeString()}`);
  }
}

export const medicalStore = MedicalStore.getInstance(); 