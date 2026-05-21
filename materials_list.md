# Şehir Devletleri Simülasyonu - Hammaddeler Listesi (Materials & Minerals List)

Bu doküman, siyasi ve ekonomik simülasyonda yer alan stratejik hammaddeleri, bunların madencilik/üretim alanlarını, kullanım amaçlarını ve veritabanı şemalarını listeler.

---

## 💎 1. Stratejik Hammaddeler ve Kullanım Alanları

| Maden/Hammadde | Kategori | Temel Fiyat (Base Price) | Çıkarıldığı Eyalet/Kaynak | Kullanım Amacı |
| :--- | :--- | :--- | :--- | :--- |
| **Kömür (Coal)** | Enerji & Yakıt | 50 ₺ | Zonguldak Cumhuriyeti | Enerji santrallerini besler, demir-çelik eritme tesislerinde ısı kaynağı olarak kullanılır. |
| **Demir Cevheri (Iron Ore)** | Maden | 80 ₺ | Sivas Cumhuriyeti | Çelik alaşımının ana hammaddesidir. Sanayi parçaları ve askeri mühimmat üretiminde kullanılır. |
| **Çelik (Steel)** | İşlenmiş Metal | 200 ₺ | Karabük Cumhuriyeti (Eritme) | Fabrika yükseltmeleri, köprü/altyapı inşası, ağır sanayi ve savunma sanayii gövde zırhlarında kullanılır. |
| **Bakır (Copper)** | Metal | 120 ₺ | Kastamonu Cumhuriyeti | Yüksek elektrik iletkenliği sebebiyle güç trafoları, elektrik şebekeleri ve mikroçip devre kartlarında kullanılır. |
| **Alüminyum (Aluminum)** | Hafif Metal | 150 ₺ | Konya Cumhuriyeti | Hafif ve korozyona dayanıklı yapısıyla otomobil gövdeleri, İHA/SİHA kanat ve gövde kaplamalarında kullanılır. |
| **Lityum (Lithium)** | Nadir Toprak | 350 ₺ | Eskişehir Cumhuriyeti | Pil ve enerji depolama hücresi üretimi. Elektrikli araç bataryaları ve askeri batarya kitleri için kritiktir. |
| **Bor (Boron)** | Stratejik Element | 500 ₺ | Balıkesir Cumhuriyeti | Türkiye'nin en stratejik kaynağıdır. Isı korumalı tank zırhları, nükleer reaktör çubukları ve roket yakıtlarında kullanılır. |
| **Petrol (Petroleum)** | Enerji & Kimya | 280 ₺ | Batman Cumhuriyeti | Rafinerilerde akaryakıt, sentetik plastik hammaddesi, asfalt ve kimyasal çözücüler üretmek amacıyla rafine edilir. |
| **Silikon (Silicon)** | Yarı İletken | 400 ₺ | Ankara Cumhuriyeti | Mikroişlemciler, robotik otomasyon kartları, telemetri birimleri ve gelişmiş radar donanımlarının ham maddesidir. |

---

## 🗄️ 2. Veritabanı Şeması (Database Schema - TypeORM)

Veritabanı tarafında, hammaddeleri ve kullanıcıların envanterlerini takip etmek amacıyla aşağıdaki iki ana tablo oluşturulacaktır:

### A. Hammadde Tanımları Tablosu (`Commodity` Entity)
Her hammaddenin temel niteliklerini (ad, sembol, kategori, baz fiyat) saklar.

```typescript
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CommodityCategory {
  ENERGY = 'ENERGY',
  RAW_MINERAL = 'RAW_MINERAL',
  REFINED_METAL = 'REFINED_METAL',
  SEMICONDUCTOR = 'SEMICONDUCTOR',
  STRATEGIC = 'STRATEGIC'
}

@Entity('commodities')
export class Commodity {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  id!: string; // e.g. "coal", "boron", "steel"

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string; // e.g. "Kömür", "Bor", "Çelik"

  @Column({ type: 'enum', enum: CommodityCategory })
  category!: CommodityCategory;

  @Column({ type: 'varchar', length: 10 })
  symbol!: string; // e.g. "COAL", "BOR", "STEEL"

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  basePrice!: number; // Baz borsa fiyatı

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

### B. Kullanıcı Envanter Tablosu (`UserMaterial` Entity)
Vatandaşların sahip olduğu maden/hammadde miktarlarını kaydeder.

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/User';
import { Commodity } from './Commodity';

@Entity('user_materials')
@Unique(['userId', 'commodityId'])
export class UserMaterial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Commodity)
  @JoinColumn({ name: 'commodityId' })
  commodity!: Commodity;

  @Column()
  commodityId!: string;

  @Column({ type: 'numeric', precision: 15, scale: 4, default: 0 })
  amount!: number; // Kullanıcının sahip olduğu miktar
}
```

---

## 📈 3. Profesyonel Al-Sat Borsa Mekanizması (Marketplace / Borsa)

Piyasa alım satım işlemleri bu hammaddeler üzerinden yürütülür:
- **Alış (Buy)**: Vatandaşlar cüzdan nakitleri ile hammadde borsasından hammadde satın alabilir. Alım yapıldığında nakit düşer, ilgili envanter (`UserMaterial`) artar.
- **Satış (Sell)**: Vatandaşlar sahip oldukları madenleri borsaya satarak nakit para kazanabilir. Satış yapıldığında envanter düşer, cüzdan nakdi artar.
- **Anlık Fiyat Dalgalanmaları**: Arz-talep durumuna göre fiyatlar baz fiyat etrafında dalgalanır.
