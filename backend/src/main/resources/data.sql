-- 샘플 러닝 기록 (서울 한강 공원 근처 좌표)
INSERT INTO running_record (title, run_date, distance_km, duration_seconds, coordinates, created_at) VALUES
('한강 러닝', CURRENT_DATE, 5.2, 1800, '[[37.5215,126.9428],[37.5220,126.9450],[37.5230,126.9480],[37.5240,126.9510],[37.5250,126.9540]]', CURRENT_TIMESTAMP),
('여의도 러닝', DATEADD(DAY, -2, CURRENT_DATE), 7.5, 2700, '[[37.5255,126.9240],[37.5260,126.9260],[37.5270,126.9290],[37.5280,126.9310],[37.5290,126.9340]]', CURRENT_TIMESTAMP),
('올림픽공원 러닝', DATEADD(DAY, -5, CURRENT_DATE), 6.0, 2100, '[[37.5204,127.1178],[37.5210,127.1200],[37.5220,127.1220],[37.5230,127.1240],[37.5240,127.1260]]', CURRENT_TIMESTAMP);

-- 샘플 목표 (월 50km)
INSERT INTO goal (monthly_distance_km, created_at) VALUES
(50.0, CURRENT_TIMESTAMP);
