'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Employee } from '@/types';
import { QrCode, User, Building2, Printer } from 'lucide-react';

export default function IdCardPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/employee/profile?id=${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setEmployee(data.employee);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch employee data');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ID Card...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || 'Employee not found'}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Employee ID: {params.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* ID Card Container - Centered for print */}
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] print:min-h-screen print:items-center print:justify-center">
        <div className="relative group">
          {/* Print Button - Red box on hover */}
          <div className="absolute -bottom-2 -left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 print:hidden">
            <button
              onClick={handlePrint}
              className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-colors"
              title="Print ID Card"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
          
          {/* ID Card */}
          <div 
            className="relative shadow-2xl print:shadow-none id-card-container"
            style={{ 
              width: '3.375in', 
              height: '2.125in'
            }}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl overflow-hidden border border-slate-600 print:rounded-none print:border-0">
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
      </div>


      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          
          /* Ensure the main container doesn't cause page breaks */
          .min-h-screen {
            min-height: auto !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:min-h-screen {
            min-height: 100vh !important;
          }
          
          .print\\:items-center {
            align-items: center !important;
          }
          
          .print\\:justify-center {
            justify-content: center !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:border-0 {
            border: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          /* Ensure gradients and colors print correctly */
          .bg-gradient-to-br {
            background: linear-gradient(to bottom right, #1e293b, #334155, #0f172a) !important;
          }
          
          .bg-gradient-to-r {
            background: linear-gradient(to right, #3b82f6, #9333ea, #06b6d4) !important;
          }
          
          /* Fallback solid colors for browsers that don't support gradients in print */
          .bg-gradient-to-br:not([style*="gradient"]) {
            background: #1e293b !important;
          }
          
          .bg-gradient-to-r:not([style*="gradient"]) {
            background: #3b82f6 !important;
          }
          
          /* Force text colors to print */
          .text-white {
            color: white !important;
          }
          
          .text-blue-300 {
            color: #93c5fd !important;
          }
          
          .text-slate-300 {
            color: #cbd5e1 !important;
          }
          
          /* Ensure background colors print */
          .bg-white {
            background: white !important;
          }
          
          .bg-blue-500 {
            background: #3b82f6 !important;
          }
          
          .bg-blue-600 {
            background: #2563eb !important;
          }
          
          .bg-purple-600 {
            background: #9333ea !important;
          }
          
          .bg-cyan-500 {
            background: #06b6d4 !important;
          }
          
          /* ID Card specific print styles */
          .id-card-container {
            width: 3.375in !important;
            height: 2.125in !important;
            margin: 0 auto !important;
            position: relative !important;
            max-width: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
          }
          
          /* Ensure background patterns and overlays print */
          .opacity-10 {
            opacity: 0.1 !important;
          }
          
          .opacity-20 {
            opacity: 0.2 !important;
          }
          
          /* Force border colors to print */
          .border-slate-600 {
            border-color: #475569 !important;
          }
          
          .border-blue-400 {
            border-color: #60a5fa !important;
          }
          
          .border-white {
            border-color: white !important;
          }
          
          @page {
            margin: 0 !important;
            size: 3.5in 2.25in !important;
          }
          
          /* Prevent page breaks within the ID card */
          .id-card-container,
          .id-card-container * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Ensure the entire card fits on one page */
          .id-card-container {
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
