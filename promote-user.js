const mysql = require('mysql2/promise');

const email = process.argv[2];

if (!email) {
  console.log('Error: Please specify the user email.');
  console.log('Usage: node promote-user.js user@example.com');
  process.exit(1);
}

async function main() {
  const host = 'localhost';
  const port = 3306;
  const user = 'root';
  const password = '';
  const database = 'achi_db';

  try {
    const connection = await mysql.createConnection({ host, port, user, password, database });
    console.log('[MySQL] Connected to database.');

    const [result] = await connection.query(
      'UPDATE users SET role = "admin" WHERE email = ?',
      [email]
    );

    if (result.affectedRows > 0) {
      console.log(`[Success] User "${email}" has been successfully promoted to "admin"!`);
      console.log('You can now log in with this account and access http://localhost:4321/admin');
    } else {
      console.log(`[Error] User with email "${email}" was not found in the database.`);
      console.log('Please register this email first at http://localhost:4321/auth/signup');
    }

    await connection.end();
  } catch (error) {
    console.error('[MySQL Error] failed:', error);
  }
}

main();
