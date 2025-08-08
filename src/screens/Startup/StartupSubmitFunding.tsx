import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";

export const StartupSubmitFunding = (): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/pdf",
        },
      }).then((response)=>{
        if(response.status === 201 && response.data) {
          navigate("/processing-funding", { state: { proposal_path: response.data.proposal_path } });
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
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="application" />
      </div>
      <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1">
        {/* Main Content */}
        <div className="p-6 max-md:p-4 max-sm:p-3 flex flex-col items-start max-w-2xl">
          {/* Heading */}
          <Typography variant="h4" color="blue-gray" className="text-3xl max-md:text-2xl max-sm:text-xl mb-6 max-md:mb-4 max-sm:mb-3">
            Submit Funding Application
          </Typography>

          {/* Instructions */}
          <Typography variant="h6" className="mb-6 max-md:mb-4 max-sm:mb-3 font-normal text-base max-md:text-sm max-sm:text-sm">
            <span className="leading-relaxed">
              Kindly upload your business proposal for application. Please
              convert into
            </span>
            <span className="font-bold leading-relaxed"> .pdf </span>
            <span className="leading-relaxed">format for submission. </span>
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
            className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-auto mb-4 max-md:mb-3 max-sm:mb-2"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <div className="flex items-center justify-center gap-2 max-md:gap-1.5 max-sm:gap-1">
              <ArrowUpTrayIcon className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3 text-gray-500" />
              <span className="font-text-sm-font-medium text-gray-500 text-sm max-md:text-xs capitalize">
                {selectedFile ? selectedFile.name : "Upload document"}
              </span>
            </div>
          </Button>

          <Typography
            variant="small"
            className="text-gray-500 font-[380] mb-4 max-md:mb-3 max-sm:mb-2 text-xs max-md:text-xs"
          >
            Accepted file type: PDF (Max size: 10MB)
          </Typography>

          {/* Error message */}
          {uploadError && (
            <Typography
              variant="small"
              className="text-red-500 font-[380] mb-4 max-md:mb-3 max-sm:mb-2 text-xs max-md:text-xs"
            >
              {uploadError}
            </Typography>
          )}

          {/* Success message */}
          {selectedFile && !uploadError && (
            <Typography
              variant="small"
              className="text-green-500 font-[380] mb-4 max-md:mb-3 max-sm:mb-2 text-xs max-md:text-xs"
            >
              ✓ File selected: {selectedFile.name}
            </Typography>
          )}

          <div className="flex flex-row gap-3 max-md:gap-2 max-sm:gap-2 w-full">
            <Button
              className="bg-dark-plum text-white hover:bg-light-purple capitalize text-sm max-md:text-xs py-3 max-md:py-2.5 max-sm:py-2 px-6 max-md:px-4 w-auto"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Submit"}
            </Button>

            <Button
              className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize text-sm max-md:text-xs py-3 max-md:py-2.5 max-sm:py-2 px-6 max-md:px-4 w-auto"
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
