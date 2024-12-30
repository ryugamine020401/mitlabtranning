"use client";

import { useState } from "react";
import CryptoJS from "crypto-js"; // 使用 CryptoJS 進行 SHA-256 加密
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "", // 接收明文密碼
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 處理表單字段變化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 表單校驗
  const validateForm = () => {
    const { username_or_email, password } = formData;

    if (username_or_email.trim() === "") {
      setMessage("請輸入使用者名稱或電子郵件");
      return false;
    }

    if (password.trim() === "" || password.length < 8) {
      setMessage("密碼需至少 8 個字符");
      return false;
    }

    return true;
  };

  // 使用 SHA-256 加密密碼
  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  // 表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
      const apiPath = "/api/login";
      const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;

      // 加密密碼
      const hashedPassword = hashPassword(formData.password);

      // 構建加密後的數據
      const encryptedFormData = {
        username_or_email: formData.username_or_email,
        password_hash: hashedPassword,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encryptedFormData),
      });

      if (response.ok) {
        const result = await response.json();

        // 將 access_token 存儲到 localStorage
        localStorage.setItem("access_token", result.access_token);

        setMessage(`登入成功：${result.message}`);
      } else {
        const errorResult = await response.json();
        setMessage(`登入失敗：${errorResult.detail || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("登入時發生錯誤：", error);
      setMessage(`登入失敗，伺服器錯誤：${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 p-6">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">登入</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">使用者名稱或電子郵件</label>
            <input
              type="text"
              name="username_or_email"
              value={formData.username_or_email}
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
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? "bg-gray-500" : "bg-purple-600"} text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            {isSubmitting ? "登入中..." : "登入"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}

        {/* 添加跳轉到註冊頁面的 Link */}
        <p className="mt-4 text-center text-sm text-gray-300">
          還沒有帳戶？{" "}
          <Link href="/register" className="text-purple-400 hover:underline">
            註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
