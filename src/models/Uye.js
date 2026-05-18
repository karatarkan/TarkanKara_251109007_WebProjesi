const mongoose = require ('mongoose');

const UyeSchema = new mongoose.Schema({
    ad: {type: String, required: true},
    soyad: {type: String, required: true},
    yas: {type: Number, required: true},
    // Burada 'Paket' modeline referans vererek ik model arasında bağlantı kuruyorum.
    paketId: {type: mongoose.Schema.Types.ObjectId, ref: 'Paket', required: true},
    kayitTarihi: {type: Date, default: Date.now}
},{
    collection: '251109007_uyeler'
});
module.exports = mongoose.model('Uye', UyeSchema);