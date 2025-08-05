export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  enrollmentDate: string;
}

export interface GradeComponents {
  participationHomework: number; // 2% per period
  presentations: number; // 3% per period
  quizzes: number; // 5% per period
  compositionExam: number; // 10% per period
  oralExam: number; // 10% per period
}

export interface FinalGradeComponents {
  finalOralExam: number; // 10%
  finalGrammarExam: number; // 30%
}

export interface PeriodGrades {
  period1: GradeComponents;
  period2: GradeComponents;
  finalPeriod: FinalGradeComponents;
}

export interface StudentGrades {
  studentId: string;
  grades: PeriodGrades;
  totalScore: number;
  letterGrade: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
}

export interface CalendarNote {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'excuse' | 'holiday' | 'reminder';
  quarterId?: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'religious' | 'academic';
}

export interface Quarter {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  createdAt: string;
}

export interface QuarterStudent {
  id: string;
  quarterId: string;
  studentId: string;
  enrollmentDate: string;
}

// Update existing interfaces to include quarterId
export interface StudentGrades {
  studentId: string;
  quarterId: string;
  grades: PeriodGrades;
  totalScore: number;
  letterGrade: string;
}

export interface AttendanceRecord {
  studentId: string;
  quarterId: string;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
}</parameter>