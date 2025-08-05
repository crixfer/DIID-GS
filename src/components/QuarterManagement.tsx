import React, { useState } from 'react';
import { Plus, Calendar, Edit, Trash2, Play, Pause, CheckCircle, Clock, X } from 'lucide-react';
import { Quarter } from '../types';
import { useQuarters } from '../hooks/useQuarters';

interface QuarterManagementProps {
  onQuarterSelect: (quarter: Quarter) => void;
  selectedQuarter: Quarter | null;
}

export function QuarterManagement({ onQuarterSelect, selectedQuarter }: QuarterManagementProps) {
  const { quarters, activeQuarter, loading, error, createQuarter, updateQuarter, deleteQuarter } = useQuarters();
  const [showForm, setShowForm] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<Quarter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'upcoming' as Quarter['status']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuarter) {
        await updateQuarter(editingQuarter.id, formData);
      } else {
        const newQuarter = await createQuarter(formData);
        if (formData.status === 'active') {
          onQuarterSelect({
            id: newQuarter.id,
            name: newQuarter.name,
            startDate: newQuarter.start_date,
            endDate: newQuarter.end_date,
            status: newQuarter.status,
            createdAt: newQuarter.created_at
          });
        }
      }
      handleCancel();
    } catch (err) {
      console.error('Failed to save quarter:', err);
    }
  };

  const handleEdit = (quarter: Quarter) => {
    setEditingQuarter(quarter);
    setFormData({
      name: quarter.name,
      startDate: quarter.startDate,
      endDate: quarter.endDate,
      status: quarter.status
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuarter(null);
    setFormData({ name: '', startDate: '', endDate: '', status: 'upcoming' });
  };

  const handleActivate = async (quarter: Quarter) => {
    try {
      await updateQuarter(quarter.id, { ...quarter, status: 'active' });
      onQuarterSelect({ ...quarter, status: 'active' });
    } catch (err) {
      console.error('Failed to activate quarter:', err);
    }
  };

  const handleDelete = async (quarterId: string) => {
    if (window.confirm('Are you sure you want to delete this quarter? This will permanently delete all associated data.')) {
      try {
        await deleteQuarter(quarterId);
        if (selectedQuarter?.id === quarterId) {
          onQuarterSelect(activeQuarter);
        }
      } catch (err) {
        console.error('Failed to delete quarter:', err);
      }
    }
  };

  const getStatusIcon = (status: Quarter['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: Quarter['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Error loading quarters: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quarter Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quarter
        </button>
      </div>

      {/* Active Quarter Display */}
      {activeQuarter && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">{activeQuarter.name}</h3>
              <p className="text-sm text-green-700">
                {new Date(activeQuarter.startDate).toLocaleDateString()} - {new Date(activeQuarter.endDate).toLocaleDateString()}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Play className="h-3 w-3 mr-1" />
              Active
            </span>
          </div>
        </div>
      )}

      {/* Quarter Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingQuarter ? 'Edit Quarter' : 'Create New Quarter'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quarter Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Q1 2024, Spring Quarter, etc."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Quarter['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingQuarter ? 'Update Quarter' : 'Create Quarter'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quarters List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            All Quarters ({quarters.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {quarters.length > 0 ? (
            quarters.map((quarter) => (
              <div key={quarter.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {quarter.name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quarter.status)}`}>
                        {getStatusIcon(quarter.status)}
                        <span className="ml-1 capitalize">{quarter.status}</span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(quarter.startDate).toLocaleDateString()} - {new Date(quarter.endDate).toLocaleDateString()}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Created: {new Date(quarter.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {quarter.status !== 'active' && (
                      <button
                        onClick={() => handleActivate(quarter)}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                        title="Activate Quarter"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onQuarterSelect(quarter)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedQuarter?.id === quarter.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedQuarter?.id === quarter.id ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => handleEdit(quarter)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quarter.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No quarters created yet</p>
              <p className="text-sm">Create your first quarter to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}