'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Test users data
const testUsers = [
  { id: 'P001', name: 'John Doe', role: 'patient', email: 'john.doe@test.com', password: 'testpass123' },
  { id: 'P002', name: 'Jane Smith', role: 'patient', email: 'jane.smith@test.com', password: 'testpass123' },
  { id: 'P003', name: 'Robert Johnson', role: 'patient', email: 'robert.johnson@test.com', password: 'testpass123' },
  { id: 'D001', name: 'Dr. Sarah Chen', role: 'doctor', email: 'sarah.chen@hospital.com', password: 'docpass123' },
  { id: 'D002', name: 'Dr. Michael Brown', role: 'doctor', email: 'michael.brown@hospital.com', password: 'docpass123' },
  { id: 'C001', name: 'Emily Davis', role: 'caregiver', email: 'emily.davis@test.com', password: 'carepass123' },
  { id: 'C002', name: 'James Wilson', role: 'caregiver', email: 'james.wilson@test.com', password: 'carepass123' },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'patient';
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find user with matching email and password
    const user = testUsers.find(
      u => u.email === credentials.email && 
           u.password === credentials.password &&
           u.role === role
    );

    if (user) {
      // Store user info in localStorage for the session
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirect to appropriate dashboard based on role
      switch (role) {
        case 'patient':
          router.push('/patient/dashboard');
          break;
        case 'caregiver':
          router.push('/caregiver/dashboard');
          break;
        case 'doctor':
          router.push('/doctor/dashboard');
          break;
        default:
          router.push('/patient/dashboard');
      }
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 