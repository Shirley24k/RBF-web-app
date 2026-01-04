import { ArrowUpTrayIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Card, CardBody, IconButton, Input, Option, Select, Textarea, Typography } from "@material-tailwind/react";
import axios from "axios";
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import coinCirclingWallet from "../../assets/coin circling wallet.json";
import { AppButton } from "../../components/ui/AppButton";
import { Sidenav } from "../../components/ui/sidenav";
import { isValidPhoneNumber } from "../../lib/utils";
import { fundingStageOptions } from "../../utils/fundingStage";
import { industryOptions } from "../../utils/industryOptions";

interface ProposalFormData {
  // Company Overview
  title: string;
  company_name: string;
  company_industry: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  business_model: string;
  target_market: string;
  unique_value_proposition: string;
  competitive_advantage: string;
  business_goals: string;
  market_size: string;
  market_growth_rate: string;
  market_trends: string;
  competition_analysis: string;
  customer_segments: string;
  
  // Funding Requirements
  funding_amount: number;
  funding_stage: string;
  funding_purpose: string;
  
  // Financial Projections
  current_revenue: number;
  projected_revenue_12m: number;
  projected_revenue_24m: number;
  current_profit_margin: number;
  projected_profit_margin: number;
  break_even_point: string;
  cash_flow_analysis: string;
}

type SectionType = 'company' | 'funding' | 'financial';

export const ProposalManagement = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProposalId = searchParams.get('edit');
  const reviewProposalId = searchParams.get('review');
  const isEditMode = !!editProposalId;
  const isReviewMode = !!reviewProposalId;
  const isReadOnly = isReviewMode;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode || isReviewMode);
  const [currentSection, setCurrentSection] = useState<SectionType>('company');
  const [errors, setErrors] = useState<Partial<Record<keyof ProposalFormData, string>>>({});
  const [sectionComments, setSectionComments] = useState<{ [key in SectionType]?: Array<{message: string, user_type: string, user_name: string, created_at: string}> }>({});
  const [resolvedReviews, setResolvedReviews] = useState<{ [key in SectionType]?: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [draftComments, setDraftComments] = useState<{ [key in SectionType]?: string }>({});
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStaff = user.role === 'staff';
  
  // Startup owner info (fallback source when extraction misses fields)
  interface StartupInfo {
    name: string;
    company_name: string;
    company_sector: string;
    contact_no: string;
    user: { email: string };
  }
  const [startupInfo, setStartupInfo] = useState<StartupInfo | null>(null);

  // Form data state
  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    company_name: "",
    company_industry: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    business_model: "",
    target_market: "",
    unique_value_proposition: "",
    competitive_advantage: "",
    business_goals: "",
    market_size: "",
    market_growth_rate: "",
    market_trends: "",
    competition_analysis: "",
    customer_segments: "",
    funding_amount: 0,
    funding_stage: "",
    funding_purpose: "",
    current_revenue: 0,
    projected_revenue_12m: 0,
    projected_revenue_24m: 0,
    current_profit_margin: 0,
    projected_profit_margin: 0,
    break_even_point: "",
    cash_flow_analysis: "",
  });

  const sections: { key: SectionType; title: string; description: string }[] = [
    {
      key: 'company',
      title: 'Company Overview',
      description: 'Basic company information and business description'
    },
    {
      key: 'funding',
      title: 'Funding Requirements',
      description: 'Funding amount, stage, and purpose details'
    },
    {
      key: 'financial',
      title: 'Financial Projections',
      description: 'Financial analysis and use of funds'
    }
  ];

  const currentSectionIndex = sections.findIndex(s => s.key === currentSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Fetch proposal data if in edit or review mode
  useEffect(() => {
    if ((isEditMode || isReviewMode) && (editProposalId || reviewProposalId)) {
      const proposalId = editProposalId || reviewProposalId;
      fetchProposalData(proposalId!);
    }
    fetchStartupProfile();
  }, [isEditMode, isReviewMode, editProposalId, reviewProposalId]);

  const fetchProposalData = async (proposalId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/proposals/${proposalId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        const proposal = response.data.data;
        setFormData({
          title: String(proposal.title || ""),
          company_name: String(proposal.company_name || ""),
          company_industry: String(proposal.company_industry || ""),
          contact_person: String(proposal.contact_person || ""),
          contact_email: String(proposal.contact_email || ""),
          contact_phone: String(proposal.contact_phone || ""),
          business_model: String(proposal.business_model || ""),
          target_market: String(proposal.target_market || ""),
          unique_value_proposition: String(proposal.unique_value_proposition || ""),
          competitive_advantage: String(proposal.competitive_advantage || ""),
          business_goals: String(proposal.business_goals || ""),
          market_size: String(proposal.market_size || ""),
          market_growth_rate: String(proposal.market_growth_rate || ""),
          market_trends: String(proposal.market_trends || ""),
          competition_analysis: String(proposal.competition_analysis || ""),
          customer_segments: String(proposal.customer_segments || ""),
          funding_amount: Number(proposal.funding_amount || 0),
          funding_stage: String(proposal.funding_stage || ""),
          funding_purpose: String(proposal.funding_purpose || ""),
          current_revenue: Number(proposal.current_revenue || 0),
          projected_revenue_12m: Number(proposal.projected_revenue_12m || 0),
          projected_revenue_24m: Number(proposal.projected_revenue_24m || 0),
          current_profit_margin: Number(proposal.current_profit_margin || 0),
          projected_profit_margin: Number(proposal.projected_profit_margin || 0),
          break_even_point: String(proposal.break_even_point || ""),
          cash_flow_analysis: String(proposal.cash_flow_analysis || ""),
        });
        
        // If in review mode or staff edit mode, also fetch existing reviews
        if (isReviewMode || (isStaff && isEditMode)) {
          await fetchExistingReviews(proposalId);
        }
      }
    } catch (error: any) {
      console.error("Error fetching proposal:", error);
      alert("Failed to load proposal data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingReviews = async (proposalId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proposals/${proposalId}/reviews`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        const proposal = response.data.data;
        
        // Try to get review data from review_summary first, then from reviews array
        let reviewData = proposal.review_summary || {};
        
            // If review_summary is empty, try to parse from reviews array
              if (!reviewData.company && proposal.reviews && Array.isArray(proposal.reviews)) {
                const reviewsArray = proposal.reviews;
                reviewData = {
                  company: reviewsArray.find((r: any) => r.section_type === 'company') || {},
                  funding: reviewsArray.find((r: any) => r.section_type === 'funding') || {},
                  financial: reviewsArray.find((r: any) => r.section_type === 'financial') || {}
                };
              }
        
        setSectionComments({
          company: reviewData.company?.comments || [],
          funding: reviewData.funding?.comments || [],
          financial: reviewData.financial?.comments || []
        });
        
        setResolvedReviews({
          company: reviewData.company?.is_resolved || false,
          funding: reviewData.funding?.is_resolved || false,
          financial: reviewData.financial?.is_resolved || false
        });
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    }
  };
  
  const fetchStartupProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/startup/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200 && response.data?.data) {
        setStartupInfo(response.data.data);
      }
    } catch (error) {
      console.warn('Unable to fetch startup profile for fallback');
    }
  };

  // Validate individual field 
  const validateField = (name: keyof ProposalFormData, value: any): string | undefined => {
    if (typeof value === 'string') {
      if (!value.trim()) {
        return `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
      
      // Specific validation for email and phone
      if (name === 'contact_email') {
        if (!isValidEmail(value)) {
          return 'Please enter a valid email address';
        }
      }
      
      if (name === 'contact_phone') {
        if (!isValidPhoneNumber(value)) {
          return 'Please enter a valid phone number';
        }
      }
    } else if (typeof value === 'number') {
      if (value < 0) {
        return `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be positive`;
      }
      
      if (name.includes('margin') && (value < 0 || value > 100)) {
        return 'Profit margin must be between 0% and 100%';
      }
    }
    
    return undefined;
  };

  // Handle input change with validation 
  const handleInputChange = (name: keyof ProposalFormData, value: any) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    if (!error) {
      setErrors(prev => { const { [name]: _, ...rest } = prev as any; return rest; });
    }
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email?.trim() !== '' && emailRegex.test(email);
  };

  const handleDraftCommentChange = (section: SectionType, value: string) => {
    setDraftComments(prev => ({ ...prev, [section]: value }));
  };

  const submitDraftComment = (section: SectionType) => {
    const draftText = draftComments[section];
    if (draftText && draftText.trim() !== '') {
      const newComment = {
        message: draftText,
        user_type: isStaff ? 'staff' : 'startup_owner',
        user_name: isStaff ? 'Staff' : 'Startup Owner', // Will be replaced by backend with actual names
        created_at: new Date().toISOString()
      };
      
      // Add to local state for immediate UI update
      const existingComments = sectionComments[section] || [];
      setSectionComments(prev => ({ 
        ...prev, 
        [section]: [...existingComments, newComment] 
      }));
      setDraftComments(prev => ({ ...prev, [section]: '' }));
      
      // Send only the new comment to backend
      if (isStaff) {
        // For staff, we'll handle this in the staff response submission
        return;
      } else {
        // For startup owners, send immediately
        sendNewCommentToBackend(section, [newComment]);
      }
    }
  };

  const sendNewCommentToBackend = async (section: SectionType, newComments: Array<{message: string, user_type: string, user_name: string, created_at: string}>) => {
    if (!reviewProposalId) return;
    
    try {
      await axios.post(`${API_BASE_URL}/startup/reviews/${reviewProposalId}`, {
        reviews: {
          [section]: newComments
        }
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error: any) {
      console.error("Error sending new comment:", error);
      // Revert the local state if backend fails
      const existingComments = sectionComments[section] || [];
      setSectionComments(prev => ({ 
        ...prev, 
        [section]: existingComments.slice(0, -newComments.length)
      }));
      alert("Failed to save comment. Please try again.");
    }
  };

  const hasReview = (section: SectionType) => {
    return sectionComments[section] && sectionComments[section].length > 0;
  };

  const isReviewResolved = (section: SectionType) => {
    return resolvedReviews[section] === true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return; // Disable file selection in review mode
    
    const file = event.target.files?.[0];
    //check file is pdf
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError("Please select a PDF file to upload.");
      setSelectedFile(null);
    }
  };

  const handleUploadClick = () => {
    if (isReadOnly) return; // Disable upload in review mode
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAutoExtract = async () => {
    if (isReadOnly) return; // Disable extraction in review mode
    
    if (!selectedFile) {
      setUploadError("Please select a PDF file to upload.");
      return;
    }

    setIsProcessing(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const response = await axios.post(`${API_BASE_URL}/extract-proposal`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const extractedData = response.data.data;
        
        // Populate all form fields with extracted data
        const rawCompanyName = String(extractedData.company_name || "");
        const rawIndustry = String(extractedData.company_industry || "");
        const rawContactPerson = String(extractedData.contact_person || "");
        const rawContactEmail = String(extractedData.contact_email || "");
        const rawContactPhone = String(extractedData.contact_phone || "");

        const isMissing = (v: string | undefined) => !v || v === 'Null' || v.trim() === '';

        const fallbackCompanyName = isMissing(rawCompanyName)
          ? (startupInfo?.company_name || '')
          : rawCompanyName;
        const fallbackIndustry = isMissing(rawIndustry)
          ? (startupInfo?.company_sector || '')
          : rawIndustry;
        const fallbackContactPerson = isMissing(rawContactPerson)
          ? (startupInfo?.name || '')
          : rawContactPerson;
        const fallbackContactEmail = isMissing(rawContactEmail)
          ? (startupInfo?.user?.email || '')
          : rawContactEmail;
        const fallbackContactPhone = isMissing(rawContactPhone)
          ? (startupInfo?.contact_no || '')
          : rawContactPhone;

        setFormData({
          title: String(extractedData.title || ""),
          company_name: fallbackCompanyName,
          company_industry: fallbackIndustry,
          contact_person: fallbackContactPerson,
          contact_email: fallbackContactEmail,
          contact_phone: fallbackContactPhone,
          business_model: String(extractedData.business_model || ""),
          target_market: String(extractedData.target_market || ""),
          unique_value_proposition: String(extractedData.unique_value_proposition || ""),
          competitive_advantage: String(extractedData.competitive_advantage || ""),
          business_goals: String(extractedData.business_goals || ""),
          market_size: String(extractedData.market_size || ""),
          market_growth_rate: String(extractedData.market_growth_rate || ""),
          market_trends: String(extractedData.market_trends || ""),
          competition_analysis: String(extractedData.competition_analysis || ""),
          customer_segments: String(extractedData.customer_segments || ""),
          funding_amount: Number(extractedData.funding_amount || 0),
          funding_stage: String(extractedData.funding_stage || ""),
          funding_purpose: String(extractedData.funding_purpose || ""),
          current_revenue: Number(extractedData.current_revenue || 0),
          projected_revenue_12m: Number(extractedData.projected_revenue_12m || 0),
          projected_revenue_24m: Number(extractedData.projected_revenue_24m || 0),
          current_profit_margin: Number(extractedData.current_profit_margin || 0),
          projected_profit_margin: Number(extractedData.projected_profit_margin || 0),
          break_even_point: String(extractedData.break_even_point || ""),
          cash_flow_analysis: String(extractedData.cash_flow_analysis || ""),
        });
        
        // Clear any existing errors since we're populating with new data
        setErrors({});
        
        setSelectedFile(null);
        setUploadError("");
        
        // Show success message
        alert("Proposal data extracted successfully! Please review and edit the fields as needed.");
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.message || "Failed to extract proposal data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewSubmission = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if this is the final approval (all reviews completed and resolved)
      const isFinalApproval = Object.keys(sectionComments).every(section => 
        !hasReview(section as SectionType) || isReviewResolved(section as SectionType)
      );
      
      if (isFinalApproval) {
        await handleFinalApproval();
      } else {
        await handleRequestStaffReview();
      }
    } catch (error: any) {
      console.error("Error submitting reviews:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit reviews. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalApproval = async () => {
    try {
      // Final approval - change status to 'REVIEWED'
      const statusResponse = await axios.put(`${API_BASE_URL}/startup/review-proposals/${reviewProposalId}`, {
        status: 'REVIEWED'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (statusResponse.status === 200) {
        alert("Proposal review completed successfully!");
        navigate("/proposal-listings");
      }
    } catch (error: any) {
      console.error("Error completing review:", error);
      alert("Failed to complete review. Please try again.");
    }
  };

  const handleRequestStaffReview = async () => {
    try {
      // Request staff review - change status to 'REVIEWING'
      const statusResponse = await axios.put(`${API_BASE_URL}/startup/review-proposals/${reviewProposalId}`, {
        status: 'REVIEWING'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (statusResponse.status === 200) {
        alert("Reviews submitted successfully! Staff will review your feedback.");
        navigate("/proposal-listings");
      }
    } catch (error: any) {
      console.error("Error requesting staff review:", error);
      alert("Failed to request staff review. Please try again.");
    }
  };

  const handleUpdateProposal = async () => {
    // Submit-time guard for critical fields
    const submitErrors: Partial<Record<keyof ProposalFormData, string>> = {};
    if (!formData.company_industry || String(formData.company_industry).trim() === "") {
      submitErrors.company_industry = 'Company industry is required';
    }
    if (!formData.funding_stage || String(formData.funding_stage).trim() === "") {
      submitErrors.funding_stage = 'Funding stage is required';
    }
    if (!formData.funding_amount || Number(formData.funding_amount) <= 0) {
      submitErrors.funding_amount = 'Funding amount must be greater than 0';
    }
    if (Object.keys(submitErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...submitErrors }));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await axios.put(`${API_BASE_URL}/startup/proposals/${editProposalId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        alert("Proposal updated successfully!");
        navigate("/proposal-listings");
      }
    } catch (error: any) {
      console.error("Error updating proposal:", error);
      alert("Failed to update proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewProposal = async () => {
    // Submit-time guard for critical fields
    const submitErrors: Partial<Record<keyof ProposalFormData, string>> = {};
    if (!formData.company_industry || String(formData.company_industry).trim() === "") {
      submitErrors.company_industry = 'Company industry is required';
    }
    if (!formData.funding_stage || String(formData.funding_stage).trim() === "") {
      submitErrors.funding_stage = 'Funding stage is required';
    }
    if (!formData.funding_amount || Number(formData.funding_amount) <= 0) {
      submitErrors.funding_amount = 'Funding amount must be greater than 0';
    }
    if (Object.keys(submitErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...submitErrors }));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await axios.post(`${API_BASE_URL}/startup/proposals`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 201) {
        alert("Proposal created successfully!");
        navigate("/proposal-listings");
      }
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaffResponseSubmission = async () => {
    if (!isStaff || !editProposalId) return;
    
    // Check if there are any staff responses
    const hasAnyResponse = Object.values(sectionComments).some(comments => 
      comments && comments.some(comment => comment.user_type === 'staff')
    );
    
    if (!hasAnyResponse) {
      return;
    }
    
    try {
      // Extract only staff responses for submission
      const staffResponses = Object.keys(sectionComments).reduce((acc, section) => {
        const staffComments = sectionComments[section as SectionType]?.filter(comment => comment.user_type === 'staff') || [];
        if (staffComments.length > 0) {
          acc[section as SectionType] = staffComments;
        }
        return acc;
      }, {} as { [key in SectionType]?: Array<{message: string, user_type: string, user_name: string, created_at: string}> });

      const response = await axios.post(`${API_BASE_URL}/staff/proposals/${editProposalId}/responses`, {
        responses: staffResponses
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error: any) {
      console.error("Error submitting staff responses:", error);
      alert("Failed to submit staff responses. Please try again.");
    } 
  };

  const handleCreateProposal = async () => {
    if (isStaff){
      await handleStaffResponseSubmission();
    }

    if (isEditMode) {
      await handleUpdateProposal();
      return;
    } else if (isReviewMode) {
      await handleReviewSubmission();
      return;
    } else {
      await handleCreateNewProposal();
      return;
    }
  };

  const handleMarkResolved = (section: SectionType) => {
    const newResolvedStatus = !resolvedReviews[section];
    setResolvedReviews(prev => ({ ...prev, [section]: newResolvedStatus }));
    
    // Save resolution status to backend
    if (reviewProposalId) {
      axios.patch(`${API_BASE_URL}/startup/reviews/${reviewProposalId}/resolution`, {
        section: section,
        is_resolved: newResolvedStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).catch(error => {
        console.error("Error updating resolution status:", error);
        // Revert the local state if backend update fails
        setResolvedReviews(prev => ({ ...prev, [section]: !newResolvedStatus }));
        alert("Failed to update resolution status. Please try again.");
      });
    }
  };

  const resetForm = () => {
    if (isReadOnly) return; // Disable reset in review mode
    
    setFormData({
      title: "",
      company_name: "",
      company_industry: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      business_model: "",
      target_market: "",
      unique_value_proposition: "",
      competitive_advantage: "",
      business_goals: "",
      market_size: "",
      market_growth_rate: "",
      market_trends: "",
      competition_analysis: "",
      customer_segments: "",
      funding_amount: 0,
      funding_stage: "",
      funding_purpose: "",
      current_revenue: 0,
      projected_revenue_12m: 0,
      projected_revenue_24m: 0,
      current_profit_margin: 0,
      projected_profit_margin: 0,
      break_even_point: "",
      cash_flow_analysis: "",
    });
    setSelectedFile(null);
    setUploadError("");
    setCurrentSection('company');
    setErrors({}); // Clear errors on reset
  };

  const nextSection = () => {
    if (!isLastSection) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSection(sections[nextIndex].key);
    }
  };

  const prevSection = () => {
    if (!isFirstSection) {
      const prevIndex = currentSectionIndex - 1;
      setCurrentSection(sections[prevIndex].key);
    }
  };

  const canProceedToNext = () => {
    switch (currentSection) {
      case 'company':
        // Check if all Company Overview fields have valid values
        return (
          (formData.title?.trim() || "") !== "" && 
          (formData.company_name?.trim() || "") !== "" && 
          (formData.company_industry?.trim() || "") !== "" &&
          (formData.contact_person?.trim() || "") !== "" && 
          (formData.contact_email?.trim() || "") !== "" && 
          (formData.contact_phone?.trim() || "") !== "" &&
          (formData.business_model?.trim() || "") !== "" && 
          (formData.target_market?.trim() || "") !== "" && 
          (formData.unique_value_proposition?.trim() || "") !== "" &&
          (formData.competitive_advantage?.trim() || "") !== "" && 
          (formData.business_goals?.trim() || "") !== "" && 
          (formData.market_size?.trim() || "") !== "" &&
          (formData.market_growth_rate?.trim() || "") !== "" && 
          (formData.market_trends?.trim() || "") !== "" && 
          (formData.competition_analysis?.trim() || "") !== "" &&
          (formData.customer_segments?.trim() || "") !== ""
        );
      
      case 'funding':
        // Check if all Funding Requirements fields have valid values
        return (
          formData.funding_amount > 0 && 
          (formData.funding_stage?.trim() || "") !== "" && 
          (formData.funding_purpose?.trim() || "") !== ""
        );
      
      case 'financial':
        // Check if all Financial Projections fields have valid values
        return (
          formData.current_revenue >= 0 && formData.projected_revenue_12m >= 0 && formData.projected_revenue_24m >= 0 &&
          formData.current_profit_margin >= 0 && formData.projected_profit_margin >= 0 &&
          (formData.break_even_point?.trim() || "") !== "" && 
          (formData.cash_flow_analysis?.trim() || "") !== ""
        );
      
      default:
        return false;
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'company':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Proposal Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.title}
                  success={!errors.title && (formData.title || "") !== ""}
                />
                {!!errors.title && (
                  <span className="text-red-500 text-sm">{errors.title}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Company Name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.company_name}
                  success={!errors.company_name && (formData.company_name || "") !== ""}
                />
                {!!errors.company_name && (
                  <span className="text-red-500 text-sm">{errors.company_name}</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Select
                  label="Company Industry"
                  value={formData.company_industry}
                  onChange={(value) => handleInputChange('company_industry', value || "")}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.company_industry}
                  success={!errors.company_industry && (formData.company_industry || "") !== ""}
                >
                  {industryOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                {!!errors.company_industry && (
                  <span className="text-red-500 text-sm">{errors.company_industry}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.contact_person}
                  success={!errors.contact_person && (formData.contact_person || "") !== ""}
                />
                {!!errors.contact_person && (
                  <span className="text-red-500 text-sm">{errors.contact_person}</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Contact Email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.contact_email}
                  success={!errors.contact_email && (formData.contact_email || "") !== ""}
                />
                {!!errors.contact_email && (
                  <span className="text-red-500 text-sm">{errors.contact_email}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Contact Phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.contact_phone}
                  success={!errors.contact_phone && (formData.contact_phone || "") !== ""}
                />
                {!!errors.contact_phone && (
                  <span className="text-red-500 text-sm">{errors.contact_phone}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Business Model"
                value={formData.business_model}
                onChange={(e) => handleInputChange('business_model', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.business_model}
                success={!errors.business_model && (formData.business_model || "") !== ""}
              />
              {!!errors.business_model && (
                <span className="text-red-500 text-sm">{errors.business_model}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Target Market"
                value={formData.target_market}
                onChange={(e) => handleInputChange('target_market', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.target_market}
                success={!errors.target_market && (formData.target_market || "") !== ""}
              />
              {!!errors.target_market && (
                <span className="text-red-500 text-sm">{errors.target_market}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Unique Value Proposition"
                value={formData.unique_value_proposition}
                onChange={(e) => handleInputChange('unique_value_proposition', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.unique_value_proposition}
                success={!errors.unique_value_proposition && (formData.unique_value_proposition || "") !== ""}
              />
              {!!errors.unique_value_proposition && (
                <span className="text-red-500 text-sm">{errors.unique_value_proposition}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Competitive Advantage"
                value={formData.competitive_advantage}
                onChange={(e) => handleInputChange('competitive_advantage', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.competitive_advantage}
                success={!errors.competitive_advantage && (formData.competitive_advantage || "") !== ""}
              />
              {!!errors.competitive_advantage && (
                <span className="text-red-500 text-sm">{errors.competitive_advantage}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Business Goals"
                value={formData.business_goals}
                onChange={(e) => handleInputChange('business_goals', e.target.value)}
                rows={4}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.business_goals}
                success={!errors.business_goals && (formData.business_goals || "") !== ""}
              />
              {!!errors.business_goals && (
                <span className="text-red-500 text-sm">{errors.business_goals}</span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Market Size"
                  value={formData.market_size}
                  onChange={(e) => handleInputChange('market_size', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.market_size}
                  success={!errors.market_size && (formData.market_size || "") !== ""}
                />
                {!!errors.market_size && (
                  <span className="text-red-500 text-sm">{errors.market_size}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Market Growth Rate"
                  value={formData.market_growth_rate}
                  onChange={(e) => handleInputChange('market_growth_rate', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.market_growth_rate}
                  success={!errors.market_growth_rate && (formData.market_growth_rate || "") !== ""}
                />
                {!!errors.market_growth_rate && (
                  <span className="text-red-500 text-sm">{errors.market_growth_rate}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Market Trends"
                value={formData.market_trends}
                onChange={(e) => handleInputChange('market_trends', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.market_trends}
                success={!errors.market_trends && (formData.market_trends || "") !== ""}
              />
              {!!errors.market_trends && (
                <span className="text-red-500 text-sm">{errors.market_trends}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Competition Analysis"
                value={formData.competition_analysis}
                onChange={(e) => handleInputChange('competition_analysis', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.competition_analysis}
                success={!errors.competition_analysis && (formData.competition_analysis || "") !== ""}
              />
              {!!errors.competition_analysis && (
                <span className="text-red-500 text-sm">{errors.competition_analysis}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Customer Segments"
                value={formData.customer_segments}
                onChange={(e) => handleInputChange('customer_segments', e.target.value)}
                rows={3}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.customer_segments}
                success={!errors.customer_segments && (formData.customer_segments || "") !== ""}
              />
              {!!errors.customer_segments && (
                <span className="text-red-500 text-sm">{errors.customer_segments}</span>
              )}
            </div>
            
            {/* Comments Section */}
            {(isEditMode || isReviewMode) && renderCommentBox('company')}
          </div>
        );

      case 'funding':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Funding Amount (RM)"
                  type="number"
                  value={formData.funding_amount}
                  onChange={(e) => handleInputChange('funding_amount', parseFloat(e.target.value) || 0)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.funding_amount}
                  success={!errors.funding_amount && (formData.funding_amount || 0) > 0}
                />
                {!!errors.funding_amount && (
                  <span className="text-red-500 text-sm">{errors.funding_amount}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Select
                  label="Funding Stage"
                  value={formData.funding_stage}
                  onChange={(value) => handleInputChange('funding_stage', value || "")}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.funding_stage}
                  success={!errors.funding_stage && (formData.funding_stage || "") !== ""}
                >
                  {fundingStageOptions.map(stage => (
                    <Option key={stage.value} value={stage.value}>{stage.label}</Option>
                  ))}
                </Select>
                {!!errors.funding_stage && (
                  <span className="text-red-500 text-sm">{errors.funding_stage}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Funding Purpose"
                value={formData.funding_purpose}
                onChange={(e) => handleInputChange('funding_purpose', e.target.value)}
                rows={4}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.funding_purpose}
                success={!errors.funding_purpose && (formData.funding_purpose || "") !== ""}
              />
              {!!errors.funding_purpose && (
                <span className="text-red-500 text-sm">{errors.funding_purpose}</span>
              )}
            </div>
            
            {/* Comments Section */}
            {(isEditMode || isReviewMode) && renderCommentBox('funding')}
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Current Revenue (RM)"
                  type="number"
                  value={formData.current_revenue}
                  onChange={(e) => handleInputChange('current_revenue', parseFloat(e.target.value) || 0)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.current_revenue}
                  success={!errors.current_revenue}
                />
                {!!errors.current_revenue && (
                  <span className="text-red-500 text-sm">{errors.current_revenue}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Current Profit Margin (%)"
                  type="number"
                  value={formData.current_profit_margin}
                  onChange={(e) => handleInputChange('current_profit_margin', parseFloat(e.target.value) || 0)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.current_profit_margin}
                  success={!errors.current_profit_margin}
                />
                {!!errors.current_profit_margin && (
                  <span className="text-red-500 text-sm">{errors.current_profit_margin}</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Projected Revenue 12M (RM)"
                  type="number"
                  value={formData.projected_revenue_12m}
                  onChange={(e) => handleInputChange('projected_revenue_12m', parseFloat(e.target.value) || 0)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.projected_revenue_12m}
                  success={!errors.projected_revenue_12m}
                />
                {!!errors.projected_revenue_12m && (
                  <span className="text-red-500 text-sm">{errors.projected_revenue_12m}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Projected Revenue 24M (RM)"
                  type="number"
                  value={formData.projected_revenue_24m}
                  onChange={(e) => handleInputChange('projected_revenue_24m', parseFloat(e.target.value) || 0)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.projected_revenue_24m}
                  success={!errors.projected_revenue_24m}
                />
                {!!errors.projected_revenue_24m && (
                  <span className="text-red-500 text-sm">{errors.projected_revenue_24m}</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  label="Projected Profit Margin (%)"
                  type="number"
                  value={formData.projected_profit_margin}
                  onChange={(e) => handleInputChange('projected_profit_margin', parseFloat(e.target.value) || 0)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.projected_profit_margin}
                  success={!errors.projected_profit_margin}
                />
                {!!errors.projected_profit_margin && (
                  <span className="text-red-500 text-sm">{errors.projected_profit_margin}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Break Even Point"
                  value={formData.break_even_point}
                  onChange={(e) => handleInputChange('break_even_point', e.target.value)}
                  required
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-gray-50" : ""}
                  error={!!errors.break_even_point}
                  success={!errors.break_even_point && (formData.break_even_point || "") !== ""}
                />
                {!!errors.break_even_point && (
                  <span className="text-red-500 text-sm">{errors.break_even_point}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Textarea
                label="Cash Flow Analysis"
                value={formData.cash_flow_analysis}
                onChange={(e) => handleInputChange('cash_flow_analysis', e.target.value)}
                rows={4}
                required
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-gray-50" : ""}
                error={!!errors.cash_flow_analysis}
                success={!errors.cash_flow_analysis && (formData.cash_flow_analysis || "") !== ""}
              />
              {!!errors.cash_flow_analysis && (
                <span className="text-red-500 text-sm">{errors.cash_flow_analysis}</span>
              )}
            </div>
            
            {/* Comments Section */}
            {(isEditMode || isReviewMode) && renderCommentBox('financial')}
          </div>
        );

      default:
        return null;
    }
  };

  const renderCommentBox = (section: SectionType) => {
    const hasComments = sectionComments[section] && sectionComments[section].length > 0;
    const isResolved = resolvedReviews[section];
    
    return (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Typography variant="small" className="font-medium text-gray-700">
            Comments
          </Typography>
          {isResolved && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Resolved
            </span>
          )}
        </div>
        
        {/* Existing Comments */}
        <div className="space-y-3 mb-3">
          {hasComments && sectionComments[section]?.map((comment, index) => (
            <div key={index} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                comment.user_type === 'staff' ? 'bg-green-900' : 'bg-light-purple'
              }`}>
                <span className="text-white text-xs font-medium">
                  {comment.user_type === 'staff' ? 'ST' : 'SO'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Typography variant="small" className="font-medium text-gray-900">
                    {comment.user_name}
                  </Typography>
                  <Typography variant="small" className="text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <Typography variant="small" className="text-gray-700">
                    {comment.message}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Comment Input */}
        {(isStaff || isReviewMode) && !isResolved && (
          <div className="space-y-2">
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isStaff ? 'bg-green-900' : 'bg-light-purple'}`}>
                <span className="text-white text-xs font-medium">{isStaff ? 'ST' : 'SO'}</span>
              </div>
              <div className="flex-1">
                <Textarea
                  value={draftComments[section] || ''}
                  onChange={(e) => handleDraftCommentChange(section, e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="border-gray-300 focus:border-dark-plum text-sm"
                />
              </div>
            </div>
            {draftComments[section] && draftComments[section].trim() !== '' && (
              <div className="flex justify-end">
                <IconButton
                  size="sm"
                  variant="text"
                  className="bg-transparent text-dark-plum text-xs px-3 py-1m"
                  onClick={() => submitDraftComment(section)}
                >
                  <CheckIcon className="h-5 w-5" />
                </IconButton>
              </div>
            )}
          </div>
        )}

        {/* Mark Resolved Button - Only show if there are comments and user is in review mode */}
        {isReviewMode && !isStaff && hasComments && (
          <div className="flex justify-end mt-3">
            <AppButton
              size="sm"
              variant={isResolved ? "primary" : "outline"}
              className={`${
                isResolved 
                  ? 'bg-green-900 text-white border-green-900 hover:bg-green-900 hover:text-white' 
                  : 'text-green-600 border-green-600 hover:bg-green-50 hover:text-green-600'
              }`}
              onClick={() => handleMarkResolved(section)}
              disabled={isResolved}
            >
              {isResolved ? 'Marked Resolved' : 'Mark Resolved'}
            </AppButton>
          </div>
        )}
      </div>
    )
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Lottie 
          animationData={coinCirclingWallet} 
          loop={true} 
          autoplay={true}
          style={{ width: '15%', height: '15%' }}
        />
        <Typography variant="h4" className="text-xl max-md:text-base font-bold">Loading...</Typography>
      </div>  
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0 z-10">
        <Sidenav active="proposal" />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="proposal" />
      </div>

      {/* Main Content */}
      <div className={`ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 transition-all duration-300`}>
        <div className="max-w-7xl px-4 max-md:px-6 max-sm:px-4 mx-0">
          {/* Header */}
          <div className="text-start mb-8 max-md:mb-6 max-sm:mb-4">
            <div className="py-8 max-md:py-6 max-sm:py-4">
              <Typography variant="h4" color="blue-gray" className="text-3xl max-md:text-2xl max-sm:text-xl mb-2">
                {isReviewMode ? 'Review Proposal' : isEditMode ? 'Edit Proposal' : 'Create Proposal'}
              </Typography>
              <Typography variant="paragraph" color="gray" className="text-lg max-sm:text-sm">
                {isReviewMode 
                  ? 'Review your business proposal before submission for RBF funding'
                  : isEditMode 
                    ? 'Update your existing business proposal for RBF funding applications'
                    : 'Build your business proposal step by step for RBF funding applications'
                }
              </Typography>
            </div>
          </div>

          {/* Auto-extraction Section - Hidden in review mode */}
          {!isReviewMode && (
            <Card className="mb-8 max-md:mb-6 max-sm:mb-4">
              <CardBody className="p-6 max-md:p-4 max-sm:p-3">
                <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="h-6 w-6" />
                  Auto-Extract from Document
                </Typography>
                <Typography variant="paragraph" color="gray" className="mb-4">
                  Already have a proposal? 
                  Upload your existing business proposal document and let our AI extract the key information automatically.
                </Typography>
                
                <div className="flex flex-col sm:flex-row gap-4 max-md:gap-3 max-sm:gap-2 items-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                  
                  <AppButton 
                    variant="outline"
                    className="!bg-transparent"
                    size="lg"
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpTrayIcon className="h-5 h-5 text-gray-500" />
                      <span className="text-gray-500 font-medium">
                        {selectedFile ? selectedFile.name : "Upload Proposal"}
                      </span>
                    </div>
                  </AppButton>
                </div>

                <Typography variant="small" className="text-gray-500 mt-2">
                  Accepted file type: PDF (Max size: 10MB)
                </Typography>

                {uploadError && (
                  <Typography variant="small" className="text-red-500 mt-2">
                    {uploadError}
                  </Typography>
                )}

                {selectedFile && !uploadError && (
                  <div className="flex flex-col items-start gap-2">
                      <Typography variant="small" className="text-green-500 mt-2">
                      ✓ File selected: {selectedFile.name}
                      </Typography>

                      <AppButton
                      variant="primary"
                      size="lg"
                      onClick={handleAutoExtract}
                      disabled={isProcessing}
                      loading={isProcessing}
                      >
                        Extract Details
                      </AppButton>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
          <div className="flex flex-row gap-6 w-full justify-center">
            {/* Main Content - Takes full width */}
            <div className="w-full min-w-0">          
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {sections.map((section, index) => (
                    <div key={section.key} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                        index < currentSectionIndex 
                          ? 'bg-green-500 text-white' 
                          : index === currentSectionIndex 
                            ? 'bg-dark-plum text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index < currentSectionIndex ? '✓' : index + 1}
                      </div>
                      <Typography variant="small" className={`text-center ${index === currentSectionIndex ? 'text-dark-plum font-semibold' : 'text-gray-500'}`}>
                        {section.title}
                      </Typography>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-dark-plum to-light-purple h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              
            {/* Current Section Form */}
              <Card className="mb-8 max-md:mb-6 max-sm:mb-4">
                <CardBody className="p-6 max-md:p-4 max-sm:p-3">
                  <div className="mb-6">
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                      {sections[currentSectionIndex].title}
                    </Typography>
                    <Typography variant="paragraph" color="gray">
                      {sections[currentSectionIndex].description}
                    </Typography>
                  </div>
                  
                  {renderSectionContent()}

                  {/* Section Navigation */}
                  <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                      {/* Reset button - Hidden in review mode */}
                      {!isReviewMode && (
                      <div className="flex justify-end w-full">
                        <AppButton
                          variant="outline"
                          size="md"
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          Reset Form
                        </AppButton>
                      </div>
                      )}
                    

                    <div className="flex justify-between w-full">
                      <AppButton
                        variant="outline"
                        size="md"
                        onClick={prevSection}
                        disabled={isFirstSection}
                      >
                        <span className="flex items-center gap-2">
                          <ChevronLeftIcon className="h-4 w-4" />
                          Previous
                        </span>
                      </AppButton>
                      
                      {isLastSection ? (
                        <AppButton
                          variant="primary"
                          size="md"
                          onClick={handleCreateProposal}
                          disabled={isSubmitting || (!isReviewMode && !canProceedToNext())}
                          loading={isSubmitting}
                        >
                          {
                          isEditMode ? 'Update Proposal' :
                          isReviewMode ? 
                            (Object.keys(sectionComments).every(section => 
                              !hasReview(section as SectionType) || isReviewResolved(section as SectionType)
                            ) ? 'Complete Review' : 'Request Staff Review') : 
                            'Create Proposal'
                        }
                        </AppButton>
                      ) : (
                        <AppButton
                          variant="primary"
                          size="md"
                          onClick={nextSection}
                          disabled={!canProceedToNext()}
                        >
                          <span className="flex items-center gap-2">
                            Next
                            <ChevronRightIcon className="h-4 w-4" />
                          </span>
                        </AppButton>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};