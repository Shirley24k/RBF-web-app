import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import { useRef, useState } from "react";
import { Sidenav } from "../../components/sidenav";
import axios from "axios";

export const StartupSubmitFunding = (): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError("");

    if (!file) {
      return;
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file only.");
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setUploadError("File size must be less than 10MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setUploadError("Please select a PDF file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("document", selectedFile);

      // Submit proposal to backend, backend will perform risk assessment, analyse the proposal, store the proposal information in database, then perform startup-investor matching
      await axios.post(`${API_BASE_URL}/startup/submit-funding`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response)=>{
        if(response.status === 201){
          window.location.href = "/select-investor";
        }
      }).catch((error)=>{
        console.error("Error submitting funding application:", error);
      });
    } catch (error) {
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#ffffff] flex flex-row justify-center w-full">
      <div className="bg-white w-full h-[982px] relative">
        {/* Sidebar */}
        <div className="fixed w-[311px] h-full left-0 top-0">
          <Sidenav active="application" />
        </div>

        {/* Main Content */}
        <div className="ml-[311px] p-12 flex flex-col items-start">
          {/* Heading */}
          <Typography variant="h4" color="blue-gray">
            Submit Funding Application
          </Typography>

          {/* Instructions */}
          <Typography variant="h6" className="my-4 font-normal">
            <span className="leading-[30px]">
              Kindly upload your business proposal for application. Please
              convert into
            </span>
            <span className="font-bold leading-[30px]"> .pdf </span>
            <span className="leading-[30px]">format for submission. </span>
          </Typography>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          {/* Upload Button */}
          <Button 
            className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-auto"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <div className="flex items-center justify-center gap-[19px]">
              <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
              <span className="font-text-sm-font-medium text-gray-500 text-sm capitalize">
                {selectedFile ? selectedFile.name : "Upload document"}
              </span>
            </div>
          </Button>

          <Typography
            variant="small"
            className="text-gray-500 font-[380] mt-2 mb-2"
          >
            Accepted file type: PDF (Max size: 10MB)
          </Typography>

          {/* Error message */}
          {uploadError && (
            <Typography
              variant="small"
              className="text-red-500 font-[380] mb-4"
            >
              {uploadError}
            </Typography>
          )}

          {/* Success message */}
          {selectedFile && !uploadError && (
            <Typography
              variant="small"
              className="text-green-500 font-[380] mb-4"
            >
              ✓ File selected: {selectedFile.name}
            </Typography>
          )}

          <div className="flex gap-4">
            <Button
              className="bg-dark-plum text-white hover:bg-light-purple capitalize"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Submit"}
            </Button>

            <Button
              className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize"
              variant="outlined"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
              disabled={isUploading}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
