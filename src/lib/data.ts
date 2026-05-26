import { notFound } from "next/navigation";

import { dashboardSnapshot, failures as seedFailures, findDemoProfile, posts as seedPosts } from "@/lib/seed-data";
import { createClient } from "@/lib/supabase/server";
import type { Comment, DashboardSnapshot, FailureEvent, Post, PostMedia, Profile } from "@/lib/types";

const POST_SELECT = "id, day_number, slug, title, excerpt, content, published_at, mission_date, tags, study_hours, gym_complete, physics_progress, streak_after_post";

type DbProfile = {
  id: string;
  username: string;
  display_name: string | null;
  role: "admin" | "user";
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  created_at: string;
  social_links: Array<{ label: string; url: string }> | null;
};

type DbPost = {
  id: string;
  day_number: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published_at: string;
  mission_date: string;
  tags: string[] | null;
  study_hours: number;
  gym_complete: boolean;
  physics_progress: number;
  streak_after_post: number;
};

type DbMedia = {
  id: string;
  post_id: string;
  kind: "image" | "gif" | "video" | "embed";
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

type DbComment = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  profiles: DbProfile | null;
};

type DbFailure = {
  id: string;
  day_number: number | null;
  failure_date: string;
  reason: string;
  severity: "warning" | "critical";
  auto_posted_to_instagram: boolean;
  instagram_permalink: string | null;
  created_at: string;
};

function mapProfile(profile: DbProfile, commentCount?: number): Profile {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name ?? profile.username,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    bannerUrl: profile.banner_url,
    bio: profile.bio,
    joinDate: profile.created_at,
    socialLinks: profile.social_links ?? [],
    commentCount,
  };
}

function mapMedia(media: DbMedia): PostMedia {
  return {
    id: media.id,
    kind: media.kind,
    url: media.url,
    alt: media.alt ?? "Mission media",
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  };
}

function mapComment(comment: DbComment): Comment {
  const author = comment.profiles ? mapProfile(comment.profiles) : null;

  return {
    id: comment.id,
    postId: comment.post_id,
    body: comment.body,
    createdAt: comment.created_at,
    author: author
      ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatarUrl: author.avatarUrl,
          role: author.role,
        }
      : {
          id: "deleted-user",
          username: "deleted",
          displayName: "Deleted User",
          avatarUrl: null,
          role: "user",
        },
  };
}

function mapPost(post: DbPost, media: DbMedia[] = [], comments: DbComment[] = []): Post {
  return {
    id: post.id,
    dayNumber: post.day_number,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "Mission log entry.",
    content: post.content,
    publishedAt: post.published_at,
    missionDate: post.mission_date,
    tags: post.tags ?? [],
    studyHours: Number(post.study_hours),
    gymComplete: post.gym_complete,
    physicsProgress: Number(post.physics_progress),
    streakAfterPost: post.streak_after_post,
    media: media.map(mapMedia),
    comments: comments.map(mapComment),
  };
}

function mapFailure(failure: DbFailure): FailureEvent {
  return {
    id: failure.id,
    dayNumber: failure.day_number,
    failureDate: failure.failure_date,
    reason: failure.reason,
    severity: failure.severity,
    autoPostedToInstagram: failure.auto_posted_to_instagram,
    instagramPermalink: failure.instagram_permalink,
    createdAt: failure.created_at,
  };
}

async function fetchPostsWithRelations(limit?: number) {
  const supabase = await createClient();
  if (!supabase) return seedPosts.slice(0, limit ?? seedPosts.length);

  const { data: postRows, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("day_number", { ascending: false })
    .limit(limit ?? 100);

  if (error || !postRows) return seedPosts.slice(0, limit ?? seedPosts.length);

  const ids = postRows.map((post) => post.id);
  if (ids.length === 0) return [];

  const [{ data: mediaRows }, { data: commentRows }] = await Promise.all([
    supabase.from("post_media").select("id, post_id, kind, url, alt, width, height").in("post_id", ids).order("sort_order"),
    supabase
      .from("comments")
      .select("id, post_id, body, created_at, profiles(id, username, display_name, role, avatar_url, banner_url, bio, created_at, social_links)")
      .in("post_id", ids)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true }),
  ]);

  return postRows.map((post) =>
    mapPost(
      post as DbPost,
      ((mediaRows ?? []) as DbMedia[]).filter((media) => media.post_id === post.id),
      ((commentRows ?? []) as unknown as DbComment[]).filter((comment) => comment.post_id === post.id),
    ),
  );
}

export async function getPosts(limit?: number) {
  return fetchPostsWithRelations(limit);
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  if (!supabase) return seedPosts.find((post) => post.slug === slug) ?? null;

  const { data: postRow, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !postRow) return seedPosts.find((post) => post.slug === slug) ?? null;

  const [{ data: mediaRows }, { data: commentRows }] = await Promise.all([
    supabase.from("post_media").select("id, post_id, kind, url, alt, width, height").eq("post_id", postRow.id).order("sort_order"),
    supabase
      .from("comments")
      .select("id, post_id, body, created_at, profiles(id, username, display_name, role, avatar_url, banner_url, bio, created_at, social_links)")
      .eq("post_id", postRow.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true }),
  ]);

  return mapPost(postRow as DbPost, (mediaRows ?? []) as DbMedia[], (commentRows ?? []) as unknown as DbComment[]);
}

export async function getFailures() {
  const supabase = await createClient();
  if (!supabase) return seedFailures;

  const { data, error } = await supabase
    .from("failure_events")
    .select("id, day_number, failure_date, reason, severity, auto_posted_to_instagram, instagram_permalink, created_at")
    .order("failure_date", { ascending: false });

  if (error || !data) return seedFailures;
  return (data as DbFailure[]).map(mapFailure);
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, avatar_url, banner_url, bio, created_at, social_links")
    .eq("id", user.id)
    .single();

  return data ? mapProfile(data as DbProfile) : null;
}

export async function requireAdminProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") notFound();
  return profile;
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  if (!supabase) return findDemoProfile(username);

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, avatar_url, banner_url, bio, created_at, social_links")
    .ilike("username", username)
    .single();

  if (error || !profileRow) return findDemoProfile(username);

  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profileRow.id)
    .eq("is_deleted", false);

  return mapProfile(profileRow as DbProfile, count ?? 0);
}

export async function getProfileComments(profileId: string) {
  const supabase = await createClient();
  if (!supabase) return seedPosts.flatMap((post) => post.comments).filter((comment) => comment.author.id === profileId);

  const { data } = await supabase
    .from("comments")
    .select("id, post_id, body, created_at, profiles(id, username, display_name, role, avatar_url, banner_url, bio, created_at, social_links)")
    .eq("author_id", profileId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(25);

  return ((data ?? []) as unknown as DbComment[]).map(mapComment);
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [posts, failures, profile] = await Promise.all([getPosts(12), getFailures(), getCurrentProfile()]);

  const latestPost = posts[0] ?? dashboardSnapshot.latestPost;
  const currentStreak = latestPost.streakAfterPost;
  const studyHours = latestPost.studyHours;
  const gymWindow = posts.slice(0, 14);
  const gymConsistency = gymWindow.length
    ? Math.round((gymWindow.filter((post) => post.gymComplete).length / gymWindow.length) * 100)
    : dashboardSnapshot.metrics[2].value;

  return {
    ...dashboardSnapshot,
    profile: profile ?? dashboardSnapshot.profile,
    posts: posts.length ? posts : dashboardSnapshot.posts,
    latestPost,
    failures,
    metrics: [
      { label: "Current streak", value: `${String(currentStreak).padStart(3, "0")} days`, delta: "+1 if posted before cutoff", status: "stable" },
      { label: "Today study", value: `${studyHours.toFixed(1)} h`, delta: "public daily log", status: studyHours >= 4 ? "stable" : "warning" },
      { label: "Gym consistency", value: `${gymConsistency}%`, delta: "recent post window", status: Number(gymConsistency) >= 70 ? "stable" : "warning" },
      { label: "Physics progress", value: `${latestPost.physicsProgress}%`, delta: "active unit", status: "stable" },
    ],
  };
}
