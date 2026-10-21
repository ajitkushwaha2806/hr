"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { AttendanceService } from "@/services/frontend/attendance";
import OfficeLocationModal from "@/components/pages/admin/modals/office-location-modal";
import { ShieldCheck, MapPin, RefreshCw, Search, CheckCircle2, Sliders } from "lucide-react";

export default function AdminAttendancePage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedSelfie, setSelectedSelfie] = useState(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const [logsRes, locRes] = await Promise.all([
        AttendanceService.getAdminAttendanceLogs({ limit: 100 }),
        AttendanceService.getOfficeLocation(),
      ]);
      if (logsRes?.success) {
        setLogs(logsRes.data || []);
      }
      if (locRes?.success) {
        setOfficeLocation(locRes.data || null);
      }
    } catch (err) {
      console.error("Failed to load attendance logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const emp = l.employeeId || {};
      const name = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.email || "";
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.date?.includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterType === "checked_in") return l.checkIn?.status === "SUCCESS";
      if (filterType === "completed") return l.status === "COMPLETED";
      return true;
    });
  }, [logs, searchQuery, filterType]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 p-3 sm:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Company Attendance & Biometric Audit
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" /> AWS Rekognition
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Audit live biometric captures, Geofence radius validations, and punch timestamps across the company.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="h-8.5 px-3 rounded-lg border-border text-xs font-medium cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Logs
          </Button>

          <Button
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="h-8.5 px-3 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Office Geofence
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by employee, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={filterType === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="h-8 text-xs rounded-lg"
          >
            All Logs ({logs.length})
          </Button>
          <Button
            variant={filterType === "checked_in" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterType("checked_in")}
            className="h-8 text-xs rounded-lg"
          >
            Checked In
          </Button>
          <Button
            variant={filterType === "completed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterType("completed")}
            className="h-8 text-xs rounded-lg"
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Employee</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Check-In</th>
                <th className="p-3.5">Check-Out</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Geofence Distance</th>
                <th className="p-3.5">Biometric Match</th>
                <th className="p-3.5 pr-4 text-right">Selfie Capture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
                    Loading attendance audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No attendance logs found matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((punch) => {
                  const emp = punch.employeeId || {};
                  const empName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.email || "Employee";
                  const checkInTime = punch.checkIn?.time ? new Date(punch.checkIn.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
                  const checkOutTime = punch.checkOut?.time ? new Date(punch.checkOut.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
                  const durationHours = punch.durationMinutes ? `${Math.floor(punch.durationMinutes / 60)}h ${punch.durationMinutes % 60}m` : "--";
                  const distance = punch.checkIn?.distanceMeters != null ? `${Math.round(punch.checkIn.distanceMeters)}m` : "--";
                  const confidence = punch.checkIn?.faceMatchConfidence ? `${Math.round(punch.checkIn.faceMatchConfidence)}%` : "Verified";
                  const selfie = punch.checkIn?.selfieUrl;

                  return (
                    <tr key={punch._id} className="hover:bg-muted/20 transition-colors">
                      {/* Employee Info */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={empName} className="size-8 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {empName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{empName}</p>
                            <p className="text-[11px] text-muted-foreground">{emp.email || emp.department || "Staff"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                        {punch.date}
                      </td>

                      {/* Check-In */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {checkInTime}
                        </span>
                      </td>

                      {/* Check-Out */}
                      <td className="p-3.5 whitespace-nowrap">
                        {punch.checkOut ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {checkOutTime}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">In Progress</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                        {durationHours}
                      </td>

                      {/* Geofence Distance */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" /> {distance}
                        </span>
                      </td>

                      {/* Biometric Match */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Rekognition: {confidence}
                        </span>
                      </td>

                      {/* Selfie View */}
                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        {selfie ? (
                          <button
                            onClick={() => setSelectedSelfie(selfie)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                          >
                            <img src={selfie} alt="Punch Selfie" className="size-6 rounded-md object-cover border border-border inline-block" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selfie Preview Modal */}
      {selectedSelfie && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedSelfie(null)}
        >
          <div className="bg-card border border-border p-4 rounded-2xl max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Biometric Live Camera Capture</h3>
              <button onClick={() => setSelectedSelfie(null)} className="text-xs text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>
            <img src={selectedSelfie} alt="Biometric Capture" className="w-full aspect-square object-cover rounded-xl border border-border" />
            <p className="text-[11px] text-muted-foreground text-center">
              Verified with AWS Rekognition facial comparison & blink liveness check.
            </p>
          </div>
        </div>
      )}

      {/* Office Location Modal */}
      <OfficeLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={officeLocation}
        onSaved={(newLoc) => setOfficeLocation(newLoc)}
      />
    </div>
  );
}
