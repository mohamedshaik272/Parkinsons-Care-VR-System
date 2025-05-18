'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, Medication, MedicationStatus } from '../types';
import { medicationStore } from '../utils/medicationStore';
import { appointmentStore } from '../utils/appointmentStore';

interface CalendarProps {
  currentUserId: string;
  currentUserRole: 'patient' | 'doctor' | 'caregiver';
  events: CalendarEvent[];
  medications?: Medication[];
  onEventClick: (event: CalendarEvent) => void;
  onEventAdd: (event: Omit<CalendarEvent, 'id'>) => void;
}

type NewEventState = Omit<CalendarEvent, 'id'> & {
  accepted?: boolean;
};

export default function Calendar({
  currentUserId,
  currentUserRole,
  events: initialEvents,
  medications = [],
  onEventClick,
  onEventAdd,
}: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [medicationStatus, setMedicationStatus] = useState<MedicationStatus[]>([]);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showMedicationLog, setShowMedicationLog] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventState>({
    title: '',
    start: '',
    end: '',
    type: 'appointment',
    description: '',
    participants: [],
    accepted: false
  });

  console.log("Calendar rendering with", medications.length, "medications and", medicationStatus.length, "statuses");

  // Group medications by patient
  const patientMedications = medications.reduce((acc, med) => {
    const patientId = med.prescribedFor;
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(med);
    return acc;
  }, {} as Record<string, Medication[]>);

  // Get unique patients
  const patients = Array.from(new Set(medications.map(med => med.prescribedFor)));

  // Subscribe to medication status updates
  useEffect(() => {
    const medicationStatusUnsubscribe = medicationStore.subscribe((type) => {
      if (type === 'status') {
        const status = medicationStore.getMedicationStatus();
        setMedicationStatus(status);
        console.log("Updated medication status:", status.length, "records");
      }
    });
    
    // Return cleanup function
    return () => {
      medicationStatusUnsubscribe();
    };
  }, []);

  // Subscribe to appointment updates based on user role
  useEffect(() => {
    const unsubscribe = appointmentStore.subscribe(() => {
      let appointmentsToShow: CalendarEvent[] = [];
      
      // Get appointments based on user role
      if (currentUserRole === 'doctor') {
        appointmentsToShow = appointmentStore.getAppointmentsForDoctor(currentUserId);
        if (selectedPatient) {
          // Add patient-specific appointments if a patient is selected
          const patientAppointments = appointmentStore.getAppointmentsForPatient(selectedPatient);
          // Combine and remove duplicates - fix for linter error
          const combinedAppointments = new Map();
          [...appointmentsToShow, ...patientAppointments].forEach(item => {
            combinedAppointments.set(item.id, item);
          });
          appointmentsToShow = Array.from(combinedAppointments.values());
        }
      } else if (currentUserRole === 'patient') {
        appointmentsToShow = appointmentStore.getAppointmentsForPatient(currentUserId);
      } else if (currentUserRole === 'caregiver') {
        appointmentsToShow = appointmentStore.getAppointmentsForCaregiver(currentUserId);
        // Also get appointments for patients this caregiver is responsible for
        // This is a simplified approach - in a real app, you'd get the list of patients for this caregiver
        const patientAppointments = medications
          .filter(med => med.prescribedFor !== currentUserId)
          .map(med => med.prescribedFor)
          .filter((value, index, self) => self.indexOf(value) === index) // Get unique patient IDs
          .flatMap(patientId => appointmentStore.getAppointmentsForPatient(patientId));
        
        // Combine and remove duplicates - fix for linter error
        const combinedAppointments = new Map();
        [...appointmentsToShow, ...patientAppointments].forEach(item => {
          combinedAppointments.set(item.id, item);
        });
        appointmentsToShow = Array.from(combinedAppointments.values());
      }
      
      console.log(`Found ${appointmentsToShow.length} appointments for ${currentUserRole} ${currentUserId}`);
      
      // Update events list with these appointments
      setEvents(prevEvents => {
        // Remove existing appointment events
        const nonAppointmentEvents = prevEvents.filter(event => event.type !== 'appointment');
        // Add the new appointments
        return [...nonAppointmentEvents, ...appointmentsToShow];
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentUserId, currentUserRole, selectedPatient, medications]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMedicationEventsForDay = (date: Date): CalendarEvent[] => {
    if (!date) return [];
    
    // Select medications based on user role
    let relevantMedications = medications;
    if (currentUserRole === 'doctor' && selectedPatient) {
      relevantMedications = medications.filter(med => med.prescribedFor === selectedPatient);
    } else if (currentUserRole === 'patient') {
      relevantMedications = medications.filter(med => med.prescribedFor === currentUserId);
    }

    console.log(`Getting medication events for ${date.toDateString()}`, relevantMedications.length);

    return relevantMedications.flatMap((med) => {
      return (med.frequency.specificTimes || []).map((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const eventDate = new Date(date);
        eventDate.setHours(hours, minutes, 0, 0);

        // Check if medication should be taken on this day
        if (med.frequency.daysOfWeek && !med.frequency.daysOfWeek.includes(eventDate.getDay())) {
          return [];
        }

        // Find status for this medication event
        const status = medicationStatus.find(
          (s) => 
            s.medicationId === med.id && 
            s.date === eventDate.toDateString() && 
            s.time === time
        );

        const event: CalendarEvent = {
          id: `med-${med.id}-${time}-${date.toDateString()}`,
          title: currentUserRole === 'doctor' ? `${med.prescribedFor}: ${med.name}` : `Take ${med.name}`,
          start: eventDate.toISOString(),
          end: new Date(eventDate.getTime() + 15 * 60000).toISOString(),
          type: 'medication',
          description: `${med.dosage} - ${med.instructions}`,
          participants: [],
          status: status?.taken,
          medicationId: med.id,
          patientId: med.prescribedFor
        };

        return event;
      });
    }).filter((event): event is CalendarEvent => event !== undefined);
  };

  const getDailyMedicationProgress = (date: Date, patientId: string | null | undefined) => {
    if (!date) return { taken: 0, total: 0 };

    const dateStr = date.toDateString();
    console.log(`Calculating progress for ${dateStr}, patient: ${patientId}`);
    
    // Filter medications based on patient
    let dayMedications = medications;
    if (currentUserRole === 'doctor' && selectedPatient) {
      dayMedications = medications.filter(med => med.prescribedFor === selectedPatient);
    } else if (currentUserRole === 'patient' || patientId) {
      const targetPatient = patientId || currentUserId;
      dayMedications = medications.filter(med => med.prescribedFor === targetPatient);
    }

    // Filter by date
    dayMedications = dayMedications.filter(med => {
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : new Date();
      return (
        startDate <= date &&
        date <= endDate &&
        (!med.frequency.daysOfWeek || med.frequency.daysOfWeek.includes(date.getDay()))
      );
    });

    console.log(`Found ${dayMedications.length} medications for this day`);

    let totalDoses = 0;
    let takenDoses = 0;

    dayMedications.forEach(med => {
      const times = med.frequency.specificTimes || [];
      totalDoses += times.length;

      times.forEach(time => {
        const taken = medicationStatus.some(
          status =>
            status.medicationId === med.id &&
            status.date === dateStr &&
            status.time === time &&
            status.taken
        );
        if (taken) takenDoses++;
      });
    });

    console.log(`Progress: ${takenDoses}/${totalDoses}`);
    return { taken: takenDoses, total: totalDoses };
  };

  // Group medication events by medication name
  const groupMedicationEvents = (events: CalendarEvent[]) => {
    return events.reduce((acc, event) => {
      if (event.type === 'medication') {
        const medName = event.title.split('Take ')[1] || event.title.split(': ')[1];
        if (!acc[medName]) {
          acc[medName] = {
            events: [],
            total: 0,
            taken: 0
          };
        }
        acc[medName].events.push(event);
        acc[medName].total++;
        if (event.status) acc[medName].taken++;
      }
      return acc;
    }, {} as Record<string, { events: CalendarEvent[], total: number, taken: number }>);
  };

  // Calculate medication adherence for the current month
  const getMonthlyAdherence = (patientId: string) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let totalMedications = 0;
    let takenMedications = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = getMedicationEventsForDay(date)
        .filter(event => event.patientId === patientId);
      
      totalMedications += events.length;
      takenMedications += events.filter(event => event.status).length;
    }

    return totalMedications > 0 ? (takenMedications / totalMedications) * 100 : 0;
  };

  const getEventsForDay = (date: Date) => {
    if (!date) return [];
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      // For doctors, show all appointments they created or that were accepted
      if (currentUserRole === 'doctor') {
        if (event.type === 'appointment') {
          return eventDate.toDateString() === date.toDateString() && 
            (event.accepted || event.participants.some(p => p.id === currentUserId));
        }
      }
      return eventDate.toDateString() === date.toDateString();
    });
    const medicationEvents = getMedicationEventsForDay(date);
    return [...dayEvents, ...medicationEvents];
  };

  // The medication status update handler with improved logging and feedback
  const handleMedicationStatusUpdate = (medicationId: string, date: Date, time: string, taken: boolean) => {
    console.log(`Updating medication ${medicationId} on ${date.toDateString()} at ${time} to ${taken ? 'taken' : 'not taken'}`);
    
    const status: MedicationStatus = {
      medicationId,
      date: date.toDateString(),
      time,
      taken,
      responseTime: new Date().toISOString()
    };
    
    // Update in the store
    medicationStore.updateMedicationStatus(status);
    
    // Also update local state for immediate UI feedback
    setMedicationStatus(prev => {
      const existingIndex = prev.findIndex(
        s => s.medicationId === medicationId && s.date === date.toDateString() && s.time === time
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = status;
        return updated;
      } else {
        return [...prev, status];
      }
    });
    
    // Update the medication events in the calendar to reflect the new status
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (
          event.type === 'medication' && 
          event.medicationId === medicationId &&
          new Date(event.start).toDateString() === date.toDateString() &&
          new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === time
        ) {
          return { ...event, status: taken };
        }
        return event;
      });
    });
  };

  // For adding appointments, ensure they're added to the store
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEvent.type === 'appointment') {
      // Create a unique ID
      const eventId = `evt-${Date.now()}`;
      
      // Create appointment with relevant participants
      const eventToAdd: CalendarEvent = {
        ...newEvent,
        id: eventId,
        participants: [
          // Always include the current user
          {
            id: currentUserId,
            name: currentUserRole === 'doctor' ? 'Doctor' : (currentUserRole === 'patient' ? 'Patient' : 'Caregiver'),
            role: currentUserRole
          },
          // If the doctor is adding for a patient, include the patient
          ...(currentUserRole === 'doctor' && selectedPatient ? [
            {
              id: selectedPatient,
              name: 'Patient',
              role: 'patient' as const
            }
          ] : []),
          // If a patient is adding, include their doctor (simplified here)
          ...(currentUserRole === 'patient' ? [
            {
              id: 'D001', // This should be the patient's actual doctor ID
              name: 'Doctor',
              role: 'doctor' as const
            }
          ] : [])
        ],
        patientId: currentUserRole === 'patient' ? currentUserId : (selectedPatient || ''),
        accepted: currentUserRole === 'doctor' // Auto-accepted if doctor creates it
      };
      
      // Add to store to propagate across users
      appointmentStore.addAppointment(eventToAdd);
      
      // Also notify parent component
      onEventAdd(eventToAdd);
    } else {
      // For non-appointment events, create the event with a new ID
      const eventWithId = {
        ...newEvent,
        id: `evt-${Date.now()}`
      } as CalendarEvent;
      onEventAdd(eventWithId);
    }
    
    // Reset form and close
    setNewEvent({
      title: '',
      start: '',
      end: '',
      type: 'appointment',
      description: '',
      participants: [],
      accepted: false
    });
    setShowEventForm(false);
  };

  // Get medication log entries sorted by date
  const getMedicationLog = () => {
    if (!selectedPatient) return [];
    
    return medicationStatus
      .filter(status => {
        const event = medications.find(med => med.id === status.medicationId);
        return event?.prescribedFor === selectedPatient;
      })
      .sort((a, b) => new Date(b.responseTime!).getTime() - new Date(a.responseTime!).getTime())
      .map(status => {
        const medication = medications.find(med => med.id === status.medicationId);
        return {
          ...status,
          medicationName: medication?.name || 'Unknown Medication',
          dosage: medication?.dosage || ''
        };
      });
  };

  const getProgressBarColor = (progress: number) => {
    if (isNaN(progress) || progress === 0) return 'bg-gray-200';
    if (progress >= 0.8) return 'bg-green-500';
    if (progress >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-green-800">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              className="p-2 text-green-600 hover:text-green-800 bg-green-50 rounded-full"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 text-white bg-green-600 hover:bg-green-700 rounded"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              className="p-2 text-green-600 hover:text-green-800 bg-green-50 rounded-full"
            >
              →
            </button>
          </div>
        </div>
        {currentUserRole === 'doctor' && (
          <div className="flex items-center space-x-4">
            <select
              value={selectedPatient || ''}
              onChange={(e) => setSelectedPatient(e.target.value || null)}
              className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">All Patients</option>
              {patients.map((patientId) => (
                <option key={patientId} value={patientId}>
                  {patientId}
                </option>
              ))}
            </select>
            {selectedPatient && (
              <button
                onClick={() => setShowMedicationLog(!showMedicationLog)}
                className="px-3 py-1 text-green-600 hover:text-green-700 bg-green-50 rounded"
              >
                {showMedicationLog ? 'Hide Medication Log' : 'Show Medication Log'}
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setShowEventForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Event
        </button>
      </div>

      {currentUserRole === 'doctor' && selectedPatient && showMedicationLog && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 mb-4">Medication Log</h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-green-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Medication</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Dosage</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getMedicationLog().map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {new Date(entry.responseTime!).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-900">{entry.medicationName}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{entry.dosage}</td>
                    <td className="py-2 px-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.taken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.taken ? 'Taken' : 'Missed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-green-50 p-2 text-center text-sm font-medium text-green-800">
            {day}
          </div>
        ))}
        
        {getDaysInMonth(selectedDate).map((date, index) => {
          if (!date) {
            return (
              <div key={`empty-${index}`} className="bg-gray-50 min-h-[100px]" />
            );
          }

          const dayEvents = getEventsForDay(date);
          const medicationEvents = dayEvents.filter(e => e.type === 'medication');
          const appointmentEvents = dayEvents.filter(e => e.type === 'appointment');
          const isToday = date.toDateString() === new Date().toDateString();
          const progress = getDailyMedicationProgress(
            date,
            currentUserRole === 'doctor' ? selectedPatient : currentUserId
          );
          
          // Calculate progress percentage safely
          const progressPercentage = progress.total > 0 
            ? Math.floor((progress.taken / progress.total) * 100)
            : 0;
            
          const progressBarColor = getProgressBarColor(progress.taken / progress.total);

          return (
            <div
              key={`day-${date.getTime()}`}
              className={`min-h-[120px] bg-white p-2 ${
                isToday ? 'ring-2 ring-green-500' : ''
              } cursor-pointer hover:bg-green-50`}
              onClick={() => setExpandedDay(date)}
            >
              <div className="flex justify-between items-start">
                <span className={`font-medium ${isToday ? 'text-green-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </span>
                {progress.total > 0 && (
                  <div className="text-xs text-gray-500">
                    {progress.taken}/{progress.total}
                  </div>
                )}
              </div>

              {progress.total > 0 && (
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressBarColor}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}

              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={`event-${event.id}-${eventIndex}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent calendar day click
                      if (event.type === 'medication') {
                        handleMedicationStatusUpdate(
                          event.medicationId!,
                          new Date(event.start),
                          new Date(event.start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          !event.status
                        );
                      } else {
                        onEventClick(event);
                      }
                    }}
                    className={`text-xs p-1.5 rounded cursor-pointer truncate ${
                      event.type === 'medication'
                        ? event.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        : event.type === 'appointment'
                        ? event.accepted
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {expandedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {expandedDay.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <button
                onClick={() => setExpandedDay(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Daily Schedule</h4>
                
                {/* Timeline view */}
                <div className="relative mt-4">
                  {/* Time markers - 24-hour day */}
                  <div className="absolute top-0 bottom-0 left-0 w-16 flex flex-col justify-between py-2 text-xs text-gray-500">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={`time-${i}`}>{i * 3}:00</div>
                    ))}
                  </div>
                  
                  {/* Timeline grid */}
                  <div className="ml-16 border-l border-gray-200 pl-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={`timeline-row-${i}`} 
                        className="h-24 border-b border-gray-100 relative"
                      >
                        <div className="absolute top-0 left-0 w-full h-full">
                          {/* Place events within this time range */}
                          {getEventsForDay(expandedDay)
                            .filter(event => {
                              const eventHour = new Date(event.start).getHours();
                              return eventHour >= i * 3 && eventHour < (i + 1) * 3;
                            })
                            .map(event => {
                              const eventStart = new Date(event.start);
                              const mins = eventStart.getMinutes();
                              const hours = eventStart.getHours() % 3; // Relative to 3-hour block
                              
                              // Position proportionally within 3-hour block
                              const topPosition = ((hours * 60 + mins) / 180) * 100;
                              
                              return (
                                <div
                                  key={`timeline-event-${event.id}`}
                                  className={`absolute left-0 ml-2 w-3/4 p-2 rounded-md text-xs ${
                                    event.type === 'medication' 
                                      ? event.status
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                      : event.type === 'appointment'
                                      ? event.accepted
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                                  }`}
                                  style={{ 
                                    top: `${topPosition}%`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (event.type === 'medication') {
                                      handleMedicationStatusUpdate(
                                        event.medicationId!,
                                        new Date(event.start),
                                        new Date(event.start).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        }),
                                        !event.status
                                      );
                                    } else {
                                      onEventClick(event);
                                    }
                                  }}
                                >
                                  <div className="flex items-center">
                                    {event.type === 'medication' && (
                                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                                        event.status ? 'bg-green-500' : 'border border-gray-400'
                                      }`}>
                                        {event.status && (
                                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium">{event.title}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(event.start).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                        {event.type === 'medication' && (
                                          <span className="ml-2">{event.description}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Medication and Appointment sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Medications</h4>
                  {getEventsForDay(expandedDay)
                    .filter(event => event.type === 'medication')
                    .length === 0 ? (
                    <p className="text-sm text-gray-500">No medications scheduled for this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {getEventsForDay(expandedDay)
                        .filter(event => event.type === 'medication')
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .map(event => (
                          <div
                            key={`expanded-med-${event.id}`}
                            className={`p-2 rounded-md ${
                              event.status
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center cursor-pointer ${
                                    event.status 
                                      ? 'bg-green-500 text-white' 
                                      : 'border-2 border-gray-300'
                                  }`}
                                  onClick={() => {
                                    handleMedicationStatusUpdate(
                                      event.medicationId!,
                                      new Date(event.start),
                                      new Date(event.start).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }),
                                      !event.status
                                    );
                                  }}
                                >
                                  {event.status && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {event.title.includes(':') 
                                      ? event.title.split(': ')[1] 
                                      : event.title.replace('Take ', '')}
                                  </div>
                                  <div className="text-xs text-gray-500">{event.description}</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(event.start).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Appointments</h4>
                  {getEventsForDay(expandedDay)
                    .filter(event => event.type === 'appointment')
                    .length === 0 ? (
                    <p className="text-sm text-gray-500">No appointments scheduled for this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {getEventsForDay(expandedDay)
                        .filter(event => event.type === 'appointment')
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .map(event => (
                          <div
                            key={`expanded-apt-${event.id}`}
                            className={`p-2 rounded-md ${
                              event.accepted
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-yellow-50 border border-yellow-200'
                            }`}
                            onClick={() => onEventClick(event)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs text-gray-500">{event.description}</div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(event.start).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {' - '}
                                {new Date(event.end).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => setExpandedDay(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Event</h3>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      type: e.target.value as CalendarEvent['type'],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                >
                  <option value="appointment">Appointment</option>
                  <option value="exercise">Exercise</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 