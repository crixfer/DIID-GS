import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Student, StudentGrades, AttendanceRecord } from '../types';

export function exportGradesToPDF(students: Student[], grades: StudentGrades[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('DIID GS - Student Grades Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  const tableData = students.map(student => {
    const studentGrade = grades.find(g => g.studentId === student.id);
    return [
      `${student.firstName} ${student.lastName}`,
      student.studentId,
      studentGrade?.totalScore.toFixed(2) || '0.00',
      studentGrade?.letterGrade || 'N/A'
    ];
  });
  
  autoTable(doc, {
    startY: 40,
    head: [['Student Name', 'Student ID', 'Total Score', 'Letter Grade']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] }
  });
  
  doc.save('english-grades-report.pdf');
}

export function exportGradesToExcel(students: Student[], grades: StudentGrades[]) {
  const data = students.map(student => {
    const studentGrade = grades.find(g => g.studentId === student.id);
    return {
      'Student Name': `${student.firstName} ${student.lastName}`,
      'Student ID': student.studentId,
      'Email': student.email,
      'Enrollment Date': student.enrollmentDate,
      'Period 1 - P&H': studentGrade?.grades.period1.participationHomework || 0,
      'Period 1 - Presentations': studentGrade?.grades.period1.presentations || 0,
      'Period 1 - Quizzes': studentGrade?.grades.period1.quizzes || 0,
      'Period 1 - Composition': studentGrade?.grades.period1.compositionExam || 0,
      'Period 1 - Oral': studentGrade?.grades.period1.oralExam || 0,
      'Period 2 - P&H': studentGrade?.grades.period2.participationHomework || 0,
      'Period 2 - Presentations': studentGrade?.grades.period2.presentations || 0,
      'Period 2 - Quizzes': studentGrade?.grades.period2.quizzes || 0,
      'Period 2 - Composition': studentGrade?.grades.period2.compositionExam || 0,
      'Period 2 - Oral': studentGrade?.grades.period2.oralExam || 0,
      'Final Oral Exam': studentGrade?.grades.finalPeriod.finalOralExam || 0,
      'Final Grammar Exam': studentGrade?.grades.finalPeriod.finalGrammarExam || 0,
      'Total Score': studentGrade?.totalScore.toFixed(2) || '0.00',
      'Letter Grade': studentGrade?.letterGrade || 'N/A'
    };
  });
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Student Grades');
  
  XLSX.writeFile(wb, 'english-grades-report.xlsx');
}

export function exportAttendanceToPDF(students: Student[], attendance: AttendanceRecord[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('DIID GS - Attendance Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  const attendanceData = students.map(student => {
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';
    
    return [
      `${student.firstName} ${student.lastName}`,
      student.studentId,
      totalDays.toString(),
      presentDays.toString(),
      `${attendanceRate}%`
    ];
  });
  
  autoTable(doc, {
    startY: 40,
    head: [['Student Name', 'Student ID', 'Total Days', 'Present Days', 'Attendance Rate']],
    body: attendanceData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] }
  });
  
  doc.save('english-attendance-report.pdf');
}