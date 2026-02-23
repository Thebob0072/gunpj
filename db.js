const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database in project root
const dbPath = path.join(__dirname, 'app.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`📦 Database initialized at: ${dbPath}`);

// Initialize tables
function initializeDatabase() {
  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      details TEXT,
      assignee TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      status TEXT DEFAULT 'To Do',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create assignees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      position TEXT,
      role TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create LINE groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS line_groups (
      groupId TEXT PRIMARY KEY,
      groupName TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create LINE members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS line_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      displayName TEXT NOT NULL,
      pictureUrl TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (groupId) REFERENCES line_groups(groupId) ON DELETE CASCADE,
      UNIQUE(groupId, userId)
    )
  `);

  console.log('✅ Database tables initialized');
}

// Task functions
const Tasks = {
  getAllTasks() {
    return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
  },

  getTaskById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  createTask(task) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, details, assignee, startDate, endDate, startTime, endTime, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
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
    );
    return this.getTaskById(task.id);
  },

  updateTask(id, task) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE tasks
      SET title = ?, details = ?, assignee = ?, startDate = ?, endDate = ?, startTime = ?, endTime = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(
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
    );
    return this.getTaskById(id);
  },

  deleteTask(id) {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }
};

// Assignee functions
const Assignees = {
  getAllAssignees() {
    return db.prepare('SELECT * FROM assignees ORDER BY createdAt DESC').all();
  },

  getAssigneeById(id) {
    return db.prepare('SELECT * FROM assignees WHERE id = ?').get(id);
  },

  getAssigneeByName(name) {
    return db.prepare('SELECT * FROM assignees WHERE name = ?').get(name);
  },

  createAssignee(assignee) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO assignees (id, name, position, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      assignee.id,
      assignee.name,
      assignee.position || '',
      assignee.role || '',
      now,
      now
    );
    return this.getAssigneeById(assignee.id);
  },

  updateAssignee(id, assignee) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE assignees
      SET name = ?, position = ?, role = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(
      assignee.name,
      assignee.position || '',
      assignee.role || '',
      now,
      id
    );
    return this.getAssigneeById(id);
  },

  deleteAssignee(id) {
    db.prepare('DELETE FROM assignees WHERE id = ?').run(id);
  }
};

// LINE Groups functions
const LineGroups = {
  getAllGroups() {
    return db.prepare('SELECT * FROM line_groups ORDER BY createdAt DESC').all();
  },

  getGroupById(groupId) {
    return db.prepare('SELECT * FROM line_groups WHERE groupId = ?').get(groupId);
  },

  createGroup(groupId, groupName) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO line_groups (groupId, groupName, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(groupId, groupName, now, now);
    return this.getGroupById(groupId);
  },

  updateGroup(groupId, groupName) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE line_groups
      SET groupName = ?, updatedAt = ?
      WHERE groupId = ?
    `);
    stmt.run(groupName, now, groupId);
    return this.getGroupById(groupId);
  },

  deleteGroup(groupId) {
    db.prepare('DELETE FROM line_groups WHERE groupId = ?').run(groupId);
  }
};

// LINE Members functions
const LineMembers = {
  getMembersByGroupId(groupId) {
    return db.prepare('SELECT userId, displayName, pictureUrl FROM line_members WHERE groupId = ? ORDER BY createdAt DESC').all(groupId);
  },

  addMember(groupId, userId, displayName, pictureUrl) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO line_members (groupId, userId, displayName, pictureUrl, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(groupId, userId, displayName, pictureUrl || '', now);
  },

  clearGroupMembers(groupId) {
    db.prepare('DELETE FROM line_members WHERE groupId = ?').run(groupId);
  }
};

// Initialize database on module load
initializeDatabase();

module.exports = {
  db,
  Tasks,
  Assignees,
  LineGroups,
  LineMembers
};
