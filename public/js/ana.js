/**
 * ==========================================================================
 * FRONTEND - BACKEND BAĞLANTI KÖPRÜSÜ (ana.js) BURASIDIR.
 * Ön Kayıt veri akışını garanti altına alan kırılmaz sürüm.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Sayfadaki formu id, class veya etiket fark etmeksizin en agresif şekilde yakalıyoruz
    const kayitFormu = document.getElementById('t-kayitFormu') || document.querySelector('.t-kayit-formu') || document.forms[0];
    
    if (kayitFormu) {
        console.log("Ön kayıt formu başarıyla kilitlendi.");
        
        kayitFormu.addEventListener('submit', async (e) => {
            e.preventDefault(); // Sayfa yenilenmesini kesin olarak engelle!

            // Form elemanlarını en güvenli seçicilerle okuyoruz
            const isimElement = document.getElementById('t-isim');
            const telElement = document.getElementById('t-telefon');
            const yasElement = document.getElementById('t-yas');
            const hedefElement = document.getElementById('t-hedef');

            if (!isimElement || !telElement || !yasElement) {
                alert("Form elemanları tarayıcı tarafından okunamadı!");
                return;
            }

            const tamIsim = isimElement.value.trim();
            const telefon = telElement.value.trim();
            const yas = yasElement.value;
            const seciliHedef = hedefElement ? hedefElement.value : 'Belirtilmedi';
            
            const isimParcalari = tamIsim.split(' ');
            const ad = isimParcalari[0];
            const soyad = isimParcalari.slice(1).join(' ') || '-';

            // Seçilen paket tipini yakalıyoruz
            const radioKontrol = document.querySelector('input[name="paketTipi"]:checked');
            const seciliRadioPaketAdi = radioKontrol ? radioKontrol.value : 'Standart';

            // --- SABİT OBJECTID KÖPRÜSÜ ---
            let dinamikPaketId = "664b4c730000000000000001"; // Standart Üyelik ID'si varsayılan olarak atanır
            let pIsmiGarantisi = "Standart Üyelik";
            
            if (seciliRadioPaketAdi === "Gold" || seciliRadioPaketAdi === "Gold Paket") {
                dinamikPaketId = "664b4c730000000000000002";
                pIsmiGarantisi = "Gold Üyelik";
            } else if (seciliRadioPaketAdi === "Premium" || seciliRadioPaketAdi === "Premium Savaşçı") {
                dinamikPaketId = "664b4c730000000000000003";
                pIsmiGarantisi = "Premium Savaşçı";
            } else if (seciliRadioPaketAdi === "Efsane Paket (VIP)") {
                dinamikPaketId = "664b4c730000000000000004"; 
                pIsmiGarantisi = "Efsane Paket (VIP)";
            }

            // Backend şemasında kırılma olmaması için hem şema alanlarını hem yedek ismi pakete ekliyoruz
            const talepVerisi = {
                ad: ad,
                soyad: soyad,
                yas: parseInt(yas),
                telefon: telefon,
                paketId: dinamikPaketId,
                hedef: seciliHedef,
                garantiPaketAdi: pIsmiGarantisi // Ön yüzde listeleme yaparken hayat kurtaracak alan
            };

            console.log("MongoDB Atlas havuzuna fırlatılan veri:", talepVerisi);

            try {
                const cevap = await fetch('/api/251109007/onkayit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(talepVerisi)
                });

                if (cevap.ok) {
                    alert(`Tebrikler ${ad}! Bilgi alma ve ön kayıt talebiniz sisteme başarıyla iletildi.`);
                    kayitFormu.reset(); 
                } else {
                    alert("Ön kayıt işlemi sırasında bir backend hatası oluştu.");
                }
            } catch (hata) {
                console.error("Ön kayıt fetch hatası:", hata);
                alert("Sunucu bağlantı hatası!");
            }
        });
    } else {
        console.error("Sayfada 't-kayitFormu' ID'li form bulunamadı!");
    }
});