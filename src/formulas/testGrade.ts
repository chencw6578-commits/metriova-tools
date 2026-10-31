import { CalculationResult } from '../types.js';

export const calculateTestGrade = (inputs: Record<string, number>): CalculationResult => {
  const scoreEarned = inputs.scoreEarned ?? 85;
  const totalPoints = inputs.totalPoints ?? 100;

  // Calculate percentage
  const percentage = totalPoints > 0 ? (scoreEarned / totalPoints) * 100 : 0;

  // Determine letter grade (standard US grading scale)
  let letterGrade: string;
  let gpa: number;
  if (percentage >= 93) { letterGrade = 'A'; gpa = 4.0; }
  else if (percentage >= 90) { letterGrade = 'A-'; gpa = 3.7; }
  else if (percentage >= 87) { letterGrade = 'B+'; gpa = 3.3; }
  else if (percentage >= 83) { letterGrade = 'B'; gpa = 3.0; }
  else if (percentage >= 80) { letterGrade = 'B-'; gpa = 2.7; }
  else if (percentage >= 77) { letterGrade = 'C+'; gpa = 2.3; }
  else if (percentage >= 73) { letterGrade = 'C'; gpa = 2.0; }
  else if (percentage >= 70) { letterGrade = 'C-'; gpa = 1.7; }
  else if (percentage >= 67) { letterGrade = 'D+'; gpa = 1.3; }
  else if (percentage >= 63) { letterGrade = 'D'; gpa = 1.0; }
  else if (percentage >= 60) { letterGrade = 'D-'; gpa = 0.7; }
  else { letterGrade = 'F'; gpa = 0.0; }

  // Points needed for next grade up.
  //
  // The boundary list must be ASCENDING: `.find()` returns the FIRST element that
  // satisfies the predicate. With the old descending list, every score below 93
  // matched 93 immediately, so the tool reported "8 points to the next grade" for
  // an 85 (the real answer is 2, to reach 87) — i.e. all 10 grade steps were wrong.
  const gradeBoundaries = [60, 63, 67, 70, 73, 77, 80, 83, 87, 90, 93];
  const nextGradeUp = gradeBoundaries.find((b) => percentage < b);
  const pointsNeeded = nextGradeUp ? (nextGradeUp / 100) * totalPoints - scoreEarned : 0;

  // Points lost
  const pointsLost = totalPoints - scoreEarned;

  // Weighted impact (if this test is worth X% of total grade)
  const testWeight = inputs.testWeight ?? 100; // percentage of total grade this test represents
  const gradeImpact = (percentage * testWeight) / 100;

  return {
    summary: {
      percentage: { label: 'Grade Percentage', value: percentage, type: 'percentage' },
      letterGrade: { label: 'Letter Grade', value: letterGrade, type: 'string' },
      gpa: { label: 'GPA Equivalent (4.0 scale)', value: gpa, type: 'number' },
      pointsLost: { label: 'Points Lost', value: pointsLost, type: 'number' },
      pointsNeeded: { label: 'Points to Next Grade', value: Math.ceil(pointsNeeded * 10) / 10, type: 'number' },
      gradeImpact: { label: 'Weighted Grade Impact', value: Math.round(gradeImpact * 10) / 10, type: 'percentage' },
    },
  };
};