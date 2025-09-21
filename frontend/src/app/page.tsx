'use client';

import { useState } from "react";
import { FiUpload, FiDownload, FiTrash2, FiCopy, FiCheck, FiAlertTriangle, FiInfo, FiLoader, FiGitMerge } from 'react-icons/fi';
import Papa from 'papaparse';

export default function Home() {
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [extractedCount, setExtractedCount] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleExtract = async () => {
    if (!htmlContent.trim()) {
      setError("Nội dung HTML không được để trống.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html: htmlContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }
      
      if (data.count === 0) {
        setMessage("Không tìm thấy bình luận mới để trích xuất.");
      } else {
        setExtractedCount(prev => prev + data.count);
        setMessage(`Đã trích xuất thành công ${data.count} bình luận mới!`);
      }
      setHtmlContent(""); // Clear textarea on success

    } catch (err: any) {
      setError(err.message || "Không thể kết nối đến server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setError("");
    setMessage("");
    try {
        const response = await fetch("http://localhost:3001/api/download");

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to download.");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shopee_comments.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        // Reset counter to 0 after successful download (data is auto-cleared on backend)
        setExtractedCount(0);
        setError(""); // Clear any previous errors
        setHtmlContent(""); // Clear HTML input as well
        setMessage("Tải xuống file CSV thành công và đã xóa dữ liệu!");
        
        // Force re-render by updating state again
        setTimeout(() => {
          setExtractedCount(0);
        }, 100);
    } catch (err: any) {
        setError(err.message || "Could not initiate download.");
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
        const response = await fetch("http://localhost:3001/api/clear", {
            method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to clear.");
        }
        setExtractedCount(0);
        setHtmlContent(""); // Clear HTML input as well
        setMessage(data.message || "Data cleared successfully.");
        
        // Force re-render by updating state again
        setTimeout(() => {
          setExtractedCount(0);
        }, 100);
    } catch (err: any) {
        setError(err.message || "Could not clear data.");
    } finally {
        setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("document.documentElement.outerHTML").then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setError(""); // Clear any previous errors when selecting new files
  };

  const handleMergeFiles = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Vui lòng chọn file CSV để gộp.");
      return;
    }

    if (selectedFiles.length < 2) {
      setError("Vui lòng chọn ít nhất 2 file CSV để gộp.");
      return;
    }

    setError("");
    setMessage("Đang gộp file...");

    const promises = Array.from(selectedFiles).map(file => {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    });

    Promise.all(promises)
      .then(results => {
        const mergedData = ([] as any[]).concat(...results);
        const csv = Papa.unparse(mergedData, { quotes: true, bom: true });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "merged_comments.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        // Reset counter and clear selected files after successful merge
        setExtractedCount(0);
        setSelectedFiles(null);
        setError(""); // Clear any previous errors
        setHtmlContent(""); // Clear HTML input as well
        
        // Clear backend data after merge
        fetch("http://localhost:3001/api/clear-after-merge", {
          method: "POST",
        }).then(() => {
          console.log("Backend data cleared successfully");
        }).catch(err => {
          console.log("Could not clear backend data:", err);
        });
        
        setMessage("Gộp file thành công, đã tải xuống và xóa dữ liệu!");
        
        // Force re-render by updating state again
        setTimeout(() => {
          setExtractedCount(0);
        }, 100);
      })
      .catch(err => {
        setError("Đã xảy ra lỗi khi gộp file.");
        console.error(err);
      });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <div className="inline-block p-1 bg-gradient-to-r from-gray-200 to-gray-400 rounded-full mb-4">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-3">
              <FiDownload className="w-8 h-8 text-gray-800 mx-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-black gradient-text-dark mb-3 tracking-tight">
            Trích Xuất Bình Luận Shopee
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Chuyển đổi HTML thành dữ liệu CSV có cấu trúc với công cụ trích xuất mạnh mẽ
          </p>
          <div className="flex justify-center items-center mt-6 space-x-4">
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
              Xử lý thời gian thực
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 animate-pulse"></div>
              Thao tác hàng loạt
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left Column: Input */}
          <div className="glass-effect-dark p-6 rounded-xl card-hover">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-r from-gray-200 to-gray-400 rounded-lg mr-3">
                <FiUpload className="w-5 h-5 text-gray-800" />
              </div>
              <h2 className="text-xl font-bold text-white">Nhập HTML</h2>
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Dán nội dung HTML vào đây..."
              className="w-full h-36 p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 ease-in-out disabled:bg-gray-700 resize-none"
              disabled={isLoading}
            />
            <button
              onClick={handleExtract}
              disabled={isLoading || !htmlContent.trim()}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg button-glow-dark"
            >
              {isLoading ? (
                <>
                  <FiLoader className="mr-2 animate-spin w-4 h-4"/> Đang trích xuất...
                </>
              ) : (
                <>
                  <FiUpload className="mr-2 w-4 h-4"/> Trích xuất bình luận
                </>
              )}
            </button>
          </div>

          {/* Right Column: Actions & Status */}
          <div className="space-y-6">
            <div className="glass-effect-dark p-6 rounded-xl card-hover">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-gray-200 to-gray-400 rounded-lg mr-3">
                  <FiDownload className="w-5 h-5 text-gray-800" />
                </div>
                <h2 className="text-xl font-bold text-white">Thao tác & Trạng thái</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300 text-sm">Tổng bình luận đã trích xuất:</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-2xl font-bold gradient-text-dark">{extractedCount}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isLoading || extractedCount === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg button-glow-dark"
                >
                  <FiDownload className="mr-2 w-4 h-4"/> Tải xuống CSV
                </button>
                <button
                  onClick={handleClear}
                  disabled={isLoading || extractedCount === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg button-glow-dark"
                >
                  <FiTrash2 className="mr-2 w-4 h-4"/> Xóa dữ liệu
                </button>
              </div>
            </div>

            <div className="glass-effect-dark p-6 rounded-xl card-hover">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-gray-200 to-gray-400 rounded-lg mr-3">
                  <FiGitMerge className="w-5 h-5 text-gray-800" />
                </div>
                <h2 className="text-xl font-bold text-white">Gộp file CSV</h2>
              </div>
              <p className="text-gray-400 mb-4 text-sm">Chọn ít nhất 2 file CSV để gộp thành một file.</p>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileSelect} 
                    className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-gray-200 file:to-gray-400 file:text-gray-800 file:transition-all file:duration-300" 
                  />
                </div>
                {selectedFiles && (
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 p-3 rounded-lg">
                    <p className="text-gray-300 font-medium">
                      Đã chọn {selectedFiles.length} file
                      {selectedFiles.length < 2 && (
                        <span className="text-orange-400 ml-2 font-bold">(Cần ít nhất 2 file)</span>
                      )}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleMergeFiles}
                  disabled={!selectedFiles || selectedFiles.length < 2}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg button-glow-dark"
                >
                  <FiGitMerge className="mr-2 w-4 h-4"/> Gộp & Tải xuống
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Status Messages */}
        <div className="max-w-6xl mx-auto mt-8 space-y-4">
          {error && (
            <div className="glass-effect-dark border border-red-500 p-4 rounded-xl">
              <div className="flex items-center">
                <div className="p-2 bg-red-500 rounded-lg mr-3">
                  <FiAlertTriangle className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <p className="font-bold text-red-400 text-lg">Lỗi</p>
                  <p className="text-gray-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          {message && (
            <div className="glass-effect-dark border border-green-500 p-4 rounded-xl">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg mr-3">
                  <FiCheck className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <p className="font-bold text-green-400 text-lg">Thành công</p>
                  <p className="text-gray-300">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}