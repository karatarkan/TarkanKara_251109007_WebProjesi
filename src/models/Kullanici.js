const mongoose = require('mongoose');

const kullaniciSchema = new mongoose.Schema({
    kullaniciAdi: {type: String, required: true, unique: true},
    sifre:{type: String, required: true},
},{
    collection: '251109007_kullanicilar'

});
module.exports = mongoose.model('Kullanici', kullaniciSchema);