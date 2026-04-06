package com.running.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class GpxParserService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * GPX InputStream에서 좌표 배열([[lat, lng], ...])을 파싱해 JSON 문자열로 반환
     */
    public String parseCoordinates(InputStream gpxStream) throws Exception {
        Document doc = DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
                .parse(gpxStream);

        NodeList trkpts = doc.getElementsByTagName("trkpt");
        List<double[]> coordinates = new ArrayList<>();

        for (int i = 0; i < trkpts.getLength(); i++) {
            var node = trkpts.item(i);
            double lat = Double.parseDouble(node.getAttributes().getNamedItem("lat").getNodeValue());
            double lng = Double.parseDouble(node.getAttributes().getNamedItem("lon").getNodeValue());
            coordinates.add(new double[]{lat, lng});
        }

        return objectMapper.writeValueAsString(coordinates);
    }

    /**
     * GPX InputStream에서 첫 번째 trkpt의 time 태그를 파싱해 LocalDate 반환
     * time 태그 없으면 null 반환
     */
    public LocalDate parseRunDate(InputStream gpxStream) throws Exception {
        Document doc = DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
                .parse(gpxStream);

        NodeList times = doc.getElementsByTagName("time");
        if (times.getLength() == 0) return null;

        // ISO 8601 형식: "2024-01-15T08:30:00Z" → 앞 10자만 사용
        String timeStr = times.item(0).getTextContent().trim();
        if (timeStr.length() < 10) return null;
        return LocalDate.parse(timeStr.substring(0, 10));
    }

    /**
     * 좌표 JSON 문자열을 List<double[]>으로 변환
     */
    public List<double[]> parseCoordinateJson(String json) throws Exception {
        if (json == null || json.isBlank()) return List.of();
        return objectMapper.readValue(json,
                objectMapper.getTypeFactory().constructCollectionType(List.class, double[].class));
    }
}
