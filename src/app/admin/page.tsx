"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PhotoUploader from "@/components/PhotoUploader";
import { createClient } from "@/lib/supabase/client";
import {
  AwardData,
  EducationEntry,
  ExperienceData,
  ProfileData,
  ProjectData,
  SkillData,
} from "@/types/portfolio";
import {
  ArrowLeft,
  LogOut,
  Plus,
  Save,
  Trash2,
  Lock,
} from "lucide-react";
import { profile } from "console";

export default function AdminCMSPage() {
  const supabase = createClient();
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [activeTab, setActiveTab] = useState<
    "PROFILE" | "EXPERIENCES" | "PROJECTS" | "AWARDS" | "SKILLS"
  >("PROFILE");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);

  const fetchAllData = useCallback(async () => {
    const [pRes, eRes, prRes, aRes, sRes] = await Promise.all([
      supabase.from("profile").select("*").limit(1).maybeSingle(),
      supabase
        .from("experiences")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("awards")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("skills")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (pRes.data) setProfile(pRes.data as ProfileData);
    if (eRes.data) setExperiences(eRes.data as ExperienceData[]);
    if (prRes.data) setProjects(prRes.data as ProjectData[]);
    if (aRes.data) setAwards(aRes.data as AwardData[]);
    if (sRes.data) setSkills(sRes.data as SkillData[]);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSessionUser(data.user?.email ?? null);
      setLoadingAuth(false);
      if (data.user) fetchAllData();
    });
  }, [supabase, fetchAllData]);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setSessionUser(data.user?.email ?? null);
    fetchAllData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  // PROFILE SAVE
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const { error } = await supabase
      .from("profile")
      .upsert({ ...profile, updated_at: new Date().toISOString() });
    if (!error) notify("Profil & Data CV berhasil disimpan!");
  };

  // EXPERIENCE CRUD
  const handleAddExperience = async (category: "WORK" | "ORGANIZATION") => {
    const payload = {
      category,
      company_or_org: category === "WORK" ? "PT Contoh Baru" : "Organisasi Baru",
      role: "Posisi / Jabatan",
      industry_field: category === "WORK" ? "teknologi informasi" : "",
      city: "Manado",
      period: "2026 - Sekarang",
      responsibilities:
        category === "WORK" ? ["Tanggung jawab utama 1"] : [],
      reporting_to: category === "WORK" ? "Project Manager" : "",
      sort_order: experiences.length + 1,
    };
    const { data } = await supabase
      .from("experiences")
      .insert(payload)
      .select()
      .single();
    if (data) {
      setExperiences([...experiences, data as ExperienceData]);
      notify("Pengalaman ditambahkan.");
    }
  };

  const handleUpdateExperience = async (exp: ExperienceData) => {
    const { error } = await supabase
      .from("experiences")
      .update(exp)
      .eq("id", exp.id);
    if (!error) notify("Pengalaman diperbarui.");
  };

  const handleDeleteExperience = async (id: string) => {
    await supabase.from("experiences").delete().eq("id", id);
    setExperiences(experiences.filter((e) => e.id !== id));
    notify("Pengalaman dihapus.");
  };

  // PROJECT CRUD
  const handleAddProject = async () => {
    const { data } = await supabase
      .from("projects")
      .insert({
        title: "Proyek Baru",
        description: "Deskripsi proyek dan dampak bisnis.",
        tech_stack: ["Next.js", "TypeScript"],
        live_url: "https://example.com",
        repo_url: "",
        featured: true,
        sort_order: projects.length + 1,
      })
      .select()
      .single();
    if (data) setProjects([...projects, data as ProjectData]);
  };

  const handleUpdateProject = async (proj: ProjectData) => {
    const { error } = await supabase
      .from("projects")
      .update(proj)
      .eq("id", proj.id);
    if (!error) notify("Proyek diperbarui.");
  };

  const handleDeleteProject = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  // AWARD CRUD
  const handleAddAward = async () => {
    const { data } = await supabase
      .from("awards")
      .insert({
        title: "Pelatihan / Penghargaan Baru",
        organizer: "Penyelenggara",
        year: "2026",
        description: "",
        sort_order: awards.length + 1,
      })
      .select()
      .single();
    if (data) setAwards([...awards, data as AwardData]);
  };

  const handleUpdateAward = async (aw: AwardData) => {
    const { error } = await supabase
      .from("awards")
      .update(aw)
      .eq("id", aw.id);
    if (!error) notify("Sertifikasi/Penghargaan diperbarui.");
  };

  const handleDeleteAward = async (id: string) => {
    await supabase.from("awards").delete().eq("id", id);
    setAwards(awards.filter((a) => a.id !== id));
  };

  // SKILL CRUD
  const handleAddSkill = async (category: "BIDANG" | "BAHASA" | "SOFTWARE") => {
    const { data } = await supabase
      .from("skills")
      .insert({
        category,
        name: "Keahlian Baru",
        proficiency: "",
        sort_order: skills.length + 1,
      })
      .select()
      .single();
    if (data) setSkills([...skills, data as SkillData]);
  };

  const handleUpdateSkill = async (sk: SkillData) => {
    const { error } = await supabase
      .from("skills")
      .update(sk)
      .eq("id", sk.id);
    if (!error) notify("Keahlian diperbarui.");
  };

  const handleDeleteSkill = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
    setSkills(skills.filter((s) => s.id !== id));
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Memuat autentikasi CMS...
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Lock className="h-5 w-5" />
            <h1 className="text-xl font-bold text-white">Portfolio Admin CMS</h1>
          </div>
          {authError && (
            <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
              {authError}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400">
              Email Admin (Supabase Auth)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Masuk ke CMS
          </button>
          <Link
            href="/"
            className="block text-center text-xs text-slate-400 hover:text-white"
          >
            ← Kembali ke Halaman Publik
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Lihat Portfolio Publik
            </Link>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-emerald-400">{sessionUser}</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-red-500 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {statusMessage && (
          <div className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
            {statusMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          {(
            [
              ["PROFILE", "1. Profil, Pendidikan, Hobi & Kontak CV"],
              ["EXPERIENCES", "2. Pengalaman Kerja & Organisasi"],
              ["PROJECTS", "3. Proyek Portfolio"],
              ["AWARDS", "4. Pelatihan & Sertifikasi"],
              ["SKILLS", "5. Keahlian (Bidang, Bahasa, Software)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === key
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE, PENDIDIKAN, HOBI & KONTAK */}
        {activeTab === "PROFILE" && profile && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-400">Nama Lengkap</label>
                <input
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Headline Portfolio
                </label>
                <input
                  value={profile.headline}
                  onChange={(e) =>
                    setProfile({ ...profile, headline: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  URL Pas Photo (Opsional)
                </label>
                <input
                  value={profile.photo_url}
                  onChange={(e) =>
                    setProfile({ ...profile, photo_url: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Tempat Tanggal Lahir
                </label>
                <input
                  value={profile.birth_place_date}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      birth_place_date: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Agama</label>
                <input
                  value={profile.religion}
                  onChange={(e) =>
                    setProfile({ ...profile, religion: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Warganegara</label>
                <input
                  value={profile.nationality}
                  onChange={(e) =>
                    setProfile({ ...profile, nationality: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Status</label>
                <input
                  value={profile.marital_status}
                  onChange={(e) =>
                    setProfile({ ...profile, marital_status: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Alamat</label>
                <input
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400">
                  Deskripsi PROFILE (CV & Hero)
                </label>
                <textarea
                  rows={3}
                  value={profile.profile_summary}
                  onChange={(e) =>
                    setProfile({ ...profile, profile_summary: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  No. WhatsApp (Mulai angka 8xxx)
                </label>
                <input
                  value={profile.phone_raw}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_raw: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Format Tampilan Telepon (+62 8xx...)
                </label>
                <input
                  value={profile.phone_display}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_display: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">LinkedIn URL</label>
                <input
                  value={profile.linkedin_url}
                  onChange={(e) =>
                    setProfile({ ...profile, linkedin_url: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400">
                  Hobi (Pisahkan dengan koma)
                </label>
                <input
                  value={profile.hobbies.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      hobbies: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Pendidikan Terakhir Editor */}
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Pendidikan Terakhir</h3>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      education_entries: [
                        ...profile.education_entries,
                        {
                          institution: "Nama Institusi",
                          program_study: "Program Studi",
                          score_label: "Nilai / IPK",
                          city: "Kota",
                          period: "2020 - 2024",
                        },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-3 py-1 text-xs text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Pendidikan
                </button>
              </div>
              {profile.education_entries.map((edu: EducationEntry, idx: number) => (
                <div
                  key={idx}
                  className="grid gap-3 border-t border-slate-800 pt-4 md:grid-cols-5"
                >
                  <input
                    placeholder="Institusi"
                    value={edu.institution}
                    onChange={(e) => {
                      const next = [...profile.education_entries];
                      next[idx].institution = e.target.value;
                      setProfile({ ...profile, education_entries: next });
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Program Studi"
                    value={edu.program_study}
                    onChange={(e) => {
                      const next = [...profile.education_entries];
                      next[idx].program_study = e.target.value;
                      setProfile({ ...profile, education_entries: next });
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Nilai / IPK"
                    value={edu.score_label}
                    onChange={(e) => {
                      const next = [...profile.education_entries];
                      next[idx].score_label = e.target.value;
                      setProfile({ ...profile, education_entries: next });
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Kota"
                    value={edu.city}
                    onChange={(e) => {
                      const next = [...profile.education_entries];
                      next[idx].city = e.target.value;
                      setProfile({ ...profile, education_entries: next });
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Periode"
                      value={edu.period}
                      onChange={(e) => {
                        const next = [...profile.education_entries];
                        next[idx].period = e.target.value;
                        setProfile({ ...profile, education_entries: next });
                      }}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = profile.education_entries.filter(
                          (_, i) => i !== idx
                        );
                        setProfile({ ...profile, education_entries: next });
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
<div className="space-y-1.5">
  <label className="text-xs text-slate-400">
    Pas Photo CV (Unggah Langsung atau Tempel URL)
  </label>
  <PhotoUploader 
  currentUrl={profile.photo_url} 
  onUploadSuccess={(url) => setProfile({ ...profile, photo_url: url })}
/>
  <input
    placeholder="Atau tempel URL gambar secara manual..."
    value={profile.photo_url}
    onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })}
    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
  />
</div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" /> Simpan Seluruh Perubahan Profil
            </button>
          </form>
        )}

        {/* TAB 2: EXPERIENCES */}
        {activeTab === "EXPERIENCES" && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <button
                onClick={() => handleAddExperience("WORK")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950"
              >
                <Plus className="h-4 w-4" /> Tambah Pengalaman Kerja
              </button>
              <button
                onClick={() => handleAddExperience("ORGANIZATION")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 px-4 py-2 text-xs font-semibold text-emerald-300"
              >
                <Plus className="h-4 w-4" /> Tambah Pengalaman Organisasi
              </button>
            </div>

            {experiences.map((exp, idx) => (
              <div
                key={exp.id}
                className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    {exp.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateExperience(exp)}
                      className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300"
                    >
                      <Save className="h-3.5 w-3.5" /> Simpan
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="inline-flex items-center gap-1 rounded bg-red-500/20 px-3 py-1 text-xs text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <input
                    placeholder="Perusahaan / Organisasi"
                    value={exp.company_or_org}
                    onChange={(e) => {
                      const next = [...experiences];
                      next[idx].company_or_org = e.target.value;
                      setExperiences(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Jabatan / Posisi"
                    value={exp.role}
                    onChange={(e) => {
                      const next = [...experiences];
                      next[idx].role = e.target.value;
                      setExperiences(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Kota"
                    value={exp.city}
                    onChange={(e) => {
                      const next = [...experiences];
                      next[idx].city = e.target.value;
                      setExperiences(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Periode (Feb 20xx - Des 20xx)"
                    value={exp.period}
                    onChange={(e) => {
                      const next = [...experiences];
                      next[idx].period = e.target.value;
                      setExperiences(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                </div>

                {exp.category === "WORK" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      placeholder="Bidang Perusahaan (contoh: otomotif, teknologi)"
                      value={exp.industry_field}
                      onChange={(e) => {
                        const next = [...experiences];
                        next[idx].industry_field = e.target.value;
                        setExperiences(next);
                      }}
                      className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                    />
                    <input
                      placeholder="Pelaporan kepada (contoh: Leader / Manager)"
                      value={exp.reporting_to}
                      onChange={(e) => {
                        const next = [...experiences];
                        next[idx].reporting_to = e.target.value;
                        setExperiences(next);
                      }}
                      className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Tanggung jawab (Satu poin per baris)"
                      value={exp.responsibilities.join("\n")}
                      onChange={(e) => {
                        const next = [...experiences];
                        next[idx].responsibilities = e.target.value
                          .split("\n")
                          .filter(Boolean);
                        setExperiences(next);
                      }}
                      className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs md:col-span-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === "PROJECTS" && (
          <div className="space-y-5">
            <button
              onClick={handleAddProject}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950"
            >
              <Plus className="h-4 w-4" /> Tambah Proyek
            </button>
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    placeholder="Nama Proyek"
                    value={proj.title}
                    onChange={(e) => {
                      const next = [...projects];
                      next[idx].title = e.target.value;
                      setProjects(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Live URL"
                    value={proj.live_url}
                    onChange={(e) => {
                      const next = [...projects];
                      next[idx].live_url = e.target.value;
                      setProjects(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Tech Stack (pisahkan dengan koma)"
                    value={proj.tech_stack.join(", ")}
                    onChange={(e) => {
                      const next = [...projects];
                      next[idx].tech_stack = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setProjects(next);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => {
                    const next = [...projects];
                    next[idx].description = e.target.value;
                    setProjects(next);
                  }}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateProject(proj)}
                    className="rounded bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="rounded bg-red-500/20 px-3 py-1 text-xs text-red-300"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: AWARDS & CERTIFICATIONS */}
        {activeTab === "AWARDS" && (
          <div className="space-y-5">
            <button
              onClick={handleAddAward}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950"
            >
              <Plus className="h-4 w-4" /> Tambah Pelatihan / Sertifikasi
            </button>
            {awards.map((aw, idx) => (
              <div
                key={aw.id}
                className="grid items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-5"
              >
                <input
                  placeholder="Nama Pelatihan / Penghargaan"
                  value={aw.title}
                  onChange={(e) => {
                    const next = [...awards];
                    next[idx].title = e.target.value;
                    setAwards(next);
                  }}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs md:col-span-2"
                />
                <input
                  placeholder="Pihak Penyelenggara"
                  value={aw.organizer}
                  onChange={(e) => {
                    const next = [...awards];
                    next[idx].organizer = e.target.value;
                    setAwards(next);
                  }}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                />
                <input
                  placeholder="Tahun (20xx)"
                  value={aw.year}
                  onChange={(e) => {
                    const next = [...awards];
                    next[idx].year = e.target.value;
                    setAwards(next);
                  }}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateAward(aw)}
                    className="rounded bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => handleDeleteAward(aw.id)}
                    className="rounded bg-red-500/20 px-3 py-1.5 text-xs text-red-300"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: SKILLS */}
        {activeTab === "SKILLS" && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAddSkill("BIDANG")}
                className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950"
              >
                + Keahlian Bidang
              </button>
              <button
                onClick={() => handleAddSkill("BAHASA")}
                className="rounded-lg border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold text-emerald-300"
              >
                + Keahlian Bahasa Asing
              </button>
              <button
                onClick={() => handleAddSkill("SOFTWARE")}
                className="rounded-lg border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold text-emerald-300"
              >
                + Keahlian Software
              </button>
            </div>

            {skills.map((sk, idx) => (
              <div
                key={sk.id}
                className="grid items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-5"
              >
                <span className="rounded bg-slate-800 px-2.5 py-1 text-center text-xs font-semibold text-emerald-400">
                  {sk.category}
                </span>
                <input
                  placeholder="Nama Keahlian"
                  value={sk.name}
                  onChange={(e) => {
                    const next = [...skills];
                    next[idx].name = e.target.value;
                    setSkills(next);
                  }}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs md:col-span-2"
                />
                <input
                  placeholder="Level / Keterangan (Opsional)"
                  value={sk.proficiency}
                  onChange={(e) => {
                    const next = [...skills];
                    next[idx].proficiency = e.target.value;
                    setSkills(next);
                  }}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateSkill(sk)}
                    className="rounded bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="rounded bg-red-500/20 px-3 py-1.5 text-xs text-red-300"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}