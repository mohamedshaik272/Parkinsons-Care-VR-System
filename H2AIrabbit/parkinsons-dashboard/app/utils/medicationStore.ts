'use client';

import { AppointmentRequest, Medication, Patient, ReminderPreference, MedicationStatus } from '../types';

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
      prescribedBy: 'D001',
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
      prescribedBy: 'D001',
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
      prescribedBy: 'D001',
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
      prescribedBy: 'D001',
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
      prescribedBy: 'D001',
      prescribedFor: 'P003'
    }
  ]
};

// Initial test data for medication status
const initialMedicationStatus: MedicationStatus[] = [
  {
    medicationId: 'm1',
    date: new Date().toDateString(),
    time: '08:00',
    taken: true,
    responseTime: new Date(new Date().setHours(8, 5, 0, 0)).toISOString()
  },
  {
    medicationId: 'm2',
    date: new Date().toDateString(),
    time: '09:00',
    taken: true,
    responseTime: new Date(new Date().setHours(9, 2, 0, 0)).toISOString()
  }
];

class MedicationStore {
  private static instance: MedicationStore;
  private medications: Record<string, Medication[]> = initialMedications;
  private medicationStatus: MedicationStatus[] = [];
  private subscribers: ((type: 'medications' | 'status') => void)[] = [];
  private reminderPreferences: Record<string, ReminderPreference> = {};
  private broadcastChannel: BroadcastChannel | null = null;
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
      const savedMedications = localStorage.getItem('medications');
      const savedStatus = localStorage.getItem('medicationStatus');
      const savedPreferences = localStorage.getItem('reminderPreferences');

      if (savedMedications) {
        try {
          this.medications = JSON.parse(savedMedications);
        } catch (e) {
          console.error('Error parsing medications:', e);
          // Keep initial medications as fallback
        }
      }
      
      if (savedStatus) {
        try {
          this.medicationStatus = JSON.parse(savedStatus);
        } catch (e) {
          console.error('Error parsing medication status:', e);
          this.medicationStatus = initialMedicationStatus;
        }
      } else {
        // Use initial status if none saved
        this.medicationStatus = initialMedicationStatus;
      }
      
      if (savedPreferences) {
        try {
          this.reminderPreferences = JSON.parse(savedPreferences);
        } catch (e) {
          console.error('Error parsing reminder preferences:', e);
        }
      }

      // Setup broadcast channel for cross-tab sync
      try {
        this.broadcastChannel = new BroadcastChannel('medication_updates');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'STATUS_UPDATE') {
            this.handleStatusUpdate(event.data.status);
          } else if (event.data.type === 'MEDICATION_UPDATE') {
            this.handleMedicationUpdate(event.data.medications);
          }
        };
      } catch (e) {
        console.error('Error setting up BroadcastChannel:', e);
      }

      // Set up periodic localStorage sync
      setInterval(() => this.syncToStorage(), 1000);
      
      this.initialized = true;
    } catch (e) {
      console.error('Error initializing MedicationStore:', e);
    }
  }

  private handleStatusUpdate(status: MedicationStatus) {
    const existingIndex = this.medicationStatus.findIndex(
      s => s.medicationId === status.medicationId && s.date === status.date && s.time === status.time
    );
    
    if (existingIndex >= 0) {
      this.medicationStatus[existingIndex] = status;
    } else {
      this.medicationStatus.push(status);
    }
    
    this.notifySubscribers('status');
  }

  private handleMedicationUpdate(medications: Record<string, Medication[]>) {
    this.medications = medications;
    this.notifySubscribers('medications');
  }

  static getInstance(): MedicationStore {
    if (!MedicationStore.instance) {
      MedicationStore.instance = new MedicationStore();
    }
    return MedicationStore.instance;
  }

  private syncToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('medications', JSON.stringify(this.medications));
      localStorage.setItem('medicationStatus', JSON.stringify(this.medicationStatus));
      localStorage.setItem('reminderPreferences', JSON.stringify(this.reminderPreferences));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  subscribe(callback: (type: 'medications' | 'status') => void) {
    this.subscribers.push(callback);
    
    // Notify immediately with current data
    callback('medications');
    callback('status');
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(type: 'medications' | 'status') {
    this.subscribers.forEach(callback => callback(type));
  }

  // Get all medications for a specific patient
  getMedicationsForPatient(patientId: string): Medication[] {
    return this.medications[patientId] || [];
  }

  // Get all medications across all patients
  getAllMedications(): Medication[] {
    return Object.values(this.medications).flat();
  }

  // Get medications prescribed by a specific doctor
  getMedicationsByDoctor(doctorId: string): Medication[] {
    return this.getAllMedications().filter(med => med.prescribedBy === doctorId);
  }

  // Add a new medication
  addMedication(medication: Medication) {
    const patientId = medication.prescribedFor;
    
    if (!this.medications[patientId]) {
      this.medications[patientId] = [];
    }
    
    this.medications[patientId].push(medication);
    
    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'MEDICATION_UPDATE',
        medications: this.medications
      });
    }
    
    this.notifySubscribers('medications');
    this.syncToStorage();
  }

  // Update existing medication
  updateMedication(updatedMedication: Medication) {
    const patientId = updatedMedication.prescribedFor;
    
    if (this.medications[patientId]) {
      const index = this.medications[patientId].findIndex(med => med.id === updatedMedication.id);
      
      if (index !== -1) {
        this.medications[patientId][index] = updatedMedication;
        
        // Broadcast to other tabs
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({
            type: 'MEDICATION_UPDATE',
            medications: this.medications
          });
        }
        
        this.notifySubscribers('medications');
        this.syncToStorage();
      }
    }
  }

  // Remove medication
  removeMedication(medicationId: string, patientId: string) {
    if (this.medications[patientId]) {
      this.medications[patientId] = this.medications[patientId].filter(med => med.id !== medicationId);
      
      // Also remove status entries for this medication
      this.medicationStatus = this.medicationStatus.filter(status => status.medicationId !== medicationId);
      
      // Broadcast to other tabs
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'MEDICATION_UPDATE',
          medications: this.medications
        });
      }
      
      this.notifySubscribers('medications');
      this.notifySubscribers('status');
      this.syncToStorage();
    }
  }

  // Update medication status (taken/not taken)
  updateMedicationStatus(status: MedicationStatus) {
    console.log('Updating medication status:', status);
    
    // Find and update existing status or add new one
    const existingIndex = this.medicationStatus.findIndex(
      s => s.medicationId === status.medicationId && s.date === status.date && s.time === status.time
    );
    
    if (existingIndex !== -1) {
      this.medicationStatus[existingIndex] = status;
    } else {
      this.medicationStatus.push(status);
    }
    
    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'STATUS_UPDATE',
        status
      });
    }
    
    this.notifySubscribers('status');
    this.syncToStorage();
  }

  // Get all medication status entries
  getMedicationStatus(): MedicationStatus[] {
    return this.medicationStatus;
  }

  // Get status for a specific patient
  getMedicationStatusForPatient(patientId: string): MedicationStatus[] {
    // Get all medication IDs for this patient
    const patientMedications = this.getMedicationsForPatient(patientId);
    const patientMedicationIds = patientMedications.map(med => med.id);
    
    // Filter status records for these medications
    return this.medicationStatus.filter(status => 
      patientMedicationIds.includes(status.medicationId)
    );
  }

  // Get status for medications prescribed by a doctor
  getMedicationStatusForDoctor(doctorId: string): MedicationStatus[] {
    // Get all medications prescribed by this doctor
    const doctorMedications = this.getMedicationsByDoctor(doctorId);
    const doctorMedicationIds = doctorMedications.map(med => med.id);
    
    // Filter status records for these medications
    return this.medicationStatus.filter(status => 
      doctorMedicationIds.includes(status.medicationId)
    );
  }

  // Get medication adherence stats for a patient
  getAdherenceStats(patientId: string, startDate?: Date, endDate?: Date): { taken: number, total: number, percentage: number } {
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
    const end = endDate || new Date();
    
    // Get patient medications
    const patientMedications = this.getMedicationsForPatient(patientId);
    const patientMedicationIds = patientMedications.map(med => med.id);
    
    // Status entries in date range for this patient
    const relevantStatus = this.medicationStatus.filter(status => {
      const statusDate = new Date(status.date);
      return (
        patientMedicationIds.includes(status.medicationId) &&
        statusDate >= start &&
        statusDate <= end
      );
    });
    
    const total = relevantStatus.length;
    const taken = relevantStatus.filter(s => s.taken).length;
    const percentage = total > 0 ? (taken / total) * 100 : 0;
    
    return { taken, total, percentage };
  }

  // Update reminder preferences
  updateReminderPreferences(userId: string, preferences: ReminderPreference) {
    this.reminderPreferences[userId] = preferences;
    this.syncToStorage();
  }

  // Get reminder preferences for a user
  getReminderPreferences(userId: string): ReminderPreference | null {
    return this.reminderPreferences[userId] || null;
  }
}

export const medicationStore = MedicationStore.getInstance(); 