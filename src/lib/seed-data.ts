import { siteConfig } from "@/lib/config";
import type { DashboardSnapshot, FailureEvent, Post, Profile } from "@/lib/types";

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
  commentCount: 12,
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
  commentCount: 3,
};

export const posts: Post[] = [
  {
    id: "post-day-004",
    dayNumber: 4,
    slug: "day-004-vector-fields-before-sunrise",
    title: "Vector Fields Before Sunrise",
    excerpt:
      "A controlled session: mechanics review, forty-five minutes of calculus drills, and a gym block that did not negotiate.",
    content:
      "The work today was quiet but dense. I treated the desk like a lab bench: one theorem, one derivation, one physical rep. The point is not to feel inspired. The point is to make the system impossible to ignore.",
    publishedAt: "2026-05-29T21:42:00.000Z",
    missionDate: "2026-05-29",
    tags: ["physics", "calculus", "gym", "streak"],
    studyHours: 4.5,
    gymComplete: true,
    physicsProgress: 18,
    streakAfterPost: 4,
    media: [
      {
        id: "media-board-004",
        kind: "image",
        url: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?auto=format&fit=crop&w=1600&q=80",
        alt: "Desk with equations and study material",
      },
    ],
    comments: [
      {
        id: "comment-004-a",
        postId: "post-day-004",
        author: demoUser,
        body: "The mission-board framing is brutal in the best way. Keep the data visible.",
        createdAt: "2026-05-29T22:01:00.000Z",
      },
    ],
  },
  {
    id: "post-day-003",
    dayNumber: 3,
    slug: "day-003-friction-is-a-force-and-a-mood",
    title: "Friction Is A Force And A Mood",
    excerpt:
      "Not a clean day, but a finished day. The log exists, the streak survives, and Newton remains annoying in useful ways.",
    content:
      "Today was resistance training in both senses. I got stuck on inclined-plane problems and still closed the loop. Failure gets archived. Completion gets counted.",
    publishedAt: "2026-05-28T23:12:00.000Z",
    missionDate: "2026-05-28",
    tags: ["mechanics", "discipline", "recovery"],
    studyHours: 2.75,
    gymComplete: true,
    physicsProgress: 14,
    streakAfterPost: 3,
    media: [],
    comments: [],
  },
  {
    id: "post-day-002",
    dayNumber: 2,
    slug: "day-002-command-center-online",
    title: "Command Center Online",
    excerpt:
      "The first version of the mission archive is live enough to stare back. Public accountability starts here.",
    content:
      "Built the first draft of the archive structure and mapped out what gets measured: study hours, gym consistency, physics progress, posts, failures, and recovery loops.",
    publishedAt: "2026-05-27T20:06:00.000Z",
    missionDate: "2026-05-27",
    tags: ["systems", "accountability"],
    studyHours: 3.25,
    gymComplete: false,
    physicsProgress: 10,
    streakAfterPost: 2,
    media: [],
    comments: [],
  },
];

export const failures: FailureEvent[] = [
  {
    id: "failure-001",
    dayNumber: 1,
    failureDate: "2026-05-26",
    reason: "Post published after cutoff. Streak counted as unstable, not broken.",
    severity: "warning",
    autoPostedToInstagram: false,
    instagramPermalink: null,
    createdAt: "2026-05-26T22:10:00.000Z",
  },
];

export const dashboardSnapshot: DashboardSnapshot = {
  profile: adminProfile,
  metrics: [
    { label: "Current streak", value: "004 days", delta: "+1 since yesterday", status: "stable" },
    { label: "Today study", value: "4.5 h", delta: "target 5.0 h", status: "warning" },
    { label: "Gym consistency", value: "82%", delta: "14 day window", status: "stable" },
    { label: "Physics progress", value: "18%", delta: "mechanics unit", status: "stable" },
  ],
  dailyMetrics: [
    { date: "May 24", studyHours: 2.5, gymComplete: true, physicsPercent: 8, streak: 0 },
    { date: "May 25", studyHours: 3.2, gymComplete: false, physicsPercent: 9, streak: 0 },
    { date: "May 26", studyHours: 2.8, gymComplete: true, physicsPercent: 10, streak: 1 },
    { date: "May 27", studyHours: 3.25, gymComplete: false, physicsPercent: 12, streak: 2 },
    { date: "May 28", studyHours: 2.75, gymComplete: true, physicsPercent: 14, streak: 3 },
    { date: "May 29", studyHours: 4.5, gymComplete: true, physicsPercent: 18, streak: 4 },
  ],
  latestPost: posts[0],
  posts,
  failures,
  analytics: [
    { label: "Mon", visitors: 120, comments: 8, studyHours: 2.4, consistency: 72 },
    { label: "Tue", visitors: 144, comments: 11, studyHours: 3.1, consistency: 76 },
    { label: "Wed", visitors: 190, comments: 14, studyHours: 3.8, consistency: 80 },
    { label: "Thu", visitors: 211, comments: 19, studyHours: 2.7, consistency: 78 },
    { label: "Fri", visitors: 260, comments: 23, studyHours: 4.5, consistency: 82 },
  ],
  visitorCount: 9254,
  engagementRate: 7.8,
};

export function findDemoProfile(username: string) {
  const normalized = username.toLowerCase();
  return [adminProfile, demoUser].find((profile) => profile.username.toLowerCase() === normalized) ?? null;
}
