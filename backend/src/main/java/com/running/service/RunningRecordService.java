package com.running.service;

import com.running.dto.RunningRecordResponse;
import com.running.entity.RunningRecord;
import com.running.repository.RunningRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RunningRecordService {

    private final RunningRecordRepository runningRecordRepository;
    private final GpxParserService gpxParserService;

    public RunningRecordResponse upload(MultipartFile file, String title, LocalDate runDate,
                                        double distanceKm, Integer durationSeconds) throws Exception {
        String coordinatesJson = gpxParserService.parseCoordinates(file.getInputStream());

        RunningRecord record = new RunningRecord();
        record.setTitle(title);
        record.setRunDate(runDate);
        record.setDistanceKm(distanceKm);
        record.setDurationSeconds(durationSeconds);
        record.setCoordinates(coordinatesJson);

        RunningRecord saved = runningRecordRepository.save(record);
        return toResponse(saved);
    }

    public List<RunningRecordResponse> getAll() {
        return runningRecordRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<RunningRecordResponse> getByPeriod(String period) {
        LocalDate today = LocalDate.now();
        List<RunningRecord> records = switch (period) {
            case "today" -> runningRecordRepository.findByRunDate(today);
            case "week" -> runningRecordRepository.findByRunDateBetween(today.minusDays(6), today);
            default -> runningRecordRepository.findAll();
        };
        return records.stream().map(this::toResponse).toList();
    }

    private RunningRecordResponse toResponse(RunningRecord record) {
        try {
            return RunningRecordResponse.builder()
                    .id(record.getId())
                    .title(record.getTitle())
                    .runDate(record.getRunDate())
                    .distanceKm(record.getDistanceKm())
                    .durationSeconds(record.getDurationSeconds())
                    .coordinates(gpxParserService.parseCoordinateJson(record.getCoordinates()))
                    .createdAt(record.getCreatedAt())
                    .build();
        } catch (Exception e) {
            log.error("좌표 파싱 실패 - recordId: {}", record.getId(), e);
            return RunningRecordResponse.builder()
                    .id(record.getId())
                    .title(record.getTitle())
                    .runDate(record.getRunDate())
                    .distanceKm(record.getDistanceKm())
                    .durationSeconds(record.getDurationSeconds())
                    .coordinates(List.of())
                    .createdAt(record.getCreatedAt())
                    .build();
        }
    }
}
