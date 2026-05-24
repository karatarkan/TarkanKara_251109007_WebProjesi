const express = require('express');
const router = express.Router(); // Express Router'ını kullanarak rotalarımızı tanımlayacağız
const mongoose = require('mongoose'); // OBJECTID DÖNÜŞÜMÜ İÇİN MONGOOSE'U DAHİL ETTİK
const Uye = require('../models/Uye');
const Kullanici = require('../models/Kullanici');
const OnKayit = require('../models/OnKayit');

// --- MIDDLEWARE: OTURUM KONTROLÜ ---
const yetkiKontrol = (req, res, next) => {
    if (req.session && req.session.yoneticiId) {
        return next();
    } else {
        return res.status(401).json({ mesaj: "Yetkisiz erişim engellendi! Lütfen önce giriş yapın." });
    }
};

// ==========================================================================
// --- YÖNETİCİ KİMLİK DOĞRULAMA (LOGIN & LOGOUT) ROTALARI ---
// ==========================================================================

router.post('/api/251109007/giris', async (req, res) => {
    try {
        const { kullaniciAdi, sifre } = req.body;
        const yonetici = await Kullanici.findOne({ kullaniciAdi }); //findOne ile kullanıcı adı eşleşen bir yönetici arıyoruz
        if (!yonetici) {
            return res.send('<script>alert("Hatalı kullanıcı adı veya şifre!"); window.location.href="/giris.html";</script>');
        }
        const sifreDogruMu = yonetici.sifreKontrol(sifre);
        if (!sifreDogruMu) {
            return res.send('<script>alert("Hatalı kullanıcı adı veya şifre!"); window.location.href="/giris.html";</script>');
        }
        req.session.yoneticiId = yonetici._id; // Giriş başarılıysa oturum bilgilerini session'a kaydediyoruz
        req.session.kullaniciAdi = yonetici.kullaniciAdi; // Kullanıcı adını da session'a ekleyelim, böylece panelde hoş geldin mesajı gibi yerlerde kullanabiliriz
        return res.redirect('/panel.html');
    } catch (error) {
        res.status(500).send("Giriş işlemi esnasında bir hata oluştu");
    }
});

router.get('/api/251109007/cikis', (req, res) => {
    req.session.yoneticiId = null;
    req.session.kullaniciAdi = null;
    req.session.destroy((hata) => {
        res.clearCookie('connect.sid');
        return res.redirect('/giris.html');
    });
});

// ==========================================================================
// --- CRUD ENDPOINT'LERİ  ---
// ==========================================================================

// --- ÜYELERİ LİSTELEME (GET) ---
router.get('/api/251109007/uyeler', yetkiKontrol, async (req, res) => {
    try {
        const uyeler = await Uye.find().populate('paketId'); // populate ile paketId'ye referans verdiğimiz paketin detaylarını da çekiyoruz
        
        //.map ne işe yarar: MongoDB'den gelen ham veriyi optimize edip, 
        // frontend'in rahat kullanabileceği bir formata dönüştürmek için kullanıyoruz.
        // Özellikle paketId'nin içindeki paketAdi'ni garantiPaketAdi olarak ekleyerek, frontend'de direkt olarak paket adını göstermek istediğimiz için bu dönüşümü yapıyoruz.
        const optimizeEdilenUyeler = uyeler.map(uye => {
            const uyeObj = uye.toObject(); //.toObject() ile Mongoose dokümanını düz bir JavaScript objesine çeviriyoruz, böylece istediğimiz eklemeleri yapabiliriz.
            let pIsmi = 'Tanımsız Paket';

            if (uye.paketId && uye.paketId.paketAdi) {
                pIsmi = uye.paketId.paketAdi;
            } else if (uye.paketId) {
                const hamId = uye.paketId.toString().trim().toLowerCase();
                if (hamId === "664b4c730000000000000001") pIsmi = "Standart Üyelik";
                else if (hamId === "664b4c730000000000000002") pIsmi = "Gold Üyelik";
                else if (hamId === "664b4c730000000000000003") pIsmi = "Premium Savaşçı";
                else if (hamId === "664b4c730000000000000004") pIsmi = "Efsane Paket (VIP)";
            }

            uyeObj.garantiPaketAdi = pIsmi;
            uyeObj.paketId = { paketAdi: pIsmi }; 
            return uyeObj;
        });

        res.json(optimizeEdilenUyeler);
    } catch (hata) {
        console.error("Listeleme hatası:", hata);
        res.status(500).json({ mesaj: "Üyeler listelenirken hata oluştu." });
    }
});

// --- YENİ ÜYE EKLEME (POST) ---
router.post('/api/251109007/uyeler', yetkiKontrol, async (req, res) => {
    try {
        const v_paketId = new mongoose.Types.ObjectId(req.body.paketId); // v_paketId adında yeni bir değişken oluşturup, gelen paketId'yi mongoose'un ObjectId formatına dönüştürüyoruz. Bu sayede veritabanında referans bütünlüğü sağlanır ve paketId alanı doğru şekilde ilişkilendirilir.
        const yeniUye = new Uye({
            ad: req.body.ad,
            soyad: req.body.soyad,
            yas: req.body.yas,
            telefon: req.body.telefon,
            paketId: v_paketId,
            durum: req.body.durum || 'Aktif',
            odemeYontemi: req.body.odemeYontemi || 'Belirtilmedi'
        });
        const kaydedilen = await yeniUye.save();
        res.status(201).json(kaydedilen);
    } catch (hata) {
        res.status(500).json({ mesaj: "Üye kaydedilirken sunucu hatası oluştu." });
    }
});

// --- ÜYE GÜNCELLEME (PUT) ---
router.put('/api/251109007/uyeler/:id', yetkiKontrol, async (req, res) => {
    try {
        const v_paketId = new mongoose.Types.ObjectId(req.body.paketId); // v_paketId adında yeni bir değişken oluşturup, gelen paketId'yi mongoose'un ObjectId formatına dönüştürüyoruz. Bu sayede veritabanında referans bütünlüğü sağlanır ve paketId alanı doğru şekilde ilişkilendirilir.
        const guncellenenUye = await Uye.findByIdAndUpdate(req.params.id, {
            ad: req.body.ad,
            soyad: req.body.soyad,
            yas: req.body.yas,
            telefon: req.body.telefon,
            paketId: v_paketId,
            durum: req.body.durum,
            odemeYontemi: req.body.odemeYontemi
        }, { returnDocument: 'after' });
        
        res.json(guncellenenUye);
    } catch (hata) {
        res.status(500).json({ mesaj: "Güncelleme esnasında hata oluştu." });
    }
});

// --- ÜYE SİLME (DELETE) ---
router.delete('/api/251109007/uyeler/:id', yetkiKontrol, async (req, res) => {
    try {
        await Uye.findByIdAndDelete(req.params.id);
        res.json({ mesaj: "Üye silindi" });
    } catch (error) {
        res.status(500).json({ mesaj: "Üye silinemedi" });
    }
});

// ==========================================================================
// --- ONKAYIT (BİLGİ TALEPLERİ) ENDPOINT'LERİ ---
// ==========================================================================

// --- MÜŞTERİ ÖN KAYIT ALANI (POST) ---
router.post('/api/251109007/onkayit', async (req, res) => {
    try {
        // Gelen paketId'yi düz string olarak doğrudan alıyoruz, validasyona takılmıyor.
        const yeniTalep = new OnKayit({
            ad: req.body.ad,
            soyad: req.body.soyad,
            yas: req.body.yas,
            telefon: req.body.telefon,
            paketId: req.body.paketId ? req.body.paketId.toString() : "664b4c730000000000000001",
            hedef: req.body.hedef || 'Belirtilmedi'
        });
        
        const kaydedilenTalep = await yeniTalep.save();
        res.status(201).json(kaydedilenTalep);
    } catch (error) {
        console.error("Ön kayıt yazma hatası:", error);
        res.status(400).json({ mesaj: "Ön kayıt talebi alınamadı." });
    }
});

// --- TALEPLERİ LİSTELEME (GET) - TEK VE NET DOĞRU SÜRÜM ---
router.get('/api/251109007/onkayitlar', yetkiKontrol, async (req, res) => {
    try {
        const talepler = await OnKayit.find().populate('paketId');
        
        const optimizeEdilenTalepler = talepler.map(talep => {
            const talepObj = talep.toObject();
            let pIsmi = 'Standart Üyelik';

            if (talep.paketId && talep.paketId.paketAdi) {
                pIsmi = talep.paketId.paketAdi;
            } else if (talep.paketId) {
                const hamId = talep.paketId.toString().trim().toLowerCase();
                if (hamId === "664b4c730000000000000001") pIsmi = "Standart Üyelik";
                else if (hamId === "664b4c730000000000000002") pIsmi = "Gold Üyelik";
                else if (hamId === "664b4c730000000000000003") pIsmi = "Premium Savaşçı";
                else if (hamId === "664b4c730000000000000004") pIsmi = "Efsane Paket (VIP)";
            }

            talepObj.garantiPaketAdi = pIsmi;
            return talepObj;
        });

        res.json(optimizeEdilenTalepler);
    } catch (error) {
        console.error("Talepleri çekme hatası:", error);
        res.status(500).json({ mesaj: "Talepler listelenemedi." });
    }
});

module.exports = router;