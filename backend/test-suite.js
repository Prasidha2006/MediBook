import http from 'http';
import app from './src/app.js';
import { initDatabase } from './src/config/db.js';

let server;
let BASE_URL;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const fetchRes = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = fetchRes.headers.get('content-type');
  const data = contentType && contentType.includes('application/json')
    ? await fetchRes.json()
    : await fetchRes.text();

  return { status: fetchRes.status, headers: fetchRes.headers, data };
}

async function runTests() {
  console.log('🚀 Starting MediBook Automated Comprehensive Test Suite...\n');

  await initDatabase();

  server = app.listen(0);
  const port = server.address().port;
  BASE_URL = `http://localhost:${port}/api/v1`;
  console.log(`📡 Test Server listening on ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'OK', 'GET /api/v1/health responds with status OK');

    // 2. Public departments
    const depts = await request('/departments');
    assert(depts.status === 200 && depts.data.data.length >= 8, `GET /api/v1/departments returns 8+ departments (found ${depts.data.data?.length})`);

    // 3. Public doctors
    const docs = await request('/doctors');
    assert(docs.status === 200 && docs.data.data.length >= 8, `GET /api/v1/doctors returns 8+ verified doctors (found ${docs.data.data?.length})`);
    const sampleDoctor = docs.data.data[0];

    // 4. Doctor details
    const docDetail = await request(`/doctors/${sampleDoctor.id}`);
    assert(docDetail.status === 200 && docDetail.data.data.fullName === sampleDoctor.fullName, `GET /api/v1/doctors/:id returns ${sampleDoctor.fullName}`);

    // 5. Doctor slot calculation for future date (2026-11-20, a Friday)
    const testDate = '2026-11-20';
    const slots = await request(`/doctors/${sampleDoctor.id}/slots?date=${testDate}`);
    assert(slots.status === 200 && slots.data.data.slots.length > 0, `GET /api/v1/doctors/:id/slots computes valid time slots (${slots.data.data.totalSlots} slots, ${slots.data.data.availableSlotsCount} available)`);

    // 6. Test Patient Self-Registration
    const testEmail = `test.patient.${Date.now()}@example.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Test Patient Registration',
        email: testEmail,
        phone: '+1 555-909-8800',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      },
    });
    assert(regRes.status === 201 && regRes.data.token, `POST /auth/register creates patient user and returns JWT token`);
    const patientToken = regRes.data.token;

    // 7. Test Login with Admin credentials
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@medibook.com',
        password: 'Admin@123',
      },
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN', 'POST /auth/login successfully logs in as ADMIN');
    const adminToken = adminLogin.data.token;

    // 8. Test Login with Doctor credentials
    const doctorLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: sampleDoctor.user?.email || 'dr.jenkins@medibook.com',
        password: 'Doctor@123',
      },
    });
    assert(doctorLogin.status === 200 && doctorLogin.data.user.role === 'DOCTOR', `POST /auth/login successfully logs in as DOCTOR (${doctorLogin.data.user.email})`);
    const doctorToken = doctorLogin.data.token;

    // 9. Patient Books an Appointment
    const availableSlot = slots.data.data.slots.find((s) => s.isAvailable);
    assert(!!availableSlot, 'Found an available slot for booking test');

    const bookingRes = await request('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctorId: sampleDoctor.id,
        date: testDate,
        startTime: availableSlot.startTime,
        endTime: availableSlot.endTime,
        reason: 'Automated test suite clinical consultation for blood pressure screening.',
      },
    });
    assert(bookingRes.status === 201 && bookingRes.data.data.appointmentNumber, `POST /appointments successfully booked: ${bookingRes.data.data?.appointmentNumber}`);
    const bookedApt = bookingRes.data.data;

    // 10. Concurrency & Double Booking Prevention: Attempting to book the SAME slot again
    const doubleBookRes = await request('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctorId: sampleDoctor.id,
        date: testDate,
        startTime: availableSlot.startTime,
        endTime: availableSlot.endTime,
        reason: 'Malicious or race condition double booking attempt.',
      },
    });
    assert(doubleBookRes.status === 409, `Double booking prevention works: got HTTP 409 Conflict ("${doubleBookRes.data.message}")`);

    // 11. Patient views their appointments
    const myApts = await request('/appointments/my', {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(myApts.status === 200 && myApts.data.data.length >= 1, `GET /appointments/my returns patient appointments (${myApts.data.data.length})`);

    // 12. Doctor updates appointment status (Accept / Confirm)
    const docUpdateRes = await request(`/doctor/appointments/${bookedApt.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        status: 'CONFIRMED',
        notes: 'Confirmed by physician. Please arrive 10 minutes prior.',
      },
    });
    assert(docUpdateRes.status === 200 && docUpdateRes.data.data.status === 'CONFIRMED', `PATCH /doctor/appointments/:id/status successfully confirmed appointment`);

    // 13. Patient cancels appointment
    const cancelRes = await request(`/appointments/${bookedApt.id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: { reason: 'Rescheduled for next week' },
    });
    assert(cancelRes.status === 200 && cancelRes.data.data.status === 'CANCELLED', `PATCH /appointments/:id/cancel successfully cancelled appointment`);

    // 14. Admin Dashboard Metrics
    const adminDash = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDash.status === 200 && adminDash.data.data.stats.totalDoctors >= 8, `GET /admin/dashboard returns complete metrics (Doctors: ${adminDash.data.data.stats.totalDoctors}, Patients: ${adminDash.data.data.stats.totalPatients}, Revenue: $${adminDash.data.data.stats.estimatedRevenue})`);

    // 15. Admin Audit Trail
    const auditLogs = await request('/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditLogs.status === 200 && auditLogs.data.data.length > 0, `GET /admin/audit-logs returns recorded event trail (${auditLogs.data.data.length} logs)`);

    console.log(`\n======================================================`);
    console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed.`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test runner exception:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
