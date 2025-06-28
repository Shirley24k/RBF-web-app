import { ArrowUpTrayIcon, ChevronLeftIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  IconButton,
  Spinner,
  Textarea,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidenav } from "../components/sidenav";

interface ApplicationDetailsProps {
  userRole: 'startup' | 'investor' | 'admin';
}

export const ApplicationDetails = ({ userRole }: ApplicationDetailsProps) => {
  const { id } = useParams();
  const [application, setApplication] = useState<any>(null);
  const [otherParty, setOtherParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [adminMessage, setAdminMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchApplication = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/application/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setApplication(response.data.data.application);
      
      if (userRole === 'startup') {
        setOtherParty(response.data.data.investor);
      } else if (userRole === 'investor') {
        setOtherParty(response.data.data.startup);
      } else {
        setOtherParty({
          startup: response.data.data.startup,
          investor: response.data.data.investor
        });
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    }
  };

  const viewProposal = () => {
    if (application?.proposal_path) {
      window.open(application.proposal_path, '_blank');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError("");

    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file only.");
      setSelectedFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
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
      const formData = new FormData();
      formData.append("agreement", selectedFile);

      const endpoint = userRole === 'startup' 
        ? `${API_BASE_URL}/startup/upload-agreement/${id}`
        : `${API_BASE_URL}/investor/upload-agreement/${id}`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        await fetchApplication();
        setSelectedFile(null);
        setUploadError("");
        window.history.back();
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.message || "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAccept = async () => {
    if (!message.trim()) {
      alert("Please provide a message to the startup.");
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/application/${id}/accept`, {
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        await fetchApplication();
        setMessage("");
        window.history.back();
      }
    } catch (error) {
      alert("Failed to accept application. Please try again.");
    }
  };

  const handleDecline = async () => {
    if (!message.trim()) {
      alert("Please provide a message to the startup.");
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/application/${id}/reject`, {
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        await fetchApplication();
        setMessage("");
        window.history.back();
      }
    } catch (error) {
      alert("Failed to decline application. Please try again.");
    }
  };

  const handleAdminApprove = async () => {
    if (!adminMessage.trim()) {
        alert("Please provide a message for the approval.");
        return;
    }

    try {    
      const response = await axios.patch(`${API_BASE_URL}/application/${id}/admin-approve`, {
        message: adminMessage
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        await fetchApplication();
        setAdminMessage("");
        window.history.back();
      }
    } catch (error) {
      alert("Failed to approve application. Please try again.");
    }
  };

  const handleAdminDecline = async () => {
    if (!adminMessage.trim()) {
      alert("Please provide a message for the decline.");
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/application/${id}/admin-decline`, {
        message: adminMessage
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        await fetchApplication();
        setAdminMessage("");
        window.history.back();
      }
    } catch (error) {
      alert("Failed to decline application. Please try again.");
    }
  };

  useEffect(() => {
    fetchApplication().finally(() => setLoading(false));
  }, [id]);

  if (loading || !application) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    );
  }

  const canViewTransaction = () => {
    if (userRole !== 'admin') return false;
    return application.status === "Active" || application.status === "Completed";
  }

  const canUploadAgreement = () => {
    if (userRole === 'admin') return false;
    return application.status === "In Progress";
  };

  const canReviewApplication = () => {
    if (userRole !== 'investor') return false;
    return application.status === "Await Review";
  };

  const canReviewAgreements = () => {
    if (userRole !== 'admin') return false;
    return application.status === "Pending";
  };

  const awaitReviewApplication = () => {
    if (userRole === 'admin') return false;
    return application.status === "Await Review";
  }

  const rejectedApplication = () => {
    if (userRole === 'admin' || userRole === 'investor') return false;
    return application.status === "Rejected"; 
  }

  const pendingAgreement = () => {
    if (userRole === 'admin') return false;
    return application.status === "Pending";
  }

  const rejectedAgreement = () => {
    if (userRole === 'admin') return false;
    return userAgreementPath !== null && otherAgreementPath !== null && application.status === "In Progress"; 
  }

  const activeAgreement = () => {
    return application.status === "Active"; 
  }

  const completedApplication = () => {
    if (userRole === 'admin') return false;
    return application.status === "Completed";
  }

  // Helper to get agreement paths
  const userAgreementPath = userRole === 'startup' ? application.startup_agreement_path : application.investor_agreement_path;
  const otherAgreementPath = userRole === 'startup' ? application.investor_agreement_path : application.startup_agreement_path;
  const otherPartyRole = userRole === 'startup' ? 'investor' : 'startup';

  return (
    <div className="bg-white min-h-screen flex">
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>

      <div className="ml-[341px] flex flex-col flex-1">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-2">
                <div className="py-8 flex items-center">
                    <IconButton
                    variant="text"
                    className="mr-4 flex items-center justify-center"
                    onClick={() => window.history.back()}
                    >
                    <ChevronLeftIcon className="h-6 w-6" />
                    </IconButton>
                    <Typography variant="h4" color="blue-gray">
                    Application Details
                    </Typography>
                </div>
                <div className="flex justify-end items-center">
                {canViewTransaction() && (
                    <Button
                        className="bg-dark-plum hover:bg-light-purple text-white font-bold text-sm py-3 px-6 rounded-lg capitalize"
                        onClick={() => {
                        window.location.href = `/admin-transaction-details/${id}`;
                        }}
                    >
                        View Transaction
                    </Button>
                    )}
                </div>
            </div>
          

          {/* Application Information Card (always shown) */}
          <Card className="mb-8">
            <CardBody className="flex flex-col gap-y-1">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Application Information
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-6">
                  <Typography variant="h6" color="blue-gray">Business Proposal</Typography>
                  <Typography variant="h6" color="blue-gray">Application Status</Typography>
                  <Typography variant="h6" color="blue-gray">Application Datetime</Typography>
                  <Typography variant="h6" color="blue-gray">Funding Amount</Typography>
                </div>
                <div className="flex flex-col gap-y-6">
                  <Typography 
                    color="gray" 
                    className="underline font-[400] cursor-pointer" 
                    onClick={viewProposal}
                  >
                    Business proposal.pdf
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    {application.status}
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    {application.updated_at ? new Date(application.updated_at).toISOString().slice(0, 10) : ""}
                  </Typography>
                  <Typography color="gray" className="font-[400]">
                    {application.funding_amount}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Investor Information Card (admin & startup) */}
          {(userRole === 'admin' || userRole === 'startup') && (
            <Card className="mb-8">
              <CardBody className="flex flex-col gap-y-1">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Investor Information
                </Typography>
                <div className="grid grid-cols-2 gap-x-4">
                  <div className="flex flex-col gap-y-6">
                    <Typography variant="h6" color="blue-gray">Name</Typography>
                    <Typography variant="h6" color="blue-gray">Phone Number</Typography>
                    <Typography variant="h6" color="blue-gray">Email Address</Typography>
                    <Typography variant="h6" color="blue-gray">
                      {(userRole === 'admin' ? otherParty.investor?.type : otherParty?.type) === "individual" ? "Country" : "Company Name"}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-y-6">
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.investor?.name : otherParty?.name}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.investor?.contact_no : otherParty?.contact_no}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.investor?.email : otherParty?.email}</Typography>
                    <Typography color="gray" className="font-[400]">
                      {(userRole === 'admin' ? otherParty.investor?.type : otherParty?.type) === "individual"
                        ? (userRole === 'admin' ? otherParty.investor?.country : otherParty?.country)
                        : (userRole === 'admin' ? otherParty.investor?.company_address : otherParty?.company_address)}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Startup Information Card (admin & investor) */}
          {(userRole === 'admin' || userRole === 'investor') && (
            <Card className="mb-8">
              <CardBody className="flex flex-col gap-y-1">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Startup Information
                </Typography>
                <div className="grid grid-cols-2 gap-x-4">
                  <div className="flex flex-col gap-y-6">
                    <Typography variant="h6" color="blue-gray">Applicant Name</Typography>
                    <Typography variant="h6" color="blue-gray">Phone Number</Typography>
                    <Typography variant="h6" color="blue-gray">Company Name</Typography>
                    <Typography variant="h6" color="blue-gray">Business Email Address</Typography>
                    <Typography variant="h6" color="blue-gray">Company Sector</Typography>
                    <Typography variant="h6" color="blue-gray">Company Address</Typography>
                  </div>
                  <div className="flex flex-col gap-y-6">
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.startup?.name : otherParty?.name}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.startup?.contact_no : otherParty?.contact_no}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.startup?.company_name : otherParty?.company_name}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.startup?.email : otherParty?.email}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.startup?.company_sector : otherParty?.company_sector}</Typography>
                    <Typography color="gray" className="font-[400]">{userRole === 'admin' ? otherParty.startup?.company_address : otherParty?.company_address}</Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Investor message section (only for in progress and rejected application) */}
          {(rejectedApplication() || canUploadAgreement()) && (
            <div className="mb-8">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Investor Message
              </Typography>
              {/* Display message */}
              <Typography className="mb-2 font-[400] border border-gray-400 rounded-[5px] p-2 h-[100px]" color="gray">
                {application.message}
              </Typography>
            </div>
          )}

        {/* Upload Agreement Section (only for in progress, active and completed) */}
        {!(awaitReviewApplication() || rejectedApplication()) && (
            <div>
                <span className="flex items-center gap-2">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                    Agreement
                </Typography>
                {/* add a tooltip to show admin message */}
                    {rejectedAgreement() && (
                    <Tooltip content={application.admin_message}>
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mb-3" />
                    </Tooltip>
                    )}
                    {(activeAgreement() || completedApplication()) && (
                    <Tooltip content={application.admin_message}>
                        <ExclamationCircleIcon className="w-5 h-5 text-green-500 mb-3" />
                    </Tooltip>
                    )}
                </span>
            </div>
        )}

        {/* If user has uploaded agreement */}
        {(userAgreementPath && rejectedAgreement() && canUploadAgreement()) && (
            <div>
            <Typography className="mb-2 font-[400]" color="gray">
                You have uploaded your
                <a
                href={userAgreementPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-deep-purple-600 underline ml-1"
                >
                agreement.
                </a>
            </Typography>
            {!otherAgreementPath && (
                <Typography className="mb-2 font-[400]" color="gray">
                Waiting for {otherPartyRole} to upload agreement.
                </Typography>
            )}
            </div>
        )}

        {((canUploadAgreement() && !userAgreementPath) || rejectedAgreement()) && (
            // Show upload UI to upload agreement
            <div>
            {rejectedAgreement() && (
                <Typography className="mb-4 font-[400]" color="red">
                    !! Your application has been rejected. Please hover over the tooltip icon to view the admin message.
                </Typography>
            )}
                <Typography className="mb-4 font-[400]" color="gray">
                Kindly {rejectedAgreement() ? "re-upload" : "upload"} a copy of signed agreement between you and the {otherPartyRole}. 
                Please convert into <span className="font-bold">.pdf</span> format for submission.
                </Typography>

                <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,application/pdf"
                className="hidden"
                />

                <Button 
                className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-auto mb-2"
                onClick={handleUploadClick}
                disabled={isUploading}
                >
                <div className="flex items-center justify-center gap-[19px]">
                    <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-500 font-medium capitalize">
                    {selectedFile ? selectedFile.name : "Upload agreement"}
                    </span>
                </div>
                </Button>

                <Typography variant="small" className="text-gray-500 font-[380] mt-2 mb-2">
                Accepted file type: PDF (Max size: 10MB)
                </Typography>

                {uploadError && (
                <Typography variant="small" className="text-red-500 font-[380] mb-4">
                    {uploadError}
                </Typography>
                )}

                {selectedFile && !uploadError && (
                <Typography variant="small" className="text-green-500 font-[380] mb-4">
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
                    onClick={() => window.history.back()}
                    disabled={isUploading}
                >
                    Back
                </Button>
                </div>
            </div>
            )}

        {/* Await Review Section (Startup View) */}
        {awaitReviewApplication() && (
            <div>
            <Typography className="mb-2 font-[400]" color="gray">
                Waiting for investor to review.
            </Typography>
            </div>
         )}

          {/* Investor Review Section */}
          {canReviewApplication() && (
            <div className="mb-8">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Application Decision
              </Typography>
              <Typography color="gray" className="mb-4 font-[400]">
                Dear investor, kindly indicate whether you accept or decline this application. 
                A message to the startup is required, regardless of your decision. 
                If you choose to accept, please include details on how to proceed with the remaining funding process. 
                If you decide to decline, please provide a polite and constructive reason for your decision.
              </Typography>
              <Textarea
                variant="outlined"
                label="Message"
                className="mb-6 bg-white border border-gray-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <Button
                  className="bg-dark-plum text-white hover:bg-light-purple capitalize"
                  onClick={handleAccept}
                >
                  Accept
                </Button>
                <Button
                  className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize"
                  variant="outlined"
                  onClick={handleDecline}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Admin Review Section */}
          {canReviewAgreements() && (
            <div className="mb-8">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Agreement Review
              </Typography>
              <Typography color="gray" className="mb-4 font-[400]">
                Approve the application if the agreements uploaded by both startup and investor match. 
                If decline, please provide a remark to startup and investor.
              </Typography>

              <Typography variant="small" className="text-gray-500 mb-2">
                Click to view:
              </Typography>

              <div className="flex flex-col gap-2 mb-6">
                <Typography
                  as="a"
                  href="#"
                  className="text-deep-purple-600 font-semibold underline text-sm cursor-pointer"
                  onClick={() => window.open(application.startup_agreement_path, '_blank')}
                >
                  Startup agreement
                </Typography>
                <Typography
                  as="a"
                  href="#"
                  className="text-deep-purple-600 font-semibold underline text-sm cursor-pointer"
                  onClick={() => window.open(application.investor_agreement_path, '_blank')}
                >
                  Investor agreement
                </Typography>
              </div>

              <Textarea
                variant="outlined"
                label="Message"
                className="mb-6 bg-white border border-gray-500 text-gray-700"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
              />

              <div className="flex justify-end gap-4">
                <Button
                  className="bg-dark-plum text-white hover:bg-light-purple capitalize"
                  onClick={handleAdminApprove}
                >
                  Approve
                </Button>
                <Button
                  className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize"
                  variant="outlined"
                  onClick={handleAdminDecline}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Pending Application Section (Startup and Investor Views) */}
          {pendingAgreement() && (
            <div>
            <Typography variant="h6" className="text-gray-500 mb-2">
                Click to view:
              </Typography>

              <div className="flex flex-col gap-2 mb-6">
                <Typography
                  as="a"
                  href="#"
                  className="text-deep-purple-600 font-semibold underline text-sm cursor-pointer"
                  onClick={() => window.open(application.startup_agreement_path, '_blank')}
                >
                  Startup agreement
                </Typography>
                <Typography
                  as="a"
                  href="#"
                  className="text-deep-purple-600 font-semibold underline text-sm cursor-pointer"
                  onClick={() => window.open(application.investor_agreement_path, '_blank')}
                >
                  Investor agreement
                </Typography>
              </div>
            <Typography className="mb-2 font-[400]" color="gray">
                Waiting for admin to review.
            </Typography>
          </div>
          )}

          {/* Completed Application Section */}
          {(completedApplication() || activeAgreement()) && (
            <div>
              <Typography variant="h6" className="text-gray-500 mb-2">
                Click to view:
              </Typography>

              <div className="flex flex-col gap-2 mb-6">
                <Typography
                  as="a"
                  href="#"
                  className="text-deep-purple-600 font-semibold underline text-sm cursor-pointer"
                  onClick={() => window.open(application.startup_agreement_path, '_blank')}
                >
                  Startup agreement
                </Typography>
                <Typography
                  as="a"
                  href="#"
                  className="text-deep-purple-600 font-semibold underline text-sm cursor-pointer"
                  onClick={() => window.open(application.investor_agreement_path, '_blank')}
                >
                  Investor agreement
                </Typography>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 