export const dynamic = "force-dynamic";

import Link from "next/link";

import { Parallax, Reveal, SplitText } from "@/components/motion";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { siteConfig } from "@/lib/config";
import { getDashboardSnapshot } from "@/lib/data";
import { padDay } from "@/lib/utils";

const DAY_MS = 86_400_000;

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / DAY_MS));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();
  const { settings, metrics, latestPost, posts, sections } = snapshot;

  const daysToDeadline = daysUntil(settings.applicationDeadline);
  const daysToDecision = daysUntil(settings.decisionHorizon);
  const missionStarted = posts.length > 0;
  const nextDay = latestPost ? latestPost.dayNumber + 1 : 1;
  const featured = sections.filter((s) => s.featured && !s.archived).slice(0, 5);
  const wings = featured.length ? featured : sections.filter((s) => !s.archived).slice(0, 5);

  return (
    <div className="overflow-x-clip">
      {/* ───────────────────────── 01 · ATMOSPHERE HERO ───────────────────────── */}
      <section className="relative flex min-h-[86svh] items-center">
        <div className="container-shell w-full">
          <Reveal>
            <p className="eyebrow justify-start">{settings.countdownLabel || "Mission control · active"}</p>
          </Reveal>

          <h1 className="display mt-7 leading-[0.84]">
            <SplitText by="char" as="span" stagger={0.04} className="block text-display-xl accent-glow">
              ASCENT
            </SplitText>
            <span className="mt-1 block text-display-lg text-muted/70">— 1004</span>
          </h1>

          <div className="mt-10 grid gap-8 sm:grid-cols-[1.2fr_0.8fr] sm:items-end">
            <Reveal delay={0.15}>
              <p className="lead text-pretty">
                {settings.operatorBio ||
                  "A public record of one multi-year climb toward MIT — physics, discipline, fitness, and the quiet work of becoming, documented from a rain-lit desk after midnight."}
              </p>
            </Reveal>

            <Reveal delay={0.25} className="sm:text-right">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">Application horizon</p>
              <p className="display mt-2 text-display-sm text-accent accent-glow">
                {daysToDeadline}
                <span className="ml-2 align-baseline text-base tracking-normal text-muted">days</span>
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.4} className="mt-12 flex flex-wrap items-center gap-4">
            <MagneticLink
              href="/timeline"
              className="button-primary inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.2em]"
            >
              Enter the archive
            </MagneticLink>
            <MagneticLink
              href="/auth/signup"
              strength={0.25}
              className="button-secondary inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.2em]"
            >
              Observe the mission
            </MagneticLink>
          </Reveal>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
          <span className="flex flex-col items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-muted/70">
            scroll
            <span className="h-10 w-px animate-pulse bg-gradient-to-b from-accent/70 to-transparent" />
          </span>
        </div>
      </section>

      {/* ───────────────────────── 02 · MISSION STATEMENT ─────────────────────── */}
      <section className="section-y">
        <div className="container-shell">
          <Reveal>
            <p className="eyebrow">The premise</p>
          </Reveal>
          <SplitText
            as="h2"
            className="display mt-8 max-w-[18ch] text-display-md text-balance"
          >
            Nothing here is inflated. The work is the proof.
          </SplitText>
          <Reveal delay={0.15}>
            <p className="lead mt-8">
              {settings.countdownDescription ||
                "Every streak, study hour, and failure is published in the open — a long-range record kept honest by being visible. The archive stays at zero until the first real day is logged."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── 03 · COUNTDOWN ─────────────────────────────── */}
      <section className="section-y relative">
        <Parallax offset={-30} className="container-shell">
          <Reveal>
            <p className="eyebrow">{missionStarted ? "Mission clock" : "Mission clock · standby"}</p>
          </Reveal>
          <div className="mt-10 flex flex-wrap items-end gap-x-16 gap-y-10">
            <div>
              <p className="display text-display-xl accent-glow tabular-nums">{daysToDeadline}</p>
              <p className="mt-3 max-w-[22ch] text-sm leading-6 text-muted">
                days until the MIT application horizon · {formatDate(settings.applicationDeadline)}
              </p>
            </div>
            <div className="hairline-v hidden h-28 sm:block" />
            <div>
              <p className="display text-display-md text-ash/80 tabular-nums">{daysToDecision}</p>
              <p className="mt-3 max-w-[22ch] text-sm leading-6 text-muted">
                days to the decision horizon · {formatDate(settings.decisionHorizon)}
              </p>
            </div>
          </div>
        </Parallax>
      </section>

      {/* ───────────────────────── 04 · CURRENT OBJECTIVES ────────────────────── */}
      <section className="section-y">
        <div className="container-shell">
          <Reveal>
            <p className="eyebrow">Live telemetry</p>
            <h2 className="display mt-7 text-display-sm">The dials, right now.</h2>
          </Reveal>

          <div className="mt-14">
            {metrics.map((metric, index) => (
              <Reveal
                key={metric.label}
                delay={index * 0.05}
                className="grid grid-cols-1 items-baseline gap-2 border-t border-white/10 py-7 sm:grid-cols-[0.5fr_1fr_0.6fr] sm:gap-8"
              >
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">{metric.label}</p>
                <p className="display text-display-sm tabular-nums">{metric.value}</p>
                <p className={`text-xs ${metric.status === "stable" ? "text-accent" : "text-muted"} sm:text-right`}>
                  {metric.delta}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── 05 · LATEST MISSION LOG ────────────────────── */}
      <section className="section-y">
        <div className="container-wide">
          <Reveal>
            <p className="eyebrow">{latestPost ? "Latest transmission" : "Awaiting first transmission"}</p>
          </Reveal>

          {latestPost ? (
            <Link href={`/posts/${latestPost.slug}`} className="group mt-10 block" data-cursor="active">
              {latestPost.media[0]?.url ? (
                <Parallax offset={26} className="mb-10 overflow-hidden rounded-[1.75rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={latestPost.media[0].url}
                    alt={latestPost.media[0].alt || latestPost.title}
                    className="h-[42vh] w-full scale-[1.04] object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                </Parallax>
              ) : null}
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-accent">
                {padDay(latestPost.dayNumber)} · {latestPost.sectionName}
              </p>
              <h2 className="display mt-5 max-w-[16ch] text-display-md transition-colors group-hover:text-accent">
                {latestPost.title}
              </h2>
              <p className="lead mt-6">{latestPost.excerpt}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition group-hover:text-ash">
                Read the log
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ) : (
            <div className="mt-10">
              <h2 className="display max-w-[14ch] text-display-md">{padDay(nextDay)} is still unwritten.</h2>
              <p className="lead mt-6">
                The mission archive opens with the first published log. Until then, the room stays quiet and the clock keeps running.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── 06 · ARCHIVE / WINGS ───────────────────────── */}
      {wings.length ? (
        <section className="section-y">
          <div className="container-shell">
            <Reveal>
              <p className="eyebrow">The facility</p>
              <h2 className="display mt-7 max-w-[16ch] text-display-sm">
                Each wing keeps its own discipline.
              </h2>
            </Reveal>

            <div className="mt-14">
              {wings.map((wing, index) => (
                <Reveal key={wing.id} delay={index * 0.05}>
                  <Link
                    href="/timeline"
                    data-cursor="active"
                    className="group flex items-baseline justify-between gap-6 border-t border-white/10 py-8"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="text-[0.7rem] tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</span>
                      <span className="display text-2xl tracking-[-0.03em] transition-colors group-hover:text-accent sm:text-4xl">
                        {wing.name}
                      </span>
                    </span>
                    <span className="hidden max-w-[34ch] text-right text-sm leading-6 text-muted sm:block">
                      {wing.description}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ───────────────────────── 07 · OBSERVER COMMUNITY ────────────────────── */}
      <section className="section-y">
        <div className="container-shell scrim-soft rounded-[2.5rem] py-section-sm text-center">
          <Reveal>
            <p className="eyebrow justify-center">Observer channel</p>
            <SplitText as="h2" className="display mx-auto mt-8 max-w-[20ch] text-display-md text-balance">
              Witness the climb in real time.
            </SplitText>
            <p className="lead mx-auto mt-8 text-center">
              {settings.nextActionCopy ||
                "Create an observer profile to follow every log, leave a mark in the comments, and watch the mission unfold night after night."}
            </p>
            <div className="mt-11 flex flex-wrap justify-center gap-4">
              <MagneticLink
                href="/auth/signup"
                className="button-primary inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.2em]"
              >
                Join the channel
              </MagneticLink>
              <MagneticLink
                href="/timeline"
                strength={0.25}
                className="button-secondary inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.2em]"
              >
                Read the timeline
              </MagneticLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
