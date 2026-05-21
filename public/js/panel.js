/**
 * ==========================================================================
 * HOCAM SELAMLAR, ADMİN PANELİ TÜM CRUD İŞLEMLERİ (panel.js) BURADADIR.
 * Eleman uyuşmazlıkları ve veritabanına yazma hatası tamamen çözülmüştür.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const sayfaYenilendiMi = window.performance && window.performance.getEntriesByType("navigation")[0].type === "reload";
    if (sayfaYenilendiMi) {
        // Tarayıcı yenilendiği an session'ı temizlemesi için backend çıkış rotasını tetikliyoruz
        fetch('/api/251109007/cikis').then(() => {
            alert("Güvenlik Protokolü: Sayfa yenilendiği için oturumunuz sonlandırıldı hocam!");
            window.location.href = '/giris.html';
        });
        return; // Sayfanın geri kalan kodlarını çalıştırma, direkt çıkışa yönlendir
    }
    const tabloGövde = document.getElementById('uyeTabloGövde');
    const uyeFormu = document.getElementById('panelUyeFormu');
    const formBaslik = document.getElementById('form-baslik');
    const formButon = document.getElementById('formButon'); // HTML'deki id ile birebir eşitledik hocam
    
    // Form Elemanları Sabitlemesi
    const uyeIdInput = document.getElementById('uyeId');
    const uyeAdInput = document.getElementById('uyeAd');
    const uyeSoyadInput = document.getElementById('uyeSoyad');
    const uyeYasInput = document.getElementById('uyeYas');
    const uyePaketSelect = document.getElementById('uyePaket');

    // --- 1. CRUD İŞLEMİ: GET (MONGODB'DEN CANLI ÜYELERİ LİSTELEME) ---
    async function uyeleriGetir() {
        try {
            const cevap = await fetch('/api/251109007/uyeler');
            if (cevap.status === 401) {
                alert("Hocam oturum süreniz dolmuş! Lütfen tekrar giriş yapın.");
                window.location.href = '/giris.html';
                return;
            }
            const uyeler = await cevap.json();
            
            tabloGövde.innerHTML = ''; // Eski satırları temizle

            if (!uyeler || uyeler.length === 0) {
                tabloGövde.innerHTML = `<tr><td colspan="4" style="padding:15px; text-align:center; color:#aaa;">Veritabanında henüz kayıtlı üye yok hocam.</td></tr>`;
                return;
            }

            uyeler.forEach(uye => {
                const paketIsmi = uye.paketId ? uye.paketId.paketAdi : 'Standart Üyelik';
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #333';
                
                tr.innerHTML = `
                    <td style="padding:12px;">${uye.ad} ${uye.soyad}</td>
                    <td style="padding:12px;">${uye.yas}</td>
                    <td style="padding:12px; color:#ff6600;">${paketIsmi}</td>
                    <td style="padding:12px; text-align:center;">
                        <button class="duzenle-btn" data-id="${uye._id}" data-ad="${uye.ad}" data-soyad="${uye.soyad}" data-yas="${uye.yas}" style="padding:6px 12px; background:#007bff; color:#fff; border:none; border-radius:4px; margin-right:8px; cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i> Düzenle</button>
                        <button class="sil-btn" data-id="${uye._id}" style="padding:6px 12px; background:#dc3545; color:#fff; border:none; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-trash"></i> Sil</button>
                    </td>
                `;
                tabloGövde.appendChild(tr);
            });

            // Olay tetikleyicilerini yeniden bağla
            silmeOlaylariniTetikle();
            duzenlemeOlaylariniTetikle();

        } catch (hata) {
            console.error("Üyeler çekilirken hata oluştu:", hata);
        }
    }

    // --- 2. CRUD İŞLEMİ: POST & PUT (ÜYE EKLEME VE GÜNCELLEME) ---
    if (uyeFormu) {
        uyeFormu.addEventListener('submit', async (e) => {
            e.preventDefault(); // Sayfa yenilenmesini engelle

            const id = uyeIdInput.value;
            const veri = {
                ad: uyeAdInput.value.trim(),
                soyad: uyeSoyadInput.value.trim(),
                yas: parseInt(uyeYasInput.value),
                paketId: uyePaketSelect.value
            };

            try {
                let url = '/api/251109007/uyeler';
                let method = 'POST';

                // Eğer gizli inputta ID varsa işlemimiz PUT (Güncelleme) olur hocam
                if (id) {
                    url = `/api/251109007/uyeler/${id}`;
                    method = 'PUT';
                }

                const cevap = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(veri)
                });

                if (cevap.ok) {
                    alert(id ? "Üye başarıyla güncellendi hocam!" : "Yeni üye başarıyla MongoDB Atlas'a kaydedildi hocam!");
                    formuSifirla();
                    uyeleriGetir(); // Tabloyu canlı tazele
                } else {
                    const hataVerisi = await cevap.json();
                    alert("İşlem başarısız: " + (hataVerisi.mesaj || "Bilinmeyen hata"));
                }
            } catch (hata) {
                console.error("Form gönderilirken sunucu hatası:", hata);
                alert("Sunucuyla bağlantı kurulamadı!");
            }
        });
    }

    // --- 3. CRUD İŞLEMİ: DELETE (ÜYE SİLME) ---
    function silmeOlaylariniTetikle() {
        document.querySelectorAll('.sil-btn').forEach(buton => {
            buton.addEventListener('click', async () => {
                const id = buton.getAttribute('data-id');
                if (confirm("Hocam bu üyeyi silmek istediğinize emin misiniz? (MongoDB'den silinecektir)")) {
                    try {
                        const cevap = await fetch(`/api/251109007/uyeler/${id}`, { method: 'DELETE' });
                        if (cevap.ok) {
                            alert("Üye başarıyla silindi hocam!");
                            uyeleriGetir();
                        }
                    } catch (hata) {
                        console.error("Silme esnasında hata:", hata);
                    }
                }
            });
        });
    }

    // --- 4. CRUD İŞLEMİ: FORMU DÜZENLEME MODUNA ALMA KÖPRÜSÜ ---
    function duzenlemeOlaylariniTetikle() {
        document.querySelectorAll('.duzenle-btn').forEach(buton => {
            buton.addEventListener('click', () => {
                uyeIdInput.value = buton.getAttribute('data-id');
                uyeAdInput.value = buton.getAttribute('data-ad');
                uyeSoyadInput.value = buton.getAttribute('data-soyad');
                uyeYasInput.value = buton.getAttribute('data-yas');
                
                formBaslik.innerHTML = `<i class="fa-solid fa-user-pen"></i> Üye Bilgilerini Güncelle`;
                if (formButon) {
                    formButon.innerText = "Değişiklikleri Kaydet";
                    formButon.style.background = "#007bff";
                }
            });
        });
    }

    function formuSifirla() {
        uyeIdInput.value = '';
        uyeFormu.reset();
        formBaslik.innerHTML = `<i class="fa-solid fa-user-plus"></i> Yeni Üye Kaydet`;
        if (formButon) {
            formButon.innerText = "Üyeyi Veritabanına Yaz";
            formButon.style.background = "#ff6600";
        }
    }

    // --- SEKME (TAB) GEÇİŞ KODLARI ---
    const sekmeButonlari = document.querySelectorAll('.t-panel-sekme-buton, .t-panel-sekme-buton.active');
    const sekmeIcerikleri = document.querySelectorAll('.t-panel-sekme-icerik');

    sekmeButonlari.forEach(buton => {
        buton.addEventListener('click', () => {
            const hedefSekmeId = buton.getAttribute('data-target');
            
            // Aktif olan butonun rengini düzenle
            sekmeButonlari.forEach(b => b.classList.remove('active'));
            buton.classList.add('active');

            // İlgili sekmeyi göster, diğerlerini gizle
            sekmeIcerikleri.forEach(icerik => {
                if (icerik.id === hedefSekmeId) {
                    icerik.classList.add('active');
                } else {
                    icerik.classList.remove('active');
                }
            });
        });
    });
    // --- 5. CRUD İŞLEMİ: GET (GELEN ÖN KAYIT TALEPLERİNİ LİSTELEME) ---
    const talepTabloGövde = document.getElementById('talepTabloGövde');

    async function talepleriGetir() {
        try {
            const cevap = await fetch('/api/251109007/onkayitlar');
            if (!cevap.ok) return;
            const talepler = await cevap.json();
            
            if(!talepTabloGövde) return;
            talepTabloGövde.innerHTML = '';

            if (talepler.length === 0) {
                talepTabloGövde.innerHTML = `<tr><td colspan="4" style="padding:15px; text-align:center; color:#aaa;">Henüz dışarıdan gelen bir arama/bilgi talebi yok hocam.</td></tr>`;
                return;
            }

            talepler.forEach(talep => {
                const paketIsmi = talep.paketId ? talep.paketId.paketAdi : 'Standart Üyelik';
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #333';
                tr.innerHTML = `
                    <td style="padding:12px; font-weight:bold;">${talep.ad} ${talep.soyad}</td>
                    <td style="padding:12px; color:#007bff;"><i class="fa-solid fa-phone"></i> ${talep.telefon}</td>
                    <td style="padding:12px;">${talep.yas}</td>
                    <td style="padding:12px; color:#ff6600;">${paketIsmi}</td>
                `;
                talepTabloGövde.appendChild(tr);
            });
        } catch (hata) {
            console.error("Talepler çekilemedi:", hata);
        }
    }

    // İlk açılışta bu listeyi de tetikliyoruz hocam
    talepleriGetir();
    // Açılışta verileri otomatik yükle
    uyeleriGetir();

});