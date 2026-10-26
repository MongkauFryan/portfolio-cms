"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";
import { PortfolioPayload } from "@/types/portfolio";

interface Props {
  data: PortfolioPayload;
  className?: string;
}

async function getCircularPhotoBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    const size = 300;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const minDim = Math.min(imageBitmap.width, imageBitmap.height);
    const sx = (imageBitmap.width - minDim) / 2;
    const sy = (imageBitmap.height - minDim) / 2;
    ctx.drawImage(imageBitmap, sx, sy, minDim, minDim, 0, 0, size, size);

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#222222";
    ctx.stroke();

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export default function CVDownloadButton({ data, className }: Props) {
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const { profile, experiences, awards, skills } = data;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginL = 18;
      const marginR = 18;
      const contentWidth = pageWidth - marginL - marginR;
      let y = 18;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 16) {
          doc.addPage();
          y = 18;
        }
      };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(12);
        y += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 15, 15);
        doc.text(title.toUpperCase(), marginL, y);
        y += 1.8;
        doc.setDrawColor(40, 40, 40);
        doc.setLineWidth(0.35);
        doc.line(marginL, y, pageWidth - marginR, y);
        y += 5;
      };

      // TOP TITLE: Curriculum Vitae
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Curriculum Vitae", marginL, y);
      y += 6;

      // HEADER BLOCK: Circular Pas Photo (Left) + Personal Fields (Right)
      const photoCenterX = marginL + 17;
      const photoCenterY = y + 17;
      const photoRadius = 16;

      const circularImg = await getCircularPhotoBase64(profile.photo_url);
      if (circularImg) {
        doc.addImage(
          circularImg,
          "PNG",
          photoCenterX - photoRadius,
          photoCenterY - photoRadius,
          photoRadius * 2,
          photoRadius * 2
        );
      } else {
        doc.setDrawColor(30, 30, 30);
        doc.setLineWidth(0.5);
        doc.circle(photoCenterX, photoCenterY, photoRadius, "S");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("Isi Pas Photo", photoCenterX, photoCenterY + 1, {
          align: "center",
        });
      }

      const infoX = marginL + 40;
      const valueX = infoX + 43;
      let infoY = y + 3;

      // Nama Lengkap
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(profile.full_name || "Nama Lengkap", infoX, infoY);
      infoY += 6.5;

      const personalRows: [string, string][] = [
        ["Tempat Tanggal Lahir", profile.birth_place_date || "XXX"],
        ["Agama", profile.religion || "XXX"],
        ["Warganegara", profile.nationality || "XXX"],
        ["Status", profile.marital_status || "XXX"],
        ["Alamat", profile.address || "XXX"],
      ];

      doc.setFontSize(9.5);
      personalRows.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.text(label, infoX, infoY);
        doc.text(`|  ${val}`, valueX, infoY);
        infoY += 5.2;
      });

      y = Math.max(photoCenterY + photoRadius + 4, infoY + 2);

      // 1. PROFILE
      drawSectionHeader("PROFILE");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const profileLines = doc.splitTextToSize(
        profile.profile_summary || "",
        contentWidth
      );
      checkPageBreak(profileLines.length * 4.6 + 2);
      doc.text(profileLines, marginL, y);
      y += profileLines.length * 4.6 + 2;

      // 2. PENDIDIKAN TERAKHIR
      drawSectionHeader("PENDIDIKAN TERAKHIR");
      const educations = Array.isArray(profile.education_entries)
        ? profile.education_entries
        : [];
      educations.forEach((edu) => {
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(edu.institution || "SMA Negeri xxx", marginL, y);
        doc.setFont("helvetica", "normal");
        doc.text(edu.city || "Kota xxx", pageWidth - marginR, y, {
          align: "right",
        });
        y += 4.6;

        doc.text(edu.program_study || "(isi program study)", marginL, y);
        doc.text(edu.period || "200x-200x", pageWidth - marginR, y, {
          align: "right",
        });
        y += 4.6;

        if (edu.score_label) {
          doc.text(edu.score_label, marginL, y);
          y += 5.2;
        } else {
          y += 2;
        }
      });

      // 3. PENGALAMAN KERJA
      const workExps = experiences.filter((e) => e.category === "WORK");
      drawSectionHeader("PENGALAMAN KERJA");
      workExps.forEach((work) => {
        checkPageBreak(26);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(work.company_or_org || "PT xxx", marginL, y);
        doc.setFont("helvetica", "normal");
        doc.text(work.city || "Kota", pageWidth - marginR, y, {
          align: "right",
        });
        y += 4.6;

        doc.setFont("helvetica", "bold");
        doc.text(work.role || "General Administration", marginL, y);
        doc.setFont("helvetica", "normal");
        doc.text(work.period || "Feb 20xx - Des 20xx", pageWidth - marginR, y, {
          align: "right",
        });
        y += 4.8;

        const introLine = `Perusahaan bidang ${
          work.industry_field || "(contoh: otomotif, dll)"
        }, berperan sebagai ${work.role || "(bagian)"} dan bertanggung jawab atas :`;
        const splitIntro = doc.splitTextToSize(introLine, contentWidth);
        checkPageBreak(splitIntro.length * 4.5 + 2);
        doc.text(splitIntro, marginL, y);
        y += splitIntro.length * 4.5 + 1;

        (work.responsibilities || []).forEach((resp) => {
          const bulletLines = doc.splitTextToSize(resp, contentWidth - 6);
          checkPageBreak(bulletLines.length * 4.5 + 1);
          doc.text("•", marginL + 1.5, y);
          doc.text(bulletLines, marginL + 6, y);
          y += bulletLines.length * 4.5;
        });

        if (work.reporting_to) {
          checkPageBreak(6);
          doc.text(
            `Bertanggung jawab atas semua pelaporan kepada ${work.reporting_to}`,
            marginL,
            y + 1
          );
          y += 6.5;
        } else {
          y += 3;
        }
      });

      // 4. PENGALAMAN ORGANISASI
      const orgExps = experiences.filter((e) => e.category === "ORGANIZATION");
      drawSectionHeader("PENGALAMAN ORGANISASI");
      orgExps.forEach((org) => {
        checkPageBreak(6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`•  ${org.company_or_org}`, marginL, y);
        doc.text(org.role || "Sekretaris", marginL + 95, y);
        doc.text(org.period || "20xx - sekarang", pageWidth - marginR, y, {
          align: "right",
        });
        y += 5;
      });

      // 5. PELATIHAN & SERTIFIKASI
      drawSectionHeader("PELATIHAN & SERTIFIKASI");
      awards.forEach((cert) => {
        checkPageBreak(6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`•  ${cert.title}`, marginL, y);
        doc.text(`(${cert.organizer})`, marginL + 95, y);
        doc.text(cert.year || "20xx", pageWidth - marginR, y, {
          align: "right",
        });
        y += 5;
      });

      // 6. KEAHLIAN BIDANG
      const bidangSkills = skills.filter((s) => s.category === "BIDANG");
      drawSectionHeader("KEAHLIAN BIDANG");
      bidangSkills.forEach((sk) => {
        checkPageBreak(5.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`•  ${sk.name}`, marginL, y);
        y += 4.8;
      });

      // 7. KEAHLIAN BAHASA ASING
      const bahasaSkills = skills.filter((s) => s.category === "BAHASA");
      drawSectionHeader("KEAHLIAN BAHASA ASING");
      bahasaSkills.forEach((sk) => {
        checkPageBreak(5.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        const label = sk.proficiency
          ? `${sk.name}: ${sk.proficiency}`
          : sk.name;
        doc.text(`•  ${label}`, marginL, y);
        y += 4.8;
      });

      // 8. KEAHLIAN SOFTWARE
      const softwareSkills = skills.filter((s) => s.category === "SOFTWARE");
      drawSectionHeader("KEAHLIAN SOFTWARE");
      softwareSkills.forEach((sk) => {
        checkPageBreak(5.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`•  ${sk.name}`, marginL, y);
        y += 4.8;
      });

      // 9. HOBI
      drawSectionHeader("HOBI");
      (profile.hobbies || []).forEach((hobi) => {
        checkPageBreak(5.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`•  ${hobi}`, marginL, y);
        y += 4.8;
      });

      // 10. KONTAK & INFORMASI + QR CODE
      drawSectionHeader("KONTAK & INFORMASI");
      checkPageBreak(42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      const cleanDigits = (profile.phone_raw || "").replace(/[^0-9]/g, "");
      const waNormalized = cleanDigits.startsWith("62")
        ? cleanDigits
        : `62${cleanDigits.replace(/^0+/, "")}`;

      const contactRows: [string, string][] = [
        [
          "No. Telepon",
          `: https://wa.me/${waNormalized} / ${profile.phone_display}`,
        ],
        ["Email", `: ${profile.email}`],
        ["LinkedIn", `: ${profile.linkedin_url}`],
      ];

      contactRows.forEach(([label, value]) => {
        doc.text(label, marginL, y);
        doc.text(value, marginL + 28, y);
        y += 5;
      });

      if (profile.qr_target_url || profile.linkedin_url) {
        const qrDataUrl = await QRCode.toDataURL(
          profile.qr_target_url || profile.linkedin_url,
          { margin: 1, width: 160 }
        );
        y += 2;
        doc.addImage(qrDataUrl, "PNG", marginL, y, 24, 24);
      }

      const safeFileName = (profile.full_name || "Curriculum_Vitae")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_");
      doc.save(`CV_${safeFileName}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePDF}
      disabled={generating}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      }
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {generating ? "Generating ATS CV..." : "Download CV (PDF)"}
    </button>
  );
}