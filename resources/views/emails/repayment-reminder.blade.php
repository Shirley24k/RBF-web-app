<!DOCTYPE html>
<html>
<head>
    <title>Repayment Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .urgent { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Repayment Reminder</h2>
            <p>Dear {{ $application->startup->name }},</p>
        </div>

        @if($daysUntilDue > 0)
            <div class="urgent">
                <h3>⚠️ Repayment Due Soon</h3>
                <p>Your monthly repayment is due in <strong>{{ $daysUntilDue }} days</strong>.</p>
            </div>
        @else
            <div class="urgent" style="background-color: #f8d7da; border-color: #f5c6cb;">
                <h3>🚨 URGENT: Repayment Overdue</h3>
                <p>Your monthly repayment is <strong>{{ abs($daysUntilDue) }} days overdue</strong>.</p>
            </div>
        @endif

        <div class="details">
            <h3>Repayment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Application ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">#{{ $application->id }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Due Date:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ $dueDate->format('F j, Y') }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Due:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">RM {{ number_format($repaymentAmount, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Investor:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ $application->investor->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Total Repaid:</strong></td>
                    <td style="padding: 8px 0;">RM {{ number_format($application->total_repaid, 2) }}</td>
                </tr>
            </table>
        </div>

        <p>Please log in to your account to make the payment before the due date to avoid any late fees or penalties.</p>

        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

        <div class="footer">
            <p><strong>Important:</strong></p>
            <ul>
                <li>Late payments may affect your credit rating</li>
                <li>Ensure sufficient funds are available in your account</li>
                <li>Keep this email for your records</li>
            </ul>
            <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html> 