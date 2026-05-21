const mongoose = require('mongoose');
const crypto = require('crypto');

const kullaniciSchema = new mongoose.Schema({
    kullaniciAdi: {type: String, required: true, unique: true},
    sifre:{type: String, required: true},
},{
    collection: '251109007_kullanicilar'
});

// --- HOCAM YÖNERGEDE İSTEDİĞİNİZ ŞİFRELEME (HASH) İŞLEMİ TAM BURADADIR ---
// Veritabanına kaydedilmeden hemen önce şifreyi SHA-256 ile şifreliyoruz
kullaniciSchema.pre('save', function(next) {
    const kullanici = this;
    
    // Şifre üzerinde bir değişiklik yapılmadıysa tekrar hash'leme yapma
    if (!kullanici.isModified('sifre')) return;

    try {
        const hash = crypto.createHash('sha256').update(kullanici.sifre).digest('hex');
        kullanici.sifre = hash;
        
    } catch (hata) {
         throw(hata);
    }
});

// Giriş panelinde şifre kontrolü yaparken kullanılacak yardımcı metot
kullaniciSchema.methods.sifreKontrol = function(girilenSifre) {
    const kontrolHash = crypto.createHash('sha256').update(girilenSifre).digest('hex');
    return this.sifre === kontrolHash;
};

module.exports = mongoose.model('Kullanici', kullaniciSchema);