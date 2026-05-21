const mongoose = require('mongoose');

const OnKayitSchema = new mongoose.Schema({
    ad: { type: String, required: true },
    soyad: { type: String, required: true },
    yas: { type: Number, required: true },
    telefon: { type: String, required: true }, // Adminin araması için telefonu da kaydediyoruz
    paketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paket', required: true },
    talepTarihi: { type: Date, default: Date.now }
}, {
    collection: '251109007_onkayitlar' // Tamamen bağımsız izole bir tablo!
});

module.exports = mongoose.model('OnKayit', OnKayitSchema);