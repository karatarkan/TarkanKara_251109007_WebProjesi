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

const app = express();


// Middleware
app.use(express.json()); // Json formatında gelen verileri işler.
app.use(express.urlencoded({ extended: true })); // URL-encoded verileri işler. 

// --- DÜZELTME: public klasörü src dışında olduğu için yolun başına '..' ekleyerek bir üst dizine çıkmasını sağladım ---
app.use(express.static(path.join(__dirname, '..', 'public'))); 

app.use(session({
    secret: process.env.SESSION_SECRET, // Oturum gizliliği için, env dosyasından alıyorum.
    resave: false, // Oturumun her istekte yeniden kaydedilmesini engeller.
    saveUninitialized: true,// Yeni oturumların kaydedilmesini sağlar.
    cookie: { secure: false } // Geliştirme ortamında güvenli olmayan cookie'ler kullanmak için secure: false olarak ayarlıyorum. Üretim ortamında true yapmalısınız.
}));

// --- MONGOOSE İLE CANLI MONGODB ATLAS BAĞLANTI AYARI ---
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("MongoDB Atlas bulut veritabanına bağlantı başarıyla sağlandı!");
        
        // --- HOCAM İLK KURULUM VE GÜVENLİK (SEED) TETİKLEYİCİSİ BURADADIR ---
        // Sistemde hiç yönetici yoksa, giriş yapabilmemiz için ilk yetkiliyi otomatik oluşturur.
       try {
            // ⚠️ ADIM 1: Hafızadaki eski admin kullanıcılarını tamamen temizliyoruz
            await Kullanici.deleteMany({});
            console.log("Eski yönetici kayıtları temizlendi.");

            // Adım 2: İstediğin yeni admin bilgilerini kriptolayarak veritabanına yazıyoruz
            // Şifre ("1234") modeldeki .pre('save') sayesinde otomatik SHA-256 ile hash'lenecektir.
            await Kullanici.create({
                kullaniciAdi: "admin",
                sifre: "1234"
            });
            console.log("Sistem İçin Yeni İlk Yetkili Yönetici (admin / 1234) Güvenli Şekilde Oluşturuldu!");

            // Paketler tablosu boşsa hocanın istediği o ilişkili paketleri de otomatik yükleyelim
            const paketSayisi = await Paket.countDocuments();
            if (paketSayisi === 0) {
                await Paket.insertMany([
                    { paketAdi: "Standart Üyelik", aylikUcret: 850, haftalikGiris: 3 },
                    { paketAdi: "Gold Üyelik", aylikUcret: 1200, haftalikGiris: 5 },
                    { paketAdi: "Premium Savaşçı", aylikUcret: 1500, haftalikGiris: 6 },
                    { paketAdi: "Efsane Paket (VIP)", aylikUcret: 2000, haftalikGiris: 7 }
                ]);
                console.log("Üyelik Paketleri Veritabanına Başarıyla İşlendi!");
            }
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