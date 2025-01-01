"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
const apiPath = "/api/get_product";
const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;
const deleteApiPath = "/api/delete_product";
const deleteApiUrl = `${protocol}://${domain}:${port}${deleteApiPath}`;

export default function ListDetail() {
  const params = useParams();
  const router = useRouter();

  // 獲取動態路由參數，並解碼
  const listName = decodeURIComponent(params.listName);

  // 狀態管理
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 請求函數
  const fetchProducts = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ list_name: listName }), // 傳遞 listName 給後端
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.product);
      } else {
        setError(data.message || "Failed to fetch products.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(deleteApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts((prevProducts) => prevProducts.filter((product) => product[0] !== id));
      } else {
        setError(data.message || "Failed to delete product.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 使用 useEffect 一進入頁面即調用 API
  useEffect(() => {
    fetchProducts();
  }, []);

  // 處理跳轉到新增品項頁面
  const handleAddProduct = () => {
    router.push(`/list/${encodeURIComponent(listName)}/addproduct`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-white mb-6">
        清單：{listName || "無內容"}
      </h1>

      {loading ? (
        <p className="text-lg animate-pulse">資料加載中...</p>
      ) : error ? (
        <p className="text-red-500 text-lg">錯誤：{error}</p>
      ) : (
        <ul className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6 divide-y divide-gray-700">
          {products.length > 0 ? (
            products.map((product) => (
              <li
                key={product[0]}
                className="py-4 px-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="text-lg font-semibold">{product[1]}</div>
                  <div className="text-sm text-gray-400">{product[2]}</div>
                </div>
                <button
                  onClick={() => handleDeleteProduct(product[0])}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition-colors"
                >
                  刪除
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-400 text-center">尚未添加任何產品。</p>
          )}
        </ul>
      )}

      <button
        onClick={handleAddProduct}
        className="mt-6 px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-500 transition-all"
      >
        新增品項
      </button>
    </div>
  );
}
