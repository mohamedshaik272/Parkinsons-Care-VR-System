import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Welcome to Parkinson's Disease Monitoring Portal
          </h1>
          <p className="text-xl text-green-700 mb-8">
            Supporting patients and caregivers in managing Parkinson's disease together
          </p>
          
          <div className="relative w-full h-[500px] mb-8 rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/caregiver-patient.jpg"
              alt="A compassionate healthcare worker in blue scrubs sharing a joyful moment with an elderly patient, exemplifying the caring relationship at the heart of our Parkinson's support community"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
              className="rounded-xl"
            />
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-green-100">
          <h2 className="text-2xl font-semibold text-center text-green-800 mb-6">
            Please select your role to continue
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Patient', 
                path: '/auth/login?role=patient', 
                description: 'Access your personal dashboard and track your progress',
                bgColor: 'bg-green-50',
                hoverColor: 'hover:bg-green-100',
                borderColor: 'border-green-200'
              },
              { 
                title: 'Caregiver', 
                path: '/auth/login?role=caregiver', 
                description: 'Help manage and monitor patient activities',
                bgColor: 'bg-blue-50',
                hoverColor: 'hover:bg-blue-100',
                borderColor: 'border-blue-200'
              },
              { 
                title: 'Healthcare Provider', 
                path: '/auth/login?role=doctor', 
                description: 'Access patient data and provide medical insights',
                bgColor: 'bg-purple-50',
                hoverColor: 'hover:bg-purple-100',
                borderColor: 'border-purple-200'
              },
            ].map((role) => (
              <Link
                key={role.title}
                href={role.path}
                className={`block p-6 ${role.bgColor} rounded-lg ${role.hoverColor} transition-colors duration-200 border ${role.borderColor} shadow-sm`}
              >
                <h3 className="text-xl font-semibold text-green-800 mb-2">{role.title}</h3>
                <p className="text-green-700">{role.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 