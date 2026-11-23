/* Raid Hesap: açılış reklamı (yalnızca iPhone uygulamasında çalışır)
 *
 * Kural: uygulama her açıldığında (soğuk başlangıç) en fazla 1 tane "App Open" reklamı.
 *  - Uygulamanın ilk açılışında reklam yok (kullanıcı önce tanıtımı görsün).
 *  - Tanıtım ekranı açıkken reklam yok.
 *  - Arka plandan geri dönünce reklam yok; sadece uygulama sıfırdan açılınca.
 *  - Reklam yüklenemezse hiçbir şey olmaz, uygulama normal açılır.
 *
 * YAYINDAN ÖNCE: AD_UNIT_ID'yi AdMob'daki kendi "App open" reklam biriminle değiştir
 * ve TESTING'i false yap. Info.plist'teki GADApplicationIdentifier'ı da değiştirmeyi unutma.
 */
(function () {
  const TESTING = true;
  // Google'ın resmi iOS test kimliği (App Open). Gerçek kimlik: ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN
  const AD_UNIT_ID = TESTING ? "ca-app-pub-3940256099942544/5575463023" : "BURAYA_GERCEK_APP_OPEN_KIMLIGI";
  const LOAD_TIMEOUT_MS = 4000; // reklam 4 sn içinde gelmezse bu açılışta gösterilmez

  const cap = window.Capacitor;
  const AdMob = cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.AdMob;
  if (!AdMob) return; // web / claude.ai sürümü: reklam yok

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("raidhesap4")) || {}; } catch (e) {}
  const firstLaunch = !saved.tourDone;
  const tourOpen = () => { const t = document.getElementById("tour"); return t && !t.hidden; };

  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  async function run() {
    try {
      await AdMob.initialize({});
      // iOS: kişiselleştirilmiş reklam için izin sor (Apple'ın App Tracking Transparency penceresi)
      try {
        const t = await AdMob.trackingAuthorizationStatus();
        if (t && t.status === "notDetermined") await AdMob.requestTrackingAuthorization();
      } catch (e) {}
      // AB/İngiltere kullanıcıları için Google'ın onay formu (gerekiyorsa)
      try {
        const info = await AdMob.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === "REQUIRED") await AdMob.showConsentForm();
      } catch (e) {}

      if (firstLaunch) return; // ilk açılışta reklam yok
      await withTimeout(AdMob.loadAppOpen({ adId: AD_UNIT_ID }), LOAD_TIMEOUT_MS);
      if (tourOpen()) return;
      await AdMob.showAppOpen();
    } catch (e) {
      // reklam gelmezse sessizce devam et
    }
  }
  if (document.readyState === "complete") run(); else window.addEventListener("load", run);
})();
