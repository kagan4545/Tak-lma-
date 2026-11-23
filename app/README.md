# Raid Hesap: iPhone uygulaması

Bu klasör, `../index.html`'deki uygulamayı App Store'a gönderilebilir bir iPhone uygulamasına çevirir (Capacitor 8).

- İnternetsiz çalışır, yazı tipleri uygulamanın içinde.
- Uygulama her açıldığında **en fazla 1 reklam** gösterir (Google AdMob "App Open"). İlk açılışta ve tanıtım ekranı açıkken reklam yok, arka plandan dönünce de yok.
- Sadece iPhone, sadece dik ekran.

## Klasörler

| Yol | Ne |
|---|---|
| `../index.html` | Uygulamanın kendisi (claude.ai'deki sürümle aynı dosya) |
| `src/ads.js` | Açılış reklamı |
| `src/privacy.html` | Gizlilik politikası (App Store için gerekli) |
| `scripts/build-www.mjs` | `index.html`'den `www/` klasörünü üretir |
| `ios/` | Xcode projesi |
| `resources/` | İkon (1024×1024) ve açılış ekranı |
| `../codemagic.yaml` | Mac olmadan bulutta derleme |

`index.html`'i değiştirdikten sonra `npm run sync` çalıştır, değişiklik iPhone projesine kopyalanır.

## Yayından önce yapılacaklar (sırayla)

### 1. Apple Developer hesabı
- https://developer.apple.com/programs/ adresinden kaydol: **yılda 99 dolar**.
- Hesap sahibi **18 yaşından büyük** olmalı. Değilsen annen ya da baban kendi adına açmalı.

### 2. AdMob hesabı ve reklam kimlikleri
1. https://admob.google.com adresinden hesap aç, ödeme bilgilerini gir.
2. **Uygulama ekle**: iOS, "Raid Hesap".
3. Bu uygulamada **Reklam birimi ekle**: türü **"App open"** (Uygulama açılışı).
4. İki kimlik alacaksın:
   - Uygulama kimliği: `ca-app-pub-XXXXXXXXXXXXXXXX~NNNNNNNNNN` (içinde **~** var)
   - Reklam birimi kimliği: `ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN` (içinde **/** var)
5. Değiştir:
   - `ios/App/App/Info.plist` içinde `GADApplicationIdentifier` → **uygulama kimliği**
   - `src/ads.js` içinde `AD_UNIT_ID` → **reklam birimi kimliği**, ve `TESTING = false`
6. `npm run sync`

> Şu an Google'ın resmi **test** kimlikleri var. Test reklamları "Test Ad" yazar, para kazandırmaz ama hesabını riske atmaz. **Kendi reklamına asla tıklama**; AdMob bunu hile sayıp hesabı kapatır.

### 3. Gizlilik politikası
- `src/privacy.html` içindeki `[TARİH]`, `[E-POSTA ADRESİN]`, `[DATE]`, `[YOUR EMAIL]` yerlerini doldur.
- Herkesin açabileceği bir adrese koy (ör. GitHub Pages ya da herkese açık paylaşılan bir sayfa). Bu adresi App Store Connect'te "Privacy Policy URL" alanına yazacaksın.

### 4. Paket kimliği (Bundle ID)
- Şu an `com.raidhesap.app`. Apple'da başkası almışsa değiştir: `capacitor.config.json` (`appId`), `ios/App/App.xcodeproj/project.pbxproj` (`PRODUCT_BUNDLE_IDENTIFIER`) ve `../codemagic.yaml` (`bundle_identifier`).

### 5. App Store Connect'te uygulama kaydı
https://appstoreconnect.apple.com → **Uygulamalar → +**
- Ad: **Raid Hesap** (adında "Rust" kullanma; Facepunch'ın markası)
- Birincil dil, Bundle ID, SKU (herhangi bir kod, ör. `raidhesap1`)
- **App Privacy** bölümünde: "Veri topluyor musun?" → Evet (AdMob yüzünden). Seç: *Identifiers → Device ID*, *Usage Data → Product Interaction*, *Diagnostics*, *Location → Coarse Location*; amaç *Third-Party Advertising*; "izleme için kullanılıyor mu?" → Evet.
- Yaş derecelendirmesi: anketi doldur (şiddet içeren oyun teması geçmiyor; araç uygulaması).
- Ekran görüntüleri: 6,9" iPhone boyutu (1320×2868 ya da 1290×2796) en az 3 tane.

## Derleme

### Mac'in varsa
```
cd app
npm ci
npm run sync
npm run open        # Xcode açılır
```
Xcode'da: *Signing & Capabilities* → Team'ini seç → üst menü **Product → Archive** → **Distribute App → App Store Connect**.

### Mac'in yoksa: Codemagic (bulutta Mac)
1. https://codemagic.io adresinde GitHub hesabınla giriş yap, bu depoyu ekle.
2. App Store Connect'te **Users and Access → Integrations → App Store Connect API** bölümünden bir anahtar oluştur (rol: App Manager). `.p8` dosyasını indir.
3. Codemagic'te **Team settings → Integrations → Developer Portal** → anahtarı ekle, adını **RaidHesapASC** koy.
4. Codemagic'te **Code signing identities** → iOS sertifikası oluşturmasına izin ver.
5. `codemagic.yaml` workflow'unu (**Raid Hesap iOS → TestFlight**) başlat. Derleme bitince uygulama TestFlight'a gider.

Codemagic'in ücretsiz planı ayda belirli bir derleme süresi veriyor; bu uygulama için genelde yetiyor.

## Göndermeden önce test et
1. TestFlight uygulamasını iPhone'una kur, derlemeyi yükle.
2. Kontrol et:
   - İlk açılış: tanıtım çıkıyor, **reklam yok**.
   - Uygulamayı tamamen kapatıp (yukarı kaydırıp) tekrar aç: **1 reklam**.
   - Arka plana alıp geri dön: **reklam yok**.
   - Uçak modunda aç: uygulama çalışıyor, reklam yok.
3. Her şey tamamsa App Store Connect'ten **İncelemeye Gönder**. İnceleme genelde 1–3 gün sürer.

## Bilinen riskler
- **Marka:** "Rust" adını uygulama adında/ikonunda kullanma. Açıklamada "Rust oyuncuları için raid hesaplayıcı" gibi bir ifade genelde kabul edilir ama garantisi yok.
- **4.2 Minimum işlev:** Apple, sadece web sitesini sarmalayan uygulamaları reddedebilir. Bu uygulama internetsiz çalışan bir araç olduğu için şansı iyi; reddedilirse açıklamaya internetsiz çalıştığını ve neler hesapladığını ayrıntılı yaz.
- **Veriler:** Raid sayıları Rust sunucu dosyalarına (build 2633.288.1, 22 Eylül 2026) göre. Facepunch güncellemeleriyle değişebilir; `../index.html`'deki tabloları güncelleyip yeni sürüm göndermek gerekir.
