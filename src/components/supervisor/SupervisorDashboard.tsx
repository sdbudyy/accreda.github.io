import React from 'react';

const SupervisorDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards will go here */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Pending Reviews</h2>
          <p className="text-gray-600">No pending reviews</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
          <p className="text-gray-600">View team metrics</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <p className="text-gray-600">No recent activities</p>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard; 