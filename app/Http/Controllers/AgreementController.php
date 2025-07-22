<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Agreement;

class AgreementController extends Controller
{
    public function getAgreement($application_id)
    {
        $agreement = Agreement::where('application_id', $application_id)->first();
        if ($agreement){
            return response()->json([
                'message' => 'Agreement found',
                'data' => $agreement
            ], 200);
        }
        return response()->json([
            'message' => 'Agreement not found',
            'data' => null
        ], 404);
    }
}
