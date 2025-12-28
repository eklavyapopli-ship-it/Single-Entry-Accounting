"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ---------- TYPES ---------- */
type TransactionType = "on_credit" | "purchase_return" | "credit_payment";

interface CustomerEntry {
  _id: string;
  item_name: string;
  date: string;
  type: TransactionType;
  quantity: number;
  rate: number;
  amount: number;
  remarks?: string;
  payment_amount?: number;
  discount_allowed?: number;
  payment_mode?: string;
}

interface InventoryItem {
  _id: string;
  item_name: string;
  value: number;
  currency: string;
}

export default function CustomerPage() {
  const { slug } = useParams<{ slug: string }>();
  const customerName = decodeURIComponent(slug);

  const [entries, setEntries] = useState<CustomerEntry[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    item_name: "",
    date: "",
    type: "on_credit" as TransactionType,
    quantity: 1,
    rate: 0,
    remarks: "",
    payment_amount: 0,
    discount_allowed: 0,
    payment_mode: "cash",
  });

  /* ---------- FETCH ---------- */
  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/particularCustomer?path=${encodeURIComponent(customerName)}`
      );
      const json = await res.json();
      setEntries(json.data || []);
    } catch (err) {
      alert("Failed to fetch customer data");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const res = await fetch("/api/inventory/addgetInventory");
      const json = await res.json();
      setInventory(json.collections || []);
    } catch (err) {
      alert("Failed to fetch inventory");
    }
  };

  useEffect(() => {
    fetchCustomerData();
    fetchInventoryData();
  }, [customerName]);

  /* ---------- TOTALS ---------- */
  const totalCredit = entries
    .filter((e) => e.type === "on_credit")
    .reduce((sum, e) => sum + e.amount, 0);
  const totaldisc = entries.reduce((sum,e)=>sum+(e.discount_allowed??0),0)

  const totalReturn = entries
    .filter((e) => e.type === "purchase_return")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPayment = entries
    .filter((e) => e.type === "credit_payment")
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalCredit - totalReturn - totaldisc  - totalPayment;

  /* ---------- ADD ---------- */
  const addTransaction = async () => {
    const transactionAmount =
      form.type === "credit_payment"
        ? form.payment_amount
        : form.quantity * form.rate;

    // Validation for purchase return
    if (form.type === "purchase_return") {
      const soldEntry = entries.find(
        (e) => e.item_name === form.item_name && e.type === "on_credit"
      );
      if (!soldEntry) {
        alert(
          "This item has not been sold on Credit. Cannot process purchase return."
        );
        return;
      }
      if (form.quantity > soldEntry.quantity) {
        alert(
          `Return quantity cannot exceed sold quantity (${soldEntry.quantity}).`
        );
        return;
      }
    }

    // Validation for credit payment
    if (form.type === "credit_payment" && transactionAmount > netBalance) {
      alert("Payment cannot exceed outstanding balance");
      return;
    }

    // 1️⃣ Add transaction to customer ledger
    await fetch(
      `/api/particularCustomer?path=${encodeURIComponent(customerName)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: transactionAmount,
        }),
      }
    );

    // 2️⃣ Update inventory for sales and purchase return
    if (form.type !== "credit_payment") {
      const isReturn = form.type === "purchase_return" ? -1 : 1;
      await fetch("/api/inventory/updateInventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: form.item_name,
          value_sold: transactionAmount * isReturn,
          quantity_sold: form.quantity * isReturn,
        }),
      });
    }

    // 3️⃣ Update cash account if payment mode is cash
    if (form.type === "credit_payment" && form.payment_mode === "cash") {
      await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          type:"comes in",
          amount: transactionAmount - form.discount_allowed,
          remarks: `Credit Payment${
            form.discount_allowed ? ` (Discount: ₹${form.discount_allowed})` : ""
          }`,
        }),
      });
    }

    setShowAdd(false);
    setForm({
      item_name: "",
      date: "",
      type: "on_credit",
      quantity: 1,
      rate: 0,
      remarks: "",
      payment_amount: 0,
      discount_allowed: 0,
      payment_mode: "cash",
    });

    fetchCustomerData();
    fetchInventoryData();
  };

  /* ---------- DELETE ---------- */
  const deleteTransaction = async () => {
    if (!deleteId) return;

    const transaction = entries.find((e) => e._id === deleteId);
    if (!transaction) return;

    // 1️⃣ Delete transaction
    await fetch(
      `/api/particularCustomer/delete?path=${encodeURIComponent(customerName)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: deleteId }),
      }
    );

    // 2️⃣ Restore inventory if needed
    if (transaction.type !== "credit_payment") {
      const isReturn = transaction.type === "purchase_return" ? -1 : 1;
      await fetch("/api/inventory/updateInventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: transaction.item_name,
          value_sold: -transaction.amount * isReturn,
          quantity_sold: -transaction.quantity * isReturn,
        }),
      });
    }

    setDeleteId(null);
    fetchCustomerData();
    fetchInventoryData();
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">👤 {customerName}</h1>
          <p className="text-slate-400 text-sm">Credit Customer Ledger</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded hover:bg-blue-500/30"
        >
          + Add Transaction
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Credit"
          value={`₹ ${totalCredit.toLocaleString()}`}
          color="text-red-400"
        />
        <SummaryCard
          title="Total Purchase Return"
          value={`₹ ${totalReturn.toLocaleString()}`}
          color="text-blue-400"
        />
        <SummaryCard
          title="Total Payments"
          value={`₹ ${totalPayment.toLocaleString()}`}
          color="text-green-400"
        />
        <SummaryCard
          title="Net Balance"
          value={`₹ ${netBalance.toLocaleString()}`}
          color="text-yellow-400"
        />
        <SummaryCard
          title="Discount Allowed"
          value={`₹ ${totaldisc}`}
          color="text-yellow-400"
        />
      </div>

      {/* LEDGER TABLE */}
      {loading && <p>Loading ledger...</p>}
      {!loading && entries.length === 0 && (
        <p className="text-slate-400">No transactions recorded</p>
      )}
      {!loading && entries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <Th>Date</Th>
                <Th>Item</Th>
                <Th>Qty</Th>
                <Th>Rate</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
                <Th>Remarks</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e._id}
                  className="border-t border-slate-800 hover:bg-slate-900"
                >
                  <Td>{e.date}</Td>
                  <Td>{e.item_name}</Td>
                  <Td>{e.quantity}</Td>
                  <Td>₹ {e.rate}</Td>
                  <Td className="font-medium">₹ {e.amount.toLocaleString()}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        e.type === "on_credit"
                          ? "bg-red-500/20 text-red-400"
                          : e.type === "purchase_return"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {e.type === "on_credit"
                        ? "Credit"
                        : e.type === "purchase_return"
                        ? "Purchase Return"
                        : "Credit Payment"}
                    </span>
                  </Td>
                  <Td>{e.remarks || "-"}</Td>
                  <Td>
                    <button
                      onClick={() => setDeleteId(e._id)}
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

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Add Transaction" onClose={() => setShowAdd(false)}>
          <DarkSelect
            label="Item Name"
            value={form.item_name}
            onChange={(v: string) => setForm({ ...form, item_name: v })}
            options={inventory.map((i) => i.item_name)}
          />
          <DarkInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(v: string) => setForm({ ...form, date: v })}
          />
          <DarkSelect
            label="Transaction Type"
            value={form.type}
            onChange={(v: string) =>
              setForm({ ...form, type: v as TransactionType })
            }
            options={["on_credit", "purchase_return", "credit_payment"]}
          />

          {/* Credit Payment Fields */}
          {form.type === "credit_payment" && (
            <>
              <DarkInput
                label="Payment Amount"
                type="number"
                value={form.payment_amount}
                onChange={(v: string) =>
                  setForm({ ...form, payment_amount: +v })
                }
              />
              <DarkInput
                label="Discount Allowed"
                type="number"
                value={form.discount_allowed}
                onChange={(v: string) =>
                  setForm({ ...form, discount_allowed: +v })
                }
              />
              <DarkSelect
                label="Payment Mode"
                value={form.payment_mode}
                onChange={(v: string) =>
                  setForm({ ...form, payment_mode: v })
                }
                options={["cash", "bank", "other"]}
              />
            </>
          )}

          {/* Sales / Purchase Return Fields */}
          {form.type !== "credit_payment" && (
            <>
              <DarkInput
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(v: string) => setForm({ ...form, quantity: +v })}
              />
              <DarkInput
                label="Rate"
                type="number"
                value={form.rate}
                onChange={(v: string) => setForm({ ...form, rate: +v })}
              />
            </>
          )}

          <DarkInput
            label="Remarks"
            value={form.remarks}
            onChange={(v: string) => setForm({ ...form, remarks: v })}
          />

          <button
            onClick={addTransaction}
            className="w-full mt-4 bg-blue-500/20 text-blue-400 py-2 rounded hover:bg-blue-500/30"
          >
            Save
          </button>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p className="text-slate-300 mb-4">
            Are you sure you want to delete this transaction?
          </p>
          <div className="flex gap-3">
            <button
              onClick={deleteTransaction}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="bg-slate-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
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
  return (
    <th className="px-4 py-3 text-left font-semibold text-slate-300">
      {children}
    </th>
  );
}

function Td({ children }: any) {
  return <td className="px-4 py-3">{children}</td>;
}

function DarkInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="mb-3">
      <label className="text-slate-400 text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
      />
    </div>
  );
}

function DarkSelect({ label, value, onChange, options }: any) {
  return (
    <div className="mb-3">
      <label className="text-slate-400 text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white"
      >
        <option value="">Select {label}</option>
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
