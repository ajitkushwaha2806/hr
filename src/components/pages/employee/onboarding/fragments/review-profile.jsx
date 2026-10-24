"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  User,
  Briefcase,
  MapPin,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReviewProfile({ user, employee, organization }) {
  const router = useRouter();

  return (
    <main className="flex-1 w-full px-6 sm:px-10 lg:px-16 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 p-8 sm:p-12 text-white border border-zinc-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-18 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <CheckCircle2 className="size-10 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Onboarding Completed
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground border border-primary/30">
                  Role: {user?.role === "org:admin" ? "Organization Admin" : "Employee"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2.5 tracking-tight">
                Welcome aboard, {employee?.name || user?.name}!
              </h1>
              <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Your employee record is fully active and verified in{" "}
                <strong>{organization?.name || "your organization"}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => router.push("/employee/dashboard")}
              className="h-11 px-6 rounded-xl font-bold text-xs gap-2 shadow-md bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Identity & Contact */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border/50 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <User className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Identity & Contact</h3>
              <p className="text-[11px] text-muted-foreground">Primary employee profile</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">Full Name:</span>
              <p className="font-semibold text-foreground text-sm">{employee?.name || user?.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-semibold text-foreground truncate">{employee?.email || user?.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <p className="font-semibold text-foreground">{employee?.phone || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <p className="font-mono font-bold text-primary">{employee?.employeeId || "EMP-XXXX"}</p>
            </div>
          </div>
        </div>

        {/* Role & Team */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border/50 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Role & Team</h3>
              <p className="text-[11px] text-muted-foreground">Departmental placement</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">Department:</span>
              <p className="font-semibold text-foreground text-sm">{employee?.department || "Engineering"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Designation:</span>
              <p className="font-semibold text-foreground">{employee?.designation || "Employee"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Employment Type:</span>
              <p className="font-semibold text-foreground">{employee?.employmentType || "Full-Time"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{employee?.status || "Active"}</p>
            </div>
          </div>
        </div>

        {/* Residences & Emergency */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border/50 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
              <MapPin className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Residences</h3>
              <p className="text-[11px] text-muted-foreground">Address records</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">Current Residence:</span>
              <p className="font-semibold text-foreground">
                {[
                  employee?.currentAddress?.street || employee?.address?.street,
                  employee?.currentAddress?.city || employee?.address?.city,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Permanent Residence:</span>
              <p className="font-semibold text-foreground">
                {employee?.permanentAddress?.sameAsCurrent
                  ? "Same as Current Address"
                  : [employee?.permanentAddress?.street, employee?.permanentAddress?.city]
                      .filter(Boolean)
                      .join(", ") || "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Emergency Contact:</span>
              <p className="font-semibold text-foreground">
                {employee?.emergencyContact?.name
                  ? `${employee.emergencyContact.name} (${employee.emergencyContact.relation || "Contact"})`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Identity & Verification */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border/50 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
              <Shield className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Identity & Documents</h3>
              <p className="text-[11px] text-muted-foreground">Verified credentials</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground">Aadhar Card:</span>
              <p className="font-semibold text-foreground">
                {employee?.documents?.aadhar?.number
                  ? `Ending in **** ${employee.documents.aadhar.number.slice(-4)}`
                  : "Uploaded"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">PAN Card:</span>
              <p className="font-mono font-semibold text-foreground">
                {employee?.documents?.pan?.number || "Uploaded"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">10th Marksheet:</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{employee?.documents?.tenthResult?.rollNumber ? `Roll: ${employee.documents.tenthResult.rollNumber}` : "Verified"}</span>
                {employee?.documents?.tenthResult?.fileUrl && (
                  <a
                    href={employee.documents.tenthResult.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px] inline-flex items-center gap-0.5 ml-1"
                  >
                    View Document
                  </a>
                )}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">12th Marksheet:</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{employee?.documents?.twelfthResult?.rollNumber ? `Roll: ${employee.documents.twelfthResult.rollNumber}` : "Verified"}</span>
                {employee?.documents?.twelfthResult?.fileUrl && (
                  <a
                    href={employee.documents.twelfthResult.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px] inline-flex items-center gap-0.5 ml-1"
                  >
                    View Document
                  </a>
                )}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Signed NDA (S3 Cloud):</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>{employee?.nda?.isSigned ? "✓ Electronically Executed" : "Executed"}</span>
                {employee?.nda?.agreementPdfUrl && (
                  <a
                    href={employee.nda.agreementPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px] inline-flex items-center gap-0.5 ml-1 font-normal"
                  >
                    Download PDF
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
