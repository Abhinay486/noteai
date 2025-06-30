import React, { useState } from 'react';
import { UserData } from '../context/UserContext';
import { Settings, User, Lock, Bell, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
const VITE_API_URL=import.meta.env.VITE_API_URL || "http://localhost:5000";

const SettingsPage = () => {
  const { user } = UserData();
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`${VITE_API_URL}/api/user/${user._id}`, {
        credentials: "include",
        withCredentials: true
      });
      window.location.href = '/login';
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Settings size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {/* Profile Settings */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} className="text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email updates about your notes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
                <span className="sr-only">Use setting</span>
                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={20} className="text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Account</h2>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 size={18} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 