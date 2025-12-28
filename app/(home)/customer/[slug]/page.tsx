"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ---------- TYPES ---------- */
type TransactionType = "on_cash" | "on_credit";

interface CustomerEntry {
  item_name: string;
  date: string;
  type: TransactionType;
  quantity: number;
  rate: number;
  amount: number;
  remarks?: string;
}

export default function CustomerPage() {
  const { slug } = useParams<{ slug: string }>();
  const customerName = decodeURIComponent(slug);

  const [entries, setEntries] = useState<CustomerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerName) return;

    const fetchCustomerData = async () => {
      try {
        const res = await fetch(
          `/api/particularCustomer?path=${encodeURIComponent(customerName)}`
        );
        const json = await res.json();
        setEntries(json.data || []);
      } catch (error) {
        alert("Failed to fetch customer ledger");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerName]);

  const totalCredit = entries
    .filter((e) => e.type === "on_credit")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCash = entries
    .filter((e) => e.type === "on_cash")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">👤 {customerName}</h1>
        <p className="text-slate-400 text-sm">
          Single Entry Customer Ledger
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          title="Total Credit"
          value={`₹ ${totalCredit.toLocaleString()}`}
          color="text-red-400"
        />
        <SummaryCard
          title="Total Cash"
          value={`₹ ${totalCash.toLocaleString()}`}
          color="text-green-400"
        />
        <SummaryCard
          title="Net Balance"
          value={`₹ ${(totalCredit - totalCash).toLocaleString()}`}
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
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-800 hover:bg-slate-900"
                >
                  <Td>{e.date}</Td>
                  <Td>{e.item_name}</Td>
                  <Td>{e.quantity}</Td>
                  <Td>₹ {e.rate}</Td>
                  <Td className="font-medium">
                    ₹ {e.amount.toLocaleString()}
                  </Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        e.type === "on_credit"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {e.type === "on_credit" ? "Credit" : "Cash"}
                    </span>
                  </Td>
                  <Td>{e.remarks || "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-semibold text-slate-300">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  );
}
