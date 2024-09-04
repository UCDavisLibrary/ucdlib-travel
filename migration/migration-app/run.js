// import pg from 'pg';
// const pool = new pg.Pool();
const mysql = require('mysql2/promise');
const { Client } = require('pg');


// Create a connection to the MySQL database
const connectToMySQLDatabase = async () => {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',  // 'mysql' refers to the service name in Docker Compose
        port: process.env.MYSQL_PORT || '3306',
        user: process.env.MYSQL_USER || 'mysql_user',
        password: process.env.MYSQL_PASSWORD || 'mysql_password',
        database: process.env.MYSQL_DATABASE || 'my_mysql_db'
    });

    return connection;
};

// Create a connection to the MySQL database
const connectToPostgresDatabase = async () => {
    const connection = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'db',  
        database: process.env.POSTGRES_DATABASE || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'localhost',
        port: process.env.POSTGRES_PORT || 5432
    });


    // connection.connect()
    // .then(() => {
    //     connection.query('SELECT NOW()');
    // })
    // .then(res => {
    //     console.log('Query result:', res.rows);
    // })
    // .catch(err => console.error('Connection error', err.stack))
    // .finally(() => {
    //     connection.end();
    // });

    // connection.connect()
    // .then(() => {
    //     return connection;
    // })
    // .catch(err => console.error('Connection error', err.stack));

    return connection;
};


// Run MySQL query
const runPostgresQuery = async () => {
    try {
        const connection = await connectToPostgresDatabase();

        const sql = 'SELECT * FROM settings';
        // Simple query to test the connection
        connection.connect()
        .then(() => {
            console.log("Q:",connection.query('SELECT NOW()'));
        })


        // const [rows] = await connection.query(sql);
        // console.log("R:",rows);

        await connection.end();
        //return rows;                    

    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

runPostgresQuery();

// Run MySQL query
const runMySQLQuery = async () => {
    try {
        const connection = await connectToMySQLDatabase();

        const sql = `
            SELECT
                f.*,
                (SELECT
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'activityHistoryId', h.id,
                            'formId', h.forms_id,
                            'userId', h.userid,
                            'name', h.name,
                            'relation', h.relation,
                            'action', h.action,
                            'approveProfdevAmount', h.approve_profdev_amount,
                            'approveAdminAmount', h.approve_admin_amount,
                            'approveAdminReason', h.approve_admin_reason,
                            'approveExternalAmount', h.approve_external_amount,
                            'approveLaucAmount', h.approve_lauc_amount,
                            'approveGrantAmount', h.approve_grant_amount,
                            'approveFund1Name', h.approve_fund1_name,
                            'approveFund1Amount', h.approve_fund1_amount,
                            'approveFund2Name', h.approve_fund2_name,
                            'approveFund2Amount', h.approve_fund2_amount,
                            'comments', h.comments,
                            'submitted', h.submitted
                        )
                    )
                    FROM
                        history h
                    WHERE
                        h.forms_id = f.id
                ) AS activity_history
            FROM
                forms f
            LEFT JOIN
                history h ON f.id = h.forms_id
            GROUP BY
                f.id
            ORDER BY
                f.id ASC;    
        `;
        // Simple query to test the connection
        const [rows] = await connection.execute(sql);
        

        await connection.end();
        return rows;                    

    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

// Create a connection to the MySQL database
const convertData = async () => {
    //const rows = await runMySQLQuery();
    const rows = await runPostgresQuery();
    console.log('The solution 1 is:', rows); // Should output: The solution is: 2
};

// convertData();


// const connection = mysql.createConnection({
//   host: 'mysql',
//   user:'root',
//   password: process.env.MYSQL_ROOT_PASSWORD,
//   database: process.env.MYSQL_DATABASE // Replace with the actual database name
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL!');

//   // Perform your database operations here
//   connection.query('SELECT * FROM forms', (err, results, fields) => {
//     if (err) throw err;
//     console.log("R:",results);
//     console.log("F:",fields);

//   });

//   connection.end();
// });