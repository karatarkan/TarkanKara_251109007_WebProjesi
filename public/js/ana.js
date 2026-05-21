/**
 * ==========================================================================
 * HOCAM SELAMLAR, FRONTEND - BACKEND BAĞLANTI KÖPRÜSÜ (ana.js) BURASIDIR.
 * Müşteri Ön Kayıt Formu verileri doğrudan MongoDB'ye akar.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- ÜYELER SAYFASINDAKİ ÖN KAYIT FORMU ---
    const kayitFormu = document.getElementById('t-kayitFormu');
    if (kayitFormu) {
        kayitFormu.addEventListener('submit', async (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini engelliyoruz hocam

            const tamIsim = document.getElementById('t-isim').value.trim();
            const telefon = document.getElementById('t-telefon').value.trim();
            const yas = document.getElementById('t-yas').value;
            
            // İsim ve soyisimi düzgünce parçalara ayırıyoruz
            const isimParcalari = tamIsim.split(' ');
            const ad = isimParcalari[0];
            const soyad = isimParcalari.slice(1).join(' ') || '-';

            // HTML formundan seçilen radyo butonunun değerini alıyoruz
            const seciliRadioPaketAdi = document.querySelector('input[name="paketTipi"]:checked').value;

            // --- HOCAM DİNAMİK PAKET ID EŞLEŞTİRME KÖPRÜSÜ BURADADIR ---
            let dinamikPaketId = "664b4c730000000000000001"; // Varsayılan: Standart Üyelik
            
            if (seciliRadioPaketAdi === "Gold Paket" || seciliRadioPaketAdi === "Gold") {
                dinamikPaketId = "664b4c730000000000000002";
            } else if (seciliRadioPaketAdi === "Premium Savaşçı" || seciliRadioPaketAdi === "Premium") {
                dinamikPaketId = "664b4c730000000000000003";
            } else if (seciliRadioPaketAdi === "Efsane Paket (VIP)") {
                dinamikPaketId = "664b4c730000000000000004"; // VIP Paketimiz
            }

            // Backend'in beklediği izole ön kayıt şablonu
            const talepVerisi = {
                ad: ad,
                soyad: soyad,
                yas: parseInt(yas),
                telefon: telefon,
                paketId: dinamikPaketId
            };

            console.log("Hocam ön kayıt verisi izole havuza gönderiliyor:", talepVerisi);

            try {
                // --- ARKA KAPIYI TAMAMEN KAPATTIK: Sadece onkayit tüneline istek gidiyor ---
                const cevap = await fetch('/api/251109007/onkayit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(talepVerisi)
                });

                if (cevap.ok) {
                    alert(`Tebrikler ${ad} hocam! Bilgi alma ve ön kayıt talebiniz sisteme başarıyla iletildi. Yetkililerimiz sizi arayacaktır.`);
                    kayitFormu.reset(); // Form alanlarını temizle
                } else {
                    alert("Ön kayıt işlemi sırasında bir backend hatası oluştu.");
                }
            } catch (hata) {
                console.error("Ön kayıt fetch hatası:", hata);
                alert("Sunucu bağlantı hatası! Lütfen backend'in ayakta olduğundan emin olun.");
            }
        });
    }
});