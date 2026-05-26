import { siteConfig } from "@/lib/config";
import type { DashboardSnapshot, FailureEvent, MissionSettings, Post, Profile } from "@/lib/types";

export const adminProfile: Profile = {
  id: "admin-demo-micheal",
  username: siteConfig.adminUsername,
  displayName: "Micheal",
  role: "admin",
  avatarUrl: null,
  bannerUrl: null,
  bio: "10th grade operator. Building the MIT arc one logged day at a time.",
  joinDate: "2026-05-26T00:00:00.000Z",
  socialLinks: [
    { label: "GitHub", url: siteConfig.repositoryUrl },
    { label: "Mission Log", url: "/timeline" },
  ],
  commentCount: 0,
};

const demoUser: Profile = {
  id: "observer-demo-user",
  username: "observer_17",
  displayName: "Observer 17",
  role: "user",
  avatarUrl: null,
  bannerUrl: null,
  bio: "Tracking the climb from the ground station.",
  joinDate: "2026-05-28T11:40:00.000Z",
  socialLinks: [],
  commentCount: 0,
};


export const defaultMissionSettings: MissionSettings = {
  applicationDeadline: siteConfig.applicationDeadline,
  decisionHorizon: siteConfig.decisionHorizon,
  missionTimeZone: siteConfig.missionTimeZone,
  missedDayCutoffHour: siteConfig.missedDayCutoffHour,
  countdownLabel: "primary countdown / MIT application horizon",
  countdownDescription:
    "10th grade long-range mission. Edit this timer and mission copy from the admin console whenever the target changes.",
  operatorName: siteConfig.adminUsername,
  operatorTitle: "admin / publish authority",
  operatorBio: "Only the admin account can publish logs, moderate comments, view analytics, and upload official mission media.",
  nextActionCopy: "Publish {day} before cutoff, log study hours, attach evidence, keep the system honest.",
};

export const posts: Post[] = [];

export const failures: FailureEvent[] = [];

export const dashboardSnapshot: DashboardSnapshot = {
  profile: adminProfile,
  settings: defaultMissionSettings,
  metrics: [
    { label: "Current streak", value: "000 days", delta: "+1 if posted before cutoff", status: "warning" },
    { label: "Today study", value: "0.0 h", delta: "target 5.0 h", status: "warning" },
    { label: "Gym consistency", value: "0%", delta: "14 day window", status: "warning" },
    { label: "Physics progress", value: "0%", delta: "mechanics unit", status: "warning" },
  ],
  dailyMetrics: [
    { date: "May 21", studyHours: 0, gymComplete: false, physicsPercent: 0, streak: 0 },
    { date: "May 22", studyHours: 0, gymComplete: false, physicsPercent: 0, streak: 0 },
    { date: "May 23", studyHours: 0, gymComplete: false, physicsPercent: 0, streak: 0 },
    { date: "May 24", studyHours: 0, gymComplete: false, physicsPercent: 0, streak: 0 },
    { date: "May 25", studyHours: 0, gymComplete: false, physicsPercent: 0, streak: 0 },
    { date: "May 26", studyHours: 0, gymComplete: false, physicsPercent: 0, streak: 0 },
  ],
  latestPost: null,
  posts: [],
  failures: [],
  analytics: [
    { label: "Mon", visitors: 0, comments: 0, studyHours: 0, consistency: 0 },
    { label: "Tue", visitors: 0, comments: 0, studyHours: 0, consistency: 0 },
    { label: "Wed", visitors: 0, comments: 0, studyHours: 0, consistency: 0 },
    { label: "Thu", visitors: 0, comments: 0, studyHours: 0, consistency: 0 },
    { label: "Fri", visitors: 0, comments: 0, studyHours: 0, consistency: 0 },
  ],
  visitorCount: 0,
  engagementRate: 0,
};

export function findDemoProfile(username: string) {
  const normalized = username.toLowerCase();
  return [adminProfile, demoUser].find((profile) => profile.username.toLowerCase() === normalized) ?? null;
}
