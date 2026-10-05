// Performance test (load) for REQ-NF-01 / TC-33 — ISO/IEC 25010 performance efficiency (time behaviour).
// Run:  k6 run qa/performance/k6-read-api.js
//       k6 run -e BASE_URL=http://localhost:8081 qa/performance/k6-read-api.js
// Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/  (Windows: winget install k6)
//
// The backend adds 200–1500 ms of random latency on purpose (SimulatedLatencyConfig),
// so p95 close to 1500 ms is expected. Wake the Render instance before the run.

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://foodme-lianals.onrender.com";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp up to 10 virtual users
    { duration: "1m", target: 10 }, // steady load
    { duration: "15s", target: 0 }, // ramp down
  ],
  // Exit criteria from the requirement — k6 exits non-zero when a threshold fails.
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const list = http.get(`${BASE_URL}/api/chef/active?page=0&size=12`, { tags: { name: "chef list" } });
  check(list, { "chef list is 200": (r) => r.status === 200 });

  const chefs = list.status === 200 ? list.json("exploreChefResponseDtoList") : [];
  if (chefs.length > 0) {
    const chef = chefs[Math.floor(Math.random() * chefs.length)];
    const detail = http.get(`${BASE_URL}/api/chef/${chef.id}`, { tags: { name: "chef detail" } });
    check(detail, { "chef detail is 200": (r) => r.status === 200 });
  }

  sleep(1); // think time between user actions
}
