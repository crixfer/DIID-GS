import React from 'react';
import { Users, GraduationCap, Calendar, TrendingUp, Award, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Student, StudentGrades, AttendanceRecord } from '../types';
import { calculateTotalScore, getLetterGrade } from '../utils/gradeCalculations';

interface DashboardProps {
  students: Student[];
  grades: StudentGrades[];
  attendance: AttendanceRecord[];
}

export function Dashboard({ students, grades, attendance }: DashboardProps) {
  // Calculate statistics
  const totalStudents = students.length;
  const averageGrade = grades.length > 0 
    ? grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length 
    : 0;
  
  const gradeDistribution = grades.reduce((acc, grade) => {
    const letter = grade.letterGrade;
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const attendanceRate = attendance.length > 0
    ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
    : 0;

  const gradeChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    grade,
    count,
    color: getGradeColor(grade)
  }));

  const performanceData = [
    { period: 'Period 1', average: calculatePeriodAverage('period1') },
    { period: 'Period 2', average: calculatePeriodAverage('period2') },
    { period: 'Final', average: calculateFinalAverage() }
  ];

  function calculatePeriodAverage(period: 'period1' | 'period2'): number {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, g) => {
      const periodGrades = g.grades[period];
      const periodScore = (
        periodGrades.participationHomework * 2 +
        periodGrades.presentations * 3 +
        periodGrades.quizzes * 5 +
        periodGrades.compositionExam * 10 +
        periodGrades.oralExam * 10
      ) / 30 * 100;
      return sum + periodScore;
    }, 0) / grades.length;
  }

  function calculateFinalAverage(): number {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, g) => {
      const finalGrades = g.grades.finalPeriod;
      const finalScore = (
        finalGrades.finalOralExam * 10 +
        finalGrades.finalGrammarExam * 30
      ) / 40 * 100;
      return sum + finalScore;
    }, 0) / grades.length;
  }

  function getGradeColor(letter: string): string {
    switch (letter) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  }

  const pieChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    name: grade,
    value: count,
    color: getGradeColor(grade)
  }));

  // Show message when no data is available
  const hasGradeData = grades.length > 0 && Object.keys(gradeDistribution).length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Average Grade</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{averageGrade.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Attendance Rate</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{attendanceRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Top Performers</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{gradeDistribution['A'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Performance by Period</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          {hasGradeData ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Grade Data</p>
                <p className="text-sm">Add students and enter grades to see distribution</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>System initialized - Welcome to DIID GS</span>
          </div>
          <div className="flex items-start text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{totalStudents} students registered in the system</span>
          </div>
          <div className="flex items-start text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Grade tracking system ready for input</span>
          </div>
        </div>
      </div>
    </div>
  );
}