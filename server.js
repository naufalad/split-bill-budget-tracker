const express = require('express')
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const INITIAL_BUDGET = 500

class User{
  constructor(id){
    this.id = id;
    this.balance = INITIAL_BUDGET;
  }
}

class Transaction{
  constructor(id, amount, paid_by, settled){
    this.id = id;
    this.amount = amount;
    this.paid_by = paid_by;
    this.settled = settled;
  }

  checkTransactionDetails(transaction_details){
    let total = 0;
    for (let transaction_detail of transaction_details){
      if(!transaction_detail.user) return false;
      
      total+=transaction_detail.price;
    }
    return total == this.amount;
  }

  setDetails(details){
    // this function set the transaction details, so it can split more fair
    /* details = [
      {
        'user':'A',
        'item': 'Fried Rice',
        'price': 20
      }]
    */
    // check whether the transaction details amount total is the same as the request amount
    if(!this.checkTransactionDetails(details)){
      console.log('There is something wrong with the transaction details, please check again.')
      return false;
    }

    this.details = details;
    return true;
  }
}

function getTransactionsByUserId(user_id){
  transaction_response = [];
  for(let t in transactions){
    let transaction = transactions[t];
    if(!transaction.settled && transaction.paid_by != user_id) continue;
    var amount = 0;
    let items = [];
    if(transaction.details){
      for (let transaction_detail of transaction.details){
        if(transaction_detail.user==user_id){
          items.push({
            'item': transaction_detail.item,
            'price': transaction_detail.price
            });
          amount += transaction_detail.price;
        }
      }
    }
    if(transaction.settled){
      if(!transaction.details){
        amount = transaction.amount / 2;
      }
    }else{
      amount = transaction.amount;
    }

    transaction_response.push({
      'id': transaction.id,
      'amount': amount,
      'paid_by': transaction.paid_by,
      'settled': transaction.settled,
      'items': items.length > 0 ? items : null
    });
  }
  return transaction_response;
}

app.get('/users', (req, res) => {
  console.log('GET /users endpoint called');

  response = [];
  for(let u in users){
    response.push({
      'id': users[u].id,
      'balance': users[u].balance,
      'transactions': getTransactionsByUserId(users[u].id)
    })
  }

  res.send(response);
})

app.get('/transactions', (req, res) => {
  console.log('GET /transactions endpoint called');

  var transaction_response = [];
  for(let t in transactions){
    let transaction = transactions[t];

    transaction_response.push({
      'id': transaction.id,
      'amount': transaction.amount,
      'paid_by': transaction.paid_by,
      'settled': transaction.settled,
      'details': transaction.details
    });
  }

  res.send(transaction_response);
})

app.post('/transactions', (req, res) => {
  console.log('POST /transactions endpoint called');

  let total_length = Object.keys(transactions).length;
  var new_transaction = new Transaction(total_length, req.body.amount, req.body.paid_by, false);
  let transaction_details = req.body.details;
  if(transaction_details){
    new_transaction.setDetails(transaction_details);
  }
  transactions[total_length] = new_transaction;

  users[req.body.paid_by].balance-=req.body.amount;
  
  res.send(new_transaction);
})

app.post('/settle', (req, res) => {
  console.log('POST /settle endpoint called');

  let transaction = transactions[req.body.id];
  if(!transaction || transaction.settled){
    res.send('Transaction not found or already settled');
    return;
  }
  let amount_per_user = {};
  for(let user in users){
    amount_per_user[user] = 0;
  }
  if(!transaction.details){
    for(let user in users){
      amount_per_user[user] = transaction.amount / Object.keys(users).length;;
    }
  }else{
    for(let transaction_detail of transaction.details){
      amount_per_user[transaction_detail.user] += transaction_detail.price;
    }
  }

  transaction.settled = true;
  for(let u in users){
    if(users[u].id == transaction.paid_by){
      users[u].balance+=transaction.amount;
    }
    users[u].balance-=amount_per_user[u];
  }

  res.send(transaction);
})


app.post('/details', (req, res) => {
  console.log('POST /details endpoint called');

  let transaction = transactions[req.body.id];
  let status = transaction.setDetails(req.body.details);
  if(status) res.send(transaction);
  else res.send('There is something with the transaction details, please check again.');
})

var user_a = new User('A');
var user_b = new User('B');

//using dictionary/HashMap to easy access by id
var users = {'A':user_a, 'B':user_b};
var transactions = {};

app.listen(port, () => {
  console.log(`Split bill app listening on port ${port}`)
})

module.exports = app; // for testing