"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Plus, X, Download, Search, Loader2, Calendar } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  Minor: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  Moderate: { bg: "#FFEDD5", text: "#EA580C", border: "#FED7AA" },
  Major: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
  Fatal: { bg: "#7F1D1D", text: "#FFFFFF", border: "#991B1B" },
};

const tipeColors: Record<string, { bg: string; text: string }> = {
  "Near Miss": { bg: "#DBEAFE", text: "#2563EB" },
  "First Aid": { bg: "#FEF3C7", text: "#D97706" },
  "Medical Treatment": { bg: "#FFEDD5", text: "#EA580C" },
  "Lost Time Injury": { bg: "#FEE2E2", text: "#DC2626" },
  "Fatality": { bg: "#7F1D1D", text: "#FFFFFF" },
};

interface Incident {
  id: number; judul: string; deskripsi: string; tipe: string; severity: string;
  lokasi: string; tanggal_kejadian: string; korban_nama: string; korban_jabatan: string;
  hari_kerja_hilang: number; root_cause: string; corrective_action: string;
  status: string; created_at: string;
}

interface IncidentStats {
  total: number; open: number; closed: number; totalHariHilang: number;
  bySeverity: { severity: string; count: string }[];
  byTipe: { tipe: string; count: string }[];
}

interface IncidentPageProps {
  colors: any;
}

export default function IncidentPage({ colors }: IncidentPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats>({ total: 0, open: 0, closed: 0, totalHariHilang: 0, bySeverity: [], byTipe: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    judul: "", deskripsi: "", tipe: "Near Miss", severity: "Minor", lokasi: "",
    tanggal_kejadian: "", korban_nama: "", korban_jabatan: "", hari_kerja_hilang: "0",
    root_cause: "", corrective_action: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`),
        axios.get(`${API_URL}/incidents/stats`),
      ]);
      setIncidents(incRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!formData.judul || !formData.lokasi || !formData.tanggal_kejadian) {
      alert("Judul, Lokasi, dan Tanggal Kejadian wajib diisi!"); return;
    }
    try {
      setSaving(true);
      await axios.post(`${API_URL}/incidents`, { ...formData, hari_kerja_hilang: parseInt(formData.hari_kerja_hilang) || 0 });
      setShowModal(false);
      setFormData({ judul: "", deskripsi: "", tipe: "Near Miss", severity: "Minor", lokasi: "", tanggal_kejadian: "", korban_nama: "", korban_jabatan: "", hari_kerja_hilang: "0", root_cause: "", corrective_action: "" });
      fetchData();
    } catch (err) { alert("Gagal menyimpan!"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus incident ini?")) return;
    try { await axios.delete(`${API_URL}/incidents/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const inc = incidents.find(i => i.id === id);
      if (!inc) return;
      await axios.put(`${API_URL}/incidents/${id}`, { ...inc, status: newStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredData = incidents.filter(i =>
    i.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

  const cards = [
    { label: "Total Incident", value: stats.total, color: "#DC2626", icon: AlertTriangle },
    { label: "Open", value: stats.open, color: "#EA580C" },
    { label: "Closed", value: stats.closed, color: "#16A34A" },
    { label: "Hari Kerja Hilang", value: stats.totalHariHilang, color: "#7C3AED" },
  ];

  return (
    <div>
      {/* SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: 12, color: colors.textSecondary }}>{c.label}</span>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, marginTop: 6 }}>{loading ? "..." : c.value}</div>
          </div>
        ))}
      </div>

      {/* SEARCH + BUTTON */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} color={colors.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input placeholder="Cari incident..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", background: "white", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, #DC2626, #991B1B)`, fontSize: 12, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          <Plus size={14} /> Lapor Incident
        </button>
      </div>

      {/* TABLE */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${colors.border}`, marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Daftar Incident</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["No", "Judul", "Tipe", "Severity", "Lokasi", "Tanggal", "Korban", "Status", "Aksi"].map((h, i) => (
                  <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={row.id} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)} style={{ background: hoveredRow === i ? "#FEF2F2" : "transparent" }}>
                  <td style={{ padding: "12px 14px", color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 500, color: colors.textPrimary, borderBottom: `1px solid ${colors.border}`, maxWidth: 220 }}>{row.judul}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: tipeColors[row.tipe]?.bg || "#F3F4F6", color: tipeColors[row.tipe]?.text || "#666" }}>{row.tipe}</span>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: severityColors[row.severity]?.bg || "#F3F4F6", color: severityColors[row.severity]?.text || "#666", border: `1px solid ${severityColors[row.severity]?.border || "#ddd"}` }}>{row.severity}</span>
                  </td>
                  <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>{row.lokasi}</td>
                  <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>{formatDate(row.tanggal_kejadian)}</td>
                  <td style={{ padding: "12px 14px", color: colors.textSecondary, borderBottom: `1px solid ${colors.border}` }}>{row.korban_nama || "-"}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                    <select value={row.status} onChange={(e) => handleUpdateStatus(row.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 11, cursor: "pointer", fontFamily: "inherit", background: row.status === "Open" ? "#FEE2E2" : row.status === "In Progress" ? "#FEF3C7" : "#DCFCE7", color: row.status === "Open" ? "#DC2626" : row.status === "In Progress" ? "#D97706" : "#16A34A" }}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>Tidak ada data incident</div>}
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${colors.border}`, fontSize: 12, color: colors.textMuted }}>Total: {filteredData.length} incident</div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 560, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Lapor Incident Baru</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={colors.textMuted} /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Judul Incident *</label>
              <input value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} placeholder="Contoh: Tersandung kabel di workshop" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Deskripsi</label>
              <textarea value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Kronologi kejadian..." style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 70, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Tipe *</label>
                <select value={formData.tipe} onChange={(e) => setFormData({ ...formData, tipe: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit" }}>
                  <option value="Near Miss">Near Miss</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Medical Treatment">Medical Treatment</option>
                  <option value="Lost Time Injury">Lost Time Injury</option>
                  <option value="Fatality">Fatality</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Severity *</label>
                <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit" }}>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Major">Major</option>
                  <option value="Fatal">Fatal</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Tanggal *</label>
                <input type="datetime-local" value={formData.tanggal_kejadian} onChange={(e) => setFormData({ ...formData, tanggal_kejadian: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Lokasi *</label>
              <input value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} placeholder="Contoh: Workshop Area" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Nama Korban</label>
                <input value={formData.korban_nama} onChange={(e) => setFormData({ ...formData, korban_nama: e.target.value })} placeholder="Nama korban" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Jabatan Korban</label>
                <input value={formData.korban_jabatan} onChange={(e) => setFormData({ ...formData, korban_jabatan: e.target.value })} placeholder="Jabatan" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Hari Kerja Hilang</label>
                <input type="number" value={formData.hari_kerja_hilang} onChange={(e) => setFormData({ ...formData, hari_kerja_hilang: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Root Cause</label>
              <textarea value={formData.root_cause} onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })} placeholder="Penyebab utama..." style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 50, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>Corrective Action</label>
              <textarea value={formData.corrective_action} onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })} placeholder="Tindakan perbaikan..." style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 50, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #DC2626, #991B1B)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>{saving ? "Menyimpan..." : "Simpan Incident"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}