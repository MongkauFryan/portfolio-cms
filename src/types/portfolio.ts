export interface EducationEntry {
  institution: string;
  program_study: string;
  score_label: string;
  city: string;
  period: string;
}

export interface ProfileData {
  id: string;
  full_name: string;
  headline: string;
  photo_url: string;
  birth_place_date: string;
  religion: string;
  nationality: string;
  marital_status: string;
  address: string;
  profile_summary: string;
  education_entries: EducationEntry[];
  hobbies: string[];
  phone_raw: string;
  phone_display: string;
  email: string;
  linkedin_url: string;
  qr_target_url: string;
  updated_at?: string;
}

export interface ExperienceData {
  id: string;
  category: "WORK" | "ORGANIZATION";
  company_or_org: string;
  role: string;
  industry_field: string;
  city: string;
  period: string;
  responsibilities: string[];
  reporting_to: string;
  sort_order: number;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url: string;
  repo_url: string;
  featured: boolean;
  sort_order: number;
}

export interface AwardData {
  id: string;
  title: string;
  organizer: string;
  year: string;
  description: string;
  sort_order: number;
}

export interface SkillData {
  id: string;
  category: "BIDANG" | "BAHASA" | "SOFTWARE";
  name: string;
  proficiency: string;
  sort_order: number;
}

export interface PortfolioPayload {
  profile: ProfileData;
  experiences: ExperienceData[];
  projects: ProjectData[];
  awards: AwardData[];
  skills: SkillData[];
}