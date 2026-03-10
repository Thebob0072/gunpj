CREATE TABLE IF NOT EXISTS stray_animal_budget_breakdown (
  id VARCHAR(36) PRIMARY KEY,
  fiscal_year INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  percentage INT NOT NULL,
  description TEXT,
  frequency VARCHAR(20),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO stray_animal_budget_breakdown (id, fiscal_year, category, amount, percentage, description, frequency)
VALUES
('1', 2569, 'อาหารและน้ำดื่ม', 7000, 35, 'อาหารเม็ด ขนมสัตว์ เค้กเนื้อ น้ำดื่มสะอาด', 'ต่อวัน'),
('2', 2569, 'การรักษาและวัคซีน', 6000, 30, 'วัคซีน ยาฆ่าเชื้อ ตรวจสอบสุขภาพ', 'ต่อเดือน'),
('3', 2569, 'ที่พักพิง', 4000, 20, 'ที่นอน อุปกรณ์พักผ่อน การทำความสะอาด', 'ต่อเดือน'),
('4', 2569, 'สาธารณูปโภค', 2000, 10, 'ค่าไฟฟ้า น้ำประปา วัสดุทำความสะอาด', 'ต่อเดือน'),
('5', 2569, 'บริหารจัดการ', 1000, 5, 'เอกสาร การจัดเก็บข้อมูล อื่นๆ', 'ต่อเดือน');
