import { ChevronLeftIcon, ClockIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, IconButton, Progress, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidenav } from "../../components/sidenav";
import { StatusBadge } from "../../components/StatusBadge";

export const TransactionDetails = (): JSX.Element => {
  const { id } = useParams();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [startupData, setStartupData] = useState<any>(null);
  const [next_repayment_date, setNextRepaymentDate] = useState<any>(null);
  const [overdue_detail, setOverdueDetail] = useState<any>(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const isStartup = useState(localStorage.getItem('role') === 'startup');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendReminder, setSendReminder] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
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
      axios.post(`${API_BASE_URL}/repayment-reminder/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      .then((response)=>{
        setSendReminder(true);
      })
      .catch((error)=>{
        console.error('Failed to send reminder:', error);
      })
      // Could add a success notification here
    } catch (error) {
      console.error('Failed to send reminder:', error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full">
      {/* Sidebar */}
      <div className="fixed w-[311px] h-full left-0 top-0">
        <Sidenav active="transactions" />
      </div>

      {/* Main Content */}
      <div className="ml-[255px] p-10 w-full overflow-auto">
        <div className="space-y-6 max-w-[1200px] ml-[20px]">
          {/* Header */}
          <div className="py-8 flex items-center justify-between">
            <div className="flex items-center">
              <IconButton
                variant="text"
                className="mr-4 flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </IconButton>
              <div>
                <Typography variant="h4" color="blue-gray">
                  Transaction Details
                </Typography>
                <Typography variant="small" color="gray" className="mt-1">
                  Application ID: {applicationData.id}
                </Typography>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Repayment Button for Startups - Only show when payment is due and not completed */}
              {isStartup && applicationData.status === 'Active' && !isApplicationCompleted() && isPaymentDue() && (
                <Button
                  color={isPaymentOverdue() ? "red" : "blue"}
                  className="flex items-center gap-2 capitalize"
                  onClick={() => setShowRepaymentModal(true)}
                >
                  <CurrencyDollarIcon className="h-4 w-4" />
                  {isPaymentOverdue() ? "Pay Overdue Amount" : "Pay Monthly Repayment"}
                </Button>
              )}

              {/* Reminder Button for Investors - Only show when payment is overdue and not completed */}
              {!isStartup && applicationData.status === 'Active' && !isApplicationCompleted() && isPaymentOverdue() && (
                <Button
                  color="orange"
                  variant="outlined"
                  className="flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                  onClick={handleSendReminder}
                  disabled={sendReminder}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {sendReminder ? 'Sent' : 'Send Reminder'}
                </Button>
              )}
            </div>
          </div>

          {/* Application Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-10">
            <Card className="p-4">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2">
                  Repayment Cap
                </Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">
                  {formatCurrency(applicationData.repayment_cap)}
                </Typography>
              </CardBody>
            </Card>

            <Card className="p-4">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2">
                  Funding Amount
                </Typography>
                <Typography variant="h5" color="green" className="font-bold">
                  {formatCurrency(applicationData.funding_amount)}
                </Typography>
              </CardBody>
            </Card>

            <Card className="p-4">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2">
                  Remaining Balance
                </Typography>
                <Typography variant="h5" color="orange" className="font-bold">
                  {formatCurrency(applicationData.repayment_cap - applicationData.total_repaid)}
                </Typography>
              </CardBody>
            </Card>

            <Card className="p-4">
              <CardBody className="p-0">
                <Typography variant="small" color="gray" className="mb-2">
                  Revenue Share Percentage
                </Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">
                  {applicationData.revenue_share_percentage}%
                </Typography>
              </CardBody>
            </Card>
          </div>

          {/* Repayment Progress */}
          <div className="mx-10">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" color="blue-gray">
                  Repayment Progress
                </Typography>
                <Typography variant="small" color="gray">
                  {Math.round(calculateProgress())}% Complete
                </Typography>
              </div>
              <Progress 
                value={calculateProgress()} 
                color="blue" 
                className="h-3"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Fund Transfer Date: {formatDate(transactionData[0].transaction_datetime)}</span>
                <span>Revenue Share Percentage: {applicationData.revenue_share_percentage}%</span>
              </div>
            </Card>
          </div>

          {/* Next Payment Alert */}
          <div className="mx-10">
            {isApplicationCompleted() ? (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" color="green" className="font-semibold">
                      Application Completed
                    </Typography>
                    <Typography variant="small" color="gray">
                      All payments have been successfully completed
                    </Typography>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className={`p-4 ${isPaymentOverdue() ? 'bg-red-50 border-red-200' : isPaymentDue() ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${isPaymentOverdue() ? 'text-red-500' : isPaymentDue() ? 'text-orange-500' : 'text-blue-500'}`} />
                  <div className="flex-1">
                    <Typography variant="h6" color={isPaymentOverdue() ? "red" : isPaymentDue() ? "orange" : "blue"} className="font-semibold">
                      {isPaymentOverdue() ? "Payment Overdue" : isPaymentDue() ? "Payment Due Today" : "Next Payment Due"}
                    </Typography>
                    {isPaymentDue() && (
                      <Typography variant="small" color="gray">
                        {formatDate(next_repayment_date)} - {formatCurrency(repaymentAmount)}
                      </Typography>
                    )}
                    
                    {!isPaymentDue() && (
                      <Typography variant="small" color="gray" className="mt-1">
                        Next payment: {formatDate(next_repayment_date)}
                      </Typography>
                    )}
                  </div>
                  
                  {/* Investor-specific overdue information */}
                  {!isStartup && isPaymentOverdue() && (
                    <div className="text-right">
                      <Typography variant="small" color="red" className="font-semibold">
                        {overdue_detail.days_overdue} days overdue
                      </Typography>
                      <Typography variant="small" color="gray">
                        Startup: {startupData.company_name}
                      </Typography>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Transaction History */}
          <div className="mx-10">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Transaction History
            </Typography>
            
            <div className="space-y-4">
              {transactionData && transactionData.map((transaction: any) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <Typography variant="h6" color="blue-gray" className="font-semibold">
                          {transaction.type === 'FUND_TRANSFER' ? 'Fund Transfer' : 'MonthlyRepayment'}
                        </Typography>
                        <Typography variant="small" color="gray">
                          {transaction.type === 'FUND_TRANSFER' ? 'Initial transfer for investment fund' : 'Monthly principal and interest payment'}
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                          <Typography variant="small" color="gray">
                            {formatDate(transaction.transaction_datetime)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Typography 
                        variant="h6" 
                        color={transaction.type === 'FUND_TRANSFER' ? "green" : "blue-gray"}
                        className="font-bold"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              {isPaymentOverdue() ? "Pay Overdue Amount" : "Pay Monthly Installment"}
            </Typography>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="small" color="gray" className="mb-1">
                  Scheduled Payment Date
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {formatDate(next_repayment_date)}
                </Typography>
              </div>

              <div>
                <Typography variant="small" color="gray" className="mb-2">
                  Monthly Payment Amount (RM)
                </Typography>
                <input
                  type="number"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                  disabled={true} // Fixed amount for scheduled payments
                />
                <Typography variant="small" color="gray" className="mt-1">
                  This is your scheduled monthly payment amount
                </Typography>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  className="flex-1 capitalize bg-transparent text-dark-plum hover:bg-gray-50 border-dark-plum"
                  onClick={() => setShowRepaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 capitalize bg-dark-plum text-white hover:bg-light-purple"
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
