"use client";
import { useState } from "react";
import { Shield, Mail, Lock, User, Building, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";

const API_URL = "https://e-safeske-backend-production.up.railway.app/api";

interface RegisterProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterPage({ onBack, onRegisterSuccess }: RegisterProps) {
  const [form, setForm] = useState({ nama: "", email: "", password: "", confirmPassword: "", departemen: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!form.nama || !form.email || !form.password) {
      setError("Nama, Email, dan Password wajib diisi");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await axios.post(`${API_URL}/auth/register`, {
        nama: form.nama,
        email: form.email,
        password: form.password,
        departemen: form.departemen,
        role: "observer",
      });
      setSuccess(true);
      setTimeout(() => onRegisterSuccess(), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0D4222 0%, #0A3419 50%, #071F10 100%)", fontFamily: "'Segoe UI', sans-serif", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <div style={{ width: 440, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #22C55E, #16A34A)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(34,197,94,0.3)", marginBottom: 12 }}>
            <Shield size={28} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 }}>
            <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: 24 }}>e-</span>
            <span style={{ color: "white", fontWeight: 700, fontSize: 24 }}>SafeSKE</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>PT Spektrum Krisindo Elektrika</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 12, marginBottom: 16, fontFamily: "inherit" }}>
            <ArrowLeft size={14} /> Kembali ke Login
          </button>

          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Daftar Akun Baru</h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7280" }}>Buat akun e-SafeSKE untuk mulai melaporkan temuan K3</p>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#16A34A", fontSize: 12, marginBottom: 16 }}>
              ✅ Registrasi berhasil! Mengalihkan ke halaman login...
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Nama Lengkap *</label>
            <div style={{ position: "relative" }}>
              <User size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Email *</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@ske.co.id" style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Departemen</label>
            <div style={{ position: "relative" }}>
              <Building size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" value={form.departemen} onChange={(e) => setForm({ ...form, departemen: e.target.value })} placeholder="Contoh: HSE, Maintenance, Production" style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Password *</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 karakter" style={{ width: "100%", padding: "10px 36px 10px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {showPassword ? <EyeOff size={14} color="#9CA3AF" /> : <Eye size={14} color="#9CA3AF" />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Konfirmasi *</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Ulangi password" style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          <button onClick={handleRegister} disabled={loading || success} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #166534, #0D4222)", color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Memproses..." : "Daftar Akun"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          © 2026 PT Spektrum Krisindo Elektrika — e-SafeSKE v1.0.0
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}