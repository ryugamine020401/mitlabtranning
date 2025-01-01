"use client";

import { useState } from "react";
import CryptoJS from "crypto-js"; // 使用 CryptoJS 庫進行 SHA-256 加密

export default function Home() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { username, email, password, name } = formData;

    if (username.length < 3 || username.length > 20) {
      setMessage("使用者名稱需在 3 到 20 個字符之間");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("請輸入有效的電子郵件地址");
      return false;
    }

    if (password.length < 8) {
      setMessage("密碼需至少 8 個字符");
      return false;
    }

    if (name.length < 1) {
      setMessage("請輸入姓名");
      return false;
    }

    return true;
  };

  // 使用 SHA-256 加密密碼
  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const hashedPassword = hashPassword(formData.password); // 使用 SHA-256 加密密碼
      const encryptedFormData = { ...formData, password: hashedPassword };
      
      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
      const apiPath = "/api/create_user";
      const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encryptedFormData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`成功：${result.message}`);
      } else {
        const errorResult = await response.json();
        setMessage(`提交失敗：${errorResult.detail || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("提交時發生錯誤：", error);
      setMessage(`提交失敗，伺服器錯誤。：${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 p-6">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">用戶資料表單</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">使用者名稱</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">電子郵件</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">密碼</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? "bg-gray-500" : "bg-purple-600"} text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            {isSubmitting ? "提交中..." : "提交"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}
      </div>
    </div>
  );
}
