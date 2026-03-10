const mysql = require('mysql2/promise');

async function insertThaiData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'gunpj_user',
    password: 'gunpj_password',
    database: 'gunpj_db'
  });

  try {
    const data = [
      { id: '1', fiscal_year: 2569, category: 'อาหารและน้ำดื่ม', amount: 7000, percentage: 35, description: 'อาหารเม็ด ขนมสัตว์ เค้กเนื้อ น้ำดื่มสะอาด', frequency: 'วัน' },
      { id: '2', fiscal_year: 2569, category: 'การรักษาและวัคซีน', amount: 6000, percentage: 30, description: 'วัคซีน ยาฆ่าเชื้อ ตรวจสอบสุขภาพ', frequency: 'เดือน' },
      { id: '3', fiscal_year: 2569, category: 'ที่พักพิง', amount: 4000, percentage: 20, description: 'ที่นอน อุปกรณ์พักผ่อน การทำความสะอาด', frequency: 'เดือน' },
      { id: '4', fiscal_year: 2569, category: 'สาธารณูปโภค', amount: 2000, percentage: 10, description: 'ค่าไฟฟ้า น้ำประปา วัสดุทำความสะอาด', frequency: 'เดือน' },
      { id: '5', fiscal_year: 2569, category: 'บริหารจัดการ', amount: 1000, percentage: 5, description: 'เอกสาร การจัดเก็บข้อมูล และอื่นๆ', frequency: 'เดือน' }
    ];

    for (const row of data) {
      await connection.execute(
        'INSERT INTO stray_animal_budget_breakdown (id, fiscal_year, category, amount, percentage, description, frequency) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [row.id, row.fiscal_year, row.category, row.amount, row.percentage, row.description, row.frequency]
      );
    }

    console.log('✅ Thai data inserted successfully');
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

insertThaiData();
