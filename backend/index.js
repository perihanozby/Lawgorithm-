const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "6ZLNsAAzDW"; // 👈 Kendi API Key'in
const SERIES = "TP.DK.USD.S.YTL-TP.DK.EUR.S.YTL-TP.FE.OKTG01"; // TCMB serileri "-" ile ayrılmalı
const FORMULAS = "0-0-0"; // Düzey verisi
const AGGREGATIONS = "avg-avg-avg"; // Ortalama değer
const FREQUENCY = "5"; // Aylık veri

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`; // EVDS formatı: GG-AA-YYYY
}

app.post("/calculate", async (req, res) => {
  const { amount, paymentDate, today } = req.body;
  const start = formatDate(paymentDate);
  const end = formatDate(today);

  const url = `https://evds2.tcmb.gov.tr/service/evds/series=${SERIES}&startDate=${start}&endDate=${end}&type=json&formulas=${FORMULAS}&aggregationTypes=${AGGREGATIONS}&frequency=${FREQUENCY}`;

  try {
    const response = await axios.get(url, {
      headers: {
        key: API_KEY, // ✅ Küçük harfli "key" doğru başlık
      },
    });
    const items = response.data.items;
    if (!items || items.length < 2) {
      return res.status(404).json({ error: "Yeterli veri bulunamadı." });
    }

    const first = items[0];
    const last = items[items.length - 1];

    const usdStart = parseFloat(first["TP_DK_USD_S_YTL"]); //"_"

    const usdEnd = parseFloat(last["TP_DK_USD_S_YTL"]);

    const eurStart = parseFloat(first["TP_DK_EUR_S_YTL"]);
    const eurEnd = parseFloat(last["TP_DK_EUR_S_YTL"]);

    const tufeStart = parseFloat(first["TP_FE_OKTG01"]);
    const tufeEnd = parseFloat(last["TP_FE_OKTG01"]);

    const usdResult = (usdEnd / usdStart) * amount;
    const eurResult = (eurEnd / eurStart) * amount;
    const tufeResult = (tufeEnd / tufeStart) * amount;

    const average = (usdResult + eurResult + tufeResult) / 3;

    res.json({
      method: "TCMB EVDS Hesaplama",
      dolar: usdResult.toFixed(2),
      euro: eurResult.toFixed(2),
      tufe: tufeResult.toFixed(2),
      average: average.toFixed(2),
    });
  } catch (error) {
    console.error("❌ EVDS API Hatası:", error.response?.data || error.message);
    res.status(500).json({ error: "Veri çekilemedi." });
  }
});

app.listen(5000, () => {
  console.log("✅ API çalışıyor: http://localhost:5000");
});
