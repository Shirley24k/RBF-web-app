import { ChevronLeftIcon, ClockIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, IconButton, Progress, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Sidenav } from "../components/sidenav";
import { StatusBadge } from "../components/StatusBadge";

export const TransactionDetails = (): JSX.Element => {
  const { id } = useParams();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [startupData, setStartupData] = useState<any>(null);
  const [next_repayment_date, setNextRepaymentDate] = useState<any>(null);
  const [overdue_detail, setOverdueDetail] = useState<any>(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const [isStartup] = useState(localStorage.getItem('role') === 'startup');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendReminder, setSendReminder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [searchParams] = useSearchParams();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/transaction-details/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      
      setApplicationData(response.data.application);
      setTransactionData(response.data.transactions);
      setStartupData(response.data.startup);
      setNextRepaymentDate(response.data.next_repayment_date);
      setOverdueDetail(response.data.overdue_details);
      setRepaymentAmount(response.data.repayment_amount)
      
      console.log('Transaction Data', response.data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setError('Failed to load transaction details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleStripeSuccess = async (sessionId: string) => {
    try {
      setProcessingPayment(true);      
      const response = await axios.post(`${API_BASE_URL}/transactions/process-success`, {
        session_id: sessionId,
        application_id: id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (response.data.success) {
        // Refresh transaction data to show updated status
        await fetchTransactionData();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      alert('Payment was successful but there was an error updating the transaction. Please contact support.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const handleRepayment = async () => {
    await axios.post(`${API_BASE_URL}/transactions/repayment`, {
      application_id: id,
      month: new Date().toISOString().slice(0,7) // Gets YYYY-MM format
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response)=>{
      setShowRepaymentModal(false);
      window.location.href = response.data.checkout_url;
    })
    .catch((error)=>{
      console.error('Repayment failed:', error);
    })
  };

  const handleSendReminder = async () => {
    try {
      setSendingReminder(true);
      await axios.post(`${API_BASE_URL}/repayment-reminder/${id}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setSendReminder(true);
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  // Check if application is completed (all payments made)
  const isApplicationCompleted = () => {
    if (!applicationData) return false;
    return applicationData.status === 'Completed';
  };

  // Check if today is the payment date or if payment is overdue
  const isPaymentDue = () => {
    if (!next_repayment_date || isApplicationCompleted()) return false;
    const today = new Date().toISOString().split('T')[0];
    const paymentDate = new Date(next_repayment_date).toISOString().split('T')[0];
    return today >= paymentDate;
  };

  // Check if payment is overdue
  const isPaymentOverdue = () => {
    if (isApplicationCompleted()) return false;
    return overdue_detail !== null;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'FUND_TRANSFER':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      case 'REPAYMENT':
        return <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const calculateProgress = () => {
    if (!applicationData?.repayment_cap || !applicationData?.total_repaid) return 0;
    return ((applicationData.total_repaid / applicationData.repayment_cap) * 100);
  };

  useEffect(() => {
    fetchTransactionData()
  }, [id])

  // Handle Stripe success callback
  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');
    
    if (status === 'success' && sessionId) {
      alert('Payment processed successfully! Your transaction is now pending and will be transferred to the investor within 3 minutes.');
      setIsLoading(true);
      handleStripeSuccess(sessionId);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-32 h-full left-0 top-0 z-20">
        <Sidenav active="transactions" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden z-10">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full mr-10">
        {/* Header */}
        <div className="ml-32 max-md:ml-24 max-sm:ml-20 py-8 max-md:py-6 max-sm:py-4 flex flex-row items-center justify-between gap-4 max-sm:gap-2 transition-all duration-300">
          <div className="flex items-center">
            <IconButton
              variant="text"
              className="mr-4 max-md:mr-3 max-sm:mr-2 flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                {isStartup ? navigate('/startup-transaction') : window.history.back()}
              }}
            >
              <ChevronLeftIcon className="h-6 w-6 max-md:h-5 max-md:w-5 max-sm:h-4 max-sm:w-4" />
            </IconButton>
            <div>
              <Typography variant="h4" color="blue-gray" className="text-2xl max-md:text-xl max-sm:text-base">
                Transaction Details
              </Typography>
              <Typography variant="small" color="gray" className="mt-1 text-xs max-md:text-xs">
                Application ID: {applicationData.id}
              </Typography>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-row gap-3 max-md:gap-2 max-sm:gap-2">
            {/* Repayment Button for Startups - Only show when payment is due and not completed */}
            {isStartup && applicationData.status === 'Active' && !isApplicationCompleted() && isPaymentDue() && (
              <Button
                color={isPaymentOverdue() ? "red" : "blue"}
                className="flex items-center gap-2 capitalize text-sm max-md:text-xs py-2 max-md:py-1.5 max-sm:py-1 px-4 max-md:px-3 max-sm:px-1"
                onClick={() => setShowRepaymentModal(true)}
              >
                <CurrencyDollarIcon className="hidden md:block h-4 w-4 max-md:h-3 max-md:w-3 max-sm:h-3 max-sm:w-3" />
                {isPaymentOverdue() ? "Pay Overdue Amount" : "Pay Monthly Repayment"}
              </Button>
            )}

            {/* Reminder Button for Investors - Only show when payment is overdue and not completed */}
            {!isStartup && applicationData.status === 'Active' && !isApplicationCompleted() && isPaymentOverdue() && (
              <Button
                color="orange"
                variant="outlined"
                className="flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm max-md:text-xs py-2 max-md:py-1.5 max-sm:py-1 px-4 max-md:px-3 max-sm:px-1"
                onClick={handleSendReminder}
                disabled={sendingReminder || sendReminder}
              >
                <svg className="hidden md:block h-4 w-4 max-md:h-3 max-md:w-3 max-sm:h-3 max-sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {sendingReminder ? (<Spinner className="h-4 w-4" />) : (sendReminder ? 'Sent' : 'Send Reminder')}
              </Button>
            )}
          </div>
        </div>
        <div className="ml-32 max-md:ml-24 max-sm:ml-20 px-4 max-md:px-6 max-sm:px-4 transition-all duration-300">
          {/* Application Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-md:gap-4 max-sm:gap-3 mb-6 max-md:mb-4 max-sm:mb-3">
            <Card className="p-4 max-md:p-3 max-sm:p-2">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2 text-xs max-md:text-xs">
                  Repayment Cap
                </Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold text-lg max-md:text-base max-sm:text-sm">
                  {formatCurrency(applicationData.repayment_cap)}
                </Typography>
              </CardBody>
            </Card>

            <Card className="p-4 max-md:p-3 max-sm:p-2">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2 text-xs max-md:text-xs">
                  Funding Amount
                </Typography>
                <Typography variant="h5" color="green" className="font-bold text-lg max-md:text-base max-sm:text-sm">
                  {formatCurrency(applicationData.funding_amount)}
                </Typography>
              </CardBody>
            </Card>

            <Card className="p-4 max-md:p-3 max-sm:p-2">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2 text-xs max-md:text-xs">
                  Remaining Balance
                </Typography>
                <Typography variant="h5" color="orange" className="font-bold text-lg max-md:text-base max-sm:text-sm">
                  {formatCurrency(applicationData.repayment_cap - applicationData.total_repaid)}
                </Typography>
              </CardBody>
            </Card>

            <Card className="p-4 max-md:p-3 max-sm:p-2">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2 text-xs max-md:text-xs">
                  Revenue Share Percentage
                </Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold text-lg max-md:text-base max-sm:text-sm">
                  {applicationData.revenue_share_percentage}%
                </Typography>
              </CardBody>
            </Card>
          </div>

          {/* Repayment Progress */}
          <div className="mb-6 max-md:mb-4 max-sm:mb-3">
            <Card className="p-6 max-md:p-4 max-sm:p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 max-md:mb-3 max-sm:mb-2 gap-2">
                <Typography variant="h6" color="blue-gray" className="text-lg max-md:text-base max-sm:text-sm">
                  Repayment Progress
                </Typography>
                <Typography variant="small" color="gray" className="text-xs max-md:text-xs">
                  {Math.round(calculateProgress())}% Complete
                </Typography>
              </div>
              <Progress 
                value={calculateProgress()} 
                color="blue" 
                className="h-3 max-md:h-2 max-sm:h-2"
              />
              <div className="flex flex-col sm:flex-row justify-between mt-2 text-sm max-md:text-xs max-sm:text-xs text-gray-600 gap-1">
                <span>Fund Transfer Date: {transactionData && transactionData.length > 0 ? formatDate(transactionData[transactionData.length - 1].transaction_datetime) : '-'}</span>
                <span>Revenue Share Percentage: {applicationData.revenue_share_percentage}%</span>
              </div>
            </Card>
          </div>

          {/* Next Payment Alert */}
          <div className="mb-6 max-md:mb-4 max-sm:mb-3">
            {isApplicationCompleted() ? (
              <Card className="p-4 max-md:p-3 max-sm:p-2 bg-green-50 border-green-200">
                <div className="flex items-center gap-3 max-md:gap-2 max-sm:gap-2">
                  <div className="w-8 h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 max-md:w-4 max-md:h-4 max-sm:w-3 max-sm:h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" color="green" className="font-semibold text-base max-md:text-sm max-sm:text-sm">
                      Application Completed
                    </Typography>
                    <Typography variant="small" color="gray" className="text-xs max-md:text-xs">
                      All payments have been successfully completed
                    </Typography>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className={`p-4 max-md:p-3 max-sm:p-2 ${isPaymentOverdue() ? 'bg-red-50 border-red-200' : isPaymentDue() ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-3 max-md:gap-2 max-sm:gap-2">
                  <ExclamationTriangleIcon className={`h-5 w-5 max-md:h-4 max-md:w-4 max-sm:h-3 max-sm:w-3 ${isPaymentOverdue() ? 'text-red-500' : isPaymentDue() ? 'text-orange-500' : 'text-blue-500'}`} />
                  <div className="flex-1">
                    <Typography variant="h6" color={isPaymentOverdue() ? "red" : isPaymentDue() ? "orange" : "blue"} className="font-semibold text-base max-md:text-sm max-sm:text-sm">
                      {isPaymentOverdue() ? "Payment Overdue" : isPaymentDue() ? "Payment Due Today" : "Next Payment Due"}
                    </Typography>
                    {isPaymentDue() && (
                      <Typography variant="small" color="gray" className="text-xs max-md:text-xs">
                        {formatDate(next_repayment_date)} - {formatCurrency(repaymentAmount)}
                      </Typography>
                    )}
                    
                    {!isPaymentDue() && (
                      <Typography variant="small" color="gray" className="mt-1 text-xs max-md:text-xs">
                        Next payment: {formatDate(next_repayment_date)}
                      </Typography>
                    )}
                  </div>
                  
                  {/* Investor-specific overdue information */}
                  {!isStartup && isPaymentOverdue() && (
                    <div className="text-right">
                      <Typography variant="small" color="red" className="font-semibold text-xs max-md:text-xs">
                        {overdue_detail.days_overdue} days overdue
                      </Typography>
                      <Typography variant="small" color="gray" className="text-xs max-md:text-xs">
                        Startup: {startupData.company_name}
                      </Typography>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Transaction History */}
          <div>
            <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-xl max-md:text-lg max-sm:text-base">
              Transaction History
            </Typography>
            
            <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2 pb-10">
              {transactionData && transactionData.map((transaction: any) => (
                <Card key={transaction.id} className="p-4 max-md:p-3 max-sm:p-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-md:gap-2 max-sm:gap-2">
                    <div className="flex items-center gap-4 max-md:gap-3 max-sm:gap-2">
                      <div className="hidden md:block">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <Typography variant="h6" color="blue-gray" className="font-semibold text-base max-md:text-sm max-sm:text-sm">
                          {transaction.type === 'FUND_TRANSFER' ? 'Fund Transfer' : 'MonthlyRepayment'}
                        </Typography>
                        <Typography variant="small" color="gray" className="text-xs max-md:text-xs">
                          {transaction.type === 'FUND_TRANSFER' ? 'Initial transfer for investment fund' : 'Monthly principal and interest payment'}
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          <ClockIcon className="h-3 w-3 max-md:h-2 max-md:w-2 max-sm:h-2 max-sm:w-2 text-gray-400" />
                          <Typography variant="small" color="gray" className="text-xs max-md:text-xs">
                            {formatDate(transaction.transaction_datetime)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right sm:text-left flex flex-col justify-end">
                      <Typography 
                        variant="h6" 
                        color={transaction.type === 'FUND_TRANSFER' ? "green" : "blue-gray"}
                        className="font-bold text-base max-md:text-sm max-sm:text-sm"
                      >
                        {transaction.type === 'FUND_TRANSFER' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                      <StatusBadge status={transaction.status} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Modal */}
      {showRepaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-md:p-4 max-sm:p-3 w-96 max-md:w-80 max-sm:w-72">
            <Typography variant="h5" color="blue-gray" className="mb-4 max-md:mb-3 max-sm:mb-2 text-lg max-md:text-base max-sm:text-base">
              {isPaymentOverdue() ? "Pay Overdue Amount" : "Pay Monthly Installment"}
            </Typography>
            
            <div className="space-y-4 max-md:space-y-3 max-sm:space-y-2">
              <div className="p-3 max-md:p-2 max-sm:p-2 bg-gray-50 rounded-lg">
                <Typography variant="small" color="gray" className="mb-1 text-xs max-md:text-xs">
                  Scheduled Payment Date
                </Typography>
                <Typography variant="h6" color="blue-gray" className="text-base max-md:text-sm max-sm:text-sm">
                  {formatDate(next_repayment_date)}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-2 text-xs max-md:text-xs">
                  Monthly Payment Amount (RM)
                </Typography>
                <input
                  type="number"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(Number(e.target.value))}
                  className="w-full p-3 max-md:p-2 max-sm:p-2 border border-gray-300 rounded-lg text-sm max-md:text-xs"
                  placeholder="Enter amount"
                  disabled={true} // Fixed amount for scheduled payments
                />
                <Typography variant="small" color="gray" className="mt-1 text-xs max-md:text-xs">
                  This is your scheduled monthly payment amount
                </Typography>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 max-md:gap-2 max-sm:gap-2">
                <Button
                  variant="outlined"
                  className="flex-1 capitalize bg-transparent text-dark-plum hover:bg-gray-50 border-dark-plum text-sm max-md:text-xs py-2 max-md:py-1.5 max-sm:py-1"
                  onClick={() => setShowRepaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 capitalize bg-dark-plum text-white hover:bg-light-purple text-sm max-md:text-xs py-2"
                  onClick={handleRepayment}
                >
                  {isPaymentOverdue() ? "Pay Overdue Amount" : "Confirm Payment"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
