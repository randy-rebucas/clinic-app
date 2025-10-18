'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeIdCard from './EmployeeIdCard';
import ImageUpload from './ImageUpload';
import { 
  User, 
  Mail, 
  Building, 
  Briefcase, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Key,
  Shield,
  Settings,
  IdCard,
  RefreshCw
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  department: string;
  position: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


export default function EmployeeProfile() {
  const { employee, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | undefined>(employee?.profilePicture);

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    department: '',
    position: ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  // Initialize form data when employee data loads
  useEffect(() => {
    if (employee) {
      setProfileForm({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || '',
        position: employee.position || ''
      });
      setProfilePicture(employee.profilePicture);
    }
  }, [employee]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showMessage('success', 'Employee ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showMessage('error', 'Failed to copy to clipboard');
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setProfilePicture(imageUrl);
    showMessage('success', 'Profile picture updated successfully!');
  };

  const handleImageError = (error: string) => {
    showMessage('error', error);
  };


  const generateEmployeeId = async () => {
    if (!user) return;
    
    setGeneratingId(true);
    try {
      const response = await fetch('/api/employee/generate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeId: user.id,
          department: employee?.department 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', `Employee ID generated: ${data.employeeId}`);
        // Refresh employee data
        window.location.reload();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to generate employee ID');
      }
    } catch {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setGeneratingId(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...profileForm, employeeId: user.id }),
      });

      if (response.ok) {
        showMessage('success', 'Profile updated successfully!');
        setIsEditing(false);
        // Refresh employee data
        window.location.reload();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to update profile');
      }
    } catch {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/employee/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          employeeId: user.id,
        }),
      });

      if (response.ok) {
        showMessage('success', 'Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to change password');
      }
    } catch {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (!employee || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your personal information, security settings, and preferences
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Hero Section with ID Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex-1 mb-6 lg:mb-0 lg:mr-8">
                <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
                <p className="text-blue-100 text-lg mb-1">{employee.position || 'Employee'}</p>
                <p className="text-blue-200 text-sm">{employee.department || 'General Department'}</p>
                
                {/* Employee ID Display */}
                {employee.employeeId && (
                  <div className="mt-4 mb-4">
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 hover:bg-white/30 transition-colors cursor-pointer group"
                         onClick={() => copyToClipboard(employee.employeeId!)}>
                      <IdCard className="h-5 w-5 mr-2 text-white" />
                      <span className="text-sm font-medium text-white/90 mr-2">Employee ID:</span>
                      <span className="text-white font-mono font-bold text-lg tracking-wider">
                        {employee.employeeId}
                      </span>
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {copied ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-white/50 rounded flex items-center justify-center">
                            <span className="text-white text-xs">📋</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm capitalize">{employee.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <EmployeeIdCard employee={{...employee, profilePicture}} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="order-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-4">
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    {/* Profile Picture Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profile Picture
                      </label>
                      <ImageUpload
                        currentImage={profilePicture}
                        onImageUpload={handleImageUpload}
                        onError={handleImageError}
                        disabled={loading}
                        employeeId={user?.id || ''}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={profileForm.department}
                          onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={profileForm.position}
                          onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        <X className="h-4 w-4 mr-1 inline" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="h-4 w-4 mr-1 inline" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                          <p className="text-gray-900 dark:text-white font-medium">{employee.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white font-medium">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {employee.department || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {employee.position || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Account Info */}
          <div className="order-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                {!employee.employeeId && (
                  <button
                    onClick={generateEmployeeId}
                    disabled={generatingId}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                  >
                    {generatingId ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating ID...
                      </>
                    ) : (
                      <>
                        <IdCard className="h-4 w-4 mr-2" />
                        Generate Employee ID
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Status
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    employee.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {employee.role === 'admin' ? 'Administrator' : 'Employee'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Employee ID</span>
                  <span className="text-sm text-gray-900 dark:text-white font-mono">
                    {employee.employeeId || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(employee.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Change Password
                </h3>
              </div>
              <form onSubmit={handlePasswordChange} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
