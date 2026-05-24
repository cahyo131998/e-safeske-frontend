"use client";
import { useState } from "react";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import RegisterPage from "./register";

const API_URL = "https://e-safeske-backend-production.up.railway.app/api";

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Email dan password wajib diisi"); return; }
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login gagal. Cek email dan password.");
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return <RegisterPage onBack={() => setShowRegister(false)} onRegisterSuccess={() => setShowRegister(false)} />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0D4222 0%, #0A3419 50%, #071F10 100%)", fontFamily: "'Segoe UI', sans-serif", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <div style={{ width: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #22C55E, #16A34A)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(34,197,94,0.3)", marginBottom: 16 }}>
            <Shield size={32} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 }}>
            <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: 28 }}>e-</span>
            <span style={{ color: "white", fontWeight: 700, fontSize: 28 }}>SafeSKE</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>PT Spektrum Krisindo Elektrika</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>Safety, Health & Environment Management System</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Selamat Datang</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6B7280" }}>Masuk ke akun e-SafeSKE Anda</p>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="nama@ske.co.id" style={{ width: "100%", padding: "11px 12px 11px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Masukkan password" style={{ width: "100%", padding: "11px 44px 11px 40px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {showPassword ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
              </button>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #166534, #0D4222)", color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, boxShadow: "0 4px 12px rgba(13,66,34,0.3)" }}>
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>Belum punya akun? </span>
            <button onClick={() => setShowRegister(true)} style={{ fontSize: 13, color: "#166534", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              Daftar Sekarang
            </button>
          </div>

          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 6 }}>Demo Account:</div>
            <div style={{ fontSize: 11, color: "#166534" }}>Email: cahyo@ske.co.id | Password: password123</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          © 2026 PT Spektrum Krisindo Elektrika — e-SafeSKE v1.0.0
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}