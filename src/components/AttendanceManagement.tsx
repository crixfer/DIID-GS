import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceManagementProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
}

export function AttendanceManagement({ students, attendance, onUpdateAttendance }: AttendanceManagementProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<{ [studentId: string]: string }>({});

  const getAttendanceForDate = (studentId: string, date: string): AttendanceRecord | null => {
    return attendance.find(record => record.studentId === studentId && record.date === date) || null;
  };

  const handleAttendanceChange = (studentId: string, status: AttendanceRecord['status']) => {
    const record: AttendanceRecord = {
      studentId,
      date: selectedDate,
      status,
      notes: notes[studentId] || ''
    };
    onUpdateAttendance(record);
  };

  const handleNotesChange = (studentId: string, noteText: string) => {
    setNotes({ ...notes, [studentId]: noteText });
    
    // Update existing attendance record with notes
    const existingRecord = getAttendanceForDate(studentId, selectedDate);
    if (existingRecord) {
      onUpdateAttendance({
        ...existingRecord,
        notes: noteText
      });
    }
  };

  const getAttendanceStats = (studentId: string) => {
    const studentAttendance = attendance.filter(record => record.studentId === studentId);
    const total = studentAttendance.length;
    const present = studentAttendance.filter(record => record.status === 'present').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
    return { total, present, rate };
  };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
      case 'late':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'excused':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance Management</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Present Today</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">
                {attendance.filter(r => r.date === selectedDate && r.status === 'present').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Absent Today</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">
                {attendance.filter(r => r.date === selectedDate && r.status === 'absent').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Excused Today</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">
                {attendance.filter(r => r.date === selectedDate && r.status === 'excused').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Taking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Take Attendance - {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {students.map((student) => {
              const currentAttendance = getAttendanceForDate(student.id, selectedDate);
              const stats = getAttendanceStats(student.id);
              
              return (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col space-y-4">
                    {/* Student Info */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                        <p className="text-xs text-gray-500">
                          Attendance Rate: {stats.rate}% ({stats.present}/{stats.total})
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {(['present', 'absent', 'excused', 'late'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(student.id, status)}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentAttendance?.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">{status}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Notes Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={notes[student.id] || currentAttendance?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Attendance History</h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden divide-y divide-gray-200">
          {students.map((student) => {
            const studentAttendance = attendance.filter(record => record.studentId === student.id);
            const stats = {
              total: studentAttendance.length,
              present: studentAttendance.filter(r => r.status === 'present').length,
              absent: studentAttendance.filter(r => r.status === 'absent').length,
              excused: studentAttendance.filter(r => r.status === 'excused').length,
              late: studentAttendance.filter(r => r.status === 'late').length
            };
            const rate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0';
            
            return (
              <div key={student.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    parseFloat(rate) >= 90 ? 'bg-green-100 text-green-800' :
                    parseFloat(rate) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {rate}%
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{stats.present}</div>
                    <div className="text-xs text-gray-500">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{stats.absent}</div>
                    <div className="text-xs text-gray-500">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{stats.excused}</div>
                    <div className="text-xs text-gray-500">Excused</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-orange-600">{stats.late}</div>
                    <div className="text-xs text-gray-500">Late</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Excused
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const studentAttendance = attendance.filter(record => record.studentId === student.id);
                const stats = {
                  total: studentAttendance.length,
                  present: studentAttendance.filter(r => r.status === 'present').length,
                  absent: studentAttendance.filter(r => r.status === 'absent').length,
                  excused: studentAttendance.filter(r => r.status === 'excused').length,
                  late: studentAttendance.filter(r => r.status === 'late').length
                };
                const rate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{student.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stats.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {stats.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {stats.absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      {stats.excused}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                      {stats.late}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseFloat(rate) >= 90 ? 'bg-green-100 text-green-800' :
                        parseFloat(rate) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}