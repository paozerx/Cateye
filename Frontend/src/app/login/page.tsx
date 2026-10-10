"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type AuthUser = { id: number; email: string; display_name: string };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" })
      .then((response) => { if (response.ok) router.replace("/"); })
      .catch(() => undefined);
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(mode === "register" ? { email, password, display_name: displayName } : { email, password }),
      });
      const result = await response.json().catch(() => ({})) as { detail?: string; display_name?: string };
      if (!response.ok) throw new Error(result.detail ?? "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof TypeError ? "เชื่อมต่อระบบไม่ได้ ตรวจสอบว่า backend กำลังทำงานอยู่" : cause instanceof Error ? cause.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one"/><div className="auth-decoration auth-decoration-two"/>
      <Link className="auth-brand" href="/"><span className="brand-mark"><span>•</span><span>•</span></span><span>CATEYE</span></Link>
      <section className="auth-card">
        <div className="auth-cat"><span>• •</span><b>ω</b></div>
        <p className="eyebrow">YOUR ADVENTURE, REMEMBERED</p>
        <h1>{mode === "login" ? "ยินดีต้อนรับกลับ" : "เริ่มออกเดินทาง"}</h1>
        <p className="auth-subtitle">{mode === "login" ? "เข้าสู่ระบบเพื่อกลับไปผจญภัยต่อ" : "สร้างบัญชีเพื่อเก็บทุกเรื่องราวการเล่นของคุณ"}</p>
        <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>เข้าสู่ระบบ</button><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>สมัครสมาชิก</button></div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && <label>ชื่อที่ใช้แสดง<input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="เช่น Nok" required minLength={1} maxLength={80}/></label>}
          <label>อีเมล<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={320}/></label>
          <label>รหัสผ่าน<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "register" ? "อย่างน้อย 10 ตัวอักษร" : "กรอกรหัสผ่าน"} required minLength={mode === "register" ? 10 : 1} maxLength={128}/></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "กำลังดำเนินการ…" : mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชีและเริ่มเล่น"}<span>↗</span></button>
        </form>
        <p className="auth-privacy"><span>♧</span> ข้อมูลบัญชีและบันทึกของคุณจะถูกเก็บไว้อย่างปลอดภัย</p>
      </section>
      <p className="auth-footer">CATEYE · MADE FOR YOUR NEXT QUEST</p>
    </main>
  );
}
