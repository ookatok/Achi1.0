import React, { useState, useEffect } from 'react';

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lang, setLang] = useState('th'); // default to 'th'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^| )lang=([^;]+)/);
      if (match && match[2] === 'en') {
        setLang('en');
      }
    }
  }, []);

  const isEn = lang === 'en';

  const t = {
    title: isEn ? 'Create Account' : 'สร้างบัญชีผู้ใช้',
    subtitle: isEn ? 'Register as ACHI Client' : 'สมัครสมาชิก ACHI Client',
    nameLabel: isEn ? 'Full Name' : 'ชื่อ-นามสกุล',
    emailLabel: isEn ? 'Gmail Address' : 'ที่อยู่อีเมล Gmail',
    emailPlaceholder: 'example@gmail.com',
    passwordLabel: isEn ? 'Password' : 'รหัสผ่าน',
    passwordHint: isEn
      ? 'At least 8 characters with 1 uppercase, 1 lowercase, 1 number'
      : 'ความยาวอย่างน้อย 8 ตัวอักษร (ต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข)',
    phoneLabel: isEn ? 'Phone Number' : 'เบอร์โทรศัพท์',
    phoneHint: isEn 
      ? 'Thai number (e.g. 08XXXXXXXX or 02XXXXXXX)'
      : 'เบอร์โทรศัพท์ไทย (เช่น 08XXXXXXXX หรือ 02XXXXXXX)',
    submitBtn: isEn ? 'Register' : 'สมัครสมาชิก',
    submittingBtn: isEn ? 'Creating Account...' : 'กำลังสร้างบัญชี...',
    alreadyHaveAcc: isEn ? 'Already have an account?' : 'มีบัญชีผู้ใช้อยู่แล้ว?',
    signIn: isEn ? 'Sign in' : 'เข้าสู่ระบบ',
    errorGmailOnly: isEn ? 'Only Gmail addresses (@gmail.com) are allowed.' : 'อนุญาตเฉพาะอีเมล Gmail (@gmail.com) เท่านั้น',
    errorPasswordStrength: isEn 
      ? 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' 
      : 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และต้องประกอบด้วยอักษรตัวใหญ่ ตัวเล็ก และตัวเลขอย่างน้อยอย่างละ 1 ตัว',
    errorPhoneInvalid: isEn
      ? 'Invalid Thai phone number. Mobile starts with 06/08/09 (10 digits), landline starts with 02-07 (9 digits).'
      : 'เบอร์โทรศัพท์ไม่ถูกต้อง (เบอร์มือถือต้องขึ้นต้นด้วย 06/08/09 มี 10 หลัก, เบอร์บ้านขึ้นต้นด้วย 02-07 มี 9 หลัก)'
  };

  const validateForm = (): boolean => {
    // 1. Gmail validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg(t.errorGmailOnly);
      return false;
    }

    // 2. Password validation (Min 8, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg(t.errorPasswordStrength);
      return false;
    }

    // 3. Phone validation (Thai format)
    const phoneRegex = /^0[2-9]\d{7,8}$/;
    if (!phoneRegex.test(phone)) {
      setErrorMsg(t.errorPhoneInvalid);
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, website }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof window !== 'undefined' && (window as any).showStatusAlert) {
          (window as any).showStatusAlert(res.status, null, data ? data.message : 'Registration failed');
        } else {
          alert(data ? data.message : 'Registration failed');
        }
        return;
      }

      setIsSuccess(true);
      if (typeof window !== 'undefined' && (window as any).showStatusAlert) {
        (window as any).showStatusAlert(
          200,
          isEn ? 'Registration successful! Redirecting to sign in page...' : 'สมัครสมาชิกสำเร็จ! กำลังพาไปยังหน้าเข้าสู่ระบบ...',
          null,
          true,
          () => {
            window.location.href = '/auth/signin';
          }
        );
      } else {
        window.location.href = '/auth/signin';
      }
    } catch (err: any) {
      console.error(err);
      if (typeof window !== 'undefined' && (window as any).showStatusAlert) {
        (window as any).showStatusAlert(0, null, isEn ? 'An error occurred during registration. Please check your connection.' : 'เกิดข้อผิดพลาดระหว่างสมัครสมาชิก กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else {
        alert('An error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-charcoal mb-2">{t.title}</h2>
        <p className="text-xs uppercase tracking-widest text-brand-gold font-medium">{t.subtitle}</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-sm text-xs text-red-600 font-medium leading-relaxed">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field (Invisible to users, autocomplete off, tabindex -1) */}
        <div className="absolute opacity-0 -z-50 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
            {t.nameLabel}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 flex justify-between">
            <span>{t.phoneLabel}</span>
            <span className="text-[9px] text-gray-400 normal-case font-normal">{t.phoneHint}</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isEn ? "0812345678" : "0812345678"}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 flex justify-between">
            <span>{t.passwordLabel}</span>
            <span className="text-[9px] text-gray-400 normal-case font-normal">{t.passwordHint}</span>
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full bg-brand-charcoal text-white hover:bg-brand-gold hover:text-brand-charcoal py-3 rounded-sm font-medium transition-all duration-300 disabled:opacity-50 text-sm uppercase tracking-widest font-semibold"
        >
          {isLoading ? t.submittingBtn : t.submitBtn}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500 font-light">
          {t.alreadyHaveAcc}{' '}
          <a href="/auth/signin" className="text-brand-gold font-medium hover:underline">
            {t.signIn}
          </a>
        </p>
      </div>
    </div>
  );
}
