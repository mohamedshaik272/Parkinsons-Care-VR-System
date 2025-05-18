'use client';

import { CalendarEvent } from '../types';

// Initial example appointment data
const initialAppointments: CalendarEvent[] = [
  {
    id: 'apt1',
    title: 'Initial Consultation',
    start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    end: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(11, 0, 0, 0).toString(),
    type: 'appointment',
    description: 'First assessment appointment',
    participants: [
      { id: 'P001', name: 'John Doe', role: 'patient' },
      { id: 'D001', name: 'Dr. Smith', role: 'doctor' }
    ],
    patientId: 'P001',
    accepted: true
  },
  {
    id: 'apt2',
    title: 'Follow-up Appointment',
    start: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    end: new Date(new Date().setDate(new Date().getDate() + 5)).setHours(14, 30, 0, 0).toString(),
    type: 'appointment',
    description: 'Review medication effectiveness',
    participants: [
      { id: 'P001', name: 'John Doe', role: 'patient' },
      { id: 'D001', name: 'Dr. Smith', role: 'doctor' },
      { id: 'C001', name: 'Mary Johnson', role: 'caregiver' }
    ],
    patientId: 'P001',
    accepted: true
  }
];

class AppointmentStore {
  private static instance: AppointmentStore;
  private appointments: CalendarEvent[] = initialAppointments;
  private subscribers: (() => void)[] = [];
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
      const savedAppointments = localStorage.getItem('appointments');
      
      if (savedAppointments) {
        try {
          this.appointments = JSON.parse(savedAppointments);
        } catch (e) {
          console.error('Error parsing appointments:', e);
          // Keep initial appointments as fallback
        }
      }
      
      // Setup broadcast channel for cross-tab sync
      try {
        this.broadcastChannel = new BroadcastChannel('appointment_updates');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'APPOINTMENT_UPDATE') {
            this.handleAppointmentUpdate(event.data.appointments);
          }
        };
      } catch (e) {
        console.error('Error setting up BroadcastChannel:', e);
      }
      
      // Set up periodic localStorage sync
      setInterval(() => this.syncToStorage(), 1000);
      
      this.initialized = true;
    } catch (e) {
      console.error('Error initializing AppointmentStore:', e);
    }
  }

  private handleAppointmentUpdate(appointments: CalendarEvent[]) {
    this.appointments = appointments;
    this.notifySubscribers();
  }

  static getInstance(): AppointmentStore {
    if (!AppointmentStore.instance) {
      AppointmentStore.instance = new AppointmentStore();
    }
    return AppointmentStore.instance;
  }

  private syncToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('appointments', JSON.stringify(this.appointments));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    
    // Notify immediately with current data
    callback();
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // Get all appointments
  getAllAppointments(): CalendarEvent[] {
    return this.appointments;
  }

  // Get appointments for a specific user (doctor, patient, or caregiver)
  getAppointmentsForUser(userId: string): CalendarEvent[] {
    return this.appointments.filter(appointment => 
      (Array.isArray(appointment.participants) && appointment.participants.some(participant => 
        participant && participant.id === userId
      )) ||
      (appointment.patientId === userId)
    );
  }

  // Get appointments for a specific patient
  getAppointmentsForPatient(patientId: string): CalendarEvent[] {
    return this.appointments.filter(appointment => 
      appointment.patientId === patientId
    );
  }

  // Get appointments for a specific doctor
  getAppointmentsForDoctor(doctorId: string): CalendarEvent[] {
    return this.appointments.filter(appointment => 
      Array.isArray(appointment.participants) && appointment.participants.some(participant => 
        participant && participant.id === doctorId && participant.role === 'doctor'
      )
    );
  }

  // Get appointments for a specific caregiver
  getAppointmentsForCaregiver(caregiverId: string): CalendarEvent[] {
    return this.appointments.filter(appointment => 
      Array.isArray(appointment.participants) && appointment.participants.some(participant => 
        participant && participant.id === caregiverId && participant.role === 'caregiver'
      )
    );
  }

  // Add a new appointment
  addAppointment(appointment: CalendarEvent) {
    this.appointments.push(appointment);
    
    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'APPOINTMENT_UPDATE',
        appointments: this.appointments
      });
    }
    
    this.notifySubscribers();
    this.syncToStorage();
  }

  // Update an existing appointment
  updateAppointment(updatedAppointment: CalendarEvent) {
    const index = this.appointments.findIndex(apt => apt.id === updatedAppointment.id);
    
    if (index !== -1) {
      this.appointments[index] = updatedAppointment;
      
      // Broadcast to other tabs
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'APPOINTMENT_UPDATE',
          appointments: this.appointments
        });
      }
      
      this.notifySubscribers();
      this.syncToStorage();
    }
  }

  // Cancel/delete an appointment
  removeAppointment(appointmentId: string) {
    this.appointments = this.appointments.filter(apt => apt.id !== appointmentId);
    
    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'APPOINTMENT_UPDATE',
        appointments: this.appointments
      });
    }
    
    this.notifySubscribers();
    this.syncToStorage();
  }
}

export const appointmentStore = AppointmentStore.getInstance(); 