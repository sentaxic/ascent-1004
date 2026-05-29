export type UserRole = "admin" | "moderator" | "user";

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
  activityScore?: number;
  streak?: number;
  badges?: string[];
  status?: "online" | "offline" | "unknown";
};

export type SectionTheme = "terminal" | "physics" | "gym" | "philosophy" | "ai" | "archive";

export type ContentSection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  accentColor: string;
  theme: SectionTheme;
  bannerUrl: string | null;
  layout: "timeline" | "magazine" | "research" | "gallery";
  visibility: "public" | "private";
  commentsEnabled: boolean;
  featured: boolean;
  archived: boolean;
  sortOrder: number;
  parentId: string | null;
  moderatorIds: string[];
  createdAt: string;
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
  failureMessageTemplate?: string;
  instagramWebhookUrl?: string;
  automationEnabled?: boolean;
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
  orientation?: "landscape" | "portrait" | "square" | "cinematic";
};

export type CommentReaction = {
  emoji: string;
  count: number;
};

export type Comment = {
  id: string;
  postId: string;
  parentId?: string | null;
  author: Pick<Profile, "id" | "username" | "displayName" | "avatarUrl" | "role" | "status">;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  reactions?: CommentReaction[];
  isDeleted?: boolean;
};

export type Post = {
  id: string;
  sectionId: string;
  sectionSlug: string;
  sectionName: string;
  dayNumber: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  missionDate: string;
  status: "draft" | "published" | "archived";
  objective: string;
  failures: string;
  lessons: string;
  tags: string[];
  studyHours: number;
  weightKg: number;
  codingProgress: number;
  gymComplete: boolean;
  physicsProgress: number;
  streakAfterPost: number;
  featured: boolean;
  pinned: boolean;
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
  sections: ContentSection[];
  metrics: MissionMetric[];
  dailyMetrics: DailyMetric[];
  latestPost: Post | null;
  posts: Post[];
  failures: FailureEvent[];
  analytics: AnalyticsPoint[];
  visitorCount: number;
  engagementRate: number;
};
