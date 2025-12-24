const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  try {
    console.log('🔗 连接数据库...');
    
    // 首先连接到MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ 数据库连接成功');

    // 读取并执行SQL文件
    const fs = require('fs');
    const path = require('path');
    const sqlFile = fs.readFileSync(path.join(__dirname, '../database.sql'), 'utf8');
    
    // 分割SQL语句
    const statements = sqlFile
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 执行 ${statements.length} 个SQL语句...`);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
      } catch (error) {
        if (error.code !== 'ER_TABLE_EXISTS_ERROR' && error.code !== 'ER_DB_CREATE_EXISTS') {
          console.error(`❌ 执行失败: ${statement}`, error.message);
        }
      }
    }

    console.log('🎉 数据库初始化完成！');
    
    // 测试连接
    const testConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'class_fee',
    });

    const [rows] = await testConnection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 用户表记录数: ${rows[0].count}`);

    await testConnection.end();
    await connection.end();

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}