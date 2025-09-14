import { CheckCircleIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
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
  const [sendReminder, setSendReminder] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [searchParams] = useSearchParams();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  
  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  }

  const handleStripeSuccess = async (sessionId: string) => {
    try {
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
    if (!next_repayment_date) return false;
    
    // Payment is overdue if it's past the due date (not just due today)
    const today = new Date().toISOString().split('T')[0];
    const paymentDate = new Date(next_repayment_date).toISOString().split('T')[0];
    return today > paymentDate;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'FUND_TRANSFER':
        return <CurrencyDollarIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-green-700" />;
      case 'REPAYMENT':
        return <CurrencyDollarIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-dark-plum" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-gray-500" />;
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
      <main className="ml-16 transition-all duration-300 w-full">
        <div className="px-6 py-8 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-16 max-lg:mb-12 max-sm:mb-8">
              <div className="flex flex-row items-center justify-between gap-4 max-sm:gap-2">
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
                    <Typography variant="h4" color="blue-gray" className="text-4xl max-lg:text-3xl max-sm:text-lg font-bold text-gray-900">
                      Transaction Details
                    </Typography>
                    <Typography variant="small" color="gray" className="mt-1 text-xl max-lg:text-base max-sm:text-xs text-gray-600">
                      Application ID: {applicationData.id}
                    </Typography>
                  </div>
                </div>
            
                {/* Action Buttons */}
                <div className="flex flex-row gap-4 max-lg:gap-3 max-sm:gap-2">
                  {/* Repayment Button for Startups - Only show when payment is due and not completed */}
                  {isStartup && applicationData.status === 'Active' && !isApplicationCompleted() && isPaymentDue() && (
                    <Button
                      variant="outlined"
                      className={`flex items-center gap-2 capitalize text-lg max-lg:text-base max-sm:text-xs py-4 max-lg:py-3 max-sm:py-2 px-8 max-lg:px-6 max-sm:px-3 rounded-xl ${isPaymentOverdue() ? "border-red-800 text-red-800 hover:bg-red-600 hover:text-white" : "border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white"}`}
                      onClick={() => setShowRepaymentModal(true)}
                    >
                      <CurrencyDollarIcon className="max-sm:hidden w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-4 max-sm:h-4" />
                      <span className="max-sm:hidden">{isPaymentOverdue() ? "Pay Overdue Amount" : "Pay Monthly Repayment"}</span>
                      <span className="sm:hidden">{isPaymentOverdue() ? "Pay Overdue" : "Pay Now"}</span>
                    </Button>
                  )}

                  {/* Reminder Button for Investors - Only show when payment is overdue and not completed */}
                  {!isStartup && applicationData.status === 'Active' && !isApplicationCompleted() && isPaymentOverdue() && (
                    <Button
                      variant="outlined"
                      className="flex items-center gap-2 border-dark-plum text-dark-plum hover:bg-dark-plum hover:text-white text-lg max-lg:text-base max-sm:text-xs py-4 max-lg:py-3 max-sm:py-2 px-8 max-lg:px-6 max-sm:px-3 rounded-xl"
                      onClick={handleSendReminder}
                      disabled={sendingReminder || sendReminder}
                    >
                      <EnvelopeIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-4 max-sm:h-4" />
                      <span className="max-sm:hidden">{sendingReminder ? (<Spinner className="h-8 w-8 max-lg:h-6 max-lg:w-6 max-sm:h-4 max-sm:w-4" />) : (sendReminder ? 'Sent' : 'Send Reminder')}</span>
                      <span className="sm:hidden">{sendingReminder ? (<Spinner className="h-4 w-4" />) : (sendReminder ? 'Sent' : 'Remind')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-12 max-lg:space-y-8">
              {/* Application Overview Cards */}
              <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-2 gap-6 max-lg:gap-4 max-sm:gap-3">
                <Card className="p-8 max-lg:p-6 max-sm:p-4 shadow-sm border border-gray-200 rounded-2xl">
                  <CardBody className="p-0">
                    <Typography variant="small" color="gray" className="mb-2 text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                      Repayment Cap
                    </Typography>
                    <Typography variant="h5" color="blue-gray" className="font-bold text-2xl max-lg:text-xl max-sm:text-xs text-gray-900">
                      {formatCurrency(applicationData.repayment_cap)}
                    </Typography>
                  </CardBody>
                </Card>

                <Card className="p-8 max-lg:p-6 max-sm:p-4 shadow-sm border border-gray-200 rounded-2xl">
                  <CardBody className="p-0">
                    <Typography variant="small" color="gray" className="mb-2 text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                      Funding Amount
                    </Typography>
                    <Typography variant="h5" className="font-bold text-2xl max-lg:text-xl max-sm:text-xs text-green-700">
                      {formatCurrency(applicationData.funding_amount)}
                    </Typography>
                  </CardBody>
                </Card>

                <Card className="p-8 max-lg:p-6 max-sm:p-4 shadow-sm border border-gray-200 rounded-2xl">
                  <CardBody className="p-0">
                    <Typography variant="small" color="gray" className="mb-2 text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                      Remaining Balance
                    </Typography>
                    <Typography variant="h5" className="font-bold text-2xl max-lg:text-xl max-sm:text-xs text-orange-600">
                      {formatCurrency(applicationData.repayment_cap - applicationData.total_repaid)}
                    </Typography>
                  </CardBody>
                </Card>

                <Card className="p-8 max-lg:p-6 max-sm:p-4 shadow-sm border border-gray-200 rounded-2xl">
                  <CardBody className="p-0">
                    <Typography variant="small" color="gray" className="mb-2 text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                      Revenue Share
                    </Typography>
                    <Typography variant="h5" color="blue-gray" className="font-bold text-2xl max-lg:text-xl max-sm:text-xs text-gray-900">
                      {applicationData.revenue_share_percentage}%
                    </Typography>
                  </CardBody>
                </Card>
              </div>

              {/* Repayment Progress */}
              <div>
                <Card className="p-8 max-lg:p-6 max-sm:p-4 shadow-sm border border-gray-200 rounded-2xl">
                  <div className="flex flex-row items-center justify-between mb-8 max-lg:mb-6 max-sm:mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
                    <Typography variant="h6" color="blue-gray" className="text-2xl max-lg:text-xl max-sm:text-sm font-bold text-gray-900">
                      Repayment Progress
                    </Typography>
                    <Typography variant="small" color="gray" className="text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                      {Math.round(calculateProgress())}% Complete
                    </Typography>
                  </div>
                  <Progress 
                    value={calculateProgress()} 
                    color="purple" 
                    className="h-4 max-lg:h-3 max-sm:h-2 [&>div]:!bg-light-purple"
                  />
                  <div className="flex flex-row justify-between mt-4 text-lg max-lg:text-base max-sm:text-sm text-gray-600 gap-4 max-sm:flex-col max-sm:gap-2">
                    <span className="max-sm:text-xs">Fund Transfer on: {transactionData && transactionData.length > 0 ? formatDate(transactionData[transactionData.length - 1].transaction_datetime) : '-'}</span>
                  </div>
                </Card>
              </div>

              {/* Next Payment Alert */}
              <div>
                {isApplicationCompleted() ? (
                  <Card className="p-8 max-lg:p-6 max-sm:p-4 bg-green-50 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4 max-lg:gap-3 max-sm:gap-2">
                      <div className="w-12 h-12 max-lg:w-10 max-lg:h-10 max-sm:w-8 max-sm:h-8 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <Typography variant="h6" className="font-bold text-2xl max-lg:text-xl max-sm:text-sm text-green-800">
                          Application Completed
                        </Typography>
                        <Typography variant="small" color="gray" className="text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                          All payments have been successfully completed
                        </Typography>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className={`p-8 max-lg:p-6 max-sm:p-4 rounded-2xl shadow-sm ${isPaymentOverdue() ? 'bg-red-50' : isPaymentDue() ? 'bg-orange-50' : 'bg-beige'}`}>
                    <div className="flex items-center justify-between gap-4 max-lg:gap-3 max-sm:gap-2 max-sm:flex-col max-sm:items-start">
                      <div className="flex items-center gap-4 max-lg:gap-3 max-sm:gap-2">
                        <ExclamationTriangleIcon className={`w-8 h-8 max-lg:w-6 max-lg:h-6 max-sm:w-5 max-sm:h-5 ${isPaymentOverdue() ? 'text-red-800' : isPaymentDue() ? 'text-orange-500' : 'text-light-purple'}`} />
                        <div className="flex-1">
                          <Typography variant="h6" className={`font-bold text-2xl max-lg:text-xl max-sm:text-sm ${isPaymentOverdue() ? "text-red-800" : isPaymentDue() ? "text-orange-500" : "text-dark-plum"}`}>
                            {isPaymentOverdue() ? "Payment Overdue" : isPaymentDue() ? "Payment Due Today" : "Next Payment Due"}
                          </Typography>
                          {isPaymentDue() && (
                            <Typography variant="small" color="gray" className="text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                              {formatDate(next_repayment_date)} - {formatCurrency(repaymentAmount)}
                            </Typography>
                          )}
                          
                          {!isPaymentDue() && (
                            <Typography variant="small" color="gray" className="mt-1 text-lg max-lg:text-base max-sm:text-xs text-gray-600">
                              Next payment: {formatDate(next_repayment_date)}
                            </Typography>
                          )}
                        </div>
                      </div>
                      
                      {isPaymentOverdue() && (
                        <div className="text-right max-sm:text-left max-sm:w-full max-sm:ml-6">
                          <Typography variant="small" className="font-bold text-lg max-lg:text-base max-sm:text-xs text-red-800">
                            {overdue_detail.days_overdue} days overdue
                          </Typography>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Transaction History */}
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-8 max-lg:mb-6 max-sm:mb-4 text-2xl max-lg:text-xl max-sm:text-sm font-bold text-gray-900">
                  Transaction History
                </Typography>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        {transactionData && transactionData.map((transaction: any) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-8 py-6 max-lg:px-6 max-sm:px-4 max-sm:py-3">
                              <div className="flex flex-row items-center justify-between gap-4 max-lg:gap-3 max-sm:gap-2">
                                <div className="flex items-center gap-6 max-lg:gap-4 max-sm:gap-3">
                                  <div className="max-sm:flex-shrink-0">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div className="flex-1 max-sm:min-w-0">
                                    <Typography variant="h6" color="blue-gray" className="font-bold text-lg max-lg:text-base max-sm:text-xs text-gray-900">
                                      {transaction.type === 'FUND_TRANSFER' ? 'Fund Transfer' : 'Monthly Repayment'}
                                    </Typography>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Typography variant="small" color="gray" className="text-base max-lg:text-sm max-sm:text-xs text-gray-600 truncate">
                                        {formatDate(transaction.transaction_datetime)}
                                      </Typography>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right flex flex-col justify-end">
                                  <Typography 
                                    variant="h6" 
                                    className={`font-bold text-lg max-lg:text-base max-sm:text-xs mb-2 ${transaction.type === 'FUND_TRANSFER' ? 'text-green-700' : 'text-dark-plum'}`}
                                  >
                                    {transaction.type === 'FUND_TRANSFER' 
                                      ? (isStartup ? '+' : '-') 
                                      : (isStartup ? '-' : '+')
                                    }{formatCurrency(transaction.amount)}
                                  </Typography>
                                  <StatusBadge status={transaction.status} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Repayment Modal */}
      {showRepaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-sm:p-2">
          <Card className="p-8 max-lg:p-6 max-sm:p-4 w-96 max-lg:w-80 max-sm:w-full max-sm:max-w-sm rounded-2xl shadow-sm border border-gray-200">
            <Typography variant="h5" color="blue-gray" className="mb-8 max-lg:mb-6 max-sm:mb-4 text-2xl max-lg:text-xl max-sm:text-lg font-bold text-gray-900">
              {isPaymentOverdue() ? "Pay Overdue Amount" : "Pay Monthly Repayment"}
            </Typography>
            
            <div className="space-y-6 max-lg:space-y-4 max-sm:space-y-3">
              <div className="p-6 max-lg:p-4 max-sm:p-3 bg-gray-50 rounded-xl">
                <Typography variant="small" color="gray" className="mb-2 text-lg max-lg:text-base max-sm:text-sm text-gray-600">
                  Scheduled Payment Date
                </Typography>
                <Typography variant="h6" color="blue-gray" className="text-xl max-lg:text-lg max-sm:text-base font-bold text-gray-900">
                  {formatDate(next_repayment_date)}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-4 max-lg:mb-3 max-sm:mb-2 text-lg max-lg:text-base max-sm:text-sm text-gray-600">
                  Monthly Payment Amount (RM)
                </Typography>
                <input
                  type="number"
                  value={repaymentAmount.toFixed(2)}
                  onChange={(e) => setRepaymentAmount(Number(e.target.value))}
                  className="w-full p-4 max-lg:p-3 max-sm:p-2 border border-gray-300 rounded-xl text-lg max-lg:text-base max-sm:text-sm"
                  disabled={true} // Fixed amount for scheduled payments
                />
                <Typography variant="small" color="gray" className="mt-2 text-lg max-lg:text-base max-sm:text-sm text-gray-600">
                  This is your scheduled net monthly payment amount
                </Typography>
              </div>
              
              {/* Fee Breakdown */}
              <div className="p-6 max-lg:p-4 max-sm:p-3 bg-blue-50 rounded-xl border border-blue-200">
                <Typography variant="small" className="text-blue-700 font-bold mb-4 max-lg:mb-3 max-sm:mb-2 text-lg max-lg:text-base max-sm:text-sm">
                  Processing Fee Breakdown
                </Typography>
                <div className="space-y-2 text-lg max-lg:text-base max-sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Net Payment Amount:</span>
                    <span className="font-bold text-blue-700">RM {repaymentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Processing Fee (4% + RM 1):</span>
                    <span className="font-bold text-blue-700">RM {((repaymentAmount + 1) / 0.96 - repaymentAmount).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-800">Total Amount Charged:</span>
                      <span className="text-blue-800">RM {((repaymentAmount + 1) / 0.96).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row gap-4 max-lg:gap-3 max-sm:gap-2">
                <Button
                  variant="outlined"
                  className="flex-1 capitalize bg-transparent text-dark-plum hover:bg-gray-50 border-dark-plum text-lg max-lg:text-base max-sm:text-sm py-4 max-lg:py-3 max-sm:py-2.5 rounded-xl"
                  onClick={() => setShowRepaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 capitalize bg-dark-plum text-white hover:bg-light-purple text-lg max-lg:text-base max-sm:text-sm py-4 max-lg:py-3 max-sm:py-2.5 rounded-xl"
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