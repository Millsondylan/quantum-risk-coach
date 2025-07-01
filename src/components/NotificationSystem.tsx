import React from 'react';
import { Bell } from 'lucide-react';

const NotificationSystem = () => {
  return (
    <div className="holo-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Smart Notifications</h2>
      </div>
      <p className="text-slate-400">Notification system coming soon...</p>
    </div>
  );
};

export default NotificationSystem; 