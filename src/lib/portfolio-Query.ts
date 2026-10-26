import { createServerSupabase } from "@/lib/supabase/server";
import { PortfolioPayload, ProfileData } from "@/types/portfolio";

const FALLBACK_PROFILE: ProfileData = {
  id: "default",
  full_name: "Nama Lengkap",
  headline: "Full-Stack Developer & AI Engineer",
  photo_url: "",
  birth_place_date: "XXX",
  religion: "XXX",
  nationality: "XXX",
  marital_status: "XXX",
  address: "XXX",
  profile_summary:
    "Saya berpengalaman bidang pengembangan sistem selama 3 tahun. Saya merupakan individu yang menyukai tantangan dan hal-hal baru, memiliki kemampuan multitasking, mampu bekerja secara individu maupun teamwork. Saya menjunjung tinggi nilai integritas, disiplin, dan mudah berinteraksi dengan orang baru.",
  education_entries: [
    {
      institution: "SMA Negeri xxx",
      program_study: "(isi program study)",
      score_label: "Nilai rata-rata UN x.xx",
      city: "Kota xxx",
      period: "200x-200x",
    },
  ],
  hobbies: ["Xxx", "Xxx", "Xxx"],
  phone_raw: "8xxxxxxxxxx",
  phone_display: "+62 8xx xxxx xxxx",
  email: "(isi email)@gmail.com",
  linkedin_url: "https://linkedin.com/in/username",
  qr_target_url: "https://linkedin.com/in/username",
};

export async function getPortfolioData(): Promise<PortfolioPayload> {
  try {
    const supabase = await createServerSupabase();

    const [
      { data: profileData },
      { data: experiencesData },
      { data: projectsData },
      { data: awardsData },
      { data: skillsData },
    ] = await Promise.all([
      supabase.from("profile").select("*").limit(1).maybeSingle(),
      supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
      supabase.from("projects").select("*").order("sort_order", { ascending: true }),
      supabase.from("awards").select("*").order("sort_order", { ascending: true }),
      supabase.from("skills").select("*").order("sort_order", { ascending: true }),
    ]);

    return {
      profile: (profileData as ProfileData) || FALLBACK_PROFILE,
      experiences: experiencesData || [],
      projects: projectsData || [],
      awards: awardsData || [],
      skills: skillsData || [],
    };
  } catch {
    return {
      profile: FALLBACK_PROFILE,
      experiences: [],
      projects: [],
      awards: [],
      skills: [],
    };
  }
}