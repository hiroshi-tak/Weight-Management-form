import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 50,
    duration: '30s',
};

const BASE_URL = 'http://localhost:8000/api';

const USERNAME = 'test1';
const PASSWORD = '12345678';

let token;

function login() {
    const payload = JSON.stringify({
        username: USERNAME,
        password: PASSWORD,
    });

    const res = http.post(`${BASE_URL}/token/`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
        'login status is 200': (r) => r.status === 200,
    });

    console.log('login status:', res.status);
    console.log('login body:', res.body);

    return JSON.parse(res.body).access;
}

export function setup() {
    return login();
}

export default function (token) {

    const params = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    const getRes = http.get(
        `${BASE_URL}/diary/`,
        params
    );

    check(getRes, {
        'GET 200': (r) => r.status === 200,
    });

    const unique = (__VU - 1) * 1000 + __ITER;

    const year = 2030 + Math.floor(unique / (12 * 28));
    const month = Math.floor(unique / 28) % 12 + 1;
    const day = unique % 28 + 1;

    const recordDate =
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    console.log(
        `VU=${__VU}, ITER=${__ITER}, DATE=${recordDate}`
    );

    const payload = JSON.stringify({
        weight: 65,
        memo: `k6-${__VU}-${__ITER}`,
        record_date: recordDate,
    });

    const postRes = http.post(
        `${BASE_URL}/diary/`,
        payload,
        params
    );

    if (postRes.status !== 201) {
        console.log(`POST status=${postRes.status}`);
        console.log(`POST body=${postRes.body}`);
    }

    check(postRes, {
        'POST 201': (r) => r.status === 201,
    });

    sleep(1);
}