import { GradeComponents, FinalGradeComponents, PeriodGrades } from '../types';

export const GRADE_WEIGHTS = {
  period1: {
    participationHomework: 2,
    presentations: 3,
    quizzes: 5,
    compositionExam: 10,
    oralExam: 10
  },
  period2: {
    participationHomework: 2,
    presentations: 3,
    quizzes: 5,
    compositionExam: 10,
    oralExam: 10
  },
  finalPeriod: {
    finalOralExam: 10,
    finalGrammarExam: 30
  }
};

export function calculatePeriodScore(grades: GradeComponents, isRegularPeriod: boolean = true): number {
  if (isRegularPeriod) {
    const weights = GRADE_WEIGHTS.period1;
    return (
      (grades.participationHomework * weights.participationHomework) +
      (grades.presentations * weights.presentations) +
      (grades.quizzes * weights.quizzes) +
      (grades.compositionExam * weights.compositionExam) +
      (grades.oralExam * weights.oralExam)
    ) / 100;
  }
  return 0;
}

export function calculateFinalPeriodScore(grades: FinalGradeComponents): number {
  const weights = GRADE_WEIGHTS.finalPeriod;
  return (
    (grades.finalOralExam * weights.finalOralExam) +
    (grades.finalGrammarExam * weights.finalGrammarExam)
  ) / 100;
}

export function calculateTotalScore(grades: PeriodGrades): number {
  const period1Score = calculatePeriodScore(grades.period1);
  const period2Score = calculatePeriodScore(grades.period2);
  const finalScore = calculateFinalPeriodScore(grades.finalPeriod);
  
  return period1Score + period2Score + finalScore;
}

export function getLetterGrade(totalScore: number): string {
  if (totalScore >= 90) return 'A';
  if (totalScore >= 80) return 'B';
  if (totalScore >= 70) return 'C';
  if (totalScore >= 60) return 'D';
  return 'F';
}

export function getGradeColor(letterGrade: string): string {
  switch (letterGrade) {
    case 'A': return 'text-green-600';
    case 'B': return 'text-blue-600';
    case 'C': return 'text-yellow-600';
    case 'D': return 'text-orange-600';
    case 'F': return 'text-red-600';
    default: return 'text-gray-600';
  }
}