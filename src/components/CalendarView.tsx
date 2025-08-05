import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarNote, Holiday } from '../types';
import { dominicanRepublicHolidays } from '../data/holidays';

interface CalendarViewProps {
  notes: CalendarNote[];
  onAddNote: (note: Omit<CalendarNote, 'id'>) => void;
  onUpdateNote: (note: CalendarNote) => void;
  onDeleteNote: (id: string) => void;
}

export function CalendarView({ notes, onAddNote, onUpdateNote, onDeleteNote }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<CalendarNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    type: 'reminder' as CalendarNote['type']
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date().toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getNotesForDate = (date: string) => {
    return notes.filter(note => note.date === date);
  };

  const getHolidayForDate = (date: string) => {
    return dominicanRepublicHolidays.find(holiday => holiday.date === date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateString = getDateString(day);
    setSelectedDate(dateString);
  };

  const handleAddNote = () => {
    if (!selectedDate) return;
    
    setShowNoteForm(true);
    setNoteForm({ title: '', description: '', type: 'reminder' });
  };

  const handleEditNote = (note: CalendarNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      description: note.description,
      type: note.type
    });
    setShowNoteForm(true);
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    if (editingNote) {
      onUpdateNote({
        ...editingNote,
        ...noteForm
      });
    } else {
      onAddNote({
        date: selectedDate,
        ...noteForm
      });
    }

    setShowNoteForm(false);
    setEditingNote(null);
    setNoteForm({ title: '', description: '', type: 'reminder' });
  };

  const handleCancel = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    setNoteForm({ title: '', description: '', type: 'reminder' });
  };

  const days = getDaysInMonth(currentDate);

  const getTypeColor = (type: CalendarNote['type']) => {
    switch (type) {
      case 'excuse':
        return 'bg-yellow-100 text-yellow-800';
      case 'holiday':
        return 'bg-red-100 text-red-800';
      case 'reminder':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Academic Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2 h-24"></div>;
                  }
                  
                  const dateString = getDateString(day);
                  const dayNotes = getNotesForDate(dateString);
                  const holiday = getHolidayForDate(dateString);
                  const isToday = dateString === today;
                  const isSelected = dateString === selectedDate;
                  
                  return (
                    <div
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`p-2 h-24 border border-gray-200 cursor-pointer transition-colors overflow-hidden ${
                        isSelected ? 'bg-blue-100 border-blue-300' :
                        isToday ? 'bg-green-50 border-green-300' :
                        'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>
                      
                      {holiday && (
                        <div className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded mb-1 truncate">
                          {holiday.name}
                        </div>
                      )}
                      
                      {dayNotes.slice(0, 2).map((note) => (
                        <div
                          key={note.id}
                          className={`text-xs px-1 py-0.5 rounded mb-1 truncate ${getTypeColor(note.type)}`}
                        >
                          {note.title}
                        </div>
                      ))}
                      
                      {dayNotes.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayNotes.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date */}
          {selectedDate && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <button
                  onClick={handleAddNote}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {getHolidayForDate(selectedDate) && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm font-medium text-red-800">
                      {getHolidayForDate(selectedDate)?.name}
                    </div>
                    <div className="text-xs text-red-600">
                      {getHolidayForDate(selectedDate)?.type} holiday
                    </div>
                  </div>
                )}
                
                {getNotesForDate(selectedDate).map((note) => (
                  <div key={note.id} className="p-2 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{note.title}</div>
                        {note.description && (
                          <div className="text-xs text-gray-600 mt-1">{note.description}</div>
                        )}
                        <div className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${getTypeColor(note.type)}`}>
                          {note.type}
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Holidays */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Upcoming Holidays</h4>
            <div className="space-y-2">
              {dominicanRepublicHolidays
                .filter(holiday => new Date(holiday.date) >= new Date())
                .slice(0, 5)
                .map((holiday) => (
                  <div key={holiday.date} className="text-sm">
                    <div className="font-medium text-gray-900">{holiday.name}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(holiday.date).toLocaleDateString()} • {holiday.type}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-200 border border-green-300 rounded mr-2"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                <span>Holiday</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
                <span>Excuse</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span>Reminder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingNote ? 'Edit Note' : 'Add Note'}
            </h3>
            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter note title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description (optional)..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={noteForm.type}
                  onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as CalendarNote['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="reminder">Reminder</option>
                  <option value="excuse">Student Excuse</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingNote ? 'Update' : 'Save'}
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
    </div>
  );
}