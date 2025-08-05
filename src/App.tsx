import React, { useState } from 'react';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { GradeManagement } from './components/GradeManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { CalendarView } from './components/CalendarView';
import { Reports } from './components/Reports';
import { QuarterManagement } from './components/QuarterManagement';
import { DatabaseSetup } from './components/DatabaseSetup';
import { AuthForm } from './components/AuthForm';
import { useDatabase } from './hooks/useDatabase';
import { useAuth } from './hooks/useAuth';
import { useQuarters } from './hooks/useQuarters';
import { Quarter } from './types';

function App() {
  console.log('App component rendering...');
  
  const { user, teacher, loading: authLoading } = useAuth();
  const { activeQuarter } = useQuarters();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [activeTab, setActiveTab] = useState('quarters');
  
  // Use selected quarter or fall back to active quarter
  const currentQuarter = selectedQuarter || activeQuarter;
  
  const {
    students,
    grades,
    attendance,
    calendarNotes,
    loading: dataLoading,
    error: dataError,
    addStudent,
    updateStudent,
    deleteStudent,
    updateGrades,
    updateAttendance,
    addCalendarNote,
    updateCalendarNote,
    deleteCalendarNote
  } = useDatabase(currentQuarter?.id || null);

  // Set initial quarter when active quarter is loaded
  React.useEffect(() => {
    if (activeQuarter && !selectedQuarter) {
      setSelectedQuarter(activeQuarter);
      if (activeTab === 'quarters') {
        setActiveTab('dashboard');
      }
    }
  }, [activeQuarter, selectedQuarter, activeTab]);

  // Show loading screen while checking authentication
  if (authLoading) {
    console.log('Showing auth loading screen...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DIID GS...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user || !teacher) {
    console.log('Showing auth form...');
    return <AuthForm />;
  }

  // Check if Supabase is properly configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('Showing database setup...');
    return <DatabaseSetup />;
  }

  const handleQuarterSelect = (quarter: Quarter | null) => {
    setSelectedQuarter(quarter);
    if (quarter && activeTab === 'quarters') {
      setActiveTab('dashboard');
    }
  };

  const renderContent = () => {
    // Always show quarter management if no quarter is selected
    if (!currentQuarter || activeTab === 'quarters') {
      return (
        <QuarterManagement
          onQuarterSelect={handleQuarterSelect}
          selectedQuarter={selectedQuarter}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            grades={grades}
            attendance={attendance}
          />
        );
      case 'students':
        return (
          <StudentManagement
            students={students}
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={deleteStudent}
          />
        );
      case 'grades':
        return (
          <GradeManagement
            students={students}
            grades={grades}
            onUpdateGrades={updateGrades}
          />
        );
      case 'attendance':
        return (
          <AttendanceManagement
            students={students}
            attendance={attendance}
            onUpdateAttendance={updateAttendance}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            notes={calendarNotes}
            onAddNote={addCalendarNote}
            onUpdateNote={updateCalendarNote}
            onDeleteNote={deleteCalendarNote}
          />
        );
      case 'reports':
        return (
          <Reports
            students={students}
            grades={grades}
            attendance={attendance}
          />
        );
      default:
        return (
          <Dashboard
            students={students}
            grades={grades}
            attendance={attendance}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus />
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedQuarter={selectedQuarter}
        onQuarterSelect={handleQuarterSelect}
      />
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;