const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "6ZLNsAAzDW"; 
const SERIES = "TP.DK.USD.S.YTL-TP.DK.EUR.S.YTL-TP.FE.OKTG01-TP.MK.KUL.YTL";
const FORMULAS = "0-0-0-0";
const AGGREGATIONS = "avg-avg-avg-avg";
const FREQUENCY = "5"; // Aylık veri

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

// Dönemsel artışı hesaplayan hukuka uygun fonksiyon
function calculateCumulativeByMonth(items, key, amount) {
  let updatedAmount = amount;
  for (let i = 1; i < items.length; i++) {
    const prevValue = parseFloat(items[i - 1][key]);
    const currentValue = parseFloat(items[i][key]);
    if (prevValue > 0 && currentValue > 0) {
      const monthlyIncrease = currentValue / prevValue;
      updatedAmount *= monthlyIncrease;
    }
  }
  return updatedAmount;
}

app.post("/calculate", async (req, res) => {
  const { amount, paymentDate, today } = req.body;
  const start = formatDate(paymentDate);
  const end = formatDate(today);

  const url = `https://evds2.tcmb.gov.tr/service/evds/series=${SERIES}&startDate=${start}&endDate=${end}&type=json&formulas=${FORMULAS}&aggregationTypes=${AGGREGATIONS}&frequency=${FREQUENCY}`;

  try {
    const response = await axios.get(url, {
      headers: { key: API_KEY },
    });
    const items = response.data.items;
    if (!items || items.length < 2) return res.status(404).json({ error: "Yeterli veri bulunamadı." });

    // Detaylı kümülatif hesaplama ve veri saklama
    function calculateCumulativeByMonthDetailed(items, key, amount) {
      let updatedAmount = amount;
      const growthData = [];

      for (let i = 1; i < items.length; i++) {
        const prevValue = parseFloat(items[i - 1][key]);
        const currentValue = parseFloat(items[i][key]);
        if (prevValue > 0 && currentValue > 0) {
          const monthlyIncrease = currentValue / prevValue;
          updatedAmount *= monthlyIncrease;
          growthData.push({
            date: items[i]["Tarih"],
            rate: monthlyIncrease.toFixed(4),
            value: updatedAmount.toFixed(2),
          });
        }
      }
      return { result: updatedAmount, details: growthData };
    }

    const usd = calculateCumulativeByMonthDetailed(items, "TP_DK_USD_S_YTL", amount);
    const eur = calculateCumulativeByMonthDetailed(items, "TP_DK_EUR_S_YTL", amount);
    const tufe = calculateCumulativeByMonthDetailed(items, "TP_FE_OKTG01", amount);
    const gold = calculateCumulativeByMonthDetailed(items, "TP_MK_KUL_YTL", amount);

    const average = (usd.result + eur.result + tufe.result + gold.result) / 4;

    res.json({
      usd,
      eur,
      tufe,
      gold,
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
