"use client";
import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart,
  BarChart, Bar
} from "recharts";
import {
  Eye, AlertTriangle, Clock, CheckCircle, XCircle,
  Flame, Shield, TrendingUp, Activity, Users
} from "lucide-react";
import axios from "axios";

const API_URL = "https://e-safeske-backend-production.up.railway.app/api";

interface DashboardProps {
  colors: any;
  currentUser: any;
}

export default function DashboardPage({ colors, currentUser }: DashboardProps) {
  const [hazardStats, setHazardStats] = useState<any>(null);
  const [incidentStats, setIncidentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [hRes, iRes] = await Promise.all([
          axios.get(`${API_URL}/hazards/stats`),
          axios.get(`${API_URL}/incidents/stats`),
        ]);
        setHazardStats(hRes.data);
        setIncidentStats(iRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading || !hazardStats || !incidentStats) {
    return <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>Memuat dashboard...</div>;
  }

  const summaryCards = [
    { label: "Total Hazard", value: hazardStats.total, icon: Eye, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Hazard Open", value: hazardStats.open, icon: AlertTriangle, color: "#DC2626", bg: "#FEF2F2" },
    { label: "Total Incident", value: incidentStats.total, icon: Flame, color: "#EA580C", bg: "#FFF7ED" },
    { label: "Incident Open", value: incidentStats.open, icon: Clock, color: "#D97706", bg: "#FFFBEB" },
    { label: "Hari Kerja Hilang", value: incidentStats.totalHariHilang, icon: XCircle, color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Hazard Closed", value: hazardStats.closed, icon: CheckCircle, color: "#16A34A", bg: "#F0FDF4" },
  ];

  const riskColors: Record<string, string> = { Tinggi: "#DC2626", Sedang: "#F59E0B", Rendah: "#16A34A" };
  const riskData = hazardStats.byRisk.map((r: any) => ({
    name: r.tingkat_risiko, value: parseInt(r.count), color: riskColors[r.tingkat_risiko] || "#999",
  }));

  const severityData = incidentStats.bySeverity.map((s: any) => ({
    name: s.severity, value: parseInt(s.count),
  }));

  const tipeData = incidentStats.byTipe.map((t: any) => ({
    name: t.tipe, value: parseInt(t.count),
  }));

  const trendData = [
    { bulan: "Des", hazard: 8, incident: 2 },
    { bulan: "Jan", hazard: 10, incident: 1 },
    { bulan: "Feb", hazard: 12, incident: 3 },
    { bulan: "Mar", hazard: 14, incident: 2 },
    { bulan: "Apr", hazard: 12, incident: 1 },
    { bulan: "Mei", hazard: 15, incident: 4 },
  ];

  const safetyScore = Math.round(((hazardStats.closed + incidentStats.closed) / Math.max((hazardStats.total + incidentStats.total), 1)) * 100);

  return (
    <div>
      {/* WELCOME */}
      <div style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLighter})`, borderRadius: 16, padding: "24px 28px", marginBottom: 24, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Selamat Datang, {currentUser?.nama || "User"}!</h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Berikut ringkasan aktivitas K3 di PT Spektrum Krisindo Elektrika</p>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{safetyScore}%</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Safety Score</div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 24 }}>
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{ background: "white", borderRadius: 14, padding: "16px 18px", border: `1px solid ${colors.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>{card.label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: colors.textPrimary }}>{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* CHARTS ROW 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Trend Chart */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>Trend Hazard & Incident (6 Bulan)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#166534" stopOpacity={0.15} /><stop offset="100%" stopColor="#166534" stopOpacity={0} /></linearGradient>
                <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC2626" stopOpacity={0.15} /><stop offset="100%" stopColor="#DC2626" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: colors.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="hazard" stroke="#166534" strokeWidth={2} fill="url(#hGrad)" dot={{ r: 3, fill: "#166534", stroke: "white", strokeWidth: 2 }} name="Hazard" />
              <Area type="monotone" dataKey="incident" stroke="#DC2626" strokeWidth={2} fill="url(#iGrad)" dot={{ r: 3, fill: "#DC2626", stroke: "white", strokeWidth: 2 }} name="Incident" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>Distribusi Risiko Hazard</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={2} stroke="white">
                {riskData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {riskData.map((r: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
                  <span style={{ color: colors.textSecondary }}>{r.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Incident by Type */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>Incident Berdasarkan Tipe</div>
          {tipeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={tipeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#EA580C" radius={[6, 6, 0, 0]} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted }}>Belum ada data</div>
          )}
        </div>

        {/* Status Overview */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>Status Overview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Hazard Open", value: hazardStats.open, total: hazardStats.total, color: "#DC2626" },
              { label: "Hazard In Progress", value: hazardStats.inProgress, total: hazardStats.total, color: "#F59E0B" },
              { label: "Hazard Closed", value: hazardStats.closed, total: hazardStats.total, color: "#16A34A" },
              { label: "Incident Open", value: incidentStats.open, total: incidentStats.total, color: "#EA580C" },
              { label: "Incident Closed", value: incidentStats.closed, total: incidentStats.total, color: "#16A34A" },
            ].map((item, i) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: colors.textSecondary }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: colors.textPrimary }}>{item.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "#F3F4F6", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: item.color, width: `${pct}%`, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px 0 8px", fontSize: 11, color: colors.textMuted }}>
        © 2026 PT Spektrum Krisindo Elektrika <span style={{ float: "right" }}>e-SafeSKE v1.0.0</span>
      </div>
    </div>
  );
}