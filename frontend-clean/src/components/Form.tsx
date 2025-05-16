import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Form() {
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: "",
    today: new Date().toISOString().split("T")[0],
  });

  const [results, setResults] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.error) {
        alert("Hata: " + data.error);
      } else {
        setResults(data);
      }
    } catch (error) {
      alert("Hesaplama sırasında beklenmeyen bir hata oluştu.");
      console.error(error);
    }
  };

  const mergeChartData = () => {
    if (!results) return [];
    return results.usd.details.map((usdData: any, index: number) => ({
      date: usdData.date,
      USD: parseFloat(usdData.value),
      EURO: parseFloat(results.eur.details[index].value),
      TÜFE: parseFloat(results.tufe.details[index].value),
      Altın: parseFloat(results.gold.details[index].value),
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">💰 Denklik Hesaplama</h2>

      <div>
        <label className="block mb-1 text-sm font-medium">Ödeme Tutarı (TL)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Ödeme Tarihi</label>
        <input
          type="date"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Bugünkü Tarih</label>
        <input
          type="date"
          name="today"
          value={formData.today}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Hesapla
      </button>

      {results && (
        <>
          <div className="mt-6">
            <h3 className="font-bold mb-2 text-center">📊 Dönemsel Detaylı Tablo</h3>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Parametre</th>
                  <th className="border p-2">Son Değer (TL)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border p-2">USD</td><td className="border p-2">{results.usd.result.toFixed(2)}</td></tr>
                <tr><td className="border p-2">EURO</td><td className="border p-2">{results.eur.result.toFixed(2)}</td></tr>
                <tr><td className="border p-2">TÜFE</td><td className="border p-2">{results.tufe.result.toFixed(2)}</td></tr>
                <tr><td className="border p-2">Altın</td><td className="border p-2">{results.gold.result.toFixed(2)}</td></tr>
                <tr className="font-bold bg-gray-50">
                  <td className="border p-2">Ortalama</td><td className="border p-2">{results.average}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2 text-center">📈 Dönemsel Artış Grafiği</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mergeChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="USD" stroke="#8884d8" />
                <Line type="monotone" dataKey="EURO" stroke="#82ca9d" />
                <Line type="monotone" dataKey="TÜFE" stroke="#ffc658" />
                <Line type="monotone" dataKey="Altın" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </form>
  );
}
