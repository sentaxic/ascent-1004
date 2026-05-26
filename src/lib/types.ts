export type UserRole = "admin" | "user";

export type MediaKind = "image" | "gif" | "video" | "embed";

export type SocialLink = {
  label: string;
  url: string;
};

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  joinDate: string;
  socialLinks: SocialLink[];
  commentCount?: number;
};

export type MissionSettings = {
  applicationDeadline: string;
  decisionHorizon: string;
  missionTimeZone: string;
  missedDayCutoffHour: number;
  countdownLabel: string;
  countdownDescription: string;
  operatorName: string;
  operatorTitle: string;
  operatorBio: string;
  nextActionCopy: string;
};

export type MissionMetric = {
  label: string;
  value: string;
  delta: string;
  status: "stable" | "warning" | "critical";
};

export type DailyMetric = {
  date: string;
  studyHours: number;
  gymComplete: boolean;
  physicsPercent: number;
  streak: number;
};

export type PostMedia = {
  id: string;
  kind: MediaKind;
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Comment = {
  id: string;
  postId: string;
  author: Pick<Profile, "id" | "username" | "displayName" | "avatarUrl" | "role">;
  body: string;
  createdAt: string;
};

export type Post = {
  id: string;
  dayNumber: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  missionDate: string;
  tags: string[];
  studyHours: number;
  gymComplete: boolean;
  physicsProgress: number;
  streakAfterPost: number;
  media: PostMedia[];
  comments: Comment[];
};

export type FailureEvent = {
  id: string;
  dayNumber: number | null;
  failureDate: string;
  reason: string;
  severity: "warning" | "critical";
  autoPostedToInstagram: boolean;
  instagramPermalink: string | null;
  createdAt: string;
};

export type AnalyticsPoint = {
  label: string;
  visitors: number;
  comments: number;
  studyHours: number;
  consistency: number;
};

export type DashboardSnapshot = {
  profile: Profile;
  settings: MissionSettings;
  metrics: MissionMetric[];
  dailyMetrics: DailyMetric[];
  latestPost: Post | null;
  posts: Post[];
  failures: FailureEvent[];
  analytics: AnalyticsPoint[];
  visitorCount: number;
  engagementRate: number;
};
