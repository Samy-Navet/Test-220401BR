const axios = require('axios');

const ENDPOINT = 'http://localhost:3000';

// a mettre dans un ficher .env
const clientId = 'BankinClientId';
const clientSecret = 'secret';

const CREDENTIALS = { user: 'BankinUser', password: '12345678' };


// login to get refresh token
const login = (credentials) => {
    const Authorization = Buffer.from(`${clientId}${clientSecret}`).toString('base64')
    const headers = { 'Content-Type': 'application/json', 'Authorization': `APP ${Authorization}` };
    return axios.post(`${ENDPOINT}/login`, credentials, { headers });
}


// get the access token
const getAccessToken = async (refreshToken) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    return axios.post(`${ENDPOINT}/token?grant_type=refresh_token&refresh_token=${refreshToken}/`, {}, headers);
}

// get accounts list
const getAccountList = (token) => {
    const headers = { 'Content-Type': 'application/json', Authorization: token };
    return axios.get(`${ENDPOINT}/accounts`, headers);
}

// get account transactions
const getTransaction = (accNumber, token) => {
    const headers = { 'Content-Type': 'application/json', Authorization: token };
    return axios.get(`${ENDPOINT}/accounts/${accNumber}/transactions`, headers);
}

// join account and transaction and parse it in one object
const joinTransactionsAndAccounts = async (accountList) => {
    // functionnal programmation we dont want to mutate the array in param
    const accounts = [...accountList];
    for (const account of accounts) {
        const { transactions } = await getTransaction(account.acc_number);
        account.transactions = transactions;
    }

    return accounts;
}

// main function
const getAccountsAndTransaction = async (credentials) => {
    try {
        const refreshToken = await login(credentials);
        const accessToken = await getAccessToken(refreshToken);
        const { account: accountList } = await getAccountList(accessToken);
        return joinTransactionsAndAccounts(accountList);

    } catch (err) {
        console.error(err.message);
    }
}

getAccountsAndTransaction(CREDENTIALS);
