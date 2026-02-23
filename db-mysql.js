const mysql = require('mysql2/promise');

// Railway MySQL uses MYSQLHOST, MYSQLUSER, etc.
// Custom/local uses DB_HOST, DB_USER, etc.
const dbHost     = process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost';
const dbPort     = process.env.MYSQLPORT     || process.env.DB_PORT     || 3306;
const dbUser     = process.env.MYSQLUSER     || process.env.DB_USER     || 'gunpj_user';
const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'gunpj_password';
const dbName     = process.env.MYSQLDATABASE || process.env.DB_NAME     || 'gunpj_db';

// MySQL Connection Pool Configuration
const pool = mysql.createPool({
  host: dbHost,
  port: Number(dbPort),
  user: dbUser,
  password: dbPassword,
  database: dbName,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(`🗄️  MySQL Connection Pool initialized`);
console.log(`   Host: ${dbHost}:${dbPort}`);

// Initialize database tables
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        details LONGTEXT,
        assignee VARCHAR(255) NOT NULL,
        startDate VARCHAR(10) NOT NULL,
        endDate VARCHAR(10) NOT NULL,
        startTime VARCHAR(5) NOT NULL,
        endTime VARCHAR(5) NOT NULL,
        status VARCHAR(50) DEFAULT 'To Do',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        INDEX idx_status (status),
        INDEX idx_assignee (assignee)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create assignees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assignees (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        position VARCHAR(255),
        role VARCHAR(255),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create LINE groups table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS line_groups (
        groupId VARCHAR(255) PRIMARY KEY,
        groupName VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create LINE members table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS line_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        groupId VARCHAR(255) NOT NULL,
        userId VARCHAR(255) NOT NULL,
        displayName VARCHAR(255) NOT NULL,
        pictureUrl LONGTEXT,
        createdAt DATETIME NOT NULL,
        FOREIGN KEY (groupId) REFERENCES line_groups(groupId) ON DELETE CASCADE,
        UNIQUE KEY unique_member (groupId, userId),
        INDEX idx_groupId (groupId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error('Error initializing database:', error);
    }
  } finally {
    await connection.release();
  }
}

// Task functions
const Tasks = {
  async getAllTasks() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM tasks ORDER BY createdAt DESC');
      return rows;
    } finally {
      await connection.release();
    }
  },

  async getTaskById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [id]);
      return rows[0];
    } finally {
      await connection.release();
    }
  },

  async createTask(task) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `INSERT INTO tasks (id, title, details, assignee, startDate, endDate, startTime, endTime, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.title,
          task.details || '',
          task.assignee,
          task.startDate,
          task.endDate,
          task.startTime,
          task.endTime,
          task.status || 'To Do',
          now,
          now
        ]
      );
      return this.getTaskById(task.id);
    } finally {
      await connection.release();
    }
  },

  async updateTask(id, task) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `UPDATE tasks SET title = ?, details = ?, assignee = ?, startDate = ?, endDate = ?, startTime = ?, endTime = ?, status = ?, updatedAt = ?
         WHERE id = ?`,
        [
          task.title,
          task.details || '',
          task.assignee,
          task.startDate,
          task.endDate,
          task.startTime,
          task.endTime,
          task.status,
          now,
          id
        ]
      );
      return this.getTaskById(id);
    } finally {
      await connection.release();
    }
  },

  async deleteTask(id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM tasks WHERE id = ?', [id]);
    } finally {
      await connection.release();
    }
  }
};

// Assignee functions
const Assignees = {
  async getAllAssignees() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM assignees ORDER BY createdAt DESC');
      return rows;
    } finally {
      await connection.release();
    }
  },

  async getAssigneeById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM assignees WHERE id = ?', [id]);
      return rows[0];
    } finally {
      await connection.release();
    }
  },

  async getAssigneeByName(name) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM assignees WHERE name = ?', [name]);
      return rows[0];
    } finally {
      await connection.release();
    }
  },

  async createAssignee(assignee) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `INSERT INTO assignees (id, name, position, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          assignee.id,
          assignee.name,
          assignee.position || '',
          assignee.role || '',
          now,
          now
        ]
      );
      return this.getAssigneeById(assignee.id);
    } finally {
      await connection.release();
    }
  },

  async updateAssignee(id, assignee) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `UPDATE assignees SET name = ?, position = ?, role = ?, updatedAt = ?
         WHERE id = ?`,
        [
          assignee.name,
          assignee.position || '',
          assignee.role || '',
          now,
          id
        ]
      );
      return this.getAssigneeById(id);
    } finally {
      await connection.release();
    }
  },

  async deleteAssignee(id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM assignees WHERE id = ?', [id]);
    } finally {
      await connection.release();
    }
  }
};

// LINE Groups functions
const LineGroups = {
  async getAllGroups() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM line_groups ORDER BY createdAt DESC');
      return rows;
    } finally {
      await connection.release();
    }
  },

  async getGroupById(groupId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM line_groups WHERE groupId = ?', [groupId]);
      return rows[0];
    } finally {
      await connection.release();
    }
  },

  async createGroup(groupId, groupName) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `INSERT INTO line_groups (groupId, groupName, createdAt, updatedAt)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE groupName = ?, updatedAt = ?`,
        [groupId, groupName, now, now, groupName, now]
      );
      return this.getGroupById(groupId);
    } finally {
      await connection.release();
    }
  },

  async updateGroup(groupId, groupName) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `UPDATE line_groups SET groupName = ?, updatedAt = ? WHERE groupId = ?`,
        [groupName, now, groupId]
      );
      return this.getGroupById(groupId);
    } finally {
      await connection.release();
    }
  },

  async deleteGroup(groupId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM line_groups WHERE groupId = ?', [groupId]);
    } finally {
      await connection.release();
    }
  }
};

// LINE Members functions
const LineMembers = {
  async getMembersByGroupId(groupId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT userId, displayName, pictureUrl FROM line_members WHERE groupId = ? ORDER BY createdAt DESC',
        [groupId]
      );
      return rows;
    } finally {
      await connection.release();
    }
  },

  async addMember(groupId, userId, displayName, pictureUrl) {
    const connection = await pool.getConnection();
    try {
      const now = new Date();
      await connection.execute(
        `INSERT INTO line_members (groupId, userId, displayName, pictureUrl, createdAt)
         VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE displayName = ?, pictureUrl = ?`,
        [groupId, userId, displayName, pictureUrl || '', now, displayName, pictureUrl || '']
      );
    } finally {
      await connection.release();
    }
  },

  async clearGroupMembers(groupId) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM line_members WHERE groupId = ?', [groupId]);
    } finally {
      await connection.release();
    }
  }
};

// Initialize on module load
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = {
  pool,
  Tasks,
  Assignees,
  LineGroups,
  LineMembers
};
