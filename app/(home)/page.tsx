"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  name: string;
};

export default function HomePage() {
  const router = useRouter();

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showViewCustomers, setShowViewCustomers] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);

  /* ---------------- ADD CUSTOMER ---------------- */
  const addCustomer = async () => {
    if (!customerName.trim()) return alert("Enter customer name");

    setLoading(true);
    try {
      await fetch("/api/createCustomers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerName),
      });

      setCustomerName("");
      setShowAddCustomer(false);
    } catch (err) {
      alert("Error creating customer");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH CUSTOMERS ---------------- */
  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/allCustomers");
      const json = await res.json();
      setCustomers(json.data || []);
    } catch (err) {
      alert("Failed to load customers");
    }
  };

  useEffect(() => {
    if (showViewCustomers) fetchCustomers();
  }, [showViewCustomers]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-10">📘 Single Entry Accounting</h1>

      {/* DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="➕ Add New Customer" onClick={() => setShowAddCustomer(true)} />
        <DashboardCard title="👥 View Customers" onClick={() => setShowViewCustomers(true)} />
        <DashboardCard title="📦 Inventory Account" />
        <DashboardCard title="💰 Cash Account" />
        <DashboardCard title="🧾 Miscellaneous Expenses" />
      </div>

      {/* ADD CUSTOMER TOASTER */}
      {showAddCustomer && (
        <Modal onClose={() => setShowAddCustomer(false)} title="Add New Customer">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name"
            className="w-full p-3 rounded bg-slate-800 outline-none"
          />
          <button
            onClick={addCustomer}
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 p-3 rounded"
          >
            {loading ? "Creating..." : "Create Customer"}
          </button>
        </Modal>
      )}

      {/* VIEW CUSTOMERS TOASTER */}
      {showViewCustomers && (
        <Modal onClose={() => setShowViewCustomers(false)} title="Customers">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customers.length === 0 && <p className="text-slate-400">No customers found</p>}

            {customers.map((c, i) => (
              <div
                key={i}
                onClick={() =>
                  router.push(`/customer/${encodeURIComponent(c.name)}`)
                }
                className="p-3 bg-slate-800 rounded cursor-pointer hover:bg-slate-700"
              >
                {c.name}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function DashboardCard({
  title,
  onClick,
}: {
  title: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-slate-800 hover:bg-slate-700 p-6 rounded-xl shadow-lg transition"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
