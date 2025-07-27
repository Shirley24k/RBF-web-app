import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Card, CardBody, Typography } from "@material-tailwind/react";
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
  status: 'pending' | 'processing' | 'completed';
  estimatedTime: string;
}

export const ProcessingFundingPage = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const processingSteps: ProcessingStep[] = [
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Analyzing business proposal for risk factors and compliance',
      status: 'processing',
      estimatedTime: '30-60 seconds'
    },
    {
      id: 'proposal-analysis',
      title: 'Business Proposal Analysis',
      description: 'Extracting key information and evaluating business model',
      status: 'pending',
      estimatedTime: '45-90 seconds'
    },
    {
      id: 'investor-matching',
      title: 'Investor Matching',
      description: 'Finding suitable investors based on your requirements',
      status: 'pending',
      estimatedTime: '60-120 seconds'
    }
  ];

  useEffect(() => {
    // Get application ID from location state or URL params
    const appId = location.state?.applicationId || new URLSearchParams(window.location.search).get('id');
    setApplicationId(appId);

    // Simulate processing steps with realistic timing
    const stepTimings = [3000, 4500, 6000]; // 3s, 4.5s, 6s
    let currentStepIndex = 0;

    const processSteps = () => {
      if (currentStepIndex < processingSteps.length) {
        setTimeout(() => {
          setCurrentStep(currentStepIndex);
          currentStepIndex++;
          processSteps();
        }, stepTimings[currentStepIndex]);
      } else {
        // All steps completed, check for investor matches
        checkInvestorMatches();
      }
    };

    processSteps();
  }, []);

  const checkInvestorMatches = async () => {
    if (!applicationId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/application/${applicationId}/matches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.matches && response.data.matches.length > 0) {
        // Navigate to SelectInvestor with matches
        navigate('/select-investor', {
          state: {
            investorMatches: response.data.matches,
            applicationId: applicationId
          }
        });
      } else {
        // No matches found, show appropriate message
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error checking investor matches:', error);
      setIsProcessing(false);
    }
  };

  const getCurrentStep = () => {
    return processingSteps[currentStep];
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / processingSteps.length) * 100;
  };

  const getRunnerPosition = () => {
    // Position the runner based on current step progress
    const stepProgress = (currentStep + 1) / processingSteps.length;
    return `${stepProgress * 100}%`;
  };

  return (
    <div className="bg-gray-50 flex h-screen relative overflow-hidden">
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="application" />
      </div>
      
      <div className="ml-[200px] flex flex-col flex-1 relative z-10">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
              <Typography variant="h3" className="font-bold text-dark-plum mb-4">
                Processing Your Application
              </Typography>
              <Typography variant="h6" className="text-gray-600">
                We're analyzing your business proposal and finding the best investors for you
              </Typography>
            </div>

            {/* Important Notice */}
            <Card className="bg-amber-50 border border-amber-200 mb-8 shadow-lg">
              <CardBody className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-lg">⚠️</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-amber-800 font-semibold mb-1">
                      Please Don't Close This Page
                    </Typography>
                    <Typography className="text-amber-700 text-sm">
                      The processing will continue automatically. Closing this page may interrupt the analysis.
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Current Process Display - Middle of Page */}
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-full max-w-3xl shadow-lg border border-gray-200">
                <CardBody className="p-10 text-center">
                  {/* Clean Lottie Animation Container */}
                  <div>
                    <div className="w-80 h-48 mx-auto overflow-hidden">
                      <Lottie
                        animationData={LoadingFiles}
                        loop={true}
                        autoplay={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Current Step Information */}
                  <div className="mb-8">
                    <Typography variant="h4" className="font-bold text-dark-plum mb-4">
                      {getCurrentStep()?.title}
                    </Typography>
                    <Typography variant="h6" className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
                      {getCurrentStep()?.description}
                    </Typography>
                    <div className="inline-block bg-gray-100 px-4 py-2 rounded-full">
                      <Typography variant="small" className="text-gray-600 font-medium">
                        ⏱️ Estimated time: {getCurrentStep()?.estimatedTime}
                      </Typography>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Patience Message */}
            <div className="text-center mb-8">
              <Typography variant="h6" className="text-gray-600 mb-3">
                Please be patient
              </Typography>
              <Typography className="text-gray-500 text-sm leading-relaxed">
                This process ensures we find the best possible investors for your business.
                <br />
                The analysis typically takes 2-4 minutes to complete.
              </Typography>
            </div>

            {/* Horizontal Progress Bar with Running Man - Bottom */}
            <div className="mt-auto">
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <div 
                    className="h-full bg-dark-plum transition-all duration-1000 ease-out"
                    style={{width: `${getProgressPercentage()}%`}}
                  ></div>
                </div>
                
                {/* Step Indicators on Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-between px-2">
                  {processingSteps.map((step, index) => (
                    <div key={step.id} className="relative">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                        index < currentStep 
                          ? 'bg-light-purple text-white shadow-lg' 
                          : index === currentStep 
                            ? 'bg-warm-off-white shadow-lg' 
                            : 'bg-gray-300 text-gray-500'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircleIcon className="w-8 h-8" />
                        ) : index === currentStep ? (
                          <div className="w-14 h-14">
                            <Lottie 
                              animationData={hourglass} 
                              loop={true} 
                              autoplay={true}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Running Man Icon */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{left: `calc(${getRunnerPosition()} - 16px)`}}
                >
                  <div className="w-12 h-12 bg-transparent flex items-center justify-center">
                    <Lottie 
                      animationData={walkingMan} 
                      loop={true} 
                      autoplay={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
                
                {/* Step Labels */}
                <div className="flex justify-between mt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};
