'use client';

import React, { useState, useEffect } from 'react';
import { updateEmployee, createEmployee } from '@/lib/database';
import { Employee } from '@/types';
import { Plus, Edit, Trash2, User, Mail, Building, Shield } from 'lucide-react';
import VirtualScroll from '@/components/VirtualScroll/VirtualScroll';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    // This would fetch all employees from the database
    // For now, using mock data
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@localpro.com',
        role: 'employee',
        department: 'Engineering',
        position: 'Software Developer',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@localpro.com',
        role: 'admin',
        department: 'HR',
        position: 'HR Manager',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@localpro.com',
        role: 'employee',
        department: 'Sales',
        position: 'Sales Representative',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
    ];
    
    setEmployees(mockEmployees);
    setLoading(false);
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEmployeeId = await createEmployee({
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        department: employeeData.department,
        position: employeeData.position
      });
      const newEmployee: Employee = {
        ...employeeData,
        id: newEmployeeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEmployees([...employees, newEmployee]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      await updateEmployee(employeeId, updates);
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, ...updates, updatedAt: new Date() }
          : emp
      ));
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="empty-state">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <div className="empty-state-title">Loading Employees</div>
          <div className="empty-state-description">Please wait while we load employee data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <EmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Employee Form */}
      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={(data) => handleUpdateEmployee(editingEmployee.id, data)}
          onCancel={() => setEditingEmployee(null)}
        />
      )}

      {/* Employees Virtual Scroll List */}
      <div className="card">
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Employees ({employees.length})
          </h3>
        </div>
        <VirtualScroll
          items={employees}
          itemHeight={80} // Height for each employee item
          containerHeight={500} // Fixed height for the scroll container
          renderItem={(employee: Employee) => (
            <div className="p-1">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    
                    {/* Employee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {employee.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {employee.email}
                          </p>
                        </div>
                        
                        {/* Role Badge */}
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {employee.role}
                          </span>
                        </div>
                      </div>
                      
                      {/* Department and Position */}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {employee.department || 'N/A'}
                        </div>
                        <div>
                          {employee.position || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit employee"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this employee?')) {
                          // Handle delete
                        }
                      }}
                      className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          emptyMessage="No employees found"
          showScrollToTop={true}
          showScrollToBottom={true}
        />
      </div>
    </div>
  );
}

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || 'employee',
    department: employee?.department || '',
    position: employee?.position || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {employee ? 'Update employee information' : 'Create a new team member account'}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'employee' | 'admin' })}
              className="input-field"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-6 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-6 py-2"
          >
            {employee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
