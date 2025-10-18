'use client';

import React from 'react';
import Image from 'next/image';
import { Employee } from '@/types';
import { QrCode, User, Building2, ExternalLink } from 'lucide-react';

interface EmployeeIdCardProps {
  employee: Employee;
}

export default function EmployeeIdCard({ employee }: EmployeeIdCardProps) {

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative">
        {/* Card Container */}
        <div 
          className="relative"
          style={{ 
            width: '3.375in',
            height: '2.125in'
          }}
        >
          {/* Front of Card */}
          <div className="w-full h-full">
            <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-600">
              {/* Background Pattern */}
              <div className="absolute inset-0">
                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 20% 20%, #3b82f6 2px, transparent 2px),
                                     radial-gradient(circle at 80% 80%, #8b5cf6 2px, transparent 2px),
                                     radial-gradient(circle at 40% 60%, #06b6d4 2px, transparent 2px)`,
                    backgroundSize: '30px 30px, 25px 25px, 35px 35px'
                  }}></div>
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
              </div>

              {/* Company Logo - Top Left */}
              <div className="absolute top-2 left-2 z-10">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center shadow-lg">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs">LOCALPRO</span>
                    <span className="text-blue-300 text-[10px]">Your Trusted Local Pros</span>
                  </div>
                </div>
              </div>

              {/* QR Code - Top Right */}
              <div className="absolute top-2 right-2 z-10">
                <div 
                  className="w-8 h-8 bg-white rounded shadow-lg p-1"
                  title={`Employee: ${employee.name} | ID: ${employee.employeeId || 'Not assigned'}`}
                >
                  <QrCode className="w-full h-full text-gray-800" />
                </div>
              </div>

              {/* Employee Photo - Left Side */}
              <div className="absolute top-12 left-3 z-10">
                <div className="w-24 h-24 bg-white rounded shadow-lg flex items-center justify-center border border-white/20 overflow-hidden">
                  {employee.profilePicture ? (
                    <Image
                      src={employee.profilePicture}
                      alt={`${employee.name} profile`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Information - Right Side */}
              <div className="absolute top-12 right-3 left-32 z-10">
                <div className="space-y-1">
                  {/* Department Badge */}
                  <div className="inline-block">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-semibold rounded-full border border-blue-400/30">
                      {employee.department?.toUpperCase() || 'EMPLOYEE'}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <div>
                    <h3 className="text-white font-bold text-sm leading-tight">
                      {employee.name}
                    </h3>
                    <p className="text-slate-300 text-xs">
                      {employee.position || 'Employee'}
                    </p>
                  </div>
                  
                  {/* Employee ID */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded p-2 shadow-lg">
                    <p className="text-white text-[10px] font-medium mb-0.5">EMPLOYEE ID</p>
                    <p className="text-white font-mono font-bold text-sm tracking-wider">
                      {employee.employeeId || 'NO ID ASSIGNED'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => window.open(`/id-card/${employee.id}`, '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Open ID in New Tab</span>
          </button>
        </div>

      </div>
    </div>
  );
}
