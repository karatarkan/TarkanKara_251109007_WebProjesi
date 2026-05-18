const mongoose = require('mongoose');

// Paket üyelik paketlerini tutan şema
const PaketSchema = new mongoose.Schema({
    paketAdi: {type: String, required: true},
    aylikUcret: {type: Number, required: true},
    haftalikGiris: {type: Number, required: true},
},{
    collection: '251109007_paketler'
});
module.exports = mongoose.model('Paket', PaketSchema);