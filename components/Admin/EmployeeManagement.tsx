'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Employee } from '@/types';
import { 
  Plus, Edit, Trash2, User, Mail, Building, Shield, RefreshCw, AlertTriangle, 
  Search, Filter, Eye, Calendar, SortAsc, SortDesc, X, Lock
} from 'lucide-react';

// import VirtualScroll from '@/components/VirtualScroll/VirtualScroll';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Table enhancement states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordEmployee, setPasswordEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filtered and sorted employees
  const filteredAndSortedEmployees = useMemo(() => {
    const filtered = employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = filterRole === 'all' || employee.role === filterRole;
      const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;

      return matchesSearch && matchesRole && matchesDepartment;
    });

    // Sort employees
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [employees, searchTerm, filterRole, filterDepartment, sortField, sortDirection]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const deptSet = new Set(employees.map(emp => emp.department).filter(Boolean));
    return Array.from(deptSet).sort();
  }, [employees]);

  // Handle sorting
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredAndSortedEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredAndSortedEmployees.map(emp => emp.id));
    }
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform the data to match the Employee interface
        const transformedEmployees: Employee[] = data.data.map((emp: {
          _id: string;
          name: string;
          email: string;
          role: string;
          department?: string;
          position?: string;
          employeeId: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        }) => ({
          id: emp._id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          department: emp.department || '',
          position: emp.position || '',
          createdAt: new Date(emp.createdAt),
          updatedAt: new Date(emp.updatedAt),
        }));
        
        setEmployees(transformedEmployees);
      } else {
        throw new Error(data.error || 'Failed to load employees');
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to load employees');
      setEmployees([]);
    } finally {
    setLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setActionLoading(true);

      const response = await fetch('/api/auth/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        name: employeeData.name,
        email: employeeData.email,
        password: 'TempPassword123!', // Default password, should be changed on first login
        role: employeeData.role,
        department: employeeData.department,
        position: employeeData.position
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload employees to get the updated list
        await loadEmployees();
      setShowAddForm(false);
      } else {
        throw new Error(data.error || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to add employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      setActionLoading(true);

      const response = await fetch(`/api/employee/profile?id=${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          department: updates.department,
          position: updates.position,
          employeeId: employeeId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }

      const data = await response.json();
      
      if (data.success || data.message) {
        // Reload employees to get the updated data
        await loadEmployees();
      setEditingEmployee(null);
      } else {
        throw new Error(data.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to update employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`/api/employee/delete?id=${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload employees to get the updated list
        await loadEmployees();
      } else {
        throw new Error(data.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPassword = async (employeeId: string, newPassword: string) => {
    try {
      setActionLoading(true);

      const response = await fetch('/api/employee/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      const data = await response.json();
      
      if (data.success) {
        setShowPasswordForm(false);
        setPasswordEmployee(null);
        // Show success message (you could add a toast notification here)
        alert('Password updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setActionLoading(false);
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Employees</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadEmployees}
            className="btn-primary px-4 py-2 text-sm flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your team members and their roles
          </p>
        </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadEmployees}
              disabled={loading || actionLoading}
              className="btn-secondary flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || actionLoading) ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
        <button
          onClick={() => setShowAddForm(true)}
              disabled={actionLoading}
              className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees by name, email, department, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 pr-4"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFilters || filterRole !== 'all' || filterDepartment !== 'all'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(filterRole !== 'all' || filterDepartment !== 'all') && (
                  <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {[filterRole !== 'all', filterDepartment !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Roles</option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <EmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddForm(false)}
          loading={actionLoading}
        />
      )}

      {/* Edit Employee Form */}
      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={(data) => handleUpdateEmployee(editingEmployee.id, data)}
          onCancel={() => setEditingEmployee(null)}
          loading={actionLoading}
        />
      )}

      {/* Set Password Form */}
      {showPasswordForm && passwordEmployee && (
        <PasswordForm
          employee={passwordEmployee}
          onSubmit={(password) => handleSetPassword(passwordEmployee.id, password)}
          onCancel={() => {
            setShowPasswordForm(false);
            setPasswordEmployee(null);
          }}
          loading={actionLoading}
        />
      )}

      {/* Employees Table */}
      <div className="card overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Employees ({filteredAndSortedEmployees.length} of {employees.length})
          </h3>
              {selectedEmployees.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedEmployees.length} selected
                  </span>
                  <button
                    onClick={() => setSelectedEmployees([])}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            {/* Bulk Actions */}
            {selectedEmployees.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedEmployees.length} employees?`)) {
                      // Handle bulk delete
                      console.log('Bulk delete:', selectedEmployees);
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === filteredAndSortedEmployees.length && filteredAndSortedEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Employee</span>
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Role</span>
                    {sortField === 'role' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Department</span>
                    {sortField === 'department' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('position')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Position</span>
                    {sortField === 'position' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>Joined</span>
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <User className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm || filterRole !== 'all' || filterDepartment !== 'all' 
                          ? 'No employees match your filters' 
                          : 'No employees found'
                        }
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchTerm || filterRole !== 'all' || filterDepartment !== 'all'
                          ? 'Try adjusting your search or filter criteria'
                          : 'Get started by adding your first employee'
                        }
                      </p>
                      {(searchTerm || filterRole !== 'all' || filterDepartment !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterRole('all');
                            setFilterDepartment('all');
                          }}
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      selectedEmployees.includes(employee.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {employee.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {employee.role}
                          </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.department || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                          {employee.position || 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit employee"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                            setPasswordEmployee(employee);
                            setShowPasswordForm(true);
                          }}
                          className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Set password"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>
      </div>
    </div>
  );
}

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

function EmployeeForm({ employee, onSubmit, onCancel, loading = false }: EmployeeFormProps) {
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
            disabled={loading}
            className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{employee ? 'Update Employee' : 'Add Employee'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

interface PasswordFormProps {
  employee: Employee;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

function PasswordForm({ employee, onSubmit, onCancel, loading = false }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    
    onSubmit(formData.newPassword);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, newPassword: password, confirmPassword: password }));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            Set Password for {employee.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update the password for this employee account
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                className="input-field pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="input-field pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Need a secure password?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Generate a random secure password
              </p>
            </div>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="btn-secondary px-3 py-2 text-sm"
            >
              Generate
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
}
