export interface SiteConfig {
  name: string; // ชื่อเว็บหลัก เช่น "STEPHOD"
  domain: string; // โดเมน เช่น "stephod.bio"
  title: string; // ข้อความบนแท็บเบราว์เซอร์
  description: string; // คำอธิบายเว็บไซต์ (SEO Meta Description)
  logo: {
    text: string; // ข้อความโลโก้ตัวหน้า เช่น "STEP"
    highlight: string; // ข้อความเน้นสี เช่น "HOD"
    iconType?: 'sparkles' | 'image';
    imageUrl?: string; // ลิงก์รูปโลโก้ส่วนตัว
    accentColor: string; // สีนีออนของโลโก้
  };
  footerText: string;
  watermarkText: string; // ข้อความลายน้ำใต้การ์ดโปรไฟล์
}

export const siteConfig: SiteConfig = {
  name: 'STEPHOD',
  domain: 'stephod.bio',
  title: 'STEPHOD • Aesthetic Bio-Profile Platform',
  description: 'สร้างและปรับแต่งหน้าโปรไฟล์ส่วนตัวสุดเท่ แพลตฟอร์ม STEPHOD รวมทุกลิงก์โซเชียล เพลง BGM และสถานะสด',
  logo: {
    text: 'STEP',
    highlight: 'HOD',
    iconType: 'image',
    imageUrl: '/logo.png',
    accentColor: '#00d2ff', // Electric Cyan Crystal Blue
  },
  footerText: '© 2026 STEPHOD. All rights reserved.',
  watermarkText: 'stephod.bio',
};
