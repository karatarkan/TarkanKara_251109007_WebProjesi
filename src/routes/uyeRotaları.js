const express = require('express'); // Express framework'ünü dahil ediyorum
const router = express.Router(); // Express Router'ını kullanarak yeni bir router oluşturuyorum
const Uye = require('../models/Uye'); // Uye modelini dahil ediyorum

// ---1. ENDPOINT : GET ( TÜM ÜYELERİ LİSTELEME ) ---
// Asenkron bir fonksiyon kullanarak tüm üyeleri veritabanından çekiyorum,
// req isteği, res cevabı temsil eder. Hata durumunda 500 durum kodu ve hata mesajı döndürüyorum.
// await ifadesi, Uye.find() metodunun tamamlanmasını bekler ve sonuçları 'uyeler' değişkenine atar.
// paket bilgilerini de dahil ederek JSON formatında döndürüyorum.
// populate() metodu, 'paketId' alanındaki referansları gerçek paket verileriyle doldurur.
// res.json(uyeler) ifadesi, üyeleri JSON formatında istemciye gönderir.
// try-catch bloğu, veritabanı işlemi sırasında oluşabilecek hataları yakalamak
// ve uygun bir hata mesajı döndürmek için kullanılır.

router.get('/api/251109007/uyeler', async (req, res) => {
    try {
        const uyeler = await Uye.find().populate('paketId');
        res.json(uyeler);
    } catch (error) {
        res.status(500).json({ mesaj: "Üyeler listelenemedi" });
    }
});

//  ---2. ENFPOINT: POST (YENİ ÜYE EKLEME) ---
// büyük bir veri gönderimi yaptıgımızda, bu veriyi req.body üzerinden alırız. Yeni bir Uye nesnesi oluşturup, bu nesneyi veritabanına kaydediyorum.
// req.body.ad, req.body.soyad, req.body.yas ve req.body.paketId ile gelen verileri kullanarak yeni bir üye oluşturuyorum.
// await yeniUye.save() ifadesi, yeni üyenin veritabanına kaydedilmesini sağlar ve kaydedilen üye bilgilerini 'kaydedilenUye' değişkenine atar.
// res.status(201).json(kaydedilenUye) ifadesi, başarılı bir şekilde oluşturulan üyeyi JSON formatında istemciye gönderir ve HTTP durum kodunu 201 olarak ayarlar.
// try-catch bloğu, veritabanı işlemi sırasında oluşabilecek hataları yakalamak ve uygun bir hata mesajı döndürmek için kullanılır.

router.post('/api/251109007/uyeler', async (req, res) => {
    try{
        const yeniUye = new Uye({
            ad: req.body.ad,
            soyad: req.body.soyad,
            yas: req.body.yas,
            paketId: req.body.paketId
        });
        const kaydedilenUye = await yeniUye.save();
        res.status(201).json(kaydedilenUye);
    } catch (error) {
        res.status(400).json({ mesaj: "Üye eklenemedi" });
    }
});

// ---3. ENDPOINT: PUT (ÜYE GÜNCELLEME) ---

router.put('/api/251109007/uyeler/:id', async (req, res) => {
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
// burda body almadık çünkü silme işlemi için sadece üyenin id'sine ihtiyacımız var. 
// req.params.id ifadesi, URL'deki :id parametresini temsil eder ve silinecek üyenin id'sini alır.
router.delete('/api/251109007/uyeler/:id', async (req, res) => {
    try {
        await Uye.findByIdAndDelete(req.params.id);
        res.json({ mesaj: "Üye silindi" });
    } catch (error) {
        res.status(500).json({ mesaj: "Üye silinemedi" });
    }
});
module.exports = router; // router'ı diğer dosyalarda kullanmak üzere dışa aktarıyorum