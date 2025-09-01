import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, StudentGrades, AttendanceRecord, CalendarNote, QuarterStudent } from '../types';

export function useDatabase(quarterId: string | null) {
  const [students, setStudents] = useState<Student[]>([]);
  const [quarterStudents, setQuarterStudents] = useState<QuarterStudent[]>([]);
  const [grades, setGrades] = useState<StudentGrades[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quarterId) {
      console.log('Database hook: Loading data for quarter:', quarterId);
      fetchAllData();
    } else {
      console.log('Database hook: No quarter selected, clearing data');
      setStudents([]);
      setQuarterStudents([]);
      setGrades([]);
      setAttendance([]);
      setCalendarNotes([]);
      setLoading(false);
    }
  }, [quarterId]);

  const fetchAllData = async () => {
    if (!quarterId) return;
    
    try {
      console.log('Fetching all data for quarter:', quarterId);
      setLoading(true);
      
      // Fetch data in parallel for better performance
      const [studentsResult, gradesResult, attendanceResult, notesResult] = await Promise.allSettled([
        fetchStudents(),
        fetchGrades(),
        fetchAttendance(),
        fetchCalendarNotes()
      ]);
      
      // Log any failures
      [studentsResult, gradesResult, attendanceResult, notesResult].forEach((result, index) => {
        const names = ['students', 'grades', 'attendance', 'notes'];
        if (result.status === 'rejected') {
          console.error(`Failed to fetch ${names[index]}:`, result.reason);
        } else {
          console.log(`Successfully fetched ${names[index]}`);
        }
      });
      
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      console.log('All data fetch completed');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!quarterId) return;

    console.log('Fetching students for quarter:', quarterId);
    const { data: quarterStudentsData, error: qsError } = await supabase
      .from('quarter_students')
      .select(`
        *,
        students (*)
      `)
      .eq('quarter_id', quarterId);

    if (qsError) {
      console.error('Students fetch error:', qsError);
      throw qsError;
    }

    console.log('Students data received:', quarterStudentsData?.length || 0);
    const studentsData = quarterStudentsData.map(qs => ({
      id: qs.students.id,
      firstName: qs.students.first_name,
      lastName: qs.students.last_name,
      studentId: qs.students.student_id,
      email: qs.students.email,
      enrollmentDate: qs.enrollment_date
    }));

    const quarterStudentsFormatted = quarterStudentsData.map(qs => ({
      id: qs.id,
      quarterId: qs.quarter_id,
      studentId: qs.student_id,
      enrollmentDate: qs.enrollment_date
    }));

    setStudents(studentsData);
    setQuarterStudents(quarterStudentsFormatted);
  };

  const fetchGrades = async () => {
    if (!quarterId) return;

    console.log('Fetching grades for quarter:', quarterId);
    const { data, error } = await supabase
      .from('student_grades')
      .select('*')
      .eq('quarter_id', quarterId);

    if (error) {
      console.error('Grades fetch error:', error);
      throw error;
    }

    console.log('Grades data received:', data?.length || 0);
    const formattedGrades = data.map(g => ({
      studentId: g.student_id,
      quarterId: g.quarter_id,
      grades: g.grades,
      totalScore: g.total_score,
      letterGrade: g.letter_grade
    }));

    setGrades(formattedGrades);
  };

  const fetchAttendance = async () => {
    if (!quarterId) return;

    console.log('Fetching attendance for quarter:', quarterId);
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('quarter_id', quarterId);

    if (error) {
      console.error('Attendance fetch error:', error);
      throw error;
    }

    console.log('Attendance data received:', data?.length || 0);
    const formattedAttendance = data.map(a => ({
      studentId: a.student_id,
      quarterId: a.quarter_id,
      date: a.date,
      status: a.status as 'present' | 'absent' | 'excused' | 'late',
      notes: a.notes || undefined
    }));

    setAttendance(formattedAttendance);
  };

  const fetchCalendarNotes = async () => {
    if (!quarterId) return;

    console.log('Fetching calendar notes for quarter:', quarterId);
    const { data, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .eq('quarter_id', quarterId);

    if (error) {
      console.error('Calendar notes fetch error:', error);
      throw error;
    }

    console.log('Calendar notes data received:', data?.length || 0);
    const formattedNotes = data.map(n => ({
      id: n.id,
      quarterId: n.quarter_id,
      date: n.date,
      title: n.title,
      description: n.description,
      type: n.type as 'excuse' | 'holiday' | 'reminder'
    }));

    setCalendarNotes(formattedNotes);
  };

  // Student operations
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    if (!quarterId) throw new Error('No active quarter');

    try {
      // First, create or get the student
      let studentId: string;
      
      // Check if student already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', studentData.studentId)
        .single();

      if (existingStudent) {
        studentId = existingStudent.id;
      } else {
        // Create new student
        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert({
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            student_id: studentData.studentId,
            email: studentData.email
          })
          .select()
          .single();

        if (studentError) throw studentError;
        studentId = newStudent.id;
      }

      // Add student to quarter
      const { error: quarterStudentError } = await supabase
        .from('quarter_students')
        .insert({
          quarter_id: quarterId,
          student_id: studentId,
          enrollment_date: studentData.enrollmentDate
        });

      if (quarterStudentError) throw quarterStudentError;

      await fetchStudents();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add student');
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: updatedStudent.firstName,
          last_name: updatedStudent.lastName,
          student_id: updatedStudent.studentId,
          email: updatedStudent.email
        })
        .eq('id', updatedStudent.id);

      if (error) throw error;

      await fetchStudents();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update student');
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!quarterId) return;

    try {
      // Remove from quarter (this will cascade delete related records)
      const { error } = await supabase
        .from('quarter_students')
        .delete()
        .eq('quarter_id', quarterId)
        .eq('student_id', studentId);

      if (error) throw error;

      await fetchAllData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  // Grade operations
  const updateGrades = async (studentGrades: StudentGrades) => {
    if (!quarterId) return;

    try {
      const { error } = await supabase
        .from('student_grades')
        .upsert({
          student_id: studentGrades.studentId,
          quarter_id: quarterId,
          grades: studentGrades.grades,
          total_score: studentGrades.totalScore,
          letter_grade: studentGrades.letterGrade,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await fetchGrades();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update grades');
    }
  };

  // Attendance operations
  const updateAttendance = async (record: AttendanceRecord) => {
    if (!quarterId) return;

    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          student_id: record.studentId,
          quarter_id: quarterId,
          date: record.date,
          status: record.status,
          notes: record.notes || null
        });

      if (error) throw error;

      await fetchAttendance();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update attendance');
    }
  };

  // Calendar operations
  const addCalendarNote = async (noteData: Omit<CalendarNote, 'id'>) => {
    if (!quarterId) return;

    try {
      const { error } = await supabase
        .from('calendar_notes')
        .insert({
          quarter_id: quarterId,
          date: noteData.date,
          title: noteData.title,
          description: noteData.description,
          type: noteData.type
        });

      if (error) throw error;

      await fetchCalendarNotes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add calendar note');
    }
  };

  const updateCalendarNote = async (updatedNote: CalendarNote) => {
    try {
      const { error } = await supabase
        .from('calendar_notes')
        .update({
          date: updatedNote.date,
          title: updatedNote.title,
          description: updatedNote.description,
          type: updatedNote.type
        })
        .eq('id', updatedNote.id);

      if (error) throw error;

      await fetchCalendarNotes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update calendar note');
    }
  };

  const deleteCalendarNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      await fetchCalendarNotes();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete calendar note');
    }
  };

  return {
    students,
    grades,
    attendance,
    calendarNotes,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    updateGrades,
    updateAttendance,
    addCalendarNote,
    updateCalendarNote,
    deleteCalendarNote,
    refetch: fetchAllData
  };
}