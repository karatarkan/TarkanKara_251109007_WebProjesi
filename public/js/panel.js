/**
 * ==========================================================================
 * SELAMLAR, ADMİN PANELİ TÜM CRUD İŞLEMLERİ (panel.js) BURADADIR.
 * Sekme geçişlerindeki anlık veri yenileme motoru başarıyla entegre edildi!
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- GÜVENLİK PROTOKOLÜ: SAYFA YENİLENİRSE GİRİŞE AT ---
    const sayfaYenilendiMi = window.performance && window.performance.getEntriesByType("navigation")[0].type === "reload";
    if (sayfaYenilendiMi) {
        fetch('/api/251109007/cikis').then(() => {
            alert("Güvenlik Protokolü: Sayfa yenilendiği için oturumunuz sonlandırıldı!");
            window.location.href = '/giris.html';
        });
        return;
    }

    const tabloGövde = document.getElementById('uyeTabloGövde');
    const uyeFormu = document.getElementById('panelUyeFormu');
    const formBaslik = document.getElementById('form-baslik');
    const formButon = document.getElementById('formButon');
    
    // Form Elemanları Sabitlemesi
    const uyeIdInput = document.getElementById('uyeId');
    const uyeAdInput = document.getElementById('uyeAd');
    const uyeSoyadInput = document.getElementById('uyeSoyad');
    const uyeYasInput = document.getElementById('uyeYas');
    const uyeTelefonInput = document.getElementById('uyeTelefon');
    const uyePaketSelect = document.getElementById('uyePaketId'); 
    const uyeDurumSelect = document.getElementById('uyeDurum');
    const uyeOdemeSelect = document.getElementById('uyeOdemeYontemi');

    let globalUyelerListesi = [];

    // --- 1. CRUD İŞLEMİ: GET (CANLI ÜYELERİ LİSTELEME) ---
    async function uyeleriGetir() {
        try {
            const cevap = await fetch('/api/251109007/uyeler');
            if (cevap.status === 401) {
                alert("Oturum süreniz dolmuş! Lütfen tekrar giriş yapın.");
                window.location.href = '/giris.html';
                return;
            }
            const uyeler = await cevap.json();
            globalUyelerListesi = uyeler; 
            
            if (!tabloGövde) return;
            tabloGövde.innerHTML = ''; 

            if (!uyeler || uyeler.length === 0) {
                tabloGövde.innerHTML = `<tr><td colspan="7" style="padding:15px; text-align:center; color:#aaa;">Veritabanında henüz kayıtlı üye yok.</td></tr>`;
                return;
            }

            uyeler.forEach(uye => {
                let paketIsmi = 'Tanımsız Paket';

                if (uye.garantiPaketAdi) {
                    paketIsmi = uye.garantiPaketAdi;
                } else if (uye.paketId && uye.paketId.paketAdi) {
                    paketIsmi = uye.paketId.paketAdi;
                } else if (uye.paketId) {
                    const pId = typeof uye.paketId === 'object' ? (uye.paketId._id ? uye.paketId._id.toString() : '') : uye.paketId.toString();
                    const temizId = pId.trim().toLowerCase();
                    
                    if (temizId === "664b4c730000000000000001") paketIsmi = "Standart Üyelik";
                    else if (temizId === "664b4c730000000000000002") paketIsmi = "Gold Üyelik";
                    else if (temizId === "664b4c730000000000000003") paketIsmi = "Premium Savaşçı";
                    else if (temizId === "664b4c730000000000000004") paketIsmi = "Efsane Paket (VIP)";
                }
                
                let durumRozeti = `<span style="background:#2ecc71; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold; color:#fff;">Aktif</span>`;
                if(uye.durum === 'Pasif') durumRozeti = `<span style="background:#e74c3c; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold; color:#fff;">Pasif</span>`;
                if(uye.durum === 'Donduruldu') durumRozeti = `<span style="background:#f1c40f; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold; color:#000;">Donduruldu</span>`;

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #333';
                tr.innerHTML = `
                    <td style="padding:12px; font-weight:bold;">${uye.ad} ${uye.soyad}</td>
                    <td style="padding:12px; color:#aaa;">${uye.telefon || '-'}</td>
                    <td style="padding:12px;">${uye.yas}</td>
                    <td style="padding:12px; color:#ff6600; font-weight:500;">${paketIsmi}</td>
                    <td style="padding:12px;">${durumRozeti}</td>
                    <td style="padding:12px; font-size:13px; color:#999;">${uye.odemeYontemi || 'Belirtilmedi'}</td>
                    <td style="padding:12px; text-align:center;">
                        <button class="t-btn-duzenle-yeni" data-id="${uye._id}" style="padding:5px 10px; background:#007bff; color:#fff; border:none; border-radius:4px; cursor:pointer; margin-right:5px;"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="t-btn-sil-yeni" data-id="${uye._id}" style="padding:5px 10px; background:#dc3545; color:#fff; border:none; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                `;
                tabloGövde.appendChild(tr);
            });

            silmeOlaylariniTetikle();
            duzenlemeOlaylariniTetikle();

        } catch (hata) {
            console.error("Üyeler çekilirken hata oluştu:", hata);
        }
    }

    // --- 2. CRUD İŞLEMİ: POST & PUT (VERİTABANINA KAYDETME MOTORU) ---
    if (uyeFormu) {
        uyeFormu.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const id = uyeIdInput.value;
            const veri = {
                ad: uyeAdInput.value.trim(),
                soyad: uyeSoyadInput.value.trim(),
                yas: parseInt(uyeYasInput.value),
                telefon: uyeTelefonInput.value.trim(),
                paketId: uyePaketSelect.value, 
                durum: uyeDurumSelect.value,
                odemeYontemi: uyeOdemeSelect.value
            };

            try {
                let url = '/api/251109007/uyeler';
                let method = 'POST';

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
                    alert(id ? "Üye profesyonel verileri başarıyla güncellendi!" : "Yeni profesyonel üye başarıyla MongoDB Atlas'a kaydedildi!");
                    formuSifirla();
                    uyeleriGetir(); 
                } else {
                    const hataVerisi = await cevap.json();
                    alert("İşlem başarısız: " + (hataVerisi.mesaj || "Bilinmeyen hata"));
                }
            } catch (hata) {
                console.error("Form gönderilirken sunucu hatası:", hata);
                alert("Sunucu bağlantı hatası!");
            }
        });
    }

    // --- 3. CRUD İŞLEMİ: DELETE (ÜYE SİLME) ---
    function silmeOlaylariniTetikle() {
        document.querySelectorAll('.t-btn-sil-yeni').forEach(buton => {
            buton.addEventListener('click', async () => {
                const id = buton.getAttribute('data-id');
                if (confirm("Bu üyeyi silmek istediğinize emin misiniz? (MongoDB'den tamamen kaldırılacaktır)")) {
                    try {
                        const cevap = await fetch(`/api/251109007/uyeler/${id}`, { method: 'DELETE' });
                        if (cevap.ok) {
                            alert("Üye kaydı başarıyla silindi!");
                            uyeleriGetir();
                        }
                    } catch (hata) {
                        console.error("Silme esnasında hata:", hata);
                    }
                }
            });
        });
    }

    // --- 4. CRUD İŞLEMİ: FORMU PROFESYONEL DÜZENLEME MODUNA ALMA ---
    function duzenlemeOlaylariniTetikle() {
        document.querySelectorAll('.t-btn-duzenle-yeni').forEach(buton => {
            buton.addEventListener('click', () => {
                const id = buton.getAttribute('data-id');
                const secilenUye = globalUyelerListesi.find(u => u._id === id);

                if (secilenUye) {
                    uyeIdInput.value = secilenUye._id;
                    uyeAdInput.value = secilenUye.ad;
                    uyeSoyadInput.value = secilenUye.soyad;
                    uyeYasInput.value = secilenUye.yas;
                    uyeTelefonInput.value = secilenUye.telefon || '';
                    if (secilenUye.paketId && typeof secilenUye.paketId === 'object') {
                        uyePaketSelect.value = secilenUye.paketId._id;
                    } else {
                        uyePaketSelect.value = secilenUye.paketId || '';
                    }
                    uyeDurumSelect.value = secilenUye.durum || 'Aktif';
                    uyeOdemeSelect.value = secilenUye.odemeYontemi || 'Belirtilmedi';

                    formBaslik.innerText = "ÜYE BİLGİLERİNİ GÜNCELLE";
                    if (formButon) {
                        formButon.innerText = "Değişiklikleri Kaydet";
                        formButon.style.background = "#007bff";
                    }
                }
            });
        });
    }

    function formuSifirla() {
        uyeIdInput.value = '';
        uyeFormu.reset();
        formBaslik.innerText = "YENİ PROFESYONEL ÜYE KAYDI";
        if (formButon) {
            formButon.innerText = "Veritabanına Kaydet";
            formButon.style.background = "#ff6600";
        }
    }

    // --- SEKME (TAB) GEÇİŞ KODLARI (DİNAMİK YENİLEME EKLENDİ) ---
    const sekmeButonlari = document.querySelectorAll('.t-panel-sekme-buton, .t-panel-sekme-buton.active');
    const sekmeIcerikleri = document.querySelectorAll('.t-panel-sekme-icerik');

    sekmeButonlari.forEach(buton => {
        buton.addEventListener('click', () => {
            const hedefSekmeId = buton.getAttribute('data-target'); 
            sekmeButonlari.forEach(b => b.classList.remove('active'));
            buton.classList.add('active');

            sekmeIcerikleri.forEach(icerik => {
                if (icerik.id === hedefSekmeId) {
                    icerik.classList.add('active');
                } else {
                    icerik.classList.remove('active');
                }
            });

            // ⚠️ BURASI AKIŞI KURTARAN YER: Sekme Bilgi Talepleri ise anlık listeyi tazele!
            if (hedefSekmeId === 'talepler-sekmesi') {
                talepleriGetir();
            } else if (hedefSekmeId === 'uye-yonetim-sekmesi') {
                uyeleriGetir();
            }
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

            if (!talepler || talepler.length === 0) {
                talepTabloGövde.innerHTML = `<tr><td colspan="4" style="padding:15px; text-align:center; color:#aaa;">Henüz dışarıdan gelen bir arama/bilgi talebi yok.</td></tr>`;
                return;
            }

            talepler.forEach(talep => {
                let paketIsmi = 'Standart Üyelik';
                
                if (talep.paketId) {
                    const hamId = talep.paketId.toString().trim().toLowerCase();
                    if (hamId === "664b4c730000000000000001") paketIsmi = "Standart Üyelik";
                    else if (hamId === "664b4c730000000000000002") paketIsmi = "Gold Üyelik";
                    else if (hamId === "664b4c730000000000000003") paketIsmi = "Premium Savaşçı";
                    else if (hamId === "664b4c730000000000000004") paketIsmi = "Efsane Paket (VIP)";
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #333';
                tr.innerHTML = `
                    <td style="padding:12px; font-weight:bold;">${talep.ad} ${talep.soyad}</td>
                    <td style="padding:12px; color:#007bff;"><i class="fa-solid fa-phone"></i> ${talep.telefon}</td>
                    <td style="padding:12px;">${talep.yas}</td>
                    <td style="padding:12px; color:#ff6600; font-weight:500;">${paketIsmi}</td>
                `;
                talepTabloGövde.appendChild(tr);
            });
        } catch (hata) {
            console.error("Talepler çekilemedi:", hata);
        }
    }

    talepleriGetir();
    uyeleriGetir();
});