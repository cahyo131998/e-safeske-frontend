"use client";
import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart
} from "recharts";
import {
  Shield, AlertTriangle, Eye, ClipboardCheck, FileText,
  Users, Bell, Settings, ChevronRight, ChevronDown,
  Clock, CheckCircle, XCircle, Search, Plus, Download,
  Calendar, Flame, HardHat, Wrench, ChevronLeft, Home,
  Zap, BookOpen, Database, X, Loader2, LogOut
} from "lucide-react";
import axios from "axios";
import LoginPage from "./login";
import IncidentPage from "./incidents";
import DashboardPage from "./dashboard";
import GenericModule from "./generic-module";

const API_URL = "http://localhost:5000/api";

const colors = {
  primary: "#0D4222", primaryLight: "#166534", primaryLighter: "#22803D",
  accent: "#F59E0B", accentOrange: "#EA580C", danger: "#DC2626",
  success: "#16A34A", info: "#2563EB", warning: "#F59E0B",
  bg: "#F8FAFB", border: "#E5E7EB", textPrimary: "#111827",
  textSecondary: "#6B7280", textMuted: "#9CA3AF",
};

const riskColors: Record<string, string> = { Tinggi: "#DC2626", Sedang: "#F59E0B", Rendah: "#16A34A" };

const sidebarItems = [
  { icon: Home, label: "Dashboard" }, { icon: Flame, label: "Incident", badge: 3 },
  { icon: Eye, label: "Hazard Observation" }, { icon: Wrench, label: "CAR Management" },
  { icon: ClipboardCheck, label: "Inspection" }, { icon: Zap, label: "B-Sharp" },
  { icon: BookOpen, label: "Audit" }, { icon: Users, label: "Safety Meeting" },
  { icon: Shield, label: "HSE Scorecard" }, { icon: FileText, label: "Document" },
  { icon: HardHat, label: "Training" }, { icon: Bell, label: "Notification" },
  { icon: Database, label: "Master Data" }, { icon: Settings, label: "Settings" },
];

const trendData = [
  { bulan: "Des", value: 8 }, { bulan: "Jan", value: 10 }, { bulan: "Feb", value: 12 },
  { bulan: "Mar", value: 14 }, { bulan: "Apr", value: 12 }, { bulan: "Mei", value: 15 },
];

function RiskBadge({ level }: { level: string }) {
  return <span style={{ background: riskColors[level] + "18", color: riskColors[level], border: `1px solid ${riskColors[level]}40`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{level}</span>;
}

interface Hazard {
  id: number; judul: string; deskripsi: string; lokasi: string; area: string;
  tingkat_risiko: string; status: string; reporter_id: number; pic_id: number;
  target_close_date: string; created_at: string; tindakan_perbaikan: string;
}

interface Stats {
  total: number; open: number; inProgress: number; closed: number; overdue: number;
  byRisk: { tingkat_risiko: string; count: string }[];
}

// ===== MODULE CONFIGS =====
const moduleConfigs: Record<string, any> = {
  "CAR Management": {
    title: "CAR", apiPath: "cars", accentColor: "#7C3AED",
    statusOptions: ["Open", "In Progress", "Closed", "Verified"],
    fields: [
      { key: "judul", label: "Judul CAR", type: "text", placeholder: "Judul tindakan perbaikan", required: true, showInTable: true },
      { key: "sumber", label: "Sumber", type: "select", options: ["Hazard Report", "Incident", "Inspection", "Audit", "Lainnya"], showInTable: true },
      { key: "kategori", label: "Kategori", type: "select", options: ["Unsafe Condition", "Unsafe Action", "System"], showInTable: true },
      { key: "lokasi", label: "Lokasi", type: "text", placeholder: "Lokasi", required: true, showInTable: true },
      { key: "pic_nama", label: "PIC", type: "text", placeholder: "Nama penanggung jawab", showInTable: true },
      { key: "target_date", label: "Target Date", type: "date", showInTable: true },
      { key: "deskripsi", label: "Deskripsi", type: "textarea", placeholder: "Detail temuan...", showInTable: false },
      { key: "tindakan_perbaikan", label: "Tindakan Perbaikan", type: "textarea", placeholder: "Langkah perbaikan...", showInTable: false },
    ],
  },
  "Inspection": {
    title: "Inspection", apiPath: "inspections", accentColor: "#0891B2",
    statusOptions: ["Open", "In Progress", "Closed"],
    fields: [
      { key: "judul", label: "Judul Inspeksi", type: "text", placeholder: "Contoh: Inspeksi Bulanan Workshop", required: true, showInTable: true },
      { key: "tipe", label: "Tipe", type: "select", options: ["Rutin", "Khusus", "Mendadak", "Terjadwal"], showInTable: true },
      { key: "lokasi", label: "Lokasi", type: "text", placeholder: "Area inspeksi", required: true, showInTable: true },
      { key: "inspector", label: "Inspector", type: "text", placeholder: "Nama inspector", showInTable: true },
      { key: "tanggal_inspeksi", label: "Tanggal Inspeksi", type: "date", required: true, showInTable: true },
      { key: "skor", label: "Skor (%)", type: "number", placeholder: "0-100", showInTable: false },
      { key: "temuan_positif", label: "Temuan Positif", type: "textarea", placeholder: "Hal baik yang ditemukan...", showInTable: false },
      { key: "temuan_negatif", label: "Temuan Negatif", type: "textarea", placeholder: "Hal yang perlu diperbaiki...", showInTable: false },
      { key: "rekomendasi", label: "Rekomendasi", type: "textarea", placeholder: "Saran perbaikan...", showInTable: false },
    ],
  },
  "Safety Meeting": {
    title: "Safety Meeting", apiPath: "safety-meetings", accentColor: "#0D9488",
    statusOptions: ["Scheduled", "Completed", "Cancelled"],
    fields: [
      { key: "judul", label: "Judul Meeting", type: "text", placeholder: "Contoh: Safety Talk Mingguan", required: true, showInTable: true },
      { key: "tipe", label: "Tipe", type: "select", options: ["Daily", "Weekly", "Monthly", "Toolbox Talk", "Committee"], showInTable: true },
      { key: "tanggal", label: "Tanggal & Waktu", type: "datetime-local", required: true, showInTable: true },
      { key: "lokasi", label: "Lokasi", type: "text", placeholder: "Tempat meeting", showInTable: true },
      { key: "pemimpin", label: "Pemimpin", type: "text", placeholder: "Nama pemimpin rapat", showInTable: true },
      { key: "jumlah_peserta", label: "Jumlah Peserta", type: "number", placeholder: "0", showInTable: false },
      { key: "agenda", label: "Agenda", type: "textarea", placeholder: "Topik yang dibahas...", showInTable: false },
      { key: "notulen", label: "Notulen", type: "textarea", placeholder: "Catatan rapat...", showInTable: false },
      { key: "tindak_lanjut", label: "Tindak Lanjut", type: "textarea", placeholder: "Action items...", showInTable: false },
    ],
  },
  "Audit": {
    title: "Audit", apiPath: "audits", accentColor: "#4338CA",
    statusOptions: ["Open", "In Progress", "Closed"],
    fields: [
      { key: "judul", label: "Judul Audit", type: "text", placeholder: "Contoh: Audit SMK3 Internal Q2", required: true, showInTable: true },
      { key: "tipe", label: "Tipe", type: "select", options: ["Internal", "External", "Khusus", "Surveillance"], showInTable: true },
      { key: "tanggal_audit", label: "Tanggal Audit", type: "date", required: true, showInTable: true },
      { key: "auditor", label: "Auditor", type: "text", placeholder: "Nama auditor", showInTable: true },
      { key: "area", label: "Area", type: "text", placeholder: "Area yang diaudit", showInTable: true },
      { key: "skor", label: "Skor (%)", type: "number", placeholder: "0-100", showInTable: false },
      { key: "temuan", label: "Temuan", type: "textarea", placeholder: "Detail temuan audit...", showInTable: false },
      { key: "rekomendasi", label: "Rekomendasi", type: "textarea", placeholder: "Saran perbaikan...", showInTable: false },
    ],
  },
  "Training": {
    title: "Training", apiPath: "trainings", accentColor: "#B45309",
    statusOptions: ["Scheduled", "In Progress", "Completed", "Cancelled"],
    fields: [
      { key: "judul", label: "Judul Pelatihan", type: "text", placeholder: "Contoh: Basic Safety Induction", required: true, showInTable: true },
      { key: "tipe", label: "Tipe", type: "select", options: ["Induction", "Refresher", "Certification", "Workshop", "Drill"], showInTable: true },
      { key: "tanggal", label: "Tanggal", type: "date", required: true, showInTable: true },
      { key: "durasi_jam", label: "Durasi (Jam)", type: "number", placeholder: "1", showInTable: true },
      { key: "trainer", label: "Trainer", type: "text", placeholder: "Nama trainer", showInTable: true },
      { key: "lokasi", label: "Lokasi", type: "text", placeholder: "Tempat pelatihan", showInTable: false },
      { key: "jumlah_peserta", label: "Jumlah Peserta", type: "number", placeholder: "0", showInTable: false },
      { key: "materi", label: "Materi", type: "textarea", placeholder: "Ringkasan materi...", showInTable: false },
    ],
  },
  "Document": {
    title: "Document", apiPath: "documents", accentColor: "#1D4ED8",
    statusOptions: ["Active", "Under Review", "Expired", "Archived"],
    fields: [
      { key: "judul", label: "Judul Dokumen", type: "text", placeholder: "Contoh: Prosedur JSA", required: true, showInTable: true },
      { key: "kategori", label: "Kategori", type: "select", options: ["SOP", "Instruksi Kerja", "Form", "Plan", "Report", "Lainnya"], showInTable: true },
      { key: "nomor_dokumen", label: "Nomor Dokumen", type: "text", placeholder: "SKE-HSE-SOP-001", showInTable: true },
      { key: "versi", label: "Versi", type: "text", placeholder: "1.0", showInTable: true },
      { key: "tanggal_terbit", label: "Tanggal Terbit", type: "date", showInTable: true },
      { key: "penulis", label: "Penulis", type: "text", placeholder: "Nama penulis", showInTable: false },
      { key: "keterangan", label: "Keterangan", type: "textarea", placeholder: "Catatan...", showInTable: false },
    ],
  },
};

// Coming soon pages (yang belum punya modul)
const comingSoonPages = ["B-Sharp", "HSE Scorecard", "Notification", "Master Data", "Settings"];

export default function ESafeSKEDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, inProgress: 0, closed: 0, overdue: 0, byRisk: [] });
  const [formData, setFormData] = useState({ judul: "", deskripsi: "", lokasi: "", area: "", tingkat_risiko: "Sedang", target_close_date: "" });
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hazardRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/hazards`),
        axios.get(`${API_URL}/hazards/stats`),
      ]);
      setHazards(hazardRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (isLoggedIn && activePage === "Hazard Observation") fetchData();
  }, [isLoggedIn, activePage]);

  const handleLogin = (user: any, token: string) => { setCurrentUser(user); setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); setActivePage("Dashboard"); };

  const handleSubmit = async () => {
    if (!formData.judul || !formData.lokasi) { alert("Judul dan Lokasi wajib diisi!"); return; }
    try {
      setSaving(true);
      await axios.post(`${API_URL}/hazards`, formData);
      setShowModal(false);
      setFormData({ judul: "", deskripsi: "", lokasi: "", area: "", tingkat_risiko: "Sedang", target_close_date: "" });
      fetchData();
    } catch (err) { alert("Gagal menyimpan!"); } finally { setSaving(false); }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const hazard = hazards.find(h => h.id === id);
      if (!hazard) return;
      await axios.put(`${API_URL}/hazards/${id}`, { ...hazard, status: newStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus?")) return;
    try { await axios.delete(`${API_URL}/hazards/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  const filteredData = hazards.filter((h) =>
    h.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const riskDistribution = stats.byRisk.map(r => ({
    name: r.tingkat_risiko, value: parseInt(r.count), color: riskColors[r.tingkat_risiko] || "#999",
  }));

  const summaryCards = [
    { label: "Total Observasi", value: stats.total, icon: Eye, color: colors.info },
    { label: "Open", value: stats.open, icon: AlertTriangle, color: colors.danger },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: colors.accent },
    { label: "Closed", value: stats.closed, icon: CheckCircle, color: colors.success },
    { label: "Overdue", value: stats.overdue, icon: XCircle, color: colors.accentOrange },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const initials = currentUser?.nama?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U";

  const pageTitles: Record<string, string> = {
    "Dashboard": "Dashboard", "Incident": "Incident Reporting", "Hazard Observation": "Hazard Observation",
    "CAR Management": "CAR Management", "Inspection": "Inspection", "B-Sharp": "B-Sharp (BBS)",
    "Audit": "Audit", "Safety Meeting": "Safety Meeting", "HSE Scorecard": "HSE Scorecard",
    "Document": "Document Management", "Training": "Training Management",
    "Notification": "Notification", "Master Data": "Master Data", "Settings": "Settings",
  };
  const pageTitle = pageTitles[activePage] || activePage;

  // Check if current page uses generic module
  const isGenericModule = Object.keys(moduleConfigs).includes(activePage);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: colors.bg, overflow: "hidden" }}>
      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 240 : 68, background: `linear-gradient(180deg, ${colors.primary} 0%, #0A3419 100%)`, transition: "width 0.3s", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: sidebarOpen ? "20px 20px 16px" : "20px 12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #22C55E, #16A34A)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(34,197,94,0.3)", flexShrink: 0 }}>
            <Shield size={20} color="white" strokeWidth={2.5} />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: 16 }}>e-</span>
                <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>SafeSKE</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 500 }}>PT Spektrum Krisindo Elektrika</div>
            </div>
          )}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {sidebarItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.label === activePage;
            return (
              <button key={i} onClick={() => setActivePage(item.label)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: isActive ? "rgba(34,197,94,0.15)" : "transparent", color: isActive ? "#4ADE80" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: isActive ? 600 : 400, position: "relative", marginBottom: 2, textAlign: "left", fontFamily: "inherit" }}>
                {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 2, background: "#4ADE80" }} />}
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                {sidebarOpen && item.badge && <span style={{ marginLeft: "auto", background: "#DC2626", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {sidebarOpen && "Collapse"}
        </button>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, background: "white", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>{pageTitle}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px 6px 6px", borderRadius: 10, background: "#F3F4F6" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{currentUser?.nama}</div>
                <div style={{ fontSize: 10, color: colors.textMuted }}>{currentUser?.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", fontSize: 12, color: colors.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 20 }}>
            <span style={{ fontWeight: 600, color: colors.primaryLight }}>e-SafeSKE</span>
            <ChevronRight size={12} style={{ verticalAlign: "middle", margin: "0 4px" }} />
            <span style={{ color: colors.primaryLight, fontWeight: 500 }}>{pageTitle}</span>
          </div>

          {/* DASHBOARD */}
          {activePage === "Dashboard" && <DashboardPage colors={colors} currentUser={currentUser} />}

          {/* INCIDENT */}
          {activePage === "Incident" && <IncidentPage colors={colors} />}

          {/* GENERIC MODULES (CAR, Inspection, Safety Meeting, Audit, Training, Document) */}
          {isGenericModule && (
            <GenericModule
              colors={colors}
              title={moduleConfigs[activePage].title}
              apiPath={moduleConfigs[activePage].apiPath}
              fields={moduleConfigs[activePage].fields}
              statusOptions={moduleConfigs[activePage].statusOptions}
              accentColor={moduleConfigs[activePage].accentColor}
            />
          )}

          {/* COMING SOON */}
          {comingSoonPages.includes(activePage) && (
            <div style={{ background: "white", borderRadius: 16, padding: "60px 40px", textAlign: "center", border: `1px solid ${colors.border}` }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "#F3F4F6", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Wrench size={28} color={colors.textMuted} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>Modul {pageTitle}</h3>
              <p style={{ margin: 0, fontSize: 14, color: colors.textSecondary }}>Modul ini sedang dalam pengembangan.</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: colors.textMuted }}>Coming Soon — Fase 3</p>
            </div>
          )}

          {/* HAZARD OBSERVATION */}
          {activePage === "Hazard Observation" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
                {summaryCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 500 }}>{card.label}</span>
                        <Icon size={18} color={card.color} />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>{loading ? "..." : card.value}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: `1px solid ${colors.border}` }}>
                  <div style={{ position: "relative" }}>
                    <Search size={15} color={colors.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input placeholder="Cari judul / lokasi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#F9FAFB", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>Risiko</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ResponsiveContainer width={100} height={100}>
                      <PieChart><Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={2} stroke="white">{riskDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      {riskDistribution.map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} /><span style={{ color: colors.textSecondary }}>{r.name}</span></div>
                          <span style={{ fontWeight: 600 }}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${colors.border}`, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Daftar Hazard Observation</h2>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", fontSize: 12, color: colors.textSecondary, cursor: "pointer", fontFamily: "inherit" }}><Download size={14} /> Export</button>
                    <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary})`, fontSize: 12, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><Plus size={14} /> Buat Observasi</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB" }}>
                        {["No", "Judul", "Lokasi", "Area", "Risiko", "Tanggal", "Status", "Target", "Aksi"].map((h, i) => (
                          <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, i) => (
                        <tr key={row.id} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)} style={{ background: hoveredRow === i ? "#F0FDF4" : "transparent" }}>
                          <td style={{ padding: "12px 14px", color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{i + 1}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 500, color: colors.textPrimary, borderBottom: `1px solid ${colors.border}` }}>{row.judul}</td>
                          <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>{row.lokasi}</td>
                          <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}` }}>{row.area}</td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}><RiskBadge level={row.tingkat_risiko} /></td>
                          <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>{formatDate(row.created_at)}</td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                            <select value={row.status} onChange={(e) => handleUpdateStatus(row.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 11, cursor: "pointer", fontFamily: "inherit", background: row.status === "Open" ? "#FEE2E2" : row.status === "In Progress" ? "#FEF3C7" : "#DCFCE7", color: row.status === "Open" ? "#DC2626" : row.status === "In Progress" ? "#D97706" : "#16A34A" }}>
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>{formatDate(row.target_close_date)}</td>
                          <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                            <button onClick={() => handleDelete(row.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredData.length === 0 && <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>Tidak ada data</div>}
                </div>
                <div style={{ padding: "12px 20px", borderTop: `1px solid ${colors.border}`, fontSize: 12, color: colors.textMuted }}>Total: {filteredData.length} observasi</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Trend Hazard</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={trendData}>
                      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors.primaryLight} stopOpacity={0.2} /><stop offset="100%" stopColor={colors.primaryLight} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke={colors.primaryLight} strokeWidth={2.5} fill="url(#tg)" dot={{ r: 4, fill: colors.primaryLight, stroke: "white", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Ringkasan</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Total", value: stats.total, color: colors.info },
                      { label: "Risiko Tinggi", value: stats.byRisk.find(r => r.tingkat_risiko === "Tinggi")?.count || "0", color: "#DC2626" },
                      { label: "Open", value: stats.open, color: "#EA580C" },
                      { label: "Closed", value: stats.closed, color: "#16A34A" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, background: "#F9FAFB" }}>
                        <span style={{ fontSize: 13, color: colors.textSecondary }}>{item.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL HAZARD */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 500, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Buat Observasi Baru</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={colors.textMuted} /></button>
            </div>
            {[
              { label: "Judul *", key: "judul", type: "text", ph: "Contoh: Tumpahan oli" },
              { label: "Deskripsi", key: "deskripsi", type: "textarea", ph: "Detail temuan..." },
              { label: "Lokasi *", key: "lokasi", type: "text", ph: "Contoh: Workshop Area" },
              { label: "Area", key: "area", type: "text", ph: "Contoh: Maintenance" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={formData[f.key as keyof typeof formData]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.ph} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" }} />
                ) : (
                  <input value={formData[f.key as keyof typeof formData]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.ph} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Risiko</label>
                <select value={formData.tingkat_risiko} onChange={(e) => setFormData({ ...formData, tingkat_risiko: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit" }}>
                  <option value="Tinggi">Tinggi</option><option value="Sedang">Sedang</option><option value="Rendah">Rendah</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Target Close</label>
                <input type="date" value={formData.target_close_date} onChange={(e) => setFormData({ ...formData, target_close_date: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary})`, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}