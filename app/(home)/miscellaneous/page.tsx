"use client";

import { useEffect, useState } from "react";

/* ---------- TYPES ---------- */
type TransactionType = "payment" | "comes in";

interface ExpenseEntry {
  _id: string;
  date: string;
  type: TransactionType;
  amount: number;
  remarks?: string;
}

export default function MiscellaneousPage() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: "",
    type: "payment" as TransactionType,
    amount: 0,
    remarks: "",
  });

  const fetchEntries = async () => {
    setLoading(true);
    const res = await fetch("/api/miscExpenses");
    const json = await res.json();
    setEntries(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addEntry = async () => {
    await fetch("/api/miscExpenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    setForm({ date: "", type: "payment", amount: 0, remarks: "" });
    fetchEntries();
  };

  const deleteEntry = async () => {
    if (!deleteId) return;
    await fetch("/api/miscExpenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: deleteId }),
    });
    setDeleteId(null);
    fetchEntries();
  };

  const totalDebit = entries
    .filter((e) => e.type === "payment")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredit = entries
    .filter((e) => e.type === "comes in")
    .reduce((sum, e) => sum + e.amount, 0);

  const netExpense = totalDebit - totalCredit;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold">💸 Miscellaneous Expenses</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-300"
        >
          + Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard title="Total Debit" value={`₹ ${totalDebit}`} color="text-red-600" />
        <SummaryCard title="Total Credit" value={`₹ ${totalCredit}`} color="text-green-600" />
        <SummaryCard title="Net Expense" value={`₹ ${netExpense}`} color="text-yellow-600" />
      </div>

      {/* Table */}
      {loading && <p>Loading...</p>}
      {!loading && entries.length === 0 && <p>No expense entries</p>}
      {!loading && entries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-300">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-200">
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
                <tr key={e._id} className="border-t border-slate-300 hover:bg-slate-100">
                  <Td>{e.date}</Td>
                  <Td>{e.type}</Td>
                  <Td>₹ {e.amount.toLocaleString()}</Td>
                  <Td>{e.remarks || "-"}</Td>
                  <Td>
                    <button
                      onClick={() => setDeleteId(e._id)}
                      className="text-red-600 hover:text-red-400 text-xs"
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

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Expense Entry" onClose={() => setShowAdd(false)}>
          <DarkInput label="Date" type="date" value={form.date} onChange={(v: any) => setForm({ ...form, date: v })} />
          <DarkSelect value={form.type} onChange={(v:any) => setForm({ ...form, type: v as TransactionType })} />
          <DarkInput label="Amount" type="number" value={form.amount} onChange={(v:any) => setForm({ ...form, amount: +v })} />
          <DarkInput label="Remarks" value={form.remarks} onChange={(v:any) => setForm({ ...form, remarks: v })} />
          <button onClick={addEntry} className="w-full mt-4 bg-blue-200 text-blue-800 py-2 rounded hover:bg-blue-300">Save</button>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p>Are you sure you want to delete this entry?</p>
          <div className="flex gap-3 mt-3">
            <button onClick={deleteEntry} className="bg-red-200 text-red-600 px-4 py-2 rounded">Delete</button>
            <button onClick={() => setDeleteId(null)} className="bg-slate-200 px-4 py-2 rounded">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- UI HELPERS ---------- */
function SummaryCard({ title, value, color }: any) {
  return (
    <div className="bg-slate-100 p-4 rounded-xl">
      <p className="text-slate-600 text-sm">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Th({ children }: any) {
  return <th className="px-4 py-3 text-left font-semibold text-slate-600">{children}</th>;
}

function Td({ children }: any) {
  return <td className="px-4 py-3">{children}</td>;
}

function DarkInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="mb-3">
      <label className="text-slate-600 text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 border border-slate-300 p-2 rounded text-slate-900"
      />
    </div>
  );
}

function DarkSelect({ value, onChange }: any) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-100 border border-slate-300 p-2 rounded text-slate-900 mb-3">
      <option value="debit">Debit (Expense)</option>
      <option value="credit">Credit (Refund)</option>
    </select>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-slate-600 hover:text-slate-900">✕</button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
