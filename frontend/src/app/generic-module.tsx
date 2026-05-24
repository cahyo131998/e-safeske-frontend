"use client";
import { useState, useEffect } from "react";
import { Plus, X, Search, Download, Loader2 } from "lucide-react";
import axios from "axios";

const API_URL = "https://e-safeske-backend-production.up.railway.app/api";

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "datetime-local" | "number";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  showInTable?: boolean;
}

interface GenericModuleProps {
  colors: any;
  title: string;
  apiPath: string;
  fields: FieldConfig[];
  statusOptions?: string[];
  accentColor?: string;
}

export default function GenericModule({ colors, title, apiPath, fields, statusOptions = ["Open", "In Progress", "Closed"], accentColor = colors.primaryLight }: GenericModuleProps) {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const initialForm: any = {};
  fields.forEach(f => { initialForm[f.key] = f.type === "select" && f.options ? f.options[0] : ""; });
  const [formData, setFormData] = useState<any>(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dataRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/${apiPath}`),
        axios.get(`${API_URL}/${apiPath}/stats`),
      ]);
      setData(dataRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const requiredFields = fields.filter(f => f.required);
    for (const f of requiredFields) {
      if (!formData[f.key]) { alert(`${f.label} wajib diisi!`); return; }
    }
    try {
      setSaving(true);
      await axios.post(`${API_URL}/${apiPath}`, formData);
      setShowModal(false);
      setFormData(initialForm);
      fetchData();
    } catch (err) { alert("Gagal menyimpan!"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus?")) return;
    try { await axios.delete(`${API_URL}/${apiPath}/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/${apiPath}/${id}`, { status: newStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const tableFields = fields.filter(f => f.showInTable !== false);
  const filteredData = data.filter(d =>
    Object.values(d).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatValue = (val: any, type: string) => {
    if (!val) return "-";
    if (type === "date" || type === "datetime-local") {
      return new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    }
    return String(val);
  };

  const statusColor = (s: string) => {
    if (["Open", "Scheduled"].includes(s)) return { bg: "#FEE2E2", text: "#DC2626" };
    if (["In Progress", "Under Review"].includes(s)) return { bg: "#FEF3C7", text: "#D97706" };
    return { bg: "#DCFCE7", text: "#16A34A" };
  };

  return (
    <div>
      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: `Total ${title}`, value: stats.total, color: "#2563EB" },
          { label: "Open / Aktif", value: stats.open, color: "#EA580C" },
          { label: "Closed / Selesai", value: stats.closed, color: "#16A34A" },
        ].map((c, i) => (
          <div key={i} style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: 12, color: colors.textSecondary }}>{c.label}</span>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, marginTop: 6 }}>{loading ? "..." : c.value}</div>
          </div>
        ))}
      </div>

      {/* SEARCH + BUTTON */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} color={colors.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input placeholder={`Cari ${title.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", background: "white", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${accentColor}, ${colors.primary})`, fontSize: 12, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          <Plus size={14} /> Tambah {title}
        </button>
      </div>

      {/* TABLE */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${colors.border}` }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", borderBottom: `1px solid ${colors.border}` }}>No</th>
                {tableFields.slice(0, 5).map((f, i) => (
                  <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: `1px solid ${colors.border}` }}>{f.label}</th>
                ))}
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", borderBottom: `1px solid ${colors.border}` }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", borderBottom: `1px solid ${colors.border}` }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={row.id} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)} style={{ background: hoveredRow === i ? "#F0FDF4" : "transparent" }}>
                  <td style={{ padding: "12px 14px", color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>{i + 1}</td>
                  {tableFields.slice(0, 5).map((f, j) => (
                    <td key={j} style={{ padding: "12px 14px", color: j === 0 ? colors.textPrimary : colors.textSecondary, fontWeight: j === 0 ? 500 : 400, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formatValue(row[f.key], f.type)}
                    </td>
                  ))}
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                    <select value={row.status} onChange={(e) => handleUpdateStatus(row.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 11, cursor: "pointer", fontFamily: "inherit", background: statusColor(row.status).bg, color: statusColor(row.status).text }}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.border}` }}>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>Tidak ada data</div>}
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${colors.border}`, fontSize: 12, color: colors.textMuted }}>Total: {filteredData.length} data</div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 520, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Tambah {title}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={colors.textMuted} /></button>
            </div>
            {fields.map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: "block" }}>{f.label}{f.required ? " *" : ""}</label>
                {f.type === "textarea" ? (
                  <textarea value={formData[f.key] || ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 60, outline: "none", boxSizing: "border-box" }} />
                ) : f.type === "select" ? (
                  <select value={formData[f.key] || ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit" }}>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={formData[f.key] || ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${colors.border}`, background: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${accentColor}, ${colors.primary})`, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}