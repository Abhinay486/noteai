import React from 'react';
import { UserData } from '../context/UserContext';
import { User, Calendar, FileText } from 'lucide-react';

const Profile = () => {
  const { user, loading } = UserData();

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <div className="text-center mt-10">Please log in to view your profile.</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-full bg-white p-1">
              <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-800">
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-gray-500" />
                <h3 className="font-medium text-gray-900">Account Info</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Joined:</span>{' '}
                  {formatDate(user.createdAt)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>

            {/* Notes Stats */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-gray-500" />
                <h3 className="font-medium text-gray-900">Notes</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Notes:</span>{' '}
                  {user.notes?.length || 0}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Created:</span>{' '}
                  {user.notes?.length > 0
                    ? formatDate(user.notes[user.notes.length - 1].createdAt)
                    : 'No notes yet'}
                </p>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-gray-500" />
                <h3 className="font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-2">
                {user.notes?.length > 0 ? (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatDate(user.notes[user.notes.length - 1].updatedAt)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 