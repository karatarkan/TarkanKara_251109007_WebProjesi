const mongoose = require('mongoose');

const UyeSchema = new mongoose.Schema({
    ad: { type: String, required: true },
    soyad: { type: String, required: true },
    yas: { type: Number, required: true },
    telefon: { type: String, required: true },
    paketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paket', required: true },
    durum: { type: String, enum: ['Aktif', 'Pasif', 'Donduruldu'], default: 'Aktif' },
    odemeYontemi: { type: String, enum: ['Nakit', 'Kredi Kartı', 'Havale', 'Belirtilmedi'], default: 'Belirtilmedi' },
    kayitTarihi: { type: Date, default: Date.now },
    uyelikBitisTarihi: { 
        type: Date, 
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // Varsayılan olarak üyelik bitiş tarihi, kayıt tarihinden 30 gün sonrasına ayarlanır.
    }
}, {
    collection: '251109007_uyeler'
});

module.exports = mongoose.model('Uye', UyeSchema);