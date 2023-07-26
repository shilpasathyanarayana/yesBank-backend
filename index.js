const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

// This function feches account information from mysql
function getAccount(accountnumber) {
  return new Promise(function (resolve, reject) {
    var connection = mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'KulfiSimba@143',
      database: 'mybank'
    });

    var query_str = "select * from accounts a join account_balance ab on a.accountnumber = ab.accountnumber where a.accountnumber = ?;";

    var query_var = [accountnumber];

    connection.query(query_str, query_var, function (err, rows, fields) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}
//-----------------------------------------------------

// This function feches transaction details from mysql
function getTransactionDetail(from_account) {
  return new Promise(function (resolve, reject) {
    var connection = mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'KulfiSimba@143',
      database: 'mybank'
    });

    var query_str = "select * from  transactions where from_account= ?";
    var query_var = [from_account];

    connection.query(query_str, query_var, function (err, rows, fields) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}
// ---------------------------------------------------


// This function is to validate wether given username and password is correct
function verifyLogin(user_name, password) {
  return new Promise(function (resolve, reject) {
    var connection = mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'KulfiSimba@143',
      database: 'mybank'
    });

    var query_str = "select accountnumber from login_credentials where username= ? and password= ?";
    var query_var = [user_name, password];

    connection.query(query_str, query_var, function (err, rows, fields) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  })
}
// -------------------------------------------------------------------------

// This function is user to transfer amount from from_account to to_account

function performTransaction(from_account, to_account, transaction_amount) {
  return new Promise(function (resolve, reject) {
    var connection = mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'KulfiSimba@143',
      database: 'mybank'
    });
    var query_str = "select * from account_balance where balance>? and accountnumber=?";
    var query_var = [transaction_amount, from_account];

    connection.query(query_str, query_var, function (err, rows, fields) {

      if (rows && rows.length) {
        query_str = "insert into transactions values(?,?,?)";
        var query_var = [from_account, to_account, transaction_amount];
        connection.query(query_str, query_var);

        query_str = "update account_balance set balance=balance-? where accountnumber=?";
        var query_var = [transaction_amount, from_account];
        connection.query(query_str, query_var);

        query_str = "update account_balance set balance=balance+? where accountnumber=?";
        var query_var = [transaction_amount, to_account];
        connection.query(query_str, query_var);

      }
      resolve(null);
    });




  });
}

// This is an API for transfering the amount from one account to another and update the balance
// in both the accounts

app.get('/transfer/:from_account/:to_account/:transaction_amount', (req, res) => {
  performTransaction(req.params.from_account, req.params.to_account, req.params.transaction_amount).then(
    function (rows) {
      res.send(rows);
    }
  ).catch((err) => setImmediate(() => { throw err; }));
})

// --------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------


// this is an API for retreving account details for a given account number
app.get('/account/:account_number', (req, res) => {
  getAccount(req.params.account_number).then(
    function (rows) {
      res.send(rows);
    }
  ).catch((err) => setImmediate(() => { throw err; }));
})
// ----------------------------------------------------------------------


//  this is an API for Login to accounts
app.get('/login/:user_name/:password', (req, res) => {
  let mysqlResponse = null;
  console.log(req.params.user_name);
  console.log(req.params.password);
  verifyLogin(req.params.user_name, req.params.password).then(

    function (rows) {
      console.log(rows);
      if (rows.length > 0 && rows[0].accountnumber) {
        res.send({ "accountnumber": rows[0].accountnumber });
      }
      else {
        res.status(401).send({ "accountnumber": "Does not exist" });
      }
    }
  ).catch((err) => setImmediate(() => { throw err; }));
});
// ------------------------------------------------------------

// This is the API for retreving transaction details for given account number

app.get('/transactions/:from_account', (req, res) => {
  getTransactionDetail(req.params.from_account).then(
    function (rows) {
      res.send(rows);
    }
  ).catch((err) => setImmediate(() => { throw err; }));
})

// --------------------------------------------------------------------------

// This code is to run the server in a given post
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// -----------------------------------------------------------


