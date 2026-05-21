const express = require('express'); // Express framework'ünü dahil ediyorum
const router = express.Router(); // Express Router'ını kullanarak yeni bir router oluşturuyorum
const Uye = require('../models/Uye'); // Uye modelini dahil ediyorum
const Kullanici = require('../models/Kullanici');// Yetkili kontrolü için Kullanici modelini dahil ediyorum
const OnKayit = require('../models/OnKayit'); 
// ==========================================================================
// HOCAM GÜVENLİK VE OTURUM KONTROLÜ (MIDDLEWARE) BURADADIR
// Giriş yapmamış kişilerin API endpoint'lerine erişmesini engelleyen tünel
// ==========================================================================
const yetkiKontrol = (req, res, next) => {
    if (req.session && req.session.yoneticiId) {
        return next(); // Oturum açık, bir sonraki işleme geçebilirsin hocam
    } else {
        return res.status(401).json({ mesaj: "Hocam yetkisiz erişim engellendi! Lütfen önce giriş yapın." });
    }
};

// ==========================================================================
// --- YÖNETİCİ KİMLİK DOĞRULAMA (LOGIN & LOGOUT) ROTALARI ---
// ==========================================================================

// Hocam, yetkili giriş formundan gelen istekleri doğrudan işleyen ve yönlendiren POST endpoint'i
router.post('/api/251109007/giris', async (req, res) => {
    try {
        const { kullaniciAdi, sifre } = req.body;
        
        // Kullanıcıyı adına göre veritabanında arıyoruz
        const yonetici = await Kullanici.findOne({ kullaniciAdi });
        if (!yonetici) {
            return res.send('<script>alert("Hatalı kullanıcı adı veya şifre!"); window.location.href="/giris.html";</script>');
        }

        // Modelin içine yazdığımız SHA-256 şifre kontrol metodunu çağırıyoruz
        const sifreDogruMu = yonetici.sifreKontrol(sifre);
        if (!sifreDogruMu) {
            return res.send('<script>alert("Hatalı kullanıcı adı veya şifre!"); window.location.href="/giris.html";</script>');
        }

        // Giriş başarılıysa session (oturum) kaydını yapıyoruz
        req.session.yoneticiId = yonetici._id;
        req.session.kullaniciAdi = yonetici.kullaniciAdi;

        // Hocam ekrana ham veri basmak yerine, tarayıcıyı doğrudan üyeler yönetim paneline uçuruyoruz
        return res.redirect('/panel.html');
    } catch (error) {
        res.status(500).send("Giriş işlemi esnasında bir hata oluştu");
    }
});

// Oturumu sunucuyu çökertmeden güvenli bir şekilde sonlandıran ve giriş sayfasına uçuran GÜNCEL ÇIKIŞ endpoint'i
router.get('/api/251109007/cikis', (req, res) => {
    // 1. Adım: Sunucu tarafındaki oturum verilerini temizliyoruz
    req.session.yoneticiId = null;
    req.session.kullaniciAdi = null;

    // 2. Adım: Oturumu tamamen imha ediyoruz
    req.session.destroy((hata) => {
        // Hata olsa bile tarayıcının çerezini temizleyip giriş sayfasına güvenli bir şekilde fırlatıyoruz
        res.clearCookie('connect.sid'); // Express'in varsayılan oturum çerezini tarayıcıdan siliyoruz hocam
        return res.redirect('/giris.html');
    });
});


// ==========================================================================
// --- CRUD ENDPOINT'LERİ (YETKİ KONTROLÜ DUVARI EKLENDİ) ---
// ==========================================================================

// ---1. ENDPOINT : GET ( TÜM ÜYELERİ LİSTELEME ) ---
router.get('/api/251109007/uyeler', yetkiKontrol, async (req, res) => {
    try {
        const uyeler = await Uye.find().populate('paketId');
        res.json(uyeler);
    } catch (error) {
        res.status(500).json({ mesaj: "Üyeler listelenemedi" });
    }
});

//  ---2. ENDPOINT: POST (YENİ ÜYE EKLEME) ---
// Güvenlik Duvarı: Bu endpoint dışarıya açıktır ama sadece OnKayit tablosuna yazar, asıl üyeleri bozamaz!
router.post('/api/251109007/onkayit', async (req, res) => {
    try {
        const yeniTalep = new OnKayit({
            ad: req.body.ad,
            soyad: req.body.soyad,
            yas: req.body.yas,
            telefon: req.body.telefon,
            paketId: req.body.paketId
        });
        const kaydedilenTalep = await yeniTalep.save();
        res.status(201).json(kaydedilenTalep);
    } catch (error) {
        res.status(400).json({ mesaj: "Ön kayıt talebi alınamadı." });
    }
});
// --- YENİ BİR ENDPOINT: ADMİNİN PANELDE ÖN KAYITLARI GÖRMESİ İÇİN (GET) ---
// Yetki Kontrolü: Sadece giriş yapmış admin bu bilgi alma taleplerini listeleyebilir!
router.get('/api/251109007/onkayitlar', yetkiKontrol, async (req, res) => {
    try {
        const talepler = await OnKayit.find().populate('paketId');
        res.json(talepler);
    } catch (error) {
        res.status(500).json({ mesaj: "Talepler listelenemedi." });
    }
});

// ---3. ENDPOINT: PUT (ÜYE GÜNCELLEME) ---
router.put('/api/251109007/uyeler/:id', yetkiKontrol, async (req, res) => {
    try {
        const guncellenenUye = await Uye.findByIdAndUpdate(req.params.id, {
            ad: req.body.ad,
            soyad: req.body.soyad,
            yas: req.body.yas,
            paketId: req.body.paketId
        },
        { new: true }
    );
    res.json(guncellenenUye);
    }
    catch (hata) {
        res.status(400).json({ mesaj: "Güncelleme yapilamadi" });
    }
});

// ---4. ENDPOINT: DELETE (ÜYE SİLME) ---
router.delete('/api/251109007/uyeler/:id', yetkiKontrol, async (req, res) => {
    try {
        await Uye.findByIdAndDelete(req.params.id);
        res.json({ mesaj: "Üye silindi" });
    } catch (error) {
        res.status(500).json({ mesaj: "Üye silinemedi" });
    }
});

module.exports = router;