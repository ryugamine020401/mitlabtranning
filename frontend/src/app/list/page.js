"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserList() {
  const [list, setList] = useState([]);
  const [newListItem, setNewListItem] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setMessage("未找到 access_token，請先登入");
        setIsLoading(false);
        return;
      }
      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
      const apiPath = "/api/list";
      const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const result = await response.json();
        setList(result.list || []);
        setMessage("清單加載成功");
      } else {
        const errorResult = await response.json();
        setMessage(`加載失敗：${errorResult.detail || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("加載清單時發生錯誤：", error);
      setMessage(`伺服器錯誤：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addListItem = async () => {
    if (!newListItem.trim()) {
      setMessage("請輸入清單項目");
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setMessage("未找到 access_token，請先登入");
        return;
      }
      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
      const apiPath = "/api/addlist";
      const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ list_name: newListItem }),
      });

      if (response.ok) {
        setMessage("清單項目新增成功");
        setNewListItem("");
        fetchList();
      } else {
        const errorResult = await response.json();
        setMessage(`新增失敗：${errorResult.detail || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("新增清單時發生錯誤：", error);
      setMessage(`伺服器錯誤：${error.message}`);
    }
  };

  const deleteListItem = async (item) => {
    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setMessage("未找到 access_token，請先登入");
        return;
      }

      const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL;
      const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN_NAME;
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT;
      const apiPath = "/api/api/deletelist";
      const apiUrl = `${protocol}://${domain}:${port}${apiPath}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ list_name: item }),
      });

      if (response.ok) {
        setMessage(`清單項目 "${item}" 刪除成功`);
        fetchList();
      } else {
        const errorResult = await response.json();
        setMessage(`刪除失敗：${errorResult.detail || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("刪除清單時發生錯誤：", error);
      setMessage(`伺服器錯誤：${error.message}`);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 p-6">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">使用者清單</h1>

      {isLoading ? (
        <p className="text-gray-300">加載中...</p>
      ) : (
        <>
          {message && (
            <p
              className={`text-sm mt-2 ${
                message.includes("成功") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-6 w-full max-w-md bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg">
            <p className="text-gray-300">新增清單項目</p>
            <div className="mt-4 flex items-center">
              <input
                type="text"
                value={newListItem}
                onChange={(e) => setNewListItem(e.target.value)}
                placeholder="輸入清單項目"
                className="flex-grow p-2 rounded-md border-gray-700 bg-gray-800 text-gray-200 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                onClick={addListItem}
                className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500"
              >
                新增
              </button>
            </div>
          </div>

          {list.length > 0 ? (
            <div className="mt-4 w-full max-w-md">
              {list.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-800 text-gray-200 p-4 rounded-md mb-2 shadow-lg hover:bg-gray-700"
                >
                  <Link
                    href={`/list/${encodeURIComponent(item)}`}
                    className="flex-grow text-gray-200 hover:text-purple-400"
                  >
                    {item}
                  </Link>
                  <button
                    onClick={() => deleteListItem(item)}
                    className="ml-4 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">目前無清單，請新增一個！</p>
          )}
        </>
      )}
    </div>
  );
}
