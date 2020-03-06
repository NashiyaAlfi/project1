const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
const jwt = require('jsonwebtoken')
const secretKey = 'this is very secret Key'
const port = 7000;


const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "toko_hijab"
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const Authorized = (request, result, next) => {
    if (typeof(request.headers['x-api-key']) == 'undifined'){
    return result.status(403).json({
        success: false,
        message:'Unauthorized. Token is not provided'
    })
}

let token = request.headers['x-api-key']

jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return result.status(401).json({
            success:false,
            message:'Unauthorized. Token is invalid'
        })
    }
})

next()
}

/* list end point */
app.get('/',(request,result) => {
    result.json({
        success:true,
        message:'Welcome'
    })
})

/* Login untuk mendapatkan token */

app.post('/login', (request,result)=>{

    let data = request.body

    if(data.username == 'alfi'&&data.password == 'alfi123'){
        let token = jwt.sign(data.username+'|'+data.password,secretKey)

        result.json({
            success:true,
            message:'Login success, welcome back Admin',
            token:token 
        })
    }
    result.json({
        success:false,
        message:'you are not person with username admin and have password admin!'
    })
})

/* CRUD Admin */

app.get('/admin', Authorized,(req, res) => {
    let sql = `
        select username, created_at from admins 
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all admin",
            data: result 
        })
    })
})

app.post('/admin', Authorized, (req, res) => {
    let data = req.body

    let sql = `
        insert into admins (username, password)
        values ('`+data.username+`','`+data.password+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "admin created",
            data: result
        })
    })
})

app.get('/admin/:id', Authorized,(req, res)=> {
    let sql = `
        select * from admins
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json ({
            message: "success get users detail",
            data: result[0]
        })
    })
})

app.put('/admin/:id', Authorized,(req, res) => {
    let data = req.body

    let sql = `
        update admins
        set username = '`+data.username+`', password = '`+data.password+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been updated",
            data: result
        })
    })
})

app.delete('/admin/:id', Authorized,(req, res) => {
    let sql = `
        delete from admins
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been deleted",
            data: result
        })
    })
})

/* CRUD Hijabs */

app.get('/hijabs', Authorized,(req, res) => {
    let sql = `
        select warna, jenis, harga, stock created_at from hijabs 
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get all hijab",
            data: result 
        })
    })
})

app.post('/hijabs', Authorized, (req, res) => {
    let data = req.body

    let sql = `
        insert into hijabs (warna, jenis, harga, stock)
        values ('`+data.warna+`','`+data.jenis+`','`+data.harga+`'
        ,'`+data.stock+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "hijab created",
            data: result
        })
    })
})

app.get('/hijabs/:id', Authorized, (req, res)=> {
    let sql = `
        select * from hijabs
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json ({
            message: "success get hijabs detail",
            data: result[0]
        })
    })
})

app.put('/hijabs/:id', Authorized, (req, res) => {
    let data = req.body

    let sql = `
        update hijabs
        set warna = '`+data.warna+`', jenis = '`+data.jenis+`', 
        harga = '`+data.harga+`', stock = '`+data.stock+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been updated",
            data: result
        })
    })
})

app.delete('/hijabs/:id', Authorized, (req, res) => {
    let sql = `
        delete from hijabs
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "data has been deleted",
            data: result
        })
    })
})

/* Transaksi*/

app.post('/hijabs/:id/take', Authorized,(req, res)=>{
    let data = req.body

    db.query(`
    insert into transaksi(admin_id, hijab_id)
    values('`+data.user_id+`', '`+req.params.id+`')
    `,(err, result) => {
        if (err) throw err
    })

    db.query(`
        update hijabs 
        set stock = stock -1 
        where id = '`+req.params.id+`'    
    `,(err, result) => {
        if (err) throw err
    })

    res.json({
        message: "hijab has been taked by admin"
    })
})

app.get('/admins/:id/hijabs', Authorized,(req, res)=>{
    db.query(`
    select hijabs.warna, hijabs.jenis, hijabs.harga, 
    from admins
    right join transaksi on admin_id = transaksi.admin_id
    right join hijabs on transaksi.hijab_id = hijabs.id
    where admins.id = '`+req.params.id+`' 
    `, (err, result)=>{
        if (err) throw err

        res.json({
            message:"success get users hijabs",
            data:result
        })
    })
})


/* Run Application */
app.listen(port, () => {
    console.log('app running on port ' + port)
})
