"use client";

import { useState, useRef, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import {
  RotateCcw,
  CheckCircle2,
  Printer,
  PenTool,
  Type,
  AlertCircle,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UploadFrontendService } from "@/services/frontend/upload";
import {
  getAgreementData,
  NDA_SECTIONS,
  NDA_WHEREAS,
} from "../../constants/ndaTemplate";

const PRIMARY_COLOR = "#1b1cfe";

export default function Step5Nda({
  formData,
  handleChange,
  errors = {},
  organization = null,
  companyDetails = null,
}) {
  const [signatureMode, setSignatureMode] = useState(
    formData.ndaSignatureType || "draw"
  );
  const [typedFontIndex, setTypedFontIndex] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(Boolean(formData.ndaSignatureData));
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { organization: clerkOrg } = useOrganization();
  const activeOrg = organization || clerkOrg;

  const orgLogo =
    activeOrg?.imageUrl ||
    activeOrg?.logo ||
    (companyDetails?.logo && companyDetails.logo !== "/assets/icons/logo.png" ? companyDetails.logo : null) ||
    companyDetails?.logo ||
    "/assets/icons/logo.png";

  const companyToUse = {
    name: companyDetails?.name || activeOrg?.name || "Organisation",
    address: companyDetails?.address || "Registered Corporate Office",
    phone: companyDetails?.phone || "",
    website: companyDetails?.website || "",
    representative: companyDetails?.representative || (activeOrg?.name ? `${activeOrg.name} Operations` : "Authorized Signatory"),
    designation: companyDetails?.designation || "Authorized Signatory",
    logo: orgLogo,
  };

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const { date, company, client, agreement } = getAgreementData({
    formData,
    organization: activeOrg,
    companyDetails: companyToUse,
  });

  const page1Sections = NDA_SECTIONS.slice(0, 5);
  const page2Sections = NDA_SECTIONS.slice(5);

  const TYPED_FONTS = [
    { name: "Cursive Script", style: "italic font-serif tracking-wider text-2xl" },
    { name: "Executive Formal", style: "font-serif tracking-normal text-xl uppercase font-semibold" },
    { name: "Modern Flow", style: "italic font-sans tracking-widest text-xl font-light" },
  ];

  // Initialize Canvas
  useEffect(() => {
    if (signatureMode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0f172a";

    if (formData.ndaSignatureData && formData.ndaSignatureData.startsWith("data:image")) {
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = formData.ndaSignatureData;
    }
  }, [signatureMode, formData.ndaSignatureData]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasCoords(e);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const currentPoint = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
    if (!hasDrawn) setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    handleChange("ndaSignatureData", dataUrl);
    handleChange("ndaSignatureType", "draw");
    handleChange("ndaSignedAt", new Date().toISOString());

    // Upload signature directly to S3
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          const file = new File([blob], `signature-${Date.now()}.png`, { type: "image/png" });
          const res = await UploadFrontendService.uploadDocument(file, "signatures");
          if (res?.url) {
            handleChange("ndaSignatureUrl", res.url);
          }
        } catch (e) {
          console.warn("Direct S3 signature upload warning:", e);
        }
      }
    }, "image/png");
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    handleChange("ndaSignatureData", "");
    handleChange("ndaSignatureUrl", "");
  };

  const uploadTypedSignatureToS3 = (name) => {
    if (!name?.trim()) return;
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = 400;
      offscreen.height = 100;
      const ctx = offscreen.getContext("2d");
      ctx.clearRect(0, 0, 400, 100);
      ctx.font = "italic bold 32px Georgia, serif";
      ctx.fillStyle = PRIMARY_COLOR;
      ctx.fillText(name.trim(), 20, 60);

      offscreen.toBlob(async (blob) => {
        if (blob) {
          try {
            const file = new File([blob], `signature-${Date.now()}.png`, { type: "image/png" });
            const res = await UploadFrontendService.uploadDocument(file, "signatures");
            if (res?.url) {
              handleChange("ndaSignatureUrl", res.url);
            }
          } catch (e) {
            console.warn("Typed signature S3 upload warning:", e);
          }
        }
      }, "image/png");
    } catch (e) {
      console.warn("Typed signature canvas render error:", e);
    }
  };

  const handleTypedNameChange = (name) => {
    handleChange("ndaSignerName", name);
    if (signatureMode === "type") {
      handleChange("ndaSignatureData", name.trim());
      handleChange("ndaSignatureType", "type");
      handleChange("ndaSignedAt", new Date().toISOString());
      if (name.trim().length >= 2) {
        uploadTypedSignatureToS3(name);
      }
    }
  };

  const handleSwitchMode = (mode) => {
    setSignatureMode(mode);
    handleChange("ndaSignatureType", mode);
    if (mode === "type") {
      const name = formData.ndaSignerName || client.name;
      handleChange("ndaSignerName", name);
      handleChange("ndaSignatureData", name.trim());
      if (name.trim()) uploadTypedSignatureToS3(name);
    } else {
      handleChange("ndaSignatureData", "");
      handleChange("ndaSignatureUrl", "");
      setHasDrawn(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: MagicScaleNdaPDF } = await import(
        "../../constants/MagicScaleNdaPDF"
      );

      let blob;
      try {
        blob = await pdf(
          <MagicScaleNdaPDF
            company={company}
            client={client}
            agreement={agreement}
            signatureData={formData.ndaSignatureUrl || formData.ndaSignatureData}
          />
        ).toBlob();
      } catch (pdfErr) {
        console.warn("Retrying PDF generation with fallback logo due to:", pdfErr);
        const safeCompany = {
          ...company,
          logo: "/assets/icons/logo.png",
        };
        blob = await pdf(
          <MagicScaleNdaPDF
            company={safeCompany}
            client={client}
            agreement={agreement}
            signatureData={formData.ndaSignatureUrl || formData.ndaSignatureData}
          />
        ).toBlob();
      }

      // Upload generated signed PDF to S3 in background if not already uploaded
      if (!formData.ndaAgreementPdfUrl) {
        UploadFrontendService.uploadDocument(
          new File([blob], `NDA_${(client.name || "Employee").replace(/\s+/g, "_")}.pdf`, {
            type: "application/pdf",
          }),
          "nda"
        ).then((res) => {
          if (res?.url) {
            handleChange("ndaAgreementPdfUrl", res.url);
          }
        }).catch(() => {});
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NDA_${(client.name || "Employee").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error, opening print dialog:", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Automatically generate and upload signed NDA PDF to S3 as soon as e-signature & attestation are completed
  useEffect(() => {
    if (
      formData.ndaAccepted &&
      formData.ndaAttested &&
      (formData.ndaSignatureUrl || formData.ndaSignatureData) &&
      !formData.ndaAgreementPdfUrl
    ) {
      const uploadSignedNda = async () => {
        try {
          const { pdf } = await import("@react-pdf/renderer");
          const { default: MagicScaleNdaPDF } = await import(
            "../../constants/MagicScaleNdaPDF"
          );
          const blob = await pdf(
            <MagicScaleNdaPDF
              company={company}
              client={client}
              agreement={agreement}
              signatureData={formData.ndaSignatureUrl || formData.ndaSignatureData}
            />
          ).toBlob();

          const file = new File(
            [blob],
            `NDA_${(client.name || "Employee").replace(/\s+/g, "_")}.pdf`,
            { type: "application/pdf" }
          );
          const res = await UploadFrontendService.uploadDocument(file, "nda");
          if (res?.url) {
            handleChange("ndaAgreementPdfUrl", res.url);
          }
        } catch (err) {
          console.warn("Background NDA S3 upload notification:", err);
        }
      };

      const timer = setTimeout(uploadSignedNda, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.ndaAccepted,
    formData.ndaAttested,
    formData.ndaSignatureUrl,
    formData.ndaSignatureData,
    formData.ndaAgreementPdfUrl,
  ]);

  const signerName = formData.ndaSignerName || client.name;
  const isSigned = Boolean(
    (formData.ndaSignatureUrl || formData.ndaSignatureData) &&
      formData.ndaAccepted &&
      formData.ndaAttested
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Banner / Actions Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/20 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-4 sm:p-5 shadow-xs">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative size-11 sm:size-12 rounded-xl bg-gradient-to-br from-indigo-500 via-[#1b1cfe] to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/25 shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="size-5 sm:size-6 text-white" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                  Employee Non-Disclosure Agreement
                </h2>
                {isSigned ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
                    <CheckCircle2 className="size-3" />
                    E-Signature Affixed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Signature Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review document terms below and complete electronic signature to finalize onboarding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border/50 w-full sm:w-auto shrink-0">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none gap-2 text-xs h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold cursor-pointer justify-center transition-all"
            >
              <Download className="size-3.5" />
              <span>{isGeneratingPdf ? "Generating..." : "Download PDF"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="flex-1 sm:flex-none gap-2 text-xs h-9 px-3.5 rounded-lg border-border/80 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium cursor-pointer justify-center shadow-2xs transition-all"
            >
              <Printer className="size-3.5" />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scoped Print CSS: Ensures clicking Download/Print prints ONLY the 2-page Agreement, hiding all surrounding UI */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 0;
            }
            @media print {
              html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #nda-agreement-print-area,
              #nda-agreement-print-area * {
                visibility: visible !important;
              }
              #nda-agreement-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              .nda-sheet {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-height: 1120px !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .nda-sheet-page-1 {
                page-break-after: always !important;
                break-after: page !important;
              }
              .nda-no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* ============================================================== */}
      {/* AUTHENTIC A4 PDF VIEWER STAGE (Split into 2 Standard A4 Sheets) */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-300/80 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-950 p-2 sm:p-6 md:p-8 flex flex-col items-center shadow-inner">
        {/* PDF Reader Toolbar */}
        <div className="w-full max-w-[794px] mb-3 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-xs backdrop-blur text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0 hidden xs:flex">
              <span className="size-2 rounded-full bg-rose-400" />
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="size-2 rounded-full bg-emerald-400" />
              <div className="h-3 w-px bg-slate-200 dark:bg-zinc-700 mx-1" />
            </div>
            <div className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase flex items-center gap-1 shrink-0">
              <FileText className="size-3" />
              <span>PDF</span>
            </div>
            <span className="font-semibold text-foreground truncate text-[11px] sm:text-xs">
              NDA_{client.name ? client.name.replace(/\s+/g, "_") : "Agreement"}.pdf
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              A4 Format (210 × 297 mm)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] sm:text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
              Page 1 / 2 • 2 Pages
            </span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold hidden md:inline-block">
              100% Fit
            </span>
          </div>
        </div>

        {/* Scrollable Container for Viewports */}
        <div className="w-full overflow-x-auto flex justify-center py-1 sm:py-2 px-0 sm:px-1">
          <div id="nda-agreement-print-area" className="w-full flex flex-col items-center">
            {/* ============================================================== */}
            {/* SHEET 1: PAGE 1 (Header, Recipient, Preamble & Sections 1-3)   */}
            {/* ============================================================== */}
            <div
              className="nda-sheet nda-sheet-page-1 w-full max-w-[794px] min-h-0 md:min-h-[1123px] bg-white text-[#222] shadow-[0_20px_50px_rgba(0,0,0,0.15),0_3px_10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] border border-slate-300/80 relative flex flex-col justify-between font-sans shrink-0 rounded-[2px]"
            >
              {/* stripTop - Flush to Top of Page */}
              <div
                className="w-full h-2.5 sm:h-3 shrink-0"
                style={{ backgroundColor: PRIMARY_COLOR }}
              />

              {/* A4 Inner Page Margin and Content */}
              <div className="px-3.5 xs:px-5 sm:px-10 md:px-14 pt-4 sm:pt-6 pb-4 sm:pb-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header Row with Organisation Logo */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 sm:pb-5">
                    <div className="h-10 sm:h-14 relative flex items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={company.logo || "/assets/icons/logo.png"}
                        alt={company.name || "Organisation Logo"}
                        className="max-h-9 sm:max-h-12 max-w-[120px] sm:max-w-[140px] w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/icons/logo.png";
                        }}
                      />
                    </div>
                    <div className="text-right text-[10px] sm:text-[11px] text-[#111] leading-tight sm:leading-relaxed">
                      <p className="font-semibold">{company.phone}</p>
                      <p className="text-slate-500">{company.website}</p>
                    </div>
                  </div>

                  {/* Header Bottom Row / Recipient */}
                  <div className="flex flex-wrap items-center justify-between gap-1 pt-3 sm:pt-5 pb-2 sm:pb-3 text-xs sm:text-[13px]">
                    <div>
                      <span className="font-bold text-[#111]">To </span>
                      <span className="font-bold uppercase tracking-wide break-words" style={{ color: PRIMARY_COLOR }}>
                        {client.name}
                      </span>
                    </div>
                    <div className="font-bold text-[#111] text-[11px] sm:text-xs">{date}</div>
                  </div>

                  {/* Content Body */}
                  <div className="py-2 space-y-3 text-xs sm:text-[12px] leading-relaxed text-[#222]">
                    <div className="text-center pb-1">
                      <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-foreground">
                        NON-DISCLOSURE AND PROPRIETARY RIGHTS AGREEMENT (NDA)
                      </h1>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                        Legally Binding Confidentiality, Non-Compete & Intellectual Property Covenant
                      </p>
                    </div>

                    <p className="text-left sm:text-justify leading-relaxed break-words">
                      This Non-Disclosure and Proprietary Rights Agreement is made and entered into on this{" "}
                      <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                        {agreement.date}
                      </span>{" "}
                      by and between:
                    </p>

                    <p className="text-left sm:text-justify leading-relaxed break-words">
                      <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                        {company.name}
                      </span>
                      , having its registered corporate office at{" "}
                      <span className="font-bold text-[#111]">{company.address}</span> (hereinafter referred to as the{" "}
                      <span className="font-bold text-[#111]">“Company”</span>), represented by{" "}
                      <span className="font-bold text-[#111]">{company.representative}</span> as{" "}
                      <span className="font-bold text-[#111]">{company.designation}</span>;
                    </p>

                    <p className="font-bold text-center text-[#111] my-0.5">AND</p>

                    <p className="text-left sm:text-justify leading-relaxed break-words">
                      <span className="font-bold uppercase" style={{ color: PRIMARY_COLOR }}>
                        {client.name}
                      </span>
                      , residing at <span className="font-bold text-[#111]">{client.address}</span>, Phone:{" "}
                      <span className="font-bold text-[#111]">{client.phone}</span>, Email:{" "}
                      <span className="font-bold text-[#111]">{client.email}</span>, engaged as{" "}
                      <span className="font-bold text-[#111]">{client.designation}</span> in{" "}
                      <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                        {client.department}
                      </span>{" "}
                      (hereinafter referred to as the{" "}
                      <span className="font-bold text-[#111]">“Receiving Party”</span>).
                    </p>

                    {/* WHEREAS Section */}
                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-[#111] uppercase tracking-wide">WHEREAS:</p>
                      <div className="space-y-1.5 pl-2.5 sm:pl-4">
                        {NDA_WHEREAS.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="font-bold select-none shrink-0" style={{ color: PRIMARY_COLOR }}>
                              •
                            </span>
                            <p className="text-left sm:text-justify leading-relaxed break-words">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="pt-1 text-left sm:text-justify leading-relaxed break-words">
                      NOW, Therefore, in consideration of the mutual covenants, employment terms, and compensation received herein, the parties agree as follows:
                    </p>

                    {/* Numbered Sections 1 to 5 */}
                    <div className="space-y-3.5 pt-1">
                      {page1Sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-bold text-[#111]">{sec.number}</p>
                          {sec.intro && <p className="text-left sm:text-justify leading-relaxed break-words">{sec.intro}</p>}
                          {sec.bullets && (
                            <div className="space-y-1 pl-2.5 sm:pl-4">
                              {sec.bullets.map((b, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-2">
                                  <span className="font-bold select-none shrink-0" style={{ color: PRIMARY_COLOR }}>
                                    •
                                  </span>
                                  <p className="text-left sm:text-justify leading-relaxed break-words">{b}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {sec.paragraphs &&
                            sec.paragraphs.map((p, pIdx) => (
                              <p key={pIdx} className="text-left sm:text-justify leading-relaxed break-words">
                                {p}
                              </p>
                            ))}
                          {sec.note && (
                            <p className="text-left sm:text-justify leading-relaxed break-words pt-0.5">
                              <span className="font-bold text-[#111]">Note :- </span>
                              <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                                {sec.note}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page 1 Footer Document Metadata */}
                <div className="mt-4 sm:mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Employee Non-Disclosure Agreement • Confidential</span>
                  <span>Page 1 of 2</span>
                </div>
              </div>

              {/* CommonFooter / footerWave - Flush to Bottom of Page */}
              <div
                className="w-full h-3 sm:h-4 shrink-0"
                style={{ backgroundColor: PRIMARY_COLOR }}
              />
            </div>

            {/* Visual Page Break Separator (Hidden during Print) */}
            <div className="nda-no-print my-4 sm:my-6 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono select-none">
              <span className="w-12 sm:w-16 h-px bg-slate-300 dark:bg-zinc-700" />
              <span className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs font-medium text-[10px] sm:text-[11px] text-slate-500">
                Page 1 of 2 End • Page 2 Begins Below
              </span>
              <span className="w-12 sm:w-16 h-px bg-slate-300 dark:bg-zinc-700" />
            </div>

            {/* ============================================================== */}
            {/* SHEET 2: PAGE 2 (Sections 6-11, Signature Block & Execution)   */}
            {/* ============================================================== */}
            <div
              className="nda-sheet nda-sheet-page-2 w-full max-w-[794px] min-h-0 md:min-h-[1123px] bg-white text-[#222] shadow-[0_20px_50px_rgba(0,0,0,0.15),0_3px_10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] border border-slate-300/80 relative flex flex-col justify-between font-sans shrink-0 rounded-[2px]"
            >
              {/* stripTop - Flush to Top of Page 2 */}
              <div
                className="w-full h-2.5 sm:h-3 shrink-0"
                style={{ backgroundColor: PRIMARY_COLOR }}
              />

              {/* A4 Inner Page Margin and Content for Page 2 */}
              <div className="px-3.5 xs:px-5 sm:px-10 md:px-14 pt-4 sm:pt-6 pb-4 sm:pb-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Page 2 Mini Header Row with Logo */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={company.logo || "/assets/icons/logo.png"}
                        alt={company.name}
                        className="max-h-6 sm:max-h-7 max-w-[80px] sm:max-w-[90px] w-auto object-contain shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/icons/logo.png";
                        }}
                      />
                      <div className="text-[11px] sm:text-xs truncate">
                        <span className="font-bold text-[#111]">{company.name}</span>
                        <span className="text-slate-400 ml-1.5 hidden sm:inline">• NDA Terms & Execution</span>
                      </div>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-[#111] shrink-0 ml-2">{date}</div>
                  </div>

                  {/* Numbered Sections 6 to 11 */}
                  <div className="py-3 sm:py-4 space-y-3.5 text-xs sm:text-[12px] leading-relaxed text-[#222]">
                    {page2Sections.map((sec, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-bold text-[#111]">{sec.number}</p>
                        {sec.intro && <p className="text-left sm:text-justify leading-relaxed break-words">{sec.intro}</p>}
                        {sec.bullets && (
                          <div className="space-y-1 pl-2.5 sm:pl-4">
                            {sec.bullets.map((b, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2">
                                <span className="font-bold select-none shrink-0" style={{ color: PRIMARY_COLOR }}>
                                  •
                                </span>
                                <p className="text-left sm:text-justify leading-relaxed break-words">{b}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {sec.paragraphs &&
                          sec.paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="text-left sm:text-justify leading-relaxed break-words">
                              {p}
                            </p>
                          ))}
                        {sec.note && (
                          <p className="text-left sm:text-justify leading-relaxed break-words pt-0.5">
                            <span className="font-bold text-[#111]">Note :- </span>
                            <span className="font-bold" style={{ color: PRIMARY_COLOR }}>
                              {sec.note}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Signature Row */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-300">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                    {/* Company Block (Left 50%) */}
                    <div className="w-full sm:w-1/2 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        FOR & ON BEHALF OF THE COMPANY:
                      </p>
                      <p className="font-bold text-[#111]">{company.name}</p>
                      <p className="text-xs text-[#111]">
                        Authorized Signatory: <span className="font-semibold">{company.representative}</span>
                      </p>
                      <p className="text-xs text-[#111]">
                        Designation: <span className="font-semibold">{company.designation}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Execution Date: {agreement.date}
                      </p>
                      <div className="pt-2">
                        <div className="inline-block p-2 rounded border border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-mono">
                          [ Authorized Corporate Signatory & Official Seal ]
                        </div>
                      </div>
                    </div>

                    {/* Client / Employee Block (Right 45%, Text Right) */}
                    <div className="w-full sm:w-[45%] text-left sm:text-right space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        RECEIVING PARTY (EMPLOYEE / CONSULTANT):
                      </p>
                      <p className="font-bold uppercase text-[#111]">{client.name}</p>
                      <p className="font-bold text-xs" style={{ color: PRIMARY_COLOR }}>
                        {client.representative}
                      </p>

                      {/* Live E-Signature preview directly on the document */}
                      <div className="pt-2 flex flex-col sm:items-end">
                        {formData.ndaSignatureUrl || formData.ndaSignatureData ? (
                          (formData.ndaSignatureUrl || formData.ndaSignatureData).startsWith("data:image") ||
                          (formData.ndaSignatureUrl || formData.ndaSignatureData).startsWith("http") ? (
                            <div className="p-1 rounded bg-white border border-slate-200 shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={formData.ndaSignatureUrl || formData.ndaSignatureData}
                                alt="Employee E-Signature"
                                className="h-10 sm:h-12 max-w-[140px] sm:max-w-[150px] object-contain"
                              />
                            </div>
                          ) : (
                            <p
                              className="font-serif italic text-xl sm:text-2xl font-bold py-1 break-words"
                              style={{ color: PRIMARY_COLOR }}
                            >
                              {formData.ndaSignatureData}
                            </p>
                          )
                        ) : (
                          <div className="p-2 border border-dashed border-amber-300 bg-amber-50 rounded text-[11px] text-amber-700 font-medium inline-block">
                            Awaiting E-Signature below ↓
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Digitally Stamped: {agreement.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 2 Footer Document Metadata */}
                <div className="mt-4 sm:mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Employee Non-Disclosure & Proprietary Rights Agreement • Confidential</span>
                  <span>Page 2 of 2</span>
                </div>
              </div>

              {/* CommonFooter / footerWave - Flush to Bottom of Page */}
              <div
                className="w-full h-3 sm:h-4 shrink-0"
                style={{ backgroundColor: PRIMARY_COLOR }}
              />
            </div>
          </div>
        </div>

        {/* Realistic Page Helper Notice */}
        <p className="mt-2.5 text-[11px] text-slate-500 text-center nda-no-print">
          Exact legal preview rendered to standard A4 sheet specifications (210 × 297 mm) across 2 pages.
        </p>
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE E-SIGNATURE EXECUTION STUDIO                        */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border/70 bg-gradient-to-b from-white to-slate-50/40 dark:from-zinc-900 dark:to-zinc-950 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <PenTool className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Affix Your Electronic Signature
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Draw your signature or type your legal name to affix it directly to the agreement above.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => handleSwitchMode("draw")}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                signatureMode === "draw"
                  ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PenTool className="size-3.5" />
              <span>Draw Signature</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("type")}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                signatureMode === "type"
                  ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Type className="size-3.5" />
              <span>Type Signature</span>
            </button>
          </div>
        </div>

        {/* DRAW MODE */}
        {signatureMode === "draw" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Draw inside the box using mouse, stylus, or fingertip:
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                disabled={!hasDrawn}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-rose-600 gap-1 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Clear Signature</span>
              </Button>
            </div>

            <div
              className={`relative rounded-xl border-2 border-dashed overflow-hidden bg-slate-50/70 dark:bg-zinc-950/60 transition-colors ${
                errors.ndaSignatureData
                  ? "border-rose-500 bg-rose-50/20"
                  : hasDrawn
                  ? "border-emerald-500/60 bg-emerald-50/10"
                  : "border-border/80 hover:border-primary/50"
              }`}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                className="w-full h-36 sm:h-44 touch-none cursor-crosshair block"
              />

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-muted-foreground/60 gap-1.5">
                  <PenTool className="size-6 text-muted-foreground/40" />
                  <span className="text-xs font-medium">Draw your signature here</span>
                </div>
              )}

              <div className="absolute bottom-6 left-8 right-8 border-b border-slate-300 dark:border-zinc-700/60 pointer-events-none flex justify-between text-[10px] text-muted-foreground/50 pt-1">
                <span>Sign Above</span>
                <span>Electronic Signature Stamp</span>
              </div>
            </div>

            {errors.ndaSignatureData && (
              <p className="text-xs font-medium text-rose-500 flex items-center gap-1.5 mt-1">
                <AlertCircle className="size-3.5" />
                {errors.ndaSignatureData}
              </p>
            )}
          </div>
        )}

        {/* TYPE MODE */}
        {signatureMode === "type" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Legal Full Name for Digital Signature:
              </label>
              <Input
                value={signerName}
                onChange={(e) => handleTypedNameChange(e.target.value)}
                placeholder="Enter your legal full name"
                className="h-11 text-sm bg-slate-50/60 dark:bg-zinc-950/60 border-border/60"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">
                Choose Signature Font Style:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TYPED_FONTS.map((font, idx) => (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => setTypedFontIndex(idx)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      typedFontIndex === idx
                        ? "border-primary bg-primary/5 text-primary shadow-xs"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-[10px] block font-semibold text-muted-foreground mb-1">
                      {font.name}
                    </span>
                    <span className={`${font.style} text-foreground block truncate`}>
                      {signerName || "Signature Preview"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {errors.ndaSignatureData && (
              <p className="text-xs font-medium text-rose-500 flex items-center gap-1.5 mt-1">
                <AlertCircle className="size-3.5" />
                {errors.ndaSignatureData}
              </p>
            )}
          </div>
        )}

        {/* Legal Consent Checkboxes */}
        <div className="pt-3 space-y-3 border-t border-border/40">
          <label
            htmlFor="ndaAccepted"
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group select-none ${
              formData.ndaAccepted
                ? "border-primary/40 bg-primary/[0.03]"
                : "border-border/60 bg-slate-50/50 dark:bg-zinc-950/40 hover:border-border"
            }`}
          >
            <Checkbox
              id="ndaAccepted"
              checked={Boolean(formData.ndaAccepted)}
              onCheckedChange={(checked) => handleChange("ndaAccepted", Boolean(checked))}
              className="mt-0.5 size-4 rounded border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-xs text-foreground/90 leading-relaxed group-hover:text-foreground">
              I acknowledge that I have read, understood, and agree to be bound by all <strong>11 sections</strong> of this Non-Disclosure and Proprietary Rights Agreement, including non-compete, non-solicitation, and liquidated damages provisions.
            </span>
          </label>

          <label
            htmlFor="ndaAttestation"
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group select-none ${
              formData.ndaAttested
                ? "border-primary/40 bg-primary/[0.03]"
                : "border-border/60 bg-slate-50/50 dark:bg-zinc-950/40 hover:border-border"
            }`}
          >
            <Checkbox
              id="ndaAttestation"
              checked={Boolean(formData.ndaAttested)}
              onCheckedChange={(checked) => handleChange("ndaAttested", Boolean(checked))}
              className="mt-0.5 size-4 rounded border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground">
              I certify that this electronic signature is executed by me, corresponds to my verified identity, and constitutes the legally binding equivalent of my handwritten signature under Section 10A of the Information Technology Act, 2000.
            </span>
          </label>

          {errors.ndaAccepted && (
            <p className="text-xs font-medium text-rose-500 flex items-center gap-1.5 pt-1">
              <AlertCircle className="size-3.5" />
              {errors.ndaAccepted}
            </p>
          )}

          {errors.ndaAttested && (
            <p className="text-xs font-medium text-rose-500 flex items-center gap-1.5 pt-0.5">
              <AlertCircle className="size-3.5" />
              {errors.ndaAttested}
            </p>
          )}
        </div>

        {/* Signed Notification Banner */}
        {isSigned && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-in fade-in-50">
            <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                Agreement Ready for Onboarding Finalization
              </span>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 text-[11px] truncate">
                Signed by <strong>{signerName}</strong>. Click &quot;Complete Onboarding&quot; below to finalize your profile.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
