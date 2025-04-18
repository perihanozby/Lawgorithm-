import { useState } from "react";

export default function Form() {
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: "",
    today: new Date().toISOString().split("T")[0],
  });

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
        alert(`
        📊 TCMB Verileri ile Hesaplama:
        💵 Dolar: ${data.dolar} TL
        💶 Euro: ${data.euro} TL
        📈 TÜFE: ${data.tufe} TL
        🧮 Ortalama: ${data.average} TL
        `);
      }
    } catch (error) {
      alert("Hesaplama sırasında beklenmeyen bir hata oluştu.");
      console.error(error);
    }
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
    </form>
  );
}
