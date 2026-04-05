package com.running.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
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
     * 좌표 JSON 문자열을 List<double[]>으로 변환
     */
    public List<double[]> parseCoordinateJson(String json) throws Exception {
        if (json == null || json.isBlank()) return List.of();
        return objectMapper.readValue(json,
                objectMapper.getTypeFactory().constructCollectionType(List.class, double[].class));
    }
}
