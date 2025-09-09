# Split Bill & Budget Tracker Backend

## Design decision
- Store database in memory, the limitation show that a persistent database are not needed yet.
- Create class for `User` and `Transaction`, because these are two important entity in this case.
- There are no limit on the user's wallet balance, it can go below 0 (assume that they also have credit card).

## Features
- Show users and its budget within its relevant transactions.
- Show every transactions.
- Add transactions (with its details).
- Settle a transactions by its id.

### Additional features
- List the transaction details, with its item bought from each user, can split more fair based on purchased item.
- Unit test (positive case)
- Show current wallet balance and how much the person owes (unimplemented)
- Negative test case (unimplemented)

## How to run
Pre-requisite: NodeJS and Node Package Manager (npm) installed
1. Run `npm i` to install dependencies
2. Run `npm start` command to start the application
3. Run `npm run test` command to do unit test

## Example API request and response
GET /users
- Response: 
```javascript
[
    {
        "id": "A",
        "balance": 50,
        "transactions": [
            {
                "id": 0,
                "amount": 250,
                "paid_by": "A",
                "settled": true,
                "items": null
            },
            {
                "id": 1,
                "amount": 200,
                "paid_by": "B",
                "settled": true,
                "items": [
                    {
                        "item": "Fried Rice",
                        "price": 200
                    }
                ]
            }
        ]
    },
    {
        "id": "B",
        "balance": 150,
        "transactions": [
            {
                "id": 0,
                "amount": 250,
                "paid_by": "A",
                "settled": true,
                "items": null
            },
            {
                "id": 1,
                "amount": 100,
                "paid_by": "B",
                "settled": true,
                "items": [
                    {
                        "item": "Spring Rolls",
                        "price": 100
                    }
                ]
            }
        ]
    }
]
```

GET /transactions
- Response
```javascript
[
    {
        "id": 0,
        "amount": 500,
        "paid_by": "A",
        "settled": true
    },
    {
        "id": 1,
        "amount": 300,
        "paid_by": "B",
        "settled": true,
        "details": [
            {
                "user": "A",
                "item": "Fried Rice",
                "price": 200
            },
            {
                "user": "B",
                "item": "Spring Rolls",
                "price": 100
            }
        ]
    }
]
```
POST /transactions
- Request body:
```javascript
{
    "paid_by": "A",
    "amount": 500
}
```
- Response:

```javascript
{
    "id": 0,
    "amount": 500,
    "paid_by": "A",
    "settled": false
}
```

POST /settle
- Request body:
```javascript
{ id: 0 }
```
- Response:
```javascript
{
    "id": 0,
    "amount": 500,
    "paid_by": "A",
    "settled": true
}
```
POST /details
- Request body:
```javascript
{
    "id": 1,
    "details": [
        { "user": "A", "item": "Fried Rice", "price": 200 },
        { "user": "B", "item": "Spring Rolls", "price": 100 }
]
}
```
- Response:
```javascript
{
    "id": 1,
    "amount": 200,
    "paid_by": "B",
    "settled": false,
    "items": [
        {
            "item": "Fried Rice",
            "price": 200
        }
    ]
}
```
## Author

Naufal Aditya Dirgandhavi\
A0332886R / E1590364 \
Master of Computing - Information Systems Specializations
