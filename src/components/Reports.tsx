import React from 'react';
import { Download, FileText, Users, BarChart } from 'lucide-react';
import { Student, StudentGrades, AttendanceRecord } from '../types';
import { exportGradesToPDF, exportGradesToExcel, exportAttendanceToPDF } from '../utils/exportUtils';

interface ReportsProps {
  students: Student[];
  grades: StudentGrades[];
  attendance: AttendanceRecord[];
}

export function Reports({ students, grades, attendance }: ReportsProps) {
  const handleExportGradesPDF = () => {
    exportGradesToPDF(students, grades);
  };

  const handleExportGradesExcel = () => {
    exportGradesToExcel(students, grades);
  };

  const handleExportAttendancePDF = () => {
    exportAttendanceToPDF(students, attendance);
  };

  // Calculate summary statistics
  const totalStudents = students.length;
  const averageGrade = grades.length > 0 ? grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length : 0;
  const attendanceRate = attendance.length > 0 
    ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100 
    : 0;

  const gradeDistribution = grades.reduce((acc, grade) => {
    const letter = grade.letterGrade;
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPerformers = grades
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5)
    .map(grade => {
      const student = students.find(s => s.id === grade.studentId);
      return { student, grade };
    })
    .filter(item => item.student);

  const lowPerformers = grades
    .filter(g => g.totalScore < 70)
    .sort((a, b) => a.totalScore - b.totalScore)
    .slice(0, 5)
    .map(grade => {
      const student = students.find(s => s.id === grade.studentId);
      return { student, grade };
    })
    .filter(item => item.student);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="text-sm text-gray-500">
          Generated on: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Grade Reports</h3>
              <p className="text-sm text-gray-600">Export student grades and performance data</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleExportGradesPDF}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </button>
            <button
              onClick={handleExportGradesExcel}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <BarChart className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Reports</h3>
              <p className="text-sm text-gray-600">Export attendance records and statistics</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleExportAttendancePDF}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Summary Report</h3>
              <p className="text-sm text-gray-600">Complete overview of all data</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                // Generate comprehensive report
                console.log('Generating comprehensive report...');
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BarChart className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Class Average</p>
              <p className="text-2xl font-semibold text-gray-900">{averageGrade.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">A Students</p>
              <p className="text-2xl font-semibold text-gray-900">{gradeDistribution['A'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {['A', 'B', 'C', 'D', 'F'].map((grade) => (
            <div key={grade} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${
                grade === 'A' ? 'bg-green-100 text-green-800' :
                grade === 'B' ? 'bg-blue-100 text-blue-800' :
                grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                grade === 'D' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {gradeDistribution[grade] || 0}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-900">{grade}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map(({ student, grade }, index) => (
              <div key={student?.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    #{index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {student?.firstName} {student?.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{student?.studentId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">{grade.letterGrade}</div>
                  <div className="text-sm text-gray-600">{grade.totalScore.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Needing Support */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students Needing Support</h3>
          <div className="space-y-3">
            {lowPerformers.length > 0 ? (
              lowPerformers.map(({ student, grade }) => (
                <div key={student?.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {student?.firstName} {student?.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{student?.studentId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-600">{grade.letterGrade}</div>
                    <div className="text-sm text-gray-600">{grade.totalScore.toFixed(1)}%</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>All students are performing well!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Grade Breakdown</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Period 1 weights: 30% total</li>
              <li>• Period 2 weights: 30% total</li>
              <li>• Final period: 40% total</li>
              <li>• All components sum to 100%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Status</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• {students.length} students registered</li>
              <li>• {grades.length} grade records</li>
              <li>• {attendance.length} attendance entries</li>
              <li>• System ready for export</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Options</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• PDF reports for presentations</li>
              <li>• Excel files for data analysis</li>
              <li>• Attendance summaries</li>
              <li>• Comprehensive overviews</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}