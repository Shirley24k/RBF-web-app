import { ArrowUpTrayIcon, BellAlertIcon, ChevronLeftIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
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
  const [agreement, setAgreement] = useState<any>(null);
  const [notifyInvestor, setNotifyInvestor] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Helper to get agreement paths
  const userAgreementPath = userRole === 'startup' ? application?.startup_agreement_url : application?.investor_agreement_url;
  const otherAgreementPath = userRole === 'startup' ? application?.investor_agreement_url : application?.startup_agreement_url;
  const otherPartyRole = userRole === 'startup' ? 'investor' : 'startup';

  //Identify whether startup or investor need reupload agreement
  const needStartupReupload = agreement ? agreement?.needs_startup_reupload : false
  const needInvestorReupload = agreement ? agreement?.needs_investor_reupload : false
  const userNeedReupload = userRole === 'startup' ? needStartupReupload : needInvestorReupload
  const otherNeedReupload = userRole === 'startup' ? needInvestorReupload : needStartupReupload


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
      formData.append("document", selectedFile);

      const endpoint = userRole === 'startup' 
        ? `${API_BASE_URL}/startup/upload-agreement/${id}`
        : `${API_BASE_URL}/investor/upload-agreement/${id}`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/pdf",
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
      console.error("Failed to approve application. Please try again.");
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

  const getAgreement = async () => {
    try{
      const response = await axios.get(`${API_BASE_URL}/agreement/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAgreement(response.data.data);
    } catch (error) {
      console.error("Error fetching rejected agreement:", error);
    }
  }

  const handleNotifyInvestor = () => {
    axios.post(`${API_BASE_URL}/investor-topup-reminder/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then((response)=>{
      setNotifyInvestor(true);
    })
    .catch((error)=>{
      console.error('Failed to send reminder:', error);
    });
  };

  useEffect(() => {
    fetchApplication().finally(() => setLoading(false));
    getAgreement();
    console.log('application',application);
    console.log('agreement',agreement);
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
    return application.status === "Await Review";
  }

  const rejectedApplication = () => {
    return application.status === "Rejected"; 
  }
  
  //for admin, in progress application that has no agreement yet
  const inProgressApplication = () => {
    if (userRole !== 'admin') return false;
    return (application.status === "In Progress" && (!application.startup_agreement_url || !application.investor_agreement_url));
  }

  //for admin, in progress application that require reupload agreement
  const inProgressReuploadAgreement = () => {
    if (userRole !== 'admin') return false;
    return (
      application.status === "In Progress" &&
      agreement &&
      (agreement.needs_startup_reupload || agreement.needs_investor_reupload)
    );
  }

  const pendingAgreement = () => {
    if (userRole === 'admin') return false;
    return application.status === "Pending";
  }

  const rejectedAgreement = () => {
    if (userRole === 'admin') return false;
    return application.status === "In Progress" && agreement !== null && userNeedReupload;
  }

  const insufficientBalance = () => {
    if (userRole !== 'admin' || application.status !== "Pending") return false;
    return (Number(otherParty.investor?.balance) < Number(application.funding_amount));
  }

  const activeApplication = () => {
    return application.status === "Active"; 
  }

  const completedApplication = () => {
    return application.status === "Completed";
  }
  
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

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <div className="ml-32 max-md:ml-24 max-sm:ml-20 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4 max-sm:gap-2">
          <div className="py-8 max-md:py-6 max-sm:py-4 flex items-center">
            <IconButton
              variant="text"
              className="mr-4 max-md:mr-3 max-sm:mr-0 max-sm:px-0 flex items-center justify-center"
              onClick={() => window.history.back()}
            >
              <ChevronLeftIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
            </IconButton>
            <Typography variant="h4" color="blue-gray" className="text-2xl max-md:text-xl max-sm:text-lg">
              Application Details
            </Typography>
          </div>
          <div className="flex justify-end items-center">
            {canViewTransaction() && (
              <Button
                className="bg-dark-plum hover:bg-light-purple text-white font-bold text-sm max-md:text-xs py-3 max-md:py-2 px-6 max-md:px-4 rounded-lg capitalize"
                onClick={() => {
                  window.location.href = `/application-transaction-details/${id}`;
                }}
              >
                View Transaction
              </Button>
            )}
          </div>
        </div>
        <div className="ml-40 max-md:ml-24 max-sm:ml-20 max-w-7xl px-4 max-md:px-6 max-sm:px-4">
          {/* Application Information Card (always shown) */}
          <Card className="mb-8 max-md:mb-6 max-sm:mb-4">
            <CardBody className="flex flex-col gap-y-1 p-6 max-md:p-4 max-sm:p-3">
              <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                Application Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3 max-sm:gap-2">
                {/* Desktop/Tablet: Two-column layout */}
                <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                  <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Business Proposal</Typography>
                  <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Application Status</Typography>
                  <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Application Datetime</Typography>
                  <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Funding Amount</Typography>
                  <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Funding Stage</Typography>
                  <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Funding Purpose</Typography>
                  {(activeApplication() || completedApplication()) && (
                    <>
                      <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Revenue Share Percentage</Typography>
                      <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Repayment Cap</Typography>
                      <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Cap Multiple</Typography>
                    </>
                  )}
                </div>
                <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                  <a 
                    className="underline font-[400] cursor-pointer text-gray-500 text-sm max-md:text-xs" 
                    href={application.proposal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Business proposal.pdf
                  </a>
                  <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                    {application.status}
                  </Typography>
                  <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                    {application.updated_at ? new Date(application.updated_at).toISOString().slice(0, 10) : ""}
                  </Typography>
                  <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                    RM{application.funding_amount}
                  </Typography>
                  <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                    {application.funding_stage}
                  </Typography>
                  <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                    {application.funding_purpose}
                  </Typography>
                  {(activeApplication() || completedApplication()) && (
                    <>
                      <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                        {application.revenue_share_percentage}%
                      </Typography>
                      <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                        RM{application.repayment_cap}
                      </Typography>
                      <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                        {application.cap_multiple}x
                      </Typography>
                    </>
                  )}
                </div>

                {/* Mobile: Label-value pairs */}
                <div className="md:hidden flex flex-col gap-y-4 max-sm:gap-y-3">
                  <div className="flex flex-col gap-y-1">
                    <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Business Proposal</Typography>
                    <a 
                      className="underline font-[400] cursor-pointer text-gray-500 text-sm max-sm:text-xs" 
                      href={application.proposal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Business proposal.pdf
                    </a>
                  </div>
                  
                  <div className="flex flex-col gap-y-1">
                    <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Application Status</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                      {application.status}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col gap-y-1">
                    <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Application Datetime</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                      {application.updated_at ? new Date(application.updated_at).toISOString().slice(0, 10) : ""}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col gap-y-1">
                    <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Funding Amount</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                      RM{application.funding_amount}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col gap-y-1">
                    <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Funding Stage</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                      {application.funding_stage}
                    </Typography>
                  </div>
                  
                  <div className="flex flex-col gap-y-1">
                    <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Funding Purpose</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                      {application.funding_purpose}
                    </Typography>
                  </div>
                  
                  {(activeApplication() || completedApplication()) && (
                    <>
                      <div className="flex flex-col gap-y-1">
                        <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Revenue Share Percentage</Typography>
                        <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                          {application.revenue_share_percentage}%
                        </Typography>
                      </div>
                      
                      <div className="flex flex-col gap-y-1">
                        <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Repayment Cap</Typography>
                        <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                          RM{application.repayment_cap}
                        </Typography>
                      </div>
                      
                      <div className="flex flex-col gap-y-1">
                        <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Cap Multiple</Typography>
                        <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                          {application.cap_multiple}x
                        </Typography>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Investor Information Card (admin & startup) */}
          {(userRole === 'admin' || userRole === 'startup') && (
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4">
              <CardBody className="flex flex-col gap-y-1 p-6 max-md:p-4 max-sm:p-3">
                <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                  Investor Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 max-md:gap-x-3 max-sm:gap-x-2">
                  {/* Desktop/Tablet: Two-column layout */}
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Name</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Phone Number</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Email Address</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">
                      {(userRole === 'admin' ? otherParty.investor?.type : otherParty?.type) === "individual" ? "Country" : "Company Name"}
                    </Typography>
                    {(userRole === 'admin') && (
                      <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">
                        Balance
                      </Typography>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.investor?.name : otherParty?.name}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.investor?.contact_no : otherParty?.contact_no}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.investor?.email : otherParty?.email}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                      {(userRole === 'admin' ? otherParty.investor?.type : otherParty?.type) === "individual"
                        ? (userRole === 'admin' ? otherParty.investor?.country : otherParty?.country)
                        : (userRole === 'admin' ? otherParty.investor?.company_address : otherParty?.company_address)}
                    </Typography>
                    {(userRole === 'admin') && (
                      <Typography color="gray" className="font-[400] text-sm max-md:text-xs">
                        RM {otherParty.investor?.balance}
                      </Typography>
                    )}
                  </div>

                  {/* Mobile: Label-value pairs */}
                  <div className="md:hidden flex flex-col gap-y-4 max-sm:gap-y-3">
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Name</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.investor?.name : otherParty?.name}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Phone Number</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.investor?.contact_no : otherParty?.contact_no}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Email Address</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.investor?.email : otherParty?.email}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">
                        {(userRole === 'admin' ? otherParty.investor?.type : otherParty?.type) === "individual" ? "Country" : "Company Name"}
                      </Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                        {(userRole === 'admin' ? otherParty.investor?.type : otherParty?.type) === "individual"
                          ? (userRole === 'admin' ? otherParty.investor?.country : otherParty?.country)
                          : (userRole === 'admin' ? otherParty.investor?.company_address : otherParty?.company_address)}
                      </Typography>
                    </div>
                    
                    {(userRole === 'admin') && (
                      <div className="flex flex-col gap-y-1">
                        <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Balance</Typography>
                        <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">
                          RM {otherParty.investor?.balance}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Startup Information Card (admin & investor) */}
          {(userRole === 'admin' || userRole === 'investor') && (
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4">
              <CardBody className="flex flex-col gap-y-1 p-6 max-md:p-4 max-sm:p-3">
                <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                  Startup Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 max-md:gap-x-3 max-sm:gap-x-2">
                  {/* Desktop/Tablet: Two-column layout */}
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Applicant Name</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Phone Number</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Company Name</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Business Email Address</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Company Sector</Typography>
                    <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">Company Address</Typography>
                  </div>
                  <div className="hidden md:flex flex-col gap-y-6 max-md:gap-y-4 max-sm:gap-y-3">
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.startup?.name : otherParty?.name}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.startup?.contact_no : otherParty?.contact_no}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.startup?.company_name : otherParty?.company_name}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.startup?.email : otherParty?.email}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.startup?.company_sector : otherParty?.company_sector}</Typography>
                    <Typography color="gray" className="font-[400] text-sm max-md:text-xs">{userRole === 'admin' ? otherParty.startup?.company_address : otherParty?.company_address}</Typography>
                  </div>

                  {/* Mobile: Label-value pairs */}
                  <div className="md:hidden flex flex-col gap-y-4 max-sm:gap-y-3">
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Applicant Name</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.startup?.name : otherParty?.name}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Phone Number</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.startup?.contact_no : otherParty?.contact_no}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Company Name</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.startup?.company_name : otherParty?.company_name}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Business Email Address</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.startup?.email : otherParty?.email}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Company Sector</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.startup?.company_sector : otherParty?.company_sector}</Typography>
                    </div>
                    
                    <div className="flex flex-col gap-y-1">
                      <Typography variant="h6" color="blue-gray" className="text-base max-sm:text-sm">Company Address</Typography>
                      <Typography color="gray" className="font-[400] text-sm max-sm:text-xs">{userRole === 'admin' ? otherParty.startup?.company_address : otherParty?.company_address}</Typography>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Investor message section (only for in progress and rejected application) */}
          {(rejectedApplication() || canUploadAgreement()) && (
            <div className="mb-8 max-md:mb-6 max-sm:mb-4">
              <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                Investor Message
              </Typography>
              {/* Display message */}
              <Typography className="mb-2 font-[400] border border-gray-400 rounded-[5px] p-2 h-[100px] max-md:h-[80px] max-sm:h-[60px] text-sm max-md:text-xs" color="gray">
                {application.message}
              </Typography>
            </div>
          )}

          {/* Insufficient Balance Notification (Admin Only) */}
          {insufficientBalance() && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 p-4 max-md:p-3 max-sm:p-2 bg-red-50 border border-red-200 rounded-lg justify-between gap-4 max-sm:gap-2">
              <div className="flex items-center gap-4 max-md:gap-3 max-sm:gap-2">
                <ExclamationTriangleIcon className="w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 text-red-500" />
                <div className="flex flex-col">
                  <span className="text-red-700 font-semibold text-lg max-md:text-base max-sm:text-sm flex items-center gap-2">
                    Insufficient Investor Balance
                  </span>
                  <span className="text-gray-700 text-sm max-md:text-xs mt-1">
                    Investor Balance: <span className="font-bold">RM {otherParty.investor?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</span> <br/>
                    Required Funding Amount: <span className="font-bold">RM {application.funding_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </span>
                  <span className="text-red-600 text-sm max-md:text-xs mt-1">
                    The investor's balance is insufficient to fund this application. Please notify the investor to top up their balance.
                  </span>
                </div>
              </div>
              <Button
                className="flex items-center gap-2 bg-dark-plum hover:bg-light-purple text-white font-bold capitalize px-5 max-md:px-4 max-sm:px-3 py-2 max-md:py-1.5 max-sm:py-1 rounded-lg shadow-md ml-0 sm:ml-6 text-sm max-md:text-xs"
                onClick={handleNotifyInvestor}
                disabled={notifyInvestor}
                title="Notify Investor to Top Up Balance"
              >
                <BellAlertIcon className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />
                {notifyInvestor ? 'Notification Sent' : 'Notify Investor'}
              </Button>
            </div>
          )}

          {/* Upload Agreement Section (only for in progress, active and completed) */}
          {(!awaitReviewApplication() && !rejectedApplication() && !canReviewAgreements()) && (
            <div>
              <span className="flex items-center gap-2">
                <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                  Agreement
                </Typography>
                {/* add a tooltip to show admin message */}
                {rejectedAgreement() && (
                  <Tooltip content={application.admin_message}>
                    <ExclamationTriangleIcon className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3 text-red-500 mb-3" />
                  </Tooltip>
                )}
                {(activeApplication() || completedApplication()) && (
                  <Tooltip content={application.admin_message}>
                    <ExclamationCircleIcon className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3 text-green-500 mb-3" />
                  </Tooltip>
                )}
              </span>
            </div>
          )}

          {/* If user has uploaded agreement */}
          {(userAgreementPath && canUploadAgreement() && !userNeedReupload) && (
            <div>
              <Typography className="mb-2 font-[400] text-sm max-md:text-xs" color="gray">
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
              {(!otherAgreementPath || otherNeedReupload) && (
                <Typography className="mb-2 font-[400] text-sm max-md:text-xs" color="gray">
                  Waiting for {otherPartyRole} to upload agreement.
                </Typography>
              )}
            </div>
          )}

          {((canUploadAgreement() && !userAgreementPath) || rejectedAgreement()) && (
            // Show upload UI to upload agreement
            <div>
              {rejectedAgreement() && (
                <Typography className="mb-4 font-[400] text-sm max-md:text-xs" color="red">
                  !! Your application has been rejected. Please hover over the tooltip icon to view the admin message.
                </Typography>
              )}
              <Typography className="mb-4 font-[400] text-sm max-md:text-xs" color="gray">
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
                <div className="flex items-center justify-center gap-[19px] max-md:gap-3 max-sm:gap-2">
                  <ArrowUpTrayIcon className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3 text-gray-500" />
                  <span className="text-sm max-md:text-xs text-gray-500 font-medium capitalize">
                    {selectedFile ? selectedFile.name : "Upload agreement"}
                  </span>
                </div>
              </Button>

              <Typography variant="small" className="text-gray-500 font-[380] mt-2 mb-2 text-xs max-md:text-xs">
                Accepted file type: PDF (Max size: 10MB)
              </Typography>

              {uploadError && (
                <Typography variant="small" className="text-red-500 font-[380] mb-4 text-xs max-md:text-xs">
                  {uploadError}
                </Typography>
              )}

              {selectedFile && !uploadError && (
                <Typography variant="small" className="text-green-500 font-[380] mb-4 text-xs max-md:text-xs">
                  ✓ File selected: {selectedFile.name}
                </Typography>
              )}

              <div className="flex flex-col sm:flex-row gap-4 max-md:gap-3 max-sm:gap-2">
                <Button
                  className="bg-dark-plum text-white hover:bg-light-purple capitalize text-sm max-md:text-xs py-2 max-md:py-1.5 max-sm:py-1 px-4 max-md:px-3 max-sm:px-2"
                  onClick={handleSubmit}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Uploading..." : "Submit"}
                </Button>
                <Button
                  className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize text-sm max-md:text-xs py-2 max-md:py-1.5 max-sm:py-1 px-4 max-md:px-3 max-sm:px-2"
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
          {(awaitReviewApplication() && userRole !== 'investor') && (
            <div>
              <Typography className="mb-2 font-[400] text-sm max-md:text-xs" color="gray">
                Waiting for investor to review.
              </Typography>
            </div>
          )}

          {/* In Progress Section (Admin View) */}
          {inProgressApplication() && (
            <div>
              <Typography className="mb-2 font-[400] text-sm max-md:text-xs" color="gray">
                Waiting for startup and investor to upload agreement.
              </Typography>
            </div>
          )}

          {/* In Progress Section (Admin View) */}
          {inProgressReuploadAgreement() && (
            <div>
              <Typography className="mb-2 font-[400] text-sm max-md:text-xs" color="gray">
                Waiting for startup and investor to reupload agreement.
              </Typography>
            </div>
          )}

          {/* Investor Review Section */}
          {canReviewApplication() && (
            <div className="mb-8 max-md:mb-6 max-sm:mb-4">
              <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                Application Decision
              </Typography>
              <Typography color="gray" className="mb-4 font-[400] text-sm max-md:text-xs">
                Dear investor, kindly indicate whether you accept or decline this application. 
                A message to the startup is required, regardless of your decision. 
                If you choose to accept, please include details on how to proceed with the remaining funding process. 
                If you decide to decline, please provide a polite and constructive reason for your decision.
              </Typography>
              <Textarea
                variant="outlined"
                label="Message"
                className="mb-6 max-md:mb-4 max-sm:mb-3 bg-white border border-gray-500 text-sm max-md:text-xs"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex flex-row justify-end gap-4 max-md:gap-3 max-sm:gap-2">
                <Button
                  className="bg-dark-plum text-white hover:bg-light-purple capitalize text-sm max-md:text-xs py-2 px-4"
                  onClick={handleAccept}
                >
                  Accept
                </Button>
                <Button
                  className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize text-sm max-md:text-xs py-2 px-4"
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
            <div className="mb-8 max-md:mb-6 max-sm:mb-4">
              <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
                Agreement Review
              </Typography>
              <Typography color="gray" className="mb-4 font-[400] text-sm max-md:text-xs">
                Approve the application if the agreements uploaded by both startup and investor match. 
                If decline, please provide a remark to startup and investor.
              </Typography>

              <Typography variant="small" className="text-gray-500 mb-2 text-xs max-md:text-xs">
                Click to view:
              </Typography>

              <div className="flex flex-col gap-2 mb-6 max-md:mb-4 max-sm:mb-3">
                <a
                  href={application.startup_agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep-purple-600 font-semibold underline text-sm max-md:text-xs cursor-pointer"
                >
                  Startup agreement
                </a>
                <a
                  href={application.investor_agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep-purple-600 font-semibold underline text-sm max-md:text-xs cursor-pointer"
                >
                  Investor agreement
                </a>
              </div>

              <Textarea
                variant="outlined"
                label="Message"
                className="mb-6 max-md:mb-4 max-sm:mb-3 bg-white border border-gray-500 text-gray-700 text-sm max-md:text-xs"
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
              />

              <div className="flex flex-row justify-end gap-4 max-md:gap-3 max-sm:gap-2">
                <Button
                  className="bg-dark-plum text-white hover:bg-light-purple capitalize text-sm max-md:text-xs py-2 px-4"
                  onClick={handleAdminApprove}
                  disabled={insufficientBalance()}
                >
                  Approve
                </Button>
                <Button
                  className="text-dark-plum hover:bg-light-purple hover:text-white border-none capitalize text-sm max-md:text-xs py-2 px-4"
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
              <Typography variant="h6" className="text-gray-500 mb-2 text-sm max-md:text-xs">
                Click to view:
              </Typography>

              <div className="flex flex-col gap-2 mb-6 max-md:mb-4 max-sm:mb-3">
                <a
                  href={application.startup_agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep-purple-600 font-semibold underline text-sm max-md:text-xs cursor-pointer"
                >
                  Startup agreement
                </a>
                <a
                  href={application.investor_agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep-purple-600 font-semibold underline text-sm max-md:text-xs cursor-pointer"
                >
                  Investor agreement
                </a>
              </div>
              <Typography className="mb-2 font-[400] text-sm max-md:text-xs" color="gray">
                Waiting for admin to review.
              </Typography>
            </div>
          )}

          {/* Completed Application Section */}
          {(completedApplication() || activeApplication()) && (
            <div>
              <Typography variant="h6" className="text-gray-500 mb-2 text-sm max-md:text-xs">
                Click to view:
              </Typography>

              <div className="flex flex-col gap-2 mb-6 max-md:mb-4 max-sm:mb-3">
                <a
                  href={application.startup_agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep-purple-600 font-semibold underline text-sm max-md:text-xs cursor-pointer"
                >
                  Startup agreement
                </a>
                <a
                  href={application.investor_agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep-purple-600 font-semibold underline text-sm max-md:text-xs cursor-pointer"
                >
                  Investor agreement
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 