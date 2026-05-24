const mongoose = require('mongoose');

const OnKayitSchema = new mongoose.Schema({
    ad: { type: String },
    soyad: { type: String },
    yas: { type: Number },
    telefon: { type: String }, 
    paketId: { type: String }, // VALIDASYON HATASINI ÖNLEMEK İÇİN TİPİ DÜZ STRING YAPTIK 
    hedef: { type: String, default: 'Belirtilmedi' },
    talepTarihi: { type: Date, default: Date.now }
}, {
    collection: '251109007_onkayitlar' // MongoDB Atlas'taki koleksiyon adını burada belirtiyoruz, böylece veriler doğru yerde saklanır
});

module.exports = mongoose.model('OnKayit', OnKayitSchema);