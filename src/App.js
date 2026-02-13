// App.js - Main React Component with CSV data loading
import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    assignee: '',
    organization: '',
    ticketId: '',
    requester: '',
    priority: ''
  });

  useEffect(() => {
    // Load CSV data
    // In Keboola, the data will be at: /data/in/tables/zendesk_support_data.csv
    // For local development, you can place it in /public folder
    const dataPath = process.env.REACT_APP_DATA_PATH || '/zendesk_support_data.csv';
    
    fetch(dataPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Loaded records:', results.data.length);
            setData(results.data);
            setLoading(false);
          },
          error: (error) => {
            console.error('Parse error:', error);
            setError(error.message);
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(ticket => {
      if (filters.assignee && ticket.assignee !== filters.assignee) return false;
      if (filters.organization && ticket.organization !== filters.organization) return false;
      if (filters.ticketId && ticket.ticket_id?.toString() !== filters.ticketId) return false;
      if (filters.requester && !ticket.requester?.toLowerCase().includes(filters.requester.toLowerCase())) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      return true;
    });
  }, [data, filters]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const createdTickets = filteredData.length;
    const unsolvedTickets = filteredData.filter(t => !['Solved', 'Closed'].includes(t.status)).length;
    const solvedTickets = filteredData.filter(t => ['Solved', 'Closed'].includes(t.status)).length;
    const oneTouchTickets = filteredData.filter(t => t.is_one_touch === 1).length;
    const reopenedTickets = filteredData.filter(t => t.reopens > 0).length;

    return {
      createdTickets,
      unsolvedTickets,
      solvedTickets,
      oneTouchPercentage: createdTickets > 0 ? ((oneTouchTickets / createdTickets) * 100).toFixed(1) : '0.0',
      reopenedPercentage: createdTickets > 0 ? ((reopenedTickets / createdTickets) * 100).toFixed(0) : '0'
    };
  }, [filteredData]);

  // Tickets by hour
  const ticketsByHour = useMemo(() => {
    const hourCounts = Array(24).fill(0);
    filteredData.forEach(ticket => {
      if (ticket.created_at) {
        const hour = new Date(ticket.created_at).getHours();
        hourCounts[hour]++;
      }
    });
    const total = filteredData.length;
    return hourCounts.map((count, hour) => ({
      hour,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
      count
    }));
  }, [filteredData]);

  // Tickets by day of week
  const ticketsByDay = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = Array(7).fill(0);
    filteredData.forEach(ticket => {
      if (ticket.created_at) {
        const day = new Date(ticket.created_at).getDay();
        dayCounts[day]++;
      }
    });
    return days.map((day, index) => ({
      day,
      count: dayCounts[index]
    }));
  }, [filteredData]);

  // Get unique values for filters
  const uniqueValues = useMemo(() => ({
    assignees: [...new Set(data.map(t => t.assignee).filter(Boolean))].sort(),
    organizations: [...new Set(data.map(t => t.organization).filter(Boolean))].sort(),
    priorities: [...new Set(data.map(t => t.priority).filter(Boolean))].sort()
  }), [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <h2 className="text-red-800 font-semibold mb-2">Error loading data</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Make sure zendesk_support_data.csv is available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Zendesk Support</h1>
          <div className="text-sm text-gray-500">
            Viewing: 6/19/2019 — 7/18/2019
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ticket group</label>
              <select
                value={filters.assignee}
                onChange={(e) => setFilters({...filters, assignee: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Assignees</option>
                {uniqueValues.assignees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ticket brand</label>
              <select
                value={filters.organization}
                onChange={(e) => setFilters({...filters, organization: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Organizations</option>
                {uniqueValues.organizations.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ticket channel</label>
              <input
                type="text"
                value={filters.ticketId}
                onChange={(e) => setFilters({...filters, ticketId: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ticket ID..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ticket form</label>
              <input
                type="text"
                value={filters.requester}
                onChange={(e) => setFilters({...filters, requester: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Requester..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Submitter role</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {uniqueValues.priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-500 mb-2">Created tickets</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">
              {metrics.createdTickets.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-500 mb-2">Unsolved tickets</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">
              {metrics.unsolvedTickets.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-500 mb-2">Solved tickets</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">
              {metrics.solvedTickets.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-500 mb-2">One-touch tickets</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">
              {metrics.oneTouchPercentage}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-500 mb-2">Reopened tickets</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-800">
              {metrics.reopenedPercentage}%
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by hour */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
              Tickets created by hour
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: '%', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="percentage" fill="#9dc183" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tickets by day */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
              Average tickets created by day of week
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#0f7c90" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} tickets
        </div>
      </div>
    </div>
  );
};

export default App;
