const test = require('node:test');
const assert = require('assert');
const http = require('http');
const app = require('./server');

// Start the server
const server = app.listen(8080);

function httpPost(path, data) {
    return new Promise((resolve, reject) => {
        const post_data = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 8080,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(post_data),
            }
        };
        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: responseData }));
        });
        req.on('error', reject);
        req.write(post_data);
        req.end();
    });
}

function httpGet(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:8080${path}`, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: responseData }));
        }).on('error', reject);
    });
}

test('Run scenarios sequentially', async (t) => {
    // Scenario 1
    console.log("Scenario 1:");
    console.log("1. User A pay a transaction with amount of 500");
    const postRes1 = await httpPost('/transactions', { paid_by: "A", amount: 500 });
    const transaction1 = JSON.parse(postRes1.body);
    assert.strictEqual(postRes1.statusCode, 200);
    assert.strictEqual(transaction1.id, 0);
    assert.strictEqual(transaction1.amount, 500);
    assert.strictEqual(transaction1.paid_by, 'A');

    console.log("2. They settle immediately");
    const settleRes1 = await httpPost('/settle', { id: 0 });
    const settledTransaction1 = JSON.parse(settleRes1.body);
    assert.strictEqual(settleRes1.statusCode, 200);
    assert.strictEqual(settledTransaction1.id, 0);
    assert.strictEqual(settledTransaction1.settled, true);

    console.log("3. Check both user balance");
    const usersRes1 = await httpGet('/users');
    const users1 = JSON.parse(usersRes1.body);
    assert.strictEqual(usersRes1.statusCode, 200);
    assert.strictEqual(users1.length, 2);
    assert.strictEqual(users1.find(u => u.id === 'A').balance, 250);
    assert.strictEqual(users1.find(u => u.id === 'B').balance, 250);

    console.log("4. Show transactions");
    const transactionsRes1 = await httpGet('/transactions');
    const transactions1 = JSON.parse(transactionsRes1.body);
    assert.strictEqual(transactionsRes1.statusCode, 200);
    assert.strictEqual(transactions1.length, 1);
    assert.strictEqual(transactions1[0].id, 0);
    assert.strictEqual(transactions1[0].settled, true);

    // Scenario 2
    console.log("\nScenario 2:");
    console.log("1. User B pay a transaction with amount of 300");
    const postRes2 = await httpPost('/transactions', { paid_by: "B", amount: 300 });
    const transaction2 = JSON.parse(postRes2.body);
    assert.strictEqual(postRes2.statusCode, 200);
    assert.strictEqual(transaction2.id, 1);
    assert.strictEqual(transaction2.amount, 300);
    assert.strictEqual(transaction2.paid_by, 'B');

    console.log("2. They add details about the item purchased");
    const detailsRes2 = await httpPost('/details', {
        id: 1,
        details: [
            { user: "A", item: "Fried Rice", price: 200 },
            { user: "B", item: "Spring Rolls", price: 100 }
        ]
    });
    const detailsTransaction2 = JSON.parse(detailsRes2.body);
    assert.strictEqual(detailsRes2.statusCode, 200);
    assert.strictEqual(detailsTransaction2.id, 1);

    console.log("3. They settle immediately");
    const settleRes2 = await httpPost('/settle', { id: 1 });
    const settledTransaction2 = JSON.parse(settleRes2.body);
    assert.strictEqual(settleRes2.statusCode, 200);
    assert.strictEqual(settledTransaction2.id, 1);
    assert.strictEqual(settledTransaction2.settled, true);

    console.log("4. Check both user balance");
    const usersRes2 = await httpGet('/users');
    const users2 = JSON.parse(usersRes2.body);
    assert.strictEqual(usersRes2.statusCode, 200);
    assert.strictEqual(users2.length, 2);
    assert.strictEqual(users2.find(u => u.id === 'A').balance, 50);
    assert.strictEqual(users2.find(u => u.id === 'B').balance, 150);

    console.log("5. Show transactions");
    const transactionsRes2 = await httpGet('/transactions');
    const transactions2 = JSON.parse(transactionsRes2.body);
    assert.strictEqual(transactionsRes2.statusCode, 200);
    assert.strictEqual(transactions2.length, 2);
    assert.strictEqual(transactions2.find(t => t.id === 1).settled, true);


    // Scenario 3
    console.log("\nScenario 3:");
    console.log("1. User B pay a transaction with amount of 150 with details");
    const postRes3 = await httpPost('/transactions', { paid_by: "B", amount: 150 , details: [
        { user: "A", item: "Spring Rolls", price: 100 },
        { user: "B", item: "Snack", price: 50 }
    ]});
    const transaction3 = JSON.parse(postRes3.body);
    assert.strictEqual(postRes3.statusCode, 200);
    assert.strictEqual(transaction3.id, 2);
    assert.strictEqual(transaction3.amount, 150);
    assert.strictEqual(transaction3.paid_by, 'B');

    console.log("2. They settle immediately");
    const settleRes3 = await httpPost('/settle', { id: 2 });
    const settledTransaction3 = JSON.parse(settleRes3.body);
    assert.strictEqual(settleRes3.statusCode, 200);
    assert.strictEqual(settledTransaction3.id, 2);
    assert.strictEqual(settledTransaction3.settled, true);

    console.log("3. Check both user balance");
    const usersRes3 = await httpGet('/users');
    const users3 = JSON.parse(usersRes3.body);
    assert.strictEqual(usersRes3.statusCode, 200);
    assert.strictEqual(users3.length, 2);
    assert.strictEqual(users3.find(u => u.id === 'A').balance, -50);
    assert.strictEqual(users3.find(u => u.id === 'B').balance, 100);

    console.log("5. Show transactions");
    const transactionsRes3 = await httpGet('/transactions');
    const transactions3 = JSON.parse(transactionsRes3.body);
    assert.strictEqual(transactionsRes3.statusCode, 200);
    assert.strictEqual(transactions3.length, 3);
    assert.strictEqual(transactions3.find(t => t.id === 2).settled, true);

    // Optionally, close the server after tests
    server.close();
});