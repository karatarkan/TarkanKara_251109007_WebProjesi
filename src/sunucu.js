const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); //Kullanici oturum yönetimi için gerekli.
const path = require('path'); // Dosya ve dizin yollarını yönetmek için path modülünü kullanıyorum.
require('dotenv').config(); // .env dosyasındaki ortam değişkenlerini yüklemek için dotenv paketini kullanıyorum

const app = express();

// Middleware
app.use(express.json()); // Json formatında gelen verileri işler.
app.use(express.urlencoded({ extended: true })); // URL-encoded verileri işler. 
app.use(express.static(path.join(__dirname, 'public'))); // html, css ve js düzgün çalışması için public klasörünü statik olarak sunuyorum.
app.use(session({
    secret: process.env.SESSION_SECRET, // Oturum gizliliği için, env dosyasından alıyorum.
    resave: false, // Oturumun her istekte yeniden kaydedilmesini engeller.
    saveUninitialized: true,// Yeni oturumların kaydedilmesini sağlar.
    cookie: { secure: false } // Geliştirme ortamında güvenli olmayan cookie'ler kullanmak için secure: false olarak ayarlıyorum. Üretim ortamında true yapmalısınız.
}));

//--- MONGOOSE İLE CANLI MONGODB ATLAS BAĞLANTI AYARI ---
mongoose.connect(process.env.MONGODB_URI) 
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(hata => console.log('MongoDB bağlantısı başarısız:', hata));

//--- API ROTALARINI DAHİL ETME ---
const uyeRotalari = require('./routes/uyeRotaları');
app.use(uyeRotalari); // Rota dosyasını uygulamaya dahil ediyorum.

//--- SUNUCUYU BAŞLATMA ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});