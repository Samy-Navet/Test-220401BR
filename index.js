const axios = require('axios');
const util = require('util');

const ENDPOINT = 'http://localhost:3000';

// a mettre dans un ficher .env
const clientId = 'BankinClientId';
const clientSecret = 'secret';

const CREDENTIALS = { user: 'BankinUser', password: '12345678' };


// login to get refresh token
const login = (credentials) => {
    const Authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Basic ${Authorization}` };
    return axios.post(`${ENDPOINT}/login`, credentials, { headers });
}


// get the access token
const getAccessToken = async (refresh_token) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const data = { 'grant_type': 'refresh_token', 'refresh_token': refresh_token }
    return axios.post(`${ENDPOINT}/token`, data, headers);
}

// get accounts list
const getAccountList = (token) => {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    return axios.get(`${ENDPOINT}/accounts`, { headers });
}

// get account transactions
const getTransaction = (accNumber, token) => {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return axios.get(`${ENDPOINT}/accounts/${accNumber}/transactions`, { headers });
}

// join account and transaction and parse it in one object
const joinTransactionsAndAccounts = async (accountList, token) => {
    // functionnal programmation we dont want to mutate the array in param
    const accounts = [...accountList];
    for (const account of accounts) {
        try {
            const { data: { transactions } } = await getTransaction(account.acc_number, token);
            account.transactions = transactions;
        } catch (err) {
            console.error(err.message)
        }
    }

    return accounts;
}

// main function
const getAccountsAndTransaction = async (credentials) => {
    try {
        const { data: { refresh_token } } = await login(credentials);
        const { data: { access_token } } = await getAccessToken(refresh_token);
        const { data: { account: accountList } } = await getAccountList(access_token);
        return joinTransactionsAndAccounts(accountList, access_token);

    } catch (err) {
        console.error(err.message);
    }
}

getAccountsAndTransaction(CREDENTIALS).then((res) => {
    console.log(util.inspect(res, false, null, true))
});
