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

// Run MySQL query
const runPostgresQuery = async (rows, connection) => {
    const conn = connection;

    for(let row in rows){
        // create createRevision
        // create submitDraft
        // create doRequesterAction
        console.log("R:",row);
        // conn.query(sql);
    } 

    // conn.connect()
    // .then(() => {
    //     console.log('Connected to PostgreSQL database', sql);
        
    // })
    // .catch(err => console.error('Connection error', err.stack))
    // .finally(() => {
    //     conn.end();
    // });


    // return sql = `
    //     SELECT * FROM settings
    // `;
};

// Create a connection to the MySQL database
const insertIntoPostgresDatabase = async (rows) => {
    const connection = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'db',  
        database: process.env.POSTGRES_DATABASE || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'localhost',
        port: process.env.POSTGRES_PORT || 5432
    });
    await runPostgresQuery(rows, connection);

};

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
    const rows = await runMySQLQuery();

    await insertIntoPostgresDatabase(rows);
    // console.log('The solution 1 is:', rows); // Should output: The solution is: 2
};

convertData();
