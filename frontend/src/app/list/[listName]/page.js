"use client";

import { useParams } from "next/navigation";

export default function ListDetail() {
  const params = useParams();
  const listName = decodeURIComponent(params.listName); // 解碼中文路由參數

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <h1 className="text-2xl font-bold text-gray-800">
        清單：{listName || "無內容"}
      </h1>
    </div>
  );
}
