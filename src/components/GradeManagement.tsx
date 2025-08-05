import React, { useState } from 'react';
import { Search, Calculator, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Student, StudentGrades, GradeComponents, FinalGradeComponents } from '../types';
import { calculateTotalScore, getLetterGrade, getGradeColor, GRADE_WEIGHTS } from '../utils/gradeCalculations';

interface GradeManagementProps {
  students: Student[];
  grades: StudentGrades[];
  onUpdateGrades: (studentGrades: StudentGrades) => void;
}

export function GradeManagement({ students, grades, onUpdateGrades }: GradeManagementProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGradingInfo, setShowGradingInfo] = useState(false);

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentGrades = (studentId: string): StudentGrades => {
    return grades.find(g => g.studentId === studentId) || {
      studentId,
      grades: {
        period1: { participationHomework: 0, presentations: 0, quizzes: 0, compositionExam: 0, oralExam: 0 },
        period2: { participationHomework: 0, presentations: 0, quizzes: 0, compositionExam: 0, oralExam: 0 },
        finalPeriod: { finalOralExam: 0, finalGrammarExam: 0 }
      },
      totalScore: 0,
      letterGrade: 'F'
    };
  };

  const handleGradeUpdate = (studentId: string, period: 'period1' | 'period2', field: keyof GradeComponents, value: number) => {
    const currentGrades = getStudentGrades(studentId);
    const updatedGrades = {
      ...currentGrades,
      grades: {
        ...currentGrades.grades,
        [period]: {
          ...currentGrades.grades[period],
          [field]: Math.min(100, Math.max(0, value))
        }
      }
    };
    
    updatedGrades.totalScore = calculateTotalScore(updatedGrades.grades);
    updatedGrades.letterGrade = getLetterGrade(updatedGrades.totalScore);
    
    onUpdateGrades(updatedGrades);
  };

  const handleFinalGradeUpdate = (studentId: string, field: keyof FinalGradeComponents, value: number) => {
    const currentGrades = getStudentGrades(studentId);
    const updatedGrades = {
      ...currentGrades,
      grades: {
        ...currentGrades.grades,
        finalPeriod: {
          ...currentGrades.grades.finalPeriod,
          [field]: Math.min(100, Math.max(0, value))
        }
      }
    };
    
    updatedGrades.totalScore = calculateTotalScore(updatedGrades.grades);
    updatedGrades.letterGrade = getLetterGrade(updatedGrades.totalScore);
    
    onUpdateGrades(updatedGrades);
  };

  const selectedStudentData = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  const selectedStudentGrades = selectedStudent ? getStudentGrades(selectedStudent) : null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Grade Management</h2>
        <div className="flex items-center text-sm text-gray-600">
          <Calculator className="h-4 w-4 mr-2" />
          Total Weight: 100%
        </div>
      </div>

      {/* Grading Structure Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200">
        <button
          onClick={() => setShowGradingInfo(!showGradingInfo)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="text-base sm:text-lg font-semibold text-blue-900">Grading Structure</h3>
          {showGradingInfo ? (
            <ChevronUp className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600" />
          )}
        </button>
        
        {showGradingInfo && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Period 1 & 2 (30% each)</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Participation & Homework: 2%</li>
                  <li>• Presentations: 3%</li>
                  <li>• Quizzes: 5%</li>
                  <li>• Composition Exam: 10%</li>
                  <li>• Oral Exam: 10%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Final Period (40%)</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Final Oral Exam: 10%</li>
                  <li>• Final Grammar Exam: 30%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Letter Grades</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• A: 90-100%</li>
                  <li>• B: 80-89%</li>
                  <li>• C: 70-79%</li>
                  <li>• D: 60-69%</li>
                  <li>• F: Below 60%</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Selection */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const studentGrades = getStudentGrades(student.id);
            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedStudent === student.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{student.studentId}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-lg font-semibold ${getGradeColor(studentGrades.letterGrade)}`}>
                      {studentGrades.letterGrade}
                    </div>
                    <div className="text-sm text-gray-600">
                      {studentGrades.totalScore.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Input Form */}
      {selectedStudentData && selectedStudentGrades && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Grades for {selectedStudentData.firstName} {selectedStudentData.lastName}
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xl sm:text-2xl font-bold ${getGradeColor(selectedStudentGrades.letterGrade)}`}>
                  {selectedStudentGrades.letterGrade}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedStudentGrades.totalScore.toFixed(2)}%
                </div>
              </div>
              <Award className={`h-6 w-6 sm:h-8 sm:w-8 ${getGradeColor(selectedStudentGrades.letterGrade)}`} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Period 1 */}
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Period 1 (30%)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(GRADE_WEIGHTS.period1).map(([field, weight]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} ({weight}%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedStudentGrades.grades.period1[field as keyof GradeComponents]}
                      onChange={(e) => handleGradeUpdate(
                        selectedStudent,
                        'period1',
                        field as keyof GradeComponents,
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Period 2 */}
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Period 2 (30%)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(GRADE_WEIGHTS.period2).map(([field, weight]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} ({weight}%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedStudentGrades.grades.period2[field as keyof GradeComponents]}
                      onChange={(e) => handleGradeUpdate(
                        selectedStudent,
                        'period2',
                        field as keyof GradeComponents,
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Final Period */}
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Final Period (40%)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(GRADE_WEIGHTS.finalPeriod).map(([field, weight]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} ({weight}%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedStudentGrades.grades.finalPeriod[field as keyof FinalGradeComponents]}
                      onChange={(e) => handleFinalGradeUpdate(
                        selectedStudent,
                        field as keyof FinalGradeComponents,
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Students Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Grade Overview</h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden divide-y divide-gray-200">
          {students.map((student) => {
            const studentGrades = getStudentGrades(student.id);
            return (
              <div key={student.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      studentGrades.letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                      studentGrades.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                      studentGrades.letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      studentGrades.letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {studentGrades.letterGrade}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">
                      {studentGrades.totalScore.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">P1:</span>
                    <span className="ml-1 font-medium">
                      {((studentGrades.grades.period1.participationHomework * 2 +
                         studentGrades.grades.period1.presentations * 3 +
                         studentGrades.grades.period1.quizzes * 5 +
                         studentGrades.grades.period1.compositionExam * 10 +
                         studentGrades.grades.period1.oralExam * 10) / 30).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">P2:</span>
                    <span className="ml-1 font-medium">
                      {((studentGrades.grades.period2.participationHomework * 2 +
                         studentGrades.grades.period2.presentations * 3 +
                         studentGrades.grades.period2.quizzes * 5 +
                         studentGrades.grades.period2.compositionExam * 10 +
                         studentGrades.grades.period2.oralExam * 10) / 30).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Final:</span>
                    <span className="ml-1 font-medium">
                      {((studentGrades.grades.finalPeriod.finalOralExam * 10 +
                         studentGrades.grades.finalPeriod.finalGrammarExam * 30) / 40).toFixed(1)}%
                    </span>
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
                  Period 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const studentGrades = getStudentGrades(student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{student.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((studentGrades.grades.period1.participationHomework * 2 +
                         studentGrades.grades.period1.presentations * 3 +
                         studentGrades.grades.period1.quizzes * 5 +
                         studentGrades.grades.period1.compositionExam * 10 +
                         studentGrades.grades.period1.oralExam * 10) / 30).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((studentGrades.grades.period2.participationHomework * 2 +
                         studentGrades.grades.period2.presentations * 3 +
                         studentGrades.grades.period2.quizzes * 5 +
                         studentGrades.grades.period2.compositionExam * 10 +
                         studentGrades.grades.period2.oralExam * 10) / 30).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((studentGrades.grades.finalPeriod.finalOralExam * 10 +
                         studentGrades.grades.finalPeriod.finalGrammarExam * 30) / 40).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {studentGrades.totalScore.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        studentGrades.letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                        studentGrades.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                        studentGrades.letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        studentGrades.letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {studentGrades.letterGrade}
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