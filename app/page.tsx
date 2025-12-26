"use client";

import { useState } from "react";

export default function CreateCollectionPage() {
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const createCollection = async () => {
    if (!collectionName.trim()) {
      setMessage("Please enter a collection name");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/createCustomers", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: collectionName, // 👈 sent as text
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessage(" Collection created successfully!");
      setCollectionName("");
    } catch (err: any) {
      setMessage(` ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">
          Create MongoDB Collection
        </h1>

        <input
          type="text"
          placeholder="Enter collection name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
        />

        <button
          onClick={createCollection}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Collection"}
        </button>

        {message && (
          <p className="mt-3 text-sm text-center">{message}</p>
        )}
      </div>
    </div>
  );
}
