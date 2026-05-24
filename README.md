# KaraPati Fit Club - Üye Yönetim Sistemi

Bu proje, bir spor salonunun aktif üye yönetimini ve web sitesi üzerinden gelen ön kayıt/bilgi taleplerini gerçek zamanlı olarak yönetmek amacıyla geliştirilmiş full-stack bir Node.js projesidir. Proje; güvenli yönetici girişi, üye kayıt senaryoları (CRUD) ve izole ön kayıt veri havuzu katmanlarından oluşmaktadır.

## 🧑‍🎓 Öğrenci Bilgileri
- **Adı Soyadı:** Tarkan Kara
- **Öğrenci Numarası:** 251109007
- **Okul / Bölüm:** İstanbul Gedik Üniversitesi - Bilgisayar Programcılığı Bölümü
- **Ders:** Dönem İçi Bitirme Ödev Projesi

## 🚀 Öne Çıkan Özellikler & Güvenlik Politikaları
- **SHA-256 Veri Şifreleme:** Yönetici şifreleri veritabanına asla düz metin (plain-text) olarak kaydedilmez. `Crypto` kütüphanesi ve Mongoose `pre('save')` middleware'i kullanılarak SHA-256 algoritması ile hash'lenerek mühürlenir.
- **Oturum Güvenliği (Express-Session):** Admin paneline yetkisiz erişimler (URL üzerinden doğrudan giriş denemeleri) özel bir `yetkiKontrol` middleware katmanı ile engellenir. Giriş yapmayan kullanıcılar otomatik olarak giriş ekranına fırlatılır. Sayfa yenilendiğinde güvenlik protokolü gereği oturum otomatik olarak sonlandırılır.
- **İlişkisel NoSQL Modellemesi:** MongoDB Atlas üzerinde doküman tabanlı bir yapı kurulmasına rağmen, `Uye` koleksiyonundaki `paketId` alanı üzerinden `Paket` koleksiyonuna ilişkisel bağlantı (`ref`) verilmiştir. Listeleme esnasında `.populate('paketId')` fonksiyonu ile NoSQL dünyasında join işlemi simüle edilmiştir.
- **Dinamik Veri Akışı ve Fallback:** Tarayıcı seviyesindeki Content Security Policy (CSP) veya Mongoose bellek uyuşmazlığı senaryolarına karşı front-end ve back-end tarafında çok aşamalı bütünleşik koruma ve ID eşleştirme kalkanları entegre edilmiştir.

## 🛠️ Kullanılan Teknolojiler
- **Arka Yüz (Backend):** Node.js, Express.js, Express-Session, Dotenv
- **Veritabanı (Database):** MongoDB Atlas (Mongoose ORM)
- **Ön Yüz (Frontend):** HTML5, CSS3 (Gelişmiş Responsive Tasarım), Vanilla JavaScript, FontAwesome İkon Seti

## 📁 Proje Klasör Yapısı (MVC Mimarisi)
```text
📦 karapati-fit-club
 ┣ 📂 public               # Ön Yüz (Frontend) Katmanı
 ┃ ┣ 📂 css
 ┃ ┃ ┗ 📜 style.css        # Tüm projenin tek merkezden yönetilen CSS mimarisi
 ┃ ┣ 📂 js
 ┃ ┃ ┣ 📜 ana.js           # Ziyaretçi ön kayıt form motoru ve veri paketleme
 ┃ ┃ ┗ 📜 panel.js         # Admin paneli sekme geçişleri ve canlı CRUD motoru
 ┃ ┣ 📜 index.html         # Spor salonu ana açılış sayfası
 ┃ ┣ 📜 uyeler.html        # Paket fiyatları, karşılaştırma tablosu ve ön kayıt formu
 ┃ ┣ 📜 giris.html         # Yönetici güvenli kimlik doğrulama arayüzü
 ┃ ┗ 📜 panel.html         # Gerçek zamanlı Üye ve Bilgi Talebi Yönetim Merkezi
 ┣ 📂 src                  # Arka Yüz (Backend) Katmanı
 ┃ ┣ 📂 models             # Mongoose Şemaları ve Veri Tipleri
 ┃ ┃ ┣ 📜 Kullanici.js     # Yönetici kimlik veri şeması (SHA-256 entegreli)
 ┃ ┃ ┣ 📜 OnKayit.js       # Bilgi talepleri veri şeması
 ┃ ┃ ┣ 📜 Paket.js         # Sabit spor paketleri veri şeması
 ┃ ┃ ┗ 📜 Uye.js           # Profesyonel kayıtlı üye veri şeması
 ┃ ┣ 📂 routes             # API Endpoint Tünelleri
 ┃ ┃ ┗ 📜 uyeRotalari.js   # Kimlik doğrulama, Üye CRUD ve Ön Kayıt API tünelleri
 ┃ ┗ 📜 sunucu.js          # Express sunucu yapılandırması ve MongoDB Atlas Seed (Tohumlama) motoru
 ┣ 📜 .env                 # Gizli Ortam Değişkenleri (Lokalde kalır, repoya yüklenmez)
 ┣ 📜 .env.example         # Kurulum için maskelenmiş şablon ortam değişkenleri kılavuzu
 ┗ 📜 package.json         # Proje bağımlılıkları ve npm scriptleri

 **ÖNEMLİ NOT: .env.example dosyasının adını .env yapınız ve içerisindeki KULLANICI_ADI:SIFRE kismini kendinize göre degistirin (KULLANICI_ADI:SIFRE = mongoDB UserID ve sifreniz). Bağımlılıkları yükledikten sonra; 
    node src/sunucu.js sunucuyu başlatınız.

Varsayilan Kullanici Adı ve Şifre: admin // 1234   

http://localhost:3000 ile denemeyi yapin.