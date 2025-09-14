import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, Typography } from "@material-tailwind/react";
import axios from "axios";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingFiles from "../../assets/Loading Files.json";
import hourglass from "../../assets/hourglass.json";
import walkingMan from "../../assets/walking.json";
import { Sidenav } from "../../components/sidenav";

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
}

export const ProcessingFundingPage = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0); // Overall progress from 0 to 100
  const [isProcessing, setIsProcessing] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const processingSteps: ProcessingStep[] = [
    {
      id: 'submit-application',
      title: 'Submit Application',
      description: 'Processing your funding request and creating application',
      estimatedTime: '30-60 seconds'
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Analyzing business proposal for risk factors and compliance',
      estimatedTime: '45-90 seconds'
    },
    {
      id: 'investor-matching',
      title: 'Investor Matching',
      description: 'Finding suitable investors based on your requirements',
      estimatedTime: '60-120 seconds'
    }
  ];

  useEffect(() => {
    // Start processing steps - proposal ID will be used to create application
    processApplicationSteps();
  }, []);

  const processApplicationSteps = async () => {
    try {
      // Step 1: Submit Application (starts and stops at 0% progress)
      setCurrentStep(0);
      setOverallProgress(0);
      
      // Get proposal ID from location state
      const proposalId = location.state?.proposal_id;
      if (!proposalId) {
        throw new Error('Proposal ID not found. Please select a proposal to submit for funding.');
      }
      
      // Submit the application using the submit-funding API
      const submitResponse = await axios.post(`${API_BASE_URL}/startup/submit-funding`, {
        proposal_id: proposalId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      // Get the application ID from the response
      const appId = submitResponse.data.application_id;
      setApplicationId(appId);
      
      // Step 1 complete - progress stays at 0%
      // Move to Step 2: Risk Assessment
      setCurrentStep(1);
      
      // Animate progress from 0% to 50% (center)
      const riskTimer = setInterval(() => {
        setOverallProgress(prev => {
          if (prev >= 50) {
            clearInterval(riskTimer);
            return 50;
          }
          return prev + 0.5; // Increment by 0.5% every 50ms for smooth movement
        });
      }, 50);
      
      const riskRes = await axios.post(`${API_BASE_URL}/startup/assess-risk/${appId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (riskRes.data.current_step === 'risk_assessment_failed') {
        // Risk assessment failed, application is soft deleted
        setIsProcessing(false);
        return;
      }

      // Step 2 complete - progress at 50% (center)
      // Move to Step 3: Investor Matching
      setCurrentStep(2);
      
      // Animate progress from 50% to 100%
      const matchTimer = setInterval(() => {
        setOverallProgress(prev => {
          if (prev >= 100) {
            clearInterval(matchTimer);
            return 100;
          }
          return prev + 1; // Increment by 1% every 50ms for smooth movement
        });
      }, 50);
      
      const matchRes = await axios.post(`${API_BASE_URL}/startup/match-investors/${appId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setOverallProgress(100);

      // Check if matching was successful and get investor data
      if (matchRes.data.matching_response && matchRes.data.matching_response.investors && Array.isArray(matchRes.data.matching_response.investors)) {
        navigate('/select-investor', {
          state: {
            investorMatches: matchRes.data.matching_response.investors,
            applicationId: appId,
            hasGoodMatches: matchRes.data.matching_response.has_good_matches
          }
        });
      } else {
        // No investors found or unexpected response format
        console.log("fail navigate");
        console.warn('No investor matches found or unexpected response format:', matchRes.data);
        setIsProcessing(false);
      }
      console.log("no navigate");
    } catch (error) {
      console.error('Error during processing:', error);
      setIsProcessing(false);
    }
  };

  const getCurrentStep = () => {
    return processingSteps[currentStep];
  };

  const getProgressPercentage = () => {
    return overallProgress;
  };

  const getRunnerPosition = () => {
    return `${overallProgress}%`;
  };

  return (
    <div className="bg-gray-50 flex flex-row justify-center w-full min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="application" />
      </div>
      
      {/* Main Content */}
      <div className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1 relative z-10">
        <div className="flex-1 p-6 max-md:p-4 max-sm:p-3 overflow-y-auto">
          <div className="max-w-4xl mx-auto flex flex-col">
            {/* Error State */}
            {!isProcessing && (
              <div className="flex items-center justify-center py-8 max-md:py-6 max-sm:py-4">
                <Card className="w-full max-w-2xl shadow-lg border border-red-200">
                  <CardBody className="p-6 max-md:p-4 max-sm:p-3 text-center">
                    <div className="mb-6 max-md:mb-4 max-sm:mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 w-16 h-16 max-md:w-14 max-md:h-14 max-sm:w-12 max-sm:h-12 text-red-600 flex items-center justify-center mx-auto mb-4 max-md:mb-3 max-sm:mb-2">
                          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                        </svg>
                        <Typography variant="h4" className="font-bold text-red-600 mb-4 max-md:mb-3 max-sm:mb-2 text-2xl max-md:text-xl max-sm:text-lg">
                          Application Review Complete
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 mb-6 max-md:mb-4 max-sm:mb-3 text-base max-md:text-sm max-sm:text-sm text-justify">
                          Thank you for your application. After careful review of your business metrics and revenue data, we're unable to proceed with funding at this time. We encourage you to continue growing your business and reapply when you have stronger revenue performance or consider a smaller funding amount that better matches your current financial position.
                        </Typography>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 max-md:gap-3 max-sm:gap-2 justify-center">
                      <Button
                        className="flex items-center justify-center gap-2 bg-dark-plum text-white hover:bg-light-purple capitalize text-sm max-md:text-xs py-3 max-md:py-2.5 max-sm:py-2 px-6 max-md:px-4 max-sm:px-3 w-full sm:w-auto"
                        onClick={() => navigate('/startup-home')}
                      >
                        <svg className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Return to Home
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <>
                {/* Header */}
                <div className="text-center mb-6 max-md:mb-4 max-sm:mb-3">
                  <Typography variant="h3" className="font-bold text-dark-plum mb-4 max-md:mb-3 max-sm:mb-2 text-3xl max-md:text-2xl max-sm:text-xl">
                    Processing Your Application
                  </Typography>
                  <Typography variant="h6" className="text-gray-600 text-base max-md:text-sm max-sm:text-sm">
                    We're analyzing your business proposal and finding the best investors for you
                  </Typography>
                </div>

                {/* Important Notice */}
                <Card className="bg-amber-50 border border-amber-200 mb-6 max-md:mb-4 max-sm:mb-3 shadow-lg">
                  <CardBody className="p-4 max-md:p-3 max-sm:p-2">
                    <div className="flex items-center gap-3 max-md:gap-2 max-sm:gap-2">
                      <div className="hidden sm:flex w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 flex items-center justify-center">
                        <span className="text-amber-600 text-sm max-md:text-xs">⚠️</span>
                      </div>
                      <div>
                        <Typography variant="h6" className="text-amber-800 font-semibold mb-1 max-md:mb-1 text-base max-md:text-sm max-sm:text-sm">
                          Please Don't Close This Page
                        </Typography>
                        <Typography className="text-amber-700 text-xs max-md:text-xs">
                          The processing will continue automatically. Closing this page may interrupt the analysis.
                        </Typography>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Current Process Display - Middle of Page */}
                <div className="flex items-center justify-center py-8 max-md:py-6 max-sm:py-4">
                  <Card className="w-full max-w-3xl shadow-lg border border-gray-200">
                    <CardBody className="p-6 max-md:p-4 max-sm:p-3 text-center">
                      {/* Clean Lottie Animation Container */}
                      <div>
                        <div className="w-48 h-32 max-md:w-40 max-md:h-28 max-sm:w-32 max-sm:h-24 mx-auto overflow-hidden">
                          <Lottie
                            animationData={LoadingFiles}
                            loop={true}
                            autoplay={true}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Current Step Information */}
                      <div className="mb-6 max-md:mb-4 max-sm:mb-3">
                        <Typography variant="h4" className="font-bold text-dark-plum mb-4 max-md:mb-3 max-sm:mb-2 text-2xl max-md:text-xl max-sm:text-base">
                          {getCurrentStep()?.title}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 mb-6 max-md:mb-4 max-sm:mb-3 leading-relaxed max-w-2xl mx-auto text-base max-md:text-sm max-sm:text-xs">
                          {getCurrentStep()?.description}
                        </Typography>
                        <div className="inline-block bg-gray-100 px-3 py-2 max-md:px-2 max-md:py-1.5 max-sm:px-2 max-sm:py-1 rounded-full">
                          <Typography variant="small" className="text-gray-600 font-medium text-xs max-md:text-xs">
                            Estimated time: {getCurrentStep()?.estimatedTime}
                          </Typography>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Patience Message */}
                <div className="text-center mb-6 max-md:mb-4 max-sm:mb-3">
                  <Typography variant="h6" className="text-gray-600 mb-3 max-md:mb-2 max-sm:mb-1 text-base max-md:text-sm max-sm:text-sm">
                    Please be patient
                  </Typography>
                  <Typography className="text-gray-500 text-xs max-md:text-xs leading-relaxed">
                    This process ensures we find the best possible investors for your business.
                    <br className="hidden sm:block" />
                    The analysis typically takes 2-4 minutes to complete.
                  </Typography>
                </div>

                {/* Horizontal Progress Bar with Running Man - Bottom */}
                <div className="mt-auto">
                  <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="w-full h-3 max-md:h-2 max-sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      {/* Progress Fill */}
                      <div 
                        className="h-full bg-dark-plum transition-all duration-1000 ease-out"
                        style={{width: `${getProgressPercentage()}%`}}
                      ></div>
                    </div>
                    
                    {/* Step Indicators on Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-3 max-md:h-2 max-sm:h-2 flex items-center justify-between px-0">
                      {processingSteps.map((step, index) => (
                        <div key={step.id} className="relative">
                          <div className={`w-10 h-10 max-md:w-8 max-md:h-8 max-sm:w-6 max-sm:h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                            index < currentStep 
                              ? 'bg-light-purple text-white shadow-lg' 
                              : index === currentStep 
                                ? 'bg-warm-off-white shadow-lg' 
                                : 'bg-gray-300 text-gray-500'
                          }`}>
                            {index < currentStep ? (
                              <CheckCircleIcon className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3" />
                            ) : index === currentStep ? (
                              <div className="w-10 h-10 max-md:w-8 max-md:h-8 max-sm:w-6 max-sm:h-6">
                                <Lottie 
                                  animationData={hourglass} 
                                  loop={true} 
                                  autoplay={true}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              </div>
                            ) : (
                              <span className="text-xs max-md:text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Running Man Icon */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                      style={{left: `calc(${getRunnerPosition()} - 12px)`}}
                    >
                      <div className="w-10 h-10 max-md:w-8 max-md:h-8 max-sm:w-6 max-sm:h-6 bg-transparent flex items-center justify-center">
                        <Lottie 
                          animationData={walkingMan} 
                          loop={true} 
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </div>
                    
                    {/* Step Labels */}
                    <div className="flex justify-between mt-4 max-md:mt-3 max-sm:mt-2">
                      {processingSteps.map((step, index) => (
                        <div key={step.id} className="text-center">
                          <Typography variant="small" className={`text-xs font-medium transition-all duration-300 ${
                            index <= currentStep ? 'text-dark-plum font-semibold' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
