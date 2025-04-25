import { useState, useRef } from "react";

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Function to send files to backend for processing
  const uploadFilesToBackend = async (files) => {
    setIsLoading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const data = await response.json();
      setUploadedFiles(files);
      return data;
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    await uploadFilesToBackend(files);
  };

  // Search function that queries the backend
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      alert("Error performing search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            AI-Based Document Search Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            Upload and search through your documents
          </p>
        </header>

        {/* Upload Section */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            1. Upload Your Documents
          </h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept=".pdf,.docx,.pptx"
          />

          <button
            onClick={triggerFileInput}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload PDF, Word, or PPT files"}
          </button>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-green-600 mb-3">
                {uploadedFiles.length} file(s) uploaded successfully.
              </p>

              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <span className="text-gray-700">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Search Section */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            2. Enter Your Search Query
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question or query here"
              className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
              disabled={isLoading || uploadedFiles.length === 0}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {query && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              3. Search Results
            </h2>

            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <h3 className="font-medium text-lg text-gray-800 mb-2">
                      File: {result.file}
                    </h3>
                    <div className="p-3 bg-gray-50 rounded border">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {result.content}
                      </pre>
                    </div>
                    {result.score && (
                      <div className="mt-2 text-sm text-gray-500">
                        Match score: {Math.round(result.score * 100)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                {isLoading ? "Searching..." : "No matches found."}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Prototype Interface | Team Project
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
