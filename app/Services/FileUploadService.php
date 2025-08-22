<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class FileUploadService
{
    public function uploadToSupabase(UploadedFile $file, string $bucket): array
    {
        $filename = time() . '_' . auth()->user()->id . '_' . rawurlencode($file->getClientOriginalName()); 

        $projectUrl = config('supabase.project_url');
        $token = config('supabase.service_role_key');
        
        $fileContent = file_get_contents($file->getPathname());
        
        if (empty($projectUrl) || empty($token)) {
            throw new \Exception('Supabase credentials are missing. Check your .env file.');
        }
        
        try {
            $upload = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,   // Increase timeout for large files
            ])->withBody(
                $fileContent,
                'application/pdf'
            )->put(
                "$projectUrl/storage/v1/object/$bucket/$filename"
            );
            
            if ($upload->failed()) {
                $errorBody = $upload->body();
                $statusCode = $upload->status();
                
                if ($statusCode === 401) {
                    throw new \Exception('Supabase authentication failed. Check your service role key.');
                } elseif ($statusCode === 404) {
                    throw new \Exception("Bucket '$bucket' not found in Supabase project.");
                } elseif ($statusCode === 413) {
                    throw new \Exception('File too large for Supabase storage.');
                } else {
                    if (!mb_check_encoding($errorBody, 'UTF-8')) {
                        $errorBody = mb_convert_encoding($errorBody, 'UTF-8', 'UTF-8');
                    }
                    throw new \Exception("Supabase upload failed (HTTP $statusCode): " . $errorBody);
                }
            }
        } catch (\Exception $e) {
            throw $e;
        }

        return [
            'success' => true,
            'path' => $filename,
        ];
    }

    public function getSignedUrl(string $bucket, string $filename): string
    {
        $projectUrl = config('supabase.project_url');
        $token = config('supabase.service_role_key');

        if (empty($projectUrl) || empty($token)) {
            throw new \Exception('Supabase credentials are missing. Check your .env file.');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->withOptions([
                'verify' => false,
            ])->post("$projectUrl/storage/v1/object/sign/$bucket/$filename", [
                'expiresIn' => 60 * 60,
            ]);

            if ($response->failed()) {
                throw new \Exception("Failed to generate signed URL: " . $response->body());
            }

            $data = $response->json();
            $signedUrl = $data['signedURL'] ?? '';
            
            // If the signed URL is relative, prepend the project URL/storage/v1
            if ($signedUrl && !str_starts_with($signedUrl, 'http')) {
                $signedUrl = rtrim($projectUrl, '/') . '/storage/v1' . $signedUrl;
            }
            
            return $signedUrl;
        } catch (\Exception $e) {
            throw $e;
        }
    }
} 