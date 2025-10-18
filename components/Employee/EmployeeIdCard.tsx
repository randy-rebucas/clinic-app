'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Employee } from '@/types';
import { QrCode, RotateCcw, Download, User, Building2 } from 'lucide-react';

interface EmployeeIdCardProps {
  employee: Employee;
}

export default function EmployeeIdCard({ employee }: EmployeeIdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const downloadCard = () => {
    setIsDownloading(true);
    
    // Create a simple text file with employee information for download
    const cardData = `
LOCALPRO EMPLOYEE ID CARD
========================

Employee Information:
- Name: ${employee.name}
- Employee ID: ${employee.employeeId || 'Not assigned'}
- Department: ${employee.department || 'Not specified'}
- Position: ${employee.position || 'Not specified'}
- Email: ${employee.email}
- Role: ${employee.role.toUpperCase()}

Important Information:
- This ID is non-transferable and shall be confiscated when used by others.
- Wear this ID Card when entering company premises and present to company officers upon demand.

Emergency Contact:
- HR Department
- LocalPro Time Tracker
- hr@localpro.com

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    // Create and download the file
    const blob = new Blob([cardData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee-id-${employee.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Reset downloading state after a short delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Container */}
        <div 
          className="relative transition-all duration-700"
          style={{ 
            width: '3.375in',
            height: '2.125in',
            transformStyle: 'preserve-3d',
            transform: `${isHovered ? 'scale(1.05)' : 'scale(1)'} ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`
          }}
        >
          {/* Front of Card */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
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
                <div className="w-8 h-8 bg-white rounded shadow-lg p-1">
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

          {/* Back of Card */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
            }}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-200">
              {/* Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                                     radial-gradient(circle at 75% 75%, #8b5cf6 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
              </div>

              {/* Header */}
              <div className="relative z-10 p-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <Building2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">LOCALPRO</h3>
                      <p className="text-[10px] text-gray-500">Employee ID Card</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Valid Until</p>
                    <p className="text-xs font-semibold text-gray-900">12/2025</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-2 h-full flex flex-col">
                {/* Important Notice */}
                <div className="bg-red-50 border border-red-200 rounded p-1.5 mb-2">
                  <div className="flex items-start space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-red-800 mb-0.5">IMPORTANT NOTICE</h4>
                      <p className="text-[9px] text-red-700 leading-tight">
                        This ID is non-transferable and shall be confiscated when used by others. 
                        Wear this ID Card when entering company premises and present to company officers upon demand.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="bg-gray-50 rounded p-2 mb-2 flex-1">
                  <h4 className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">Employee Information</h4>
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-[9px] text-gray-600">Name:</span>
                      <span className="text-[9px] font-semibold text-gray-900">{employee.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-gray-600">Email:</span>
                      <span className="text-[9px] font-semibold text-gray-900">{employee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-gray-600">Department:</span>
                      <span className="text-[9px] font-semibold text-gray-900">{employee.department || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-gray-600">Position:</span>
                      <span className="text-[9px] font-semibold text-gray-900">{employee.position || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-gray-600">Employee ID:</span>
                      <span className="text-[9px] font-mono font-bold text-gray-900">{employee.employeeId || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-blue-50 border border-blue-200 rounded p-1.5 mb-2">
                  <h4 className="text-[10px] font-bold text-blue-800 mb-1 uppercase tracking-wide">Emergency Contact</h4>
                  <div className="text-[9px] text-blue-700">
                    <p className="font-semibold">HR Department</p>
                    <p>LocalPro Time Tracker</p>
                    <p>hr@localpro.com</p>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>

                {/* Signature Line */}
                <div className="border-t border-gray-200 pt-1">
                  <div className="flex justify-between items-end">
                    <div className="text-[9px] text-gray-500">
                      <p>Issued: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-gray-400 w-16 mb-0.5"></div>
                      <p className="text-[9px] text-gray-500">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3 mt-6">
          <button
            onClick={flipCard}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Flip Card</span>
          </button>
          
          <button
            onClick={downloadCard}
            disabled={isDownloading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
