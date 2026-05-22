// MongoAtlas ile bağlantıyı saatlerce kuramadım sonunda +srv protokolün silip
// sadece mongodb:// şeklinde bağlantıyı kurunca oldu. O yüzden bağlantı adresini .env dosyasına mongodb:// şeklinde ekledim.
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // Kullanici oturum yönetimi için gerekli.
const path = require('path'); // Dosya ve dizin yollarını yönetmek için path modülünü kullanıyorum.
require('dotenv').config(); // .env dosyasındaki ortam değişkenlerini yüklemek için dotenv paketini kullanıyorum

// Modellerimizi Seed (Tohumlama) işlemi için buraya çağırıyoruz
const Kullanici = require('./models/Kullanici');
const Paket = require('./models/Paket');
const Uye = require('./models/Uye');
const OnKayit = require('./models/OnKayit');

const app = express();

// Middleware
app.use(express.json()); // Json formatında gelen verileri işler.
app.use(express.urlencoded({ extended: true })); // URL-encoded verileri işler. 

// --- DÜZELTME: public klasörü src dışında olduğu için yolun başına '..' ekleyerek bir üst dizine çıkmasını sağladım ---
app.use(express.static(path.join(__dirname, '..', 'public'))); 

app.use(session({
    secret: process.env.SESSION_SECRET, // Oturum gizliliği için, env dosyasından alıyorum.
    resave: false, // Oturumun her istekte yeniden kaydedilmesini env'den engeller.
    saveUninitialized: true,// Yeni oturumların kaydedilmesini sağlar.
    cookie: { secure: false } // Geliştirme ortamında secure: false olmalıdır.
}));

// --- MONGOOSE İLE CANLI MONGODB ATLAS BAĞLANTI AYARI ---
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("MongoDB Atlas bulut veritabanına bağlantı başarıyla sağlandı!");
        
       try {
            // ⚠️ ADIM 1: Hafızadaki eski admin kullanıcılarını tamamen temizliyoruz
            await Kullanici.deleteMany({});
            console.log("Eski yönetici kayıtları temizlendi.");

            await Kullanici.create({
                kullaniciAdi: "admin",
                sifre: "1234"
            });
            console.log("Yönetici (admin / 1234) güvenli şekilde oluşturuldu.");

            // ⚠️ ADIM 2: ESKİ BOZUK, ID'Sİ EŞLEŞMEYEN TÜM ÜYELERİ KAZIYORUZ ⚠️
            await Uye.deleteMany({});
            console.log("Eski bozuk üye kayıtları veritabanından tamamen temizlendi!");
            await OnKayit.deleteMany({});
            console.log("Eski ön kayıt talepleri veritabanından tamamen kazındı!");
            // ⚠️ ADIM 3: KOŞULU KALDIRDIK! ESKİ BOZUK PAKETLERİ SİLİP HAKİKİ OBJECTID TİPİNDE YAZIYORUZ ⚠️
            // Böylece string/object çakışması ve "if (paketSayisi === 0)" engeli tamamen aşılır.
            await Paket.deleteMany({});
            await Paket.insertMany([
                { _id: new mongoose.Types.ObjectId("664b4c730000000000000001"), paketAdi: "Standart Üyelik", aylikUcret: 2000, haftalikGiris: 3 },
                { _id: new mongoose.Types.ObjectId("664b4c730000000000000002"), paketAdi: "Gold Üyelik", aylikUcret: 9000, haftalikGiris: 5 },
                { _id: new mongoose.Types.ObjectId("664b4c730000000000000003"), paketAdi: "Premium Savaşçı", aylikUcret: 20000, haftalikGiris: 6 },
                { _id: new mongoose.Types.ObjectId("664b4c730000000000000004"), paketAdi: "Efsane Paket (VIP)", aylikUcret: 30000, haftalikGiris: 7 }
            ]);
            console.log("Üyelik Paketleri Hakiki Mongoose ObjectId Yapısıyla Yeniden Mühürlendi!");

        } catch (seedHata) {
            console.log("İlk kurulum verileri yazılırken hata oluştu: ", seedHata);
        }
    })
    .catch((hata) => console.log("MongoDB bağlantısı başarısız: ", hata));

// --- API ROTALARINI SUNUCUYA TANITMA ---
const uyeRotalari = require('./routes/uyeRotalari');
app.use(uyeRotalari);

// --- SUNUCUYU AYAĞA KALDIRMA ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});