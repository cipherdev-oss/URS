/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Pillar {
  Academic = "Academic",
  Leadership = "Leadership",
  ArtsSports = "Arts, Culture & Sports",
  TechInnovation = "Technology & Innovation",
  Community = "Community & Volunteering"
}

export type ActivityType = "Passive" | "Active" | "Milestone";

export interface Activity {
  id: string;
  pillar: Pillar;
  name: string;
  base: number;
  step: number;
  floor: number;
  type: ActivityType;
  hardCap?: number;
  internalOnly?: boolean;
}

export interface StudentActivity {
  activityId: string;
  count: number;
  timestamp: number;
}

export enum YearGroup {
  First = "1st Year",
  Second = "2nd Year",
  Third = "3rd Year",
  Fourth = "4th Year"
}

export interface Student {
  id: string;
  name: string;
  yearGroup: YearGroup;
  activities: StudentActivity[];
  submissionTimestamp: number;
}

export interface AppState {
  students: Student[];
  customActivities: Activity[];
}

export interface ScoreBreakdown {
  raw: Record<Pillar, number>;
  capped: Record<Pillar, number>;
  totalRaw: number;
  totalCapped: number;
  bonus: number;
  minPillar: number;
  finalScore: number;
  passesBalanceGate: boolean;
  pillarsPassingGate: Pillar[];
}
