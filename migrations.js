const express = require('express')
const mysql = require('mysql')

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'toko_hijab'
})

db.connect((err)=>{
    if (err) throw err
    console.log('Database Connected')
})

const createHijabsTable = () => {
    let sql = `
        create table hijabs (
            id int unsigned auto_increment primary key,
            warna varchar(191) not null,
            jenis varchar(50) not null,
            harga varchar(191) not null,
            stock int unsigned default 0, 
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table hijabs has been created!')
    })
}

const createAdminsTable = () => {
    let sql = `
        create table admins (
            id int unsigned auto_increment primary key,
            username varchar(100) not null,
            password varchar(255) not null,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table Admins has been created!')
    })
}

const createTransaksiTable = () => {
    let sql = `
        create table transaksi (
            id int unsigned auto_increment primary key,
            admin_id int not null,
            hijab_id int not null,
            created_at timestamp default current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err
        console.log('Table Transaksi has been created!')
    })
}

createHijabsTable()
createAdminsTable()
createTransaksiTable()