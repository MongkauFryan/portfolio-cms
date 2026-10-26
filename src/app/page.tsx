import React from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getPortfolioData } from "@/lib/portfolio-Query";
import CVDownloadButton from "@/components/CVDownloadButton";

export const dynamic = "force-dynamic";

export default async function PublicPortfolioPage() {
  const data = await getPortfolioData();
  const { profile, experiences, projects, awards, skills } = data;

  const workExperiences = experiences.filter((e) => e.category === "WORK");
  const orgExperiences = experiences.filter(
    (e) => e.category === "ORGANIZATION"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 ring-1 ring-emerald-500/30">
              {profile.full_name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                {profile.full_name}
              </p>
              <p className="text-xs text-slate-400">{profile.address}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#experience" className="hover:text-emerald-400">
              Pengalaman
            </a>
            <a href="#projects" className="hover:text-emerald-400">
              Proyek
            </a>
            <a href="#awards" className="hover:text-emerald-400">
              Sertifikasi & Penghargaan
            </a>
            <a href="#skills" className="hover:text-emerald-400">
              Keahlian
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Admin CMS
            </Link>
          </nav>

          <CVDownloadButton data={data} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-6 py-14">
        {/* Hero / Profile Section */}
        <section className="grid items-center gap-10 border-b border-slate-800/80 pb-14 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
              <span>ATS-Ready Portfolio & Dynamic CV</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {profile.full_name}
            </h1>
            <p className="text-xl font-medium text-emerald-400">
              {profile.headline}
            </p>
            <p className="leading-relaxed text-slate-300">
              {profile.profile_summary}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 ring-1 ring-slate-800">
                <MapPin className="h-4 w-4 text-emerald-400" />
                {profile.address}
              </span>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 ring-1 ring-slate-800 hover:text-emerald-400"
              >
                <Mail className="h-4 w-4 text-emerald-400" />
                {profile.email}
              </a>
              <a
                href={`https://wa.me/62${profile.phone_raw.replace(/^0+/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 ring-1 ring-slate-800 hover:text-emerald-400"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                {profile.phone_display}
              </a>
            </div>
          </div>

          {/* Education & Quick Info Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              <GraduationCap className="h-4 w-4" />
              Pendidikan Terakhir
            </div>
            <div className="space-y-4">
              {profile.education_entries.map((edu, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-emerald-500/40 pl-3.5"
                >
                  <p className="font-semibold text-white">{edu.institution}</p>
                  <p className="text-sm text-slate-300">{edu.program_study}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{edu.score_label}</span>
                    <span>
                      {edu.city} • {edu.period}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section (Work & Organization) */}
        <section id="experience" className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <Briefcase className="h-5 w-5 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">
                Pengalaman Kerja
              </h2>
            </div>
            <div className="space-y-5">
              {workExperiences.map((exp) => (
                <article
                  key={exp.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white">
                        {exp.company_or_org}
                      </h3>
                      <p className="text-sm font-medium text-emerald-400">
                        {exp.role}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{exp.city}</p>
                      <p>{exp.period}</p>
                    </div>
                  </div>
                  {exp.industry_field && (
                    <p className="mt-3 text-xs text-slate-400">
                      Bidang: {exp.industry_field}
                    </p>
                  )}
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                    {exp.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  {exp.reporting_to && (
                    <p className="mt-3 border-t border-slate-800/80 pt-2 text-xs text-slate-400">
                      Pelaporan kepada: {exp.reporting_to}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">
                Pengalaman Organisasi
              </h2>
            </div>
            <div className="space-y-4">
              {orgExperiences.map((org) => (
                <article
                  key={org.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {org.company_or_org}
                    </h3>
                    <p className="text-sm text-emerald-400">{org.role}</p>
                  </div>
                  <span className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {org.period}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Proyek Unggulan</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-emerald-500/40"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {project.title}
                    </h3>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={project.title}
                        className="text-slate-400 hover:text-emerald-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.tech_stack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-emerald-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Awards & Certifications Section */}
        <section id="awards" className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">
              Pelatihan, Sertifikasi & Penghargaan
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {awards.map((award) => (
              <div
                key={award.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{award.title}</h3>
                    <p className="text-xs font-medium text-emerald-400">
                      {award.organizer}
                    </p>
                  </div>
                  <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                    {award.year}
                  </span>
                </div>
                {award.description && (
                  <p className="mt-2.5 text-sm text-slate-300">
                    {award.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Hobbies Section */}
        <section id="skills" className="grid gap-6 md:grid-cols-3">
          {(["BIDANG", "SOFTWARE", "BAHASA"] as const).map((cat) => {
            const titles = {
              BIDANG: "Keahlian Bidang",
              SOFTWARE: "Keahlian Software",
              BAHASA: "Keahlian Bahasa Asing",
            };
            const list = skills.filter((s) => s.category === cat);
            return (
              <div
                key={cat}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <h3 className="mb-3 font-bold text-emerald-400">
                  {titles[cat]}
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {list.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>
                        {item.name}
                        {item.proficiency ? ` (${item.proficiency})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {profile.full_name}. All rights
            reserved.
          </p>
          <p>Hobi: {profile.hobbies.join(" • ")}</p>
        </div>
      </footer>
    </div>
  );
}