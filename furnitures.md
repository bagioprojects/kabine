# Ofis Eşyaları ve Sprite Haritası (Sprite Atlas)

Bu doküman, oyunda kullanılabilir olan eşyaların listesini, resim (`isometric.png`) içerisindeki konumlarını ve oyuna eklerken kullanmanız gereken **Eşya ID (Kod)** bilgilerini içermektedir.

Sistem, `isometric.png` adlı 2000x2000 piksel boyutundaki tek bir resmi **4x4'lük bir ızgara (grid)** olarak böler. Her bir hücre 500x500 piksel boyutundadır ve aşağıdaki eşyaları içerir:

## 🗄️ Sıra 1 (En Üst Satır)
| Görsel Hücresi | Eşya Adı | Eşya Kodu (ID) | Durum |
| :--- | :--- | :--- | :--- |
| `x: 0`, `y: 0` | Dosya Dolabı (Kasa) | `safe` | ✅ Aktif (Kullanılabilir) |
| `x: 500`, `y: 0` | Monitörlü Lüks Masa | `office_desk` / `desk` | ✅ Aktif (Kullanılabilir) |
| `x: 1000`, `y: 0` | Turuncu Ofis Koltuğu | `office_chair` / `chair` | ✅ Aktif (Kullanılabilir) |
| `x: 1500`, `y: 0` | Beyaz Tahta / Pano | `board` | ✅ Aktif (Kullanılabilir) |

## 🪴 Sıra 2
| Görsel Hücresi | Eşya Adı | Eşya Kodu (ID) | Durum |
| :--- | :--- | :--- | :--- |
| `x: 0`, `y: 500` | Uzun Saksı Bitkisi | `plant_tall` / `plant` | ✅ Aktif (Kullanılabilir) |
| `x: 500`, `y: 500` | Turuncu Üçlü Koltuk | `sofa` | ✅ Aktif (Kullanılabilir) |
| `x: 1000`, `y: 500` | Cam Orta Sehpa | `table_glass` | ⏳ Eklenmeye Hazır |
| `x: 1500`, `y: 500` | Su Sebili | `water_dispenser` | ⏳ Eklenmeye Hazır |

## 📚 Sıra 3
| Görsel Hücresi | Eşya Adı | Eşya Kodu (ID) | Durum |
| :--- | :--- | :--- | :--- |
| `x: 0`, `y: 1000` | Resepsiyon / L Masa | `desk_reception` | ⏳ Eklenmeye Hazır |
| `x: 500`, `y: 1000` | Ahşap Kitaplık | `bookshelf` | ⏳ Eklenmeye Hazır |
| `x: 1000`, `y: 1000` | Tekli Monitör | `monitor` | ⏳ Eklenmeye Hazır |
| `x: 1500`, `y: 1000` | Küçük Saksı Bitkisi | `plant_small` | ⏳ Eklenmeye Hazır |

## 🖨️ Sıra 4 (En Alt Satır)
| Görsel Hücresi | Eşya Adı | Eşya Kodu (ID) | Durum |
| :--- | :--- | :--- | :--- |
| `x: 0`, `y: 1500` | Yazıcı / Fotokopi Makinesi | `printer` | ⏳ Eklenmeye Hazır |
| `x: 500`, `y: 1500` | Turuncu Puf Tabure | `stool_orange` | ⏳ Eklenmeye Hazır |
| `x: 1000`, `y: 1500` | Duvar Saati | `clock` | ⏳ Eklenmeye Hazır |
| `x: 1500`, `y: 1500` | Ayaklı Zemin Lambası | `lamp` | ⏳ Eklenmeye Hazır |

---

## 🛠️ Yeni Eşya Nasıl Eklenir?

Oyuna listedeki yeni bir eşyayı (örneğin Kitaplık) eklemek isterseniz `IsometricOffice.tsx` dosyası içerisinde şu adımları izlemelisiniz:

1. **`SPRITE_ATLAS` Sözlüğüne Tanımlama:**
   ```typescript
   bookshelf: { sx: 500, sy: 1000, sw: 500, sh: 500, offsetX: -60, offsetY: -120, dw: 120, dh: 120 }
   ```
   (Yukarıdaki tabloda belirtilen `x` ve `y` değerlerini `sx` ve `sy` alanlarına yazarak eşyanın kırpılacağı (crop) yeri belirtin.)

2. **`OBJECTS` Dizisine Ekleme:**
   ```typescript
   { id: 'bookshelf', name: 'Ahşap Kitaplık', x: 1, y: 1, color: '#000', desc: 'Arşiv', flipX: false }
   ```
   (Eşyanın oyunda durmasını istediğiniz grid koordinatını (`x` ve `y`) belirterek dizinin içine ekleyin.)
