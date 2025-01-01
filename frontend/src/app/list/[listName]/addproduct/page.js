"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    list_name: "",
    product_name: "",
    product_barcode: "",
    expiry_date: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
    const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
    const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
    const apiPath = "/api/create_product";
    const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;

    console.log(formData);

    try {
      const access_token = localStorage.getItem("access_token");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      const result = await response.json();
      console.log("Data submitted successfully:", result);

      // 提交成功後跳轉回清單頁面
      router.push(`/list/${encodeURIComponent(formData.list_name)}`);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="w-full max-w-md p-6 bg-gray-800 bg-opacity-75 rounded-lg shadow-lg backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          新增品項到清單
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="list_name"
            placeholder="輸入清單名稱"
            value={formData.list_name}
            onChange={handleChange}
            className="px-4 py-2 bg-gray-700 bg-opacity-80 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="product_name"
            placeholder="輸入品項名稱"
            value={formData.product_name}
            onChange={handleChange}
            className="px-4 py-2 bg-gray-700 bg-opacity-80 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="product_barcode"
            placeholder="輸入品項條碼"
            value={formData.product_barcode}
            onChange={handleChange}
            className="px-4 py-2 bg-gray-700 bg-opacity-80 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="expiry_date"
            placeholder="有效期限"
            value={formData.expiry_date}
            onChange={handleChange}
            className="px-4 py-2 bg-gray-700 bg-opacity-80 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="description"
            placeholder="商品描述"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="px-4 py-2 bg-gray-700 bg-opacity-80 border border-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 transition-colors"
          >
            確認新增
          </button>
        </form>
      </div>
    </div>
  );
}
