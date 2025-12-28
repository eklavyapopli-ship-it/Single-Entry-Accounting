"use client";
import { Decimal128 } from "mongodb";
import { useEffect, useState } from "react";

/* ---------- TYPES ---------- */
interface InventoryItem {
  _id: string;
  inventory_id: string;
  item_name: string;
  value: number;
  currency: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    inventory_id: "",
    item_name: "",
    value: 0,
    currency: "INR",
  });

  /* ---------- FETCH INVENTORY ---------- */
  const fetchInventory = async () => {
    setLoading(true);
    const res = await fetch("/api/inventory/addgetInventory");
    const json = await res.json();
    setInventory(json.collections || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* ---------- TOTAL INVENTORY VALUE ---------- */
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);

  /* ---------- ADD INVENTORY ---------- */
  const addInventory = async () => {
    await fetch("/api/inventory/addgetInventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setShowAdd(false);
    setForm({
      inventory_id: "",
      item_name: "",
      value: 0,
      currency: "INR",
    });

    fetchInventory();
  };

  /* ---------- DELETE INVENTORY ---------- */
  const deleteInventory = async () => {
    if (!deleteId) return;

    await fetch("/api/inventory/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: deleteId }),
    });

    setDeleteId(null);
    fetchInventory();
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold"> Inventory</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded hover:bg-blue-500/30"
        >
          + Add Item
        </button>
      </div>

      {/* TOTAL VALUE */}
      <div className="mb-6">
        <p className="text-slate-400 text-sm">Total Inventory Value:</p>
        <p className="text-xl font-bold text-black">
          ₹ {totalValue.toLocaleString()}
        </p>
      </div>

      {/* TABLE */}
      {loading && <p>Loading inventory...</p>}
      {!loading && inventory.length === 0 && (
        <p className="text-slate-400">No inventory items found</p>
      )}
      {!loading && inventory.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <Th>ID</Th>
                <Th>Item Name</Th>
                <Th>Value</Th>
                <Th>Currency</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-slate-800"
                >
                  <Td>{item.inventory_id}</Td>
                  <Td>{item.item_name}</Td>
                  <Td>₹ {Number(item.value).toLocaleString()}</Td>
                  <Td>{item.currency}</Td>
                  <Td>
                    <button
                      onClick={() => setDeleteId(item._id)}
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
        <Modal title="Add Inventory Item" onClose={() => setShowAdd(false)}>
          <DarkInput
            label="Inventory ID"
            value={form.inventory_id}
            onChange={(v: string) => setForm({ ...form, inventory_id: v })}
          />
          <DarkInput
            label="Item Name"
            value={form.item_name}
            onChange={(v: string) => setForm({ ...form, item_name: v })}
          />
          <DarkInput
            label="Value"
            type="number"
            value={form.value}
            onChange={(v: string) => setForm({ ...form, value: +v })}
          />
          <DarkSelect
            value={form.currency}
            onChange={(v: string) => setForm({ ...form, currency: v })}
          />
          <button
            onClick={addInventory}
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
            Are you sure you want to delete this inventory item?
          </p>
          <div className="flex gap-3">
            <button
              onClick={deleteInventory}
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

function DarkSelect({ value, onChange }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white mb-3"
    >
      <option value="INR">INR</option>
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
    </select>
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
