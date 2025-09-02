import { ArrowUpTrayIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, Input, Option, Select, Spinner, Textarea, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { isValidPhoneNumber } from "../../lib/utils";
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
  const [touchedFields, setTouchedFields] = useState<Set<keyof ProposalFormData>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        
      }
    } catch (error: any) {
      console.error("Error fetching proposal:", error);
      alert("Failed to load proposal data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validate individual field (same pattern as StartupRegisterPage.tsx)
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

  // Handle input change with validation (same pattern as StartupRegisterPage.tsx)
  const handleInputChange = (name: keyof ProposalFormData, value: any) => {
    if (!isReadOnly) {
      // Mark field as touched
      setTouchedFields(prev => new Set(prev).add(name));
      
      // Update the field value
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validate the field and update errors
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email?.trim() !== '' && emailRegex.test(email);
  };

  // Use the utility function for phone validation

  // Check if field should show error (same pattern as StartupRegisterPage.tsx)
  const shouldShowError = (fieldName: keyof ProposalFormData): boolean => {
    return !isReadOnly && touchedFields.has(fieldName) && errors[fieldName] !== undefined;
  };

  // Check if field should show success (same pattern as StartupRegisterPage.tsx)
  const shouldShowSuccess = (fieldName: keyof ProposalFormData): boolean => {
    return !isReadOnly && touchedFields.has(fieldName) && errors[fieldName] === undefined && formData[fieldName] !== "" && formData[fieldName] !== 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return; // Disable file selection in review mode
    
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
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
        setFormData({
          title: String(extractedData.title || ""),
          company_name: String(extractedData.company_name || ""),
          company_industry: String(extractedData.company_industry || ""),
          contact_person: String(extractedData.contact_person || ""),
          contact_email: String(extractedData.contact_email || ""),
          contact_phone: String(extractedData.contact_phone || ""),
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
        
        // Clear any existing errors and touched fields since we're populating with new data
        setErrors({});
        setTouchedFields(new Set());
        
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

  const handleCreateProposal = async () => {
    if (isReviewMode) {
      // Handle review functionality - update proposal status to 'reviewed'
      try {
        setIsSubmitting(true);
        
        // Update proposal status to 'reviewed'
        const response = await axios.put(`${API_BASE_URL}/startup/review-proposals/${reviewProposalId}`, {
          status: 'REVIEWED'
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 200) {
          alert("Proposal reviewed successfully!");
          navigate("/proposal-listings");
        }
      } catch (error: any) {
        console.error("Error updating proposal status:", error);
        const errorMessage = error.response?.data?.message || "Failed to update proposal status. Please try again.";
        alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editProposalId) {
        // Update existing proposal
        const response = await axios.put(`${API_BASE_URL}/startup/proposals/${editProposalId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 200) {
          alert("Proposal updated successfully!");
          navigate("/proposal-listings");
        }
      } else {
        // Create new proposal
        const response = await axios.post(`${API_BASE_URL}/startup/proposals`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 201) {
          alert("Proposal created successfully!");
          navigate("/proposal-listings");
        }
      }
    } catch (error: any) {
      console.error("Error saving proposal:", error);
      const action = isEditMode ? "updating" : "creating";
      alert(`Failed to ${action} proposal. Please try again.`);
    } finally {
      setIsSubmitting(false);
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
    setTouchedFields(new Set()); // Clear touched fields on reset
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
                  error={shouldShowError('title')}
                  success={shouldShowSuccess('title')}
                />
                {shouldShowError('title') && (
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
                  error={shouldShowError('company_name')}
                  success={shouldShowSuccess('company_name')}
                />
                {shouldShowError('company_name') && (
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
                  error={shouldShowError('company_industry')}
                  success={shouldShowSuccess('company_industry')}
                >
                  {industryOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                {shouldShowError('company_industry') && (
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
                  error={shouldShowError('contact_person')}
                  success={shouldShowSuccess('contact_person')}
                />
                {shouldShowError('contact_person') && (
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
                  error={shouldShowError('contact_email')}
                  success={shouldShowSuccess('contact_email')}
                />
                {shouldShowError('contact_email') && (
                  <span className="text-red-500 text-sm">{errors.contact_email}</span>
                )}
                {shouldShowSuccess('contact_email') && (
                  <span className="text-green-500 text-sm">✓ Valid email address</span>
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
                  error={shouldShowError('contact_phone')}
                  success={shouldShowSuccess('contact_phone')}
                />
                {shouldShowError('contact_phone') && (
                  <span className="text-red-500 text-sm">{errors.contact_phone}</span>
                )}
                {shouldShowSuccess('contact_phone') && (
                  <span className="text-green-500 text-sm">✓ Valid phone number</span>
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
                error={shouldShowError('business_model')}
                success={shouldShowSuccess('business_model')}
              />
              {shouldShowError('business_model') && (
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
                error={shouldShowError('target_market')}
                success={shouldShowSuccess('target_market')}
              />
              {shouldShowError('target_market') && (
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
                error={shouldShowError('unique_value_proposition')}
                success={shouldShowSuccess('unique_value_proposition')}
              />
              {shouldShowError('unique_value_proposition') && (
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
                error={shouldShowError('competitive_advantage')}
                success={shouldShowSuccess('competitive_advantage')}
              />
              {shouldShowError('competitive_advantage') && (
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
                error={shouldShowError('business_goals')}
                success={shouldShowSuccess('business_goals')}
              />
              {shouldShowError('business_goals') && (
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
                  error={shouldShowError('market_size')}
                  success={shouldShowSuccess('market_size')}
                />
                {shouldShowError('market_size') && (
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
                  error={shouldShowError('market_growth_rate')}
                  success={shouldShowSuccess('market_growth_rate')}
                />
                {shouldShowError('market_growth_rate') && (
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
                error={shouldShowError('market_trends')}
                success={shouldShowSuccess('market_trends')}
              />
              {shouldShowError('market_trends') && (
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
                error={shouldShowError('competition_analysis')}
                success={shouldShowSuccess('competition_analysis')}
              />
              {shouldShowError('competition_analysis') && (
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
                error={shouldShowError('customer_segments')}
                success={shouldShowSuccess('customer_segments')}
              />
              {shouldShowError('customer_segments') && (
                <span className="text-red-500 text-sm">{errors.customer_segments}</span>
              )}
            </div>
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
                  error={shouldShowError('funding_amount')}
                  success={shouldShowSuccess('funding_amount')}
                />
                {shouldShowError('funding_amount') && (
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
                  error={shouldShowError('funding_stage')}
                  success={shouldShowSuccess('funding_stage')}
                >
                  <Option value="seed">Seed</Option>
                  <Option value="series_a">Series A</Option>
                  <Option value="series_b">Series B</Option>
                </Select>
                {shouldShowError('funding_stage') && (
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
                error={shouldShowError('funding_purpose')}
                success={shouldShowSuccess('funding_purpose')}
              />
              {shouldShowError('funding_purpose') && (
                <span className="text-red-500 text-sm">{errors.funding_purpose}</span>
              )}
            </div>
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
                  error={shouldShowError('current_revenue')}
                  success={shouldShowSuccess('current_revenue')}
                />
                {shouldShowError('current_revenue') && (
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
                  error={shouldShowError('current_profit_margin')}
                  success={shouldShowSuccess('current_profit_margin')}
                />
                {shouldShowError('current_profit_margin') && (
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
                  error={shouldShowError('projected_revenue_12m')}
                  success={shouldShowSuccess('projected_revenue_12m')}
                />
                {shouldShowError('projected_revenue_12m') && (
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
                  error={shouldShowError('projected_revenue_24m')}
                  success={shouldShowSuccess('projected_revenue_24m')}
                />
                {shouldShowError('projected_revenue_24m') && (
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
                  error={shouldShowError('projected_profit_margin')}
                  success={shouldShowSuccess('projected_profit_margin')}
                />
                {shouldShowError('projected_profit_margin') && (
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
                  error={shouldShowError('break_even_point')}
                  success={shouldShowSuccess('break_even_point')}
                />
                {shouldShowError('break_even_point') && (
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
                error={shouldShowError('cash_flow_analysis')}
                success={shouldShowSuccess('cash_flow_analysis')}
              />
              {shouldShowError('cash_flow_analysis') && (
                <span className="text-red-500 text-sm">{errors.cash_flow_analysis}</span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="w-8 h-8 border-4 border-dark-plum border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="proposal" />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="proposal" />
      </div>

      {/* Main Content */}
      <div className={`ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 transition-all duration-300`}>
        <div className="max-w-4xl px-4 max-md:px-6 max-sm:px-4 mx-auto">
          {/* Header */}
          <div className="text-center mb-8 max-md:mb-6 max-sm:mb-4">
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
                  
                  <Button 
                    className="border border-solid border-[#574964c7] rounded-[5px] bg-transparent shadow-none w-auto capitalize text-sm font-semibold"
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpTrayIcon className="h-5 h-5 text-gray-500" />
                      <span className="text-gray-500 font-medium">
                        {selectedFile ? selectedFile.name : "Upload Proposal"}
                      </span>
                    </div>
                  </Button>
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

                      <Button
                      className="bg-dark-plum hover:bg-light-purple text-white capitalize text-sm font-semibold"
                      onClick={handleAutoExtract}
                      disabled={isProcessing}
                      >
                      Extract Details
                      </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

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
                    <Button
                      variant="outlined"
                      className="border-gray-300 text-gray-600 hover:border-gray-400 px-4 py-2 capitalize text-sm font-semibold"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Reset Form
                    </Button>
                  </div>
                  )}
                

                <div className="flex justify-between w-full">
                  <Button
                    variant="outlined"
                    className="border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white px-6 max-sm:px-2 py-2 capitalize text-sm font-semibold"
                    onClick={prevSection}
                    disabled={isFirstSection}
                  >
                    <span className="flex items-center gap-2">
                      <ChevronLeftIcon className="h-4 w-4" />
                      Previous
                    </span>
                  </Button>
                  
                  {isLastSection ? (
                    <Button
                      className="bg-dark-plum hover:bg-light-purple text-white px-6 max-sm:px-2 py-2 capitalize text-sm font-semibold"
                      onClick={handleCreateProposal}
                      disabled={isSubmitting || (!isReviewMode && !canProceedToNext())}
                      size="lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          {isReviewMode ? 'Processing...' : isEditMode ? 'Updating...' : 'Creating...'}
                        </span>
                      ) : (
                        isReviewMode ? 'Review Proposal' : isEditMode ? 'Update Proposal' : 'Create Proposal'
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="bg-dark-plum hover:bg-light-purple text-white px-6 max-sm:px-2 py-2 capitalize text-sm font-semibold"
                      onClick={nextSection}
                      disabled={!canProceedToNext()}
                    >
                      <span className="flex items-center gap-2">
                        Next
                        <ChevronRightIcon className="h-4 w-4" />
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};