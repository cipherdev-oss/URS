/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pillar, Activity, StudentActivity, ScoreBreakdown } from "../types";

export const ACTIVITIES: Activity[] = [
  // Pillar 1: Academic
  { id: "gpa_5", pillar: Pillar.Academic, name: "GPA in top 5% of batch", base: 40, step: 0, floor: 40, type: "Milestone" },
  { id: "gpa_10", pillar: Pillar.Academic, name: "GPA in top 10% of batch", base: 25, step: 0, floor: 25, type: "Milestone" },
  { id: "gpa_20", pillar: Pillar.Academic, name: "GPA in top 20% of batch", base: 15, step: 0, floor: 15, type: "Milestone" },
  { id: "paper", pillar: Pillar.Academic, name: "Published paper (IEEE/Springer/Elsevier)", base: 30, step: 3, floor: 15, type: "Active", hardCap: 60 },
  { id: "conf", pillar: Pillar.Academic, name: "Presented paper at recognized conference", base: 15, step: 2, floor: 5, type: "Active", hardCap: 30 },
  { id: "ta", pillar: Pillar.Academic, name: "Teaching Assistant (per semester)", base: 15, step: 2, floor: 5, type: "Active", hardCap: 30 },
  { id: "dean", pillar: Pillar.Academic, name: "Dean's List / Honor Roll", base: 20, step: 0, floor: 20, type: "Milestone" },

  // Pillar 2: Leadership & Organization
  { id: "su_pres", pillar: Pillar.Leadership, name: "Student Union President", base: 40, step: 4, floor: 20, type: "Active" },
  { id: "soc_pres", pillar: Pillar.Leadership, name: "Society President / Executive Head", base: 30, step: 3, floor: 15, type: "Active" },
  { id: "vp_sec_treas", pillar: Pillar.Leadership, name: "VP / Secretary / Treasurer", base: 20, step: 2, floor: 10, type: "Active" },
  { id: "exec_comm", pillar: Pillar.Leadership, name: "Executive Committee Member", base: 15, step: 2, floor: 5, type: "Active" },
  { id: "batch_rep", pillar: Pillar.Leadership, name: "Batch Representative", base: 15, step: 2, floor: 5, type: "Active" },
  { id: "sub_comm", pillar: Pillar.Leadership, name: "Sub-committee Active Member", base: 5, step: 1, floor: 1, type: "Passive", hardCap: 15 },

  // Pillar 3: Arts, Culture & Sports
  { id: "sports_int", pillar: Pillar.ArtsSports, name: "National / International sports representation", base: 40, step: 4, floor: 20, type: "Active" },
  { id: "sports_gold", pillar: Pillar.ArtsSports, name: "Inter-faculty Gold Medal", base: 25, step: 3, floor: 10, type: "Active" },
  { id: "sports_silver", pillar: Pillar.ArtsSports, name: "Inter-faculty Silver / Bronze", base: 15, step: 2, floor: 5, type: "Active" },
  { id: "team_captain", pillar: Pillar.ArtsSports, name: "Team Captain / Vice Captain", base: 15, step: 2, floor: 5, type: "Active" },
  { id: "squad", pillar: Pillar.ArtsSports, name: "Squad Member", base: 10, step: 1, floor: 2, type: "Passive", hardCap: 30 },
  { id: "lead_director", pillar: Pillar.ArtsSports, name: "Lead Director / Music Act (university-wide)", base: 20, step: 2, floor: 10, type: "Active" },
  { id: "ensemble_member", pillar: Pillar.ArtsSports, name: "Ensemble / Orchestra Member", base: 10, step: 1, floor: 2, type: "Passive" },
  { id: "stage_crew_lead", pillar: Pillar.ArtsSports, name: "Stage / Technical Crew Lead", base: 10, step: 1, floor: 2, type: "Active" },

  // Pillar 4: Technology, Innovation & Hackathons
  { id: "hack_win_int", pillar: Pillar.TechInnovation, name: "International Hackathon Winner (Top 3)", base: 35, step: 4, floor: 18, type: "Active" },
  { id: "hack_win_nat", pillar: Pillar.TechInnovation, name: "National / Regional Hackathon Winner", base: 25, step: 3, floor: 13, type: "Active" },
  { id: "hack_finalist_int", pillar: Pillar.TechInnovation, name: "International Hackathon Finalist", base: 20, step: 2, floor: 10, type: "Active" },
  { id: "hack_finalist_nat", pillar: Pillar.TechInnovation, name: "National Hackathon Finalist", base: 15, step: 2, floor: 8, type: "Active" },
  { id: "hack_part", pillar: Pillar.TechInnovation, name: "Hackathon Participation (with project submission)", base: 3, step: 1, floor: 1, type: "Passive", hardCap: 12 },
  { id: "oss_contrib", pillar: Pillar.TechInnovation, name: "Significant Open Source Contribution", base: 20, step: 2, floor: 10, type: "Active", hardCap: 40 },
  { id: "pub_dev_tool", pillar: Pillar.TechInnovation, name: "Published Developer Tool / CLI / Security Tool", base: 15, step: 2, floor: 8, type: "Active", hardCap: 30 },
  { id: "ctf_local", pillar: Pillar.TechInnovation, name: "CTF Competition Ranking (Local)", base: 15, step: 2, floor: 8, type: "Active" },
  { id: "ctf_nat", pillar: Pillar.TechInnovation, name: "CTF Competition Ranking (National)", base: 20, step: 2, floor: 10, type: "Active" },
  { id: "ctf_int", pillar: Pillar.TechInnovation, name: "CTF Competition Ranking (International)", base: 30, step: 3, floor: 15, type: "Active" },
  { id: "cert", pillar: Pillar.TechInnovation, name: "Industry Certification (AWS/Azure/GCP/Security+/etc.)", base: 10, step: 0, floor: 10, type: "Milestone", hardCap: 20 },

  // Pillar 5: Community, Volunteering & Life Skills
  { id: "org_tech_ws", pillar: Pillar.Community, name: "Organized technical workshop for juniors", base: 15, step: 2, floor: 5, type: "Active", hardCap: 30 },
  { id: "org_non_tech_ws", pillar: Pillar.Community, name: "Organized non-technical workshop", base: 10, step: 1, floor: 3, type: "Active", hardCap: 20 },
  { id: "attended_ext_ws", pillar: Pillar.Community, name: "Attended external workshop / bootcamp", base: 3, step: 1, floor: 1, type: "Passive", hardCap: 15 },
  { id: "peer_end", pillar: Pillar.Community, name: "Peer Endorsement (structured)", base: 7, step: 1, floor: 2, type: "Active", hardCap: 20 },
  { id: "community_volunteering", pillar: Pillar.Community, name: "Community volunteering (outside LNBTI)", base: 10, step: 1, floor: 3, type: "Active", hardCap: 20 },
  { id: "guest_lec", pillar: Pillar.Community, name: "Industry talk / Guest lecture attendance", base: 2, step: 0.5, floor: 1, type: "Passive", hardCap: 10 },
];

export function getEffectiveActivities(customOrAllActivities: Activity[] = []): Activity[] {
  const map = new Map<string, Activity>();
  // Base defaults
  ACTIVITIES.forEach(a => map.set(a.id, a));
  // Overrides / custom
  customOrAllActivities.forEach(a => map.set(a.id, a));
  return Array.from(map.values());
}

export function getMaxCountForActivity(act: Activity): number {
  if (act.type === 'Milestone') return 1;
  if (act.hardCap !== undefined && act.hardCap > 0) {
    let total = 0;
    let count = 0;
    while (total < act.hardCap && count < 100) {
      count++;
      const pts = calculateDRPoints(act, count);
      total += pts;
      if (total >= act.hardCap) return count;
    }
    return Math.max(1, count);
  }
  return Infinity;
}

export function calculateDRPoints(activity: Activity, n: number): number {
  if (n <= 0) return 0;
  // Points for the Nth repetition = max(FLOOR, BASE - (N - 1) * STEP)
  return Math.max(activity.floor, activity.base - (n - 1) * activity.step);
}

export function calculatePillarScore(pillar: Pillar, studentActivities: StudentActivity[], customActivities: Activity[] = []): number {
  const allActivities = getEffectiveActivities(customActivities);

  const pillarActivities = studentActivities.filter(sa => {
    const act = allActivities.find(a => a.id === sa.activityId);
    return act?.pillar === pillar;
  });

  const totalsByActivityId: Record<string, number> = {};

  pillarActivities.forEach(sa => {
    const act = allActivities.find(a => a.id === sa.activityId);
    if (!act) return;

    let points = 0;
    for (let i = 1; i <= sa.count; i++) {
      points += calculateDRPoints(act, i);
    }

    if (act.hardCap !== undefined && act.hardCap > 0) {
      points = Math.min(points, act.hardCap);
    }

    totalsByActivityId[sa.activityId] = (totalsByActivityId[sa.activityId] || 0) + points;
  });

  // Special rule: GPA Tiers (Pillar 1) are non-stacking
  if (pillar === Pillar.Academic) {
    const gpaTiers = ["gpa_5", "gpa_10", "gpa_20"];
    let maxGpaPoints = 0;
    gpaTiers.forEach(id => {
      if (totalsByActivityId[id]) {
        maxGpaPoints = Math.max(maxGpaPoints, totalsByActivityId[id]);
        delete totalsByActivityId[id];
      }
    });
    return Object.values(totalsByActivityId).reduce((sum, p) => sum + p, 0) + maxGpaPoints;
  }

  return Object.values(totalsByActivityId).reduce((sum, p) => sum + p, 0);
}

export function calculateCappedScores(rawScores: Record<Pillar, number>): Record<Pillar, number> {
  const pillars = Object.values(Pillar);
  let capped: number[] = pillars.map(p => rawScores[p]);
  const raw: number[] = [...capped];
  const TOLERANCE = 0.01;
  const MAX_ITERATIONS = 50;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const total = capped.reduce((sum, v) => sum + v, 0);
    const nextCapped = [...capped];
    
    for (let i = 0; i < pillars.length; i++) {
      const others_i = total - capped[i];
      const limit_i = (2 / 3) * others_i;
      nextCapped[i] = Math.min(raw[i], limit_i);
    }

    const maxDiff = Math.max(...nextCapped.map((v, i) => Math.abs(v - capped[i])));
    capped = nextCapped;

    if (maxDiff < TOLERANCE) break;
  }

  const result: any = {};
  pillars.forEach((p, i) => {
    result[p] = Math.round(capped[i] * 100) / 100;
  });
  return result;
}

export function calculateScoreBreakdown(studentActivities: StudentActivity[], customActivities: Activity[] = []): ScoreBreakdown {
  const allActivities = getEffectiveActivities(customActivities);
  const raw: any = {};
  Object.values(Pillar).forEach(p => {
    raw[p] = calculatePillarScore(p, studentActivities, allActivities);
  });

  const capped = calculateCappedScores(raw);
  const totalRaw = Object.values(raw).reduce((s, v: any) => s + v, 0) as number;
  const totalCapped = Object.values(capped).reduce((s, v: any) => s + v, 0) as number;

  const pillarsPassingGate = Object.values(Pillar).filter(p => raw[p] >= 20);
  const passesBalanceGate = pillarsPassingGate.length >= 4;

  const minPillar = Math.min(...Object.values(capped) as number[]);
  let bonus = 0;
  if (passesBalanceGate) {
    if (minPillar >= 20 && minPillar <= 30) {
      bonus = 0.05 + (0.05 * (minPillar - 20)) / 10;
    } else if (minPillar > 30) {
      bonus = 0.10;
    }
  }

  const finalScore = Math.round(totalCapped * (1 + bonus) * 100) / 100;

  return {
    raw,
    capped,
    totalRaw,
    totalCapped,
    bonus,
    minPillar,
    finalScore,
    passesBalanceGate,
    pillarsPassingGate
  };
}

import { Student } from "../types";

export function rankStudents(students: Student[], customActivities: Activity[] = []): { student: Student; breakdown: ScoreBreakdown; rank: number }[] {
  const scored = students.map(s => ({
    student: s,
    breakdown: calculateScoreBreakdown(s.activities, customActivities)
  }));

  // Tie-breaking rules (§4.4):
  // 1. Higher total score
  // 2. Higher minimum pillar score
  // 3. Earlier submission timestamp
  // 4. Alphabetical Student Name (as proxy for ID)
  
  return scored
    .sort((a, b) => {
      // 1. Final Score
      if (b.breakdown.finalScore !== a.breakdown.finalScore) {
        return b.breakdown.finalScore - a.breakdown.finalScore;
      }
      // 2. Higher min pillar score
      if (b.breakdown.minPillar !== a.breakdown.minPillar) {
        return b.breakdown.minPillar - a.breakdown.minPillar;
      }
      // 3. Earlier timestamp
      if (a.student.submissionTimestamp !== b.student.submissionTimestamp) {
        return a.student.submissionTimestamp - b.student.submissionTimestamp;
      }
      // 4. Name
      return a.student.name.localeCompare(b.student.name);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}
