package org.example.agrimarket.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Uploads file bytes to Supabase Storage and returns the public HTTP URL.
     */
    public String uploadFileBytes(byte[] fileBytes, String originalFileName, String contentType, String folder) {
        String cleanedFolder = folder != null ? folder.trim().replaceAll("^/|/$", "") : "uploads";
        
        // Generate a unique file name to avoid collisions
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String filePath = cleanedFolder + "/" + uniqueFileName;

        // Construct Supabase Storage Upload API URL
        // POST /storage/v1/object/{bucket}/{filePath}
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            
            if (contentType != null && !contentType.isEmpty()) {
                headers.setContentType(MediaType.parseMediaType(contentType));
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }

            HttpEntity<byte[]> entity = new HttpEntity<>(fileBytes, headers);

            log.info("Uploading file to Supabase Storage: {}", uploadUrl);
            ResponseEntity<Map> response = restTemplate.postForEntity(uploadUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // Construct the public URL
                // GET /storage/v1/object/public/{bucket}/{filePath}
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filePath;
                log.info("File uploaded successfully. Public URL: {}", publicUrl);
                return publicUrl;
            } else {
                throw new RuntimeException("Supabase Storage responded with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Failed to upload file to Supabase Storage", e);
            throw new RuntimeException("Failed to upload file to Supabase Storage: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads a MultipartFile to Supabase Storage and returns the public HTTP URL.
     */
    public String uploadMultipartFile(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }
        try {
            return uploadFileBytes(file.getBytes(), file.getOriginalFilename(), file.getContentType(), folder);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes for upload", e);
        }
    }

    /**
     * Deletes a file from Supabase Storage given its public URL.
     */
    public void deleteFileByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Locate the relative file path from the public URL
            // Format of public URL: https://[project].supabase.co/storage/v1/object/public/[bucket]/[folder]/[filename]
            String searchPattern = "/storage/v1/object/public/" + bucketName + "/";
            int index = fileUrl.indexOf(searchPattern);
            if (index == -1) {
                log.warn("URL does not match Supabase Storage public format, skipping delete: {}", fileUrl);
                return;
            }

            String filePath = fileUrl.substring(index + searchPattern.length());
            
            // Construct Supabase Storage Delete API URL
            // DELETE /storage/v1/object/{bucket}/{filePath}
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Deleting file from Supabase Storage: {}", deleteUrl);
            ResponseEntity<Map> response = restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("File deleted successfully from Supabase Storage: {}", filePath);
            } else {
                log.warn("Supabase Storage delete request returned status: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Failed to delete file from Supabase Storage: {}", fileUrl, e);
        }
    }
}
