<!DOCTYPE html>
<html>
<head>
    <title>Investor Top-up Reminder</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f9f9;
        }
        .header { 
            background-color: #2c3e50; 
            color: white;
            padding: 30px 20px; 
            border-radius: 8px 8px 0 0; 
            margin-bottom: 0;
            text-align: center;
        }
        .content {
            background-color: white;
            padding: 30px 20px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .urgent { 
            background-color: #fff3cd; 
            border: 2px solid #ffeaa7; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center;
        }
        .success {
            background-color: #d4edda;
            border: 2px solid #c3e6cb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .details { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
        }
        .button { 
            display: inline-block; 
            background-color: rgba(62, 92, 124, 0.99); 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
            font-size: 16px;
        }
        .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
        }
        .balance {
            font-size: 18px;
            font-weight: bold;
            color: #27ae60;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Fund Transfer Status</h1>
            <p>Dear {{ $application->investor->name }},</p>
        </div>

        <div class="content">
            <div class="urgent">
                <h2>⚠️ Action Required</h2>
                <p>You need to top up your platform balance to proceed with the fund transfer.</p>
                <div class="amount">RM {{ number_format($shortfall, 2) }}</div>
                <p><strong>Additional amount needed</strong></p>
            </div>

            <div class="details">
                <h3>Application Details</h3>
                <table>
                    <tr>
                        <th>Application ID:</th>
                        <td>#{{ $application->id }}</td>
                    </tr>
                    <tr>
                        <th>Startup:</th>
                        <td>{{ $application->startup->name }}</td>
                    </tr>
                    <tr>
                        <th>Funding Amount:</th>
                        <td>RM {{ number_format($requiredAmount, 2) }}</td>
                    </tr>
                    <tr>
                        <th>Your Current Balance:</th>
                        <td>RM {{ number_format($currentBalance, 2) }}</td>
                    </tr>
                    <tr>
                        <th>Shortfall:</th>
                        <td style="color: #e74c3c; font-weight: bold;">RM {{ number_format($shortfall, 2) }}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center;">
                <p><strong>To proceed with the fund transfer, please top up your platform balance.</strong></p>
                <a href="{{ config('app.frontend_url') }}/investor-transaction" class="button">
                    💳 Top Up Now
                </a>
            </div>

            <div class="footer">
                <p><strong>Important Information:</strong></p>
                <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <li>Fund transfers are processed within 24-48 hours after balance confirmation</li>
                    <li>Ensure your Stripe account is properly connected</li>
                    <li>Contact support if you encounter any issues</li>
                </ul>
                <p style="margin-top: 20px;">This is an automated notification. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html> 