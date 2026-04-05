package com.running.controller;

import com.running.dto.ApiResponse;
import com.running.dto.RunningRecordResponse;
import com.running.service.RunningRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/running-records")
@RequiredArgsConstructor
public class RunningRecordController {

    private final RunningRecordService runningRecordService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<RunningRecordResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("runDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate runDate,
            @RequestParam("distanceKm") double distanceKm,
            @RequestParam(value = "durationSeconds", required = false) Integer durationSeconds
    ) throws Exception {
        RunningRecordResponse response = runningRecordService.upload(file, title, runDate, distanceKm, durationSeconds);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RunningRecordResponse>>> getRecords(
            @RequestParam(required = false) String period
    ) {
        List<RunningRecordResponse> records = period != null
                ? runningRecordService.getByPeriod(period)
                : runningRecordService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(records));
    }
}
