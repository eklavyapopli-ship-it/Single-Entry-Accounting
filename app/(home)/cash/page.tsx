"use client";

import { useEffect, useState } from "react";

/* ---------- TYPES ---------- */
type CashType = "comes in" | "payment";

interface CashEntry {
  _id: string;
  date: string;
  type: CashType;
  amount: number;
  remarks?: string;
}

export default function CashPage() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: "",
    type: "comes in" as CashType,
    amount: 0,
    remarks: "",
  });

  /* ---------- FETCH ---------- */
  const fetchCash = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cash");
      const json = await res.json();
      setEntries(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCash();
  }, []);

  /* ---------- ADD / UPDATE ---------- */
  const saveCash = async () => {
    if (editId) {
      await fetch("/api/cash", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editId, ...form }),
      });
    } else {
      await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowAdd(false);
    setEditId(null);
    setForm({ date: "", type: "comes in", amount: 0, remarks: "" });
    fetchCash();
  };

  /* ---------- DELETE ---------- */
  const deleteCash = async (_id: string) => {
    await fetch("/api/cash", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    fetchCash();
  };

  /* ---------- TOTALS ---------- */
  const totalCredit = entries
    .filter((e) => e.type === "comes in")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalDebit = entries
    .filter((e) => e.type === "payment")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold">💵 Cash Ledger</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded hover:bg-blue-500/30"
        >
          + Add Entry
        </button>
      </div>

      {/* TOTALS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard title="Total Credit" value={`₹ ${totalCredit.toLocaleString()}`} color="text-green-400" />
        <SummaryCard title="Total Debit" value={`₹ ${totalDebit.toLocaleString()}`} color="text-red-400" />
        <SummaryCard title="Net Balance" value={`₹ ${(totalCredit - totalDebit).toLocaleString()}`} color="text-yellow-400" />
      </div>

      {/* TABLE */}
      {loading && <p>Loading cash data...</p>}
      {!loading && entries.length === 0 && <p className="text-slate-400">No cash entries found</p>}
      {!loading && entries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Remarks</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id} className="border-t border-slate-800 hover:text-white hover:bg-slate-900">
                  <Td>{e.date}</Td>
                  <Td>{e.type}</Td>
                  <Td>₹ {e.amount.toLocaleString()}</Td>
                  <Td>{e.remarks || "-"}</Td>
                  <Td className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditId(e._id);
                        setForm({ date: e.date, type: e.type, amount: e.amount, remarks: e.remarks || "" });
                        setShowAdd(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-xs m-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCash(e._id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showAdd && (
        <Modal title={editId ? "Edit Cash Entry" : "Add Cash Entry"} onClose={() => { setShowAdd(false); setEditId(null); }}>
          <DarkInput label="Date" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} />
          <DarkSelect label="Type" value={form.type} onChange={(v: string) => setForm({ ...form, type: v as CashType })} options={["comes in", "payment"]} />
          <DarkInput label="Amount" type="number" value={form.amount} onChange={(v: string) => setForm({ ...form, amount: +v })} />
          <DarkInput label="Remarks" value={form.remarks} onChange={(v: string) => setForm({ ...form, remarks: v })} />

          <button onClick={saveCash} className="w-full mt-4 bg-blue-500/20 text-blue-400 py-2 rounded hover:bg-blue-500/30">
            Save
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ---------- UI HELPERS ---------- */
function SummaryCard({ title, value, color }: any) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Th({ children }: any) {
  return <th className="px-4 py-3 text-left font-semibold text-slate-300">{children}</th>;
}

function Td({ children }: any) {
  return <td className="px-4 py-3">{children}</td>;
}

function DarkInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="mb-3">
      <label className="text-slate-400 text-sm">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white" />
    </div>
  );
}

function DarkSelect({ label, value, onChange, options }: any) {
  return (
    <div className="mb-3">
      <label className="text-slate-400 text-sm">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white">
        <option value="">Select {label}</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-slate-400 hover:text-white">✕</button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
