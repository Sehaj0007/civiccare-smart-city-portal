# 🔍 Escalated Complaints - Debug & Testing Guide

## ⚡ Quick Diagnosis

### **Test 1: Check Debug Endpoint** (Copy & Paste in Browser Console)

```javascript
// Get debug info about escalation status
fetch('/api/supervisor/debug/escalation')
  .then(r => r.json())
  .then(data => {
    console.log('=== ESCALATION DEBUG INFO ===');
    console.log('Total Complaints:', data.debug.totalComplaints);
    console.log('Forwarded Complaints:', data.debug.forwardedCount);
    console.log('Status Distribution:', data.debug.statusDistribution);
    console.log('Forwarded Details:', data.debug.forwardedComplaints);
  })
  .catch(e => console.error('Debug fetch failed:', e));
```

### **Test 2: Manual Escalation Test**

#### Option A: Admin Dashboard → Escalate
1. Go to **Admin Dashboard**
2. Click on any **department** (e.g., "Potholes / Road")
3. Click **"Escalate"** button on a complaint
4. Select a **Ward Office**
5. Click **"Submit"**

**Check Backend Console for:**
```
[Escalation] Complaint TC-XXXXX escalated with status: FORWARDED
```

#### Option B: Manual API Call (Browser Console)
```javascript
// Step 1: Get a complaint ID first
fetch('/api/complaints?limit=1')
  .then(r => r.json())
  .then(data => {
    const complaintId = data.complaints[0]._id;
    console.log('Got complaint:', complaintId);
    
    // Step 2: Escalate it
    return fetch('/api/admin/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaintId: complaintId,
        wardOfficeId: '658f1a1a1a1a1a1a1a1a1a1a', // Replace with real ward office ID
        remarks: 'Test escalation'
      })
    });
  })
  .then(r => r.json())
  .then(data => console.log('Escalation Response:', data))
  .catch(e => console.error('Error:', e));
```

---

## 📊 Full Testing Checklist

- [ ] **Backend Running**: Restart backend - `npm start` in `/backend`
- [ ] **Admin Escalates**: Try escalating a complaint from admin dashboard
- [ ] **Backend Logs**: Check for `[Escalation]` log message
- [ ] **Check DB**: Run debug endpoint test in browser console
- [ ] **Supervisor Dashboard**: Open supervisor dashboard
- [ ] **Backend Logs**: Check for `[Escalation Query]` log message
- [ ] **Browser Logs**: Check `[SupervisorDashboard]` in console
- [ ] **UI Check**: Purple "Escalated Issues" card should show count
- [ ] **Table Check**: Escalated complaint should appear in table

---

## 🚨 If It's Not Working

### **Issue: No escalations possible from Admin Dashboard**
- ❓ Do you see the "Escalate" button?
- ❓ Does clicking it open a modal?
- ❓ Does the modal have "Ward Office" dropdown?
- 💡 **Check browser console (F12)** for any JavaScript errors

### **Issue: Escalation fails with error**
- ❓ What error message do you see in browser console?
- ❓ What error is in the Network tab (F12)?
- 💡 **Share the error message** - it will tell us what's failing

### **Issue: Escalation succeeds but not visible in supervisor**
- 💡 **Run the debug endpoint test** - check `forwardedCount`
- 💡 **Check backend logs** - did `[Escalation Query]` find any?
- 💡 **Check browser logs** - does `[SupervisorDashboard]` show 0?

---

## 📝 Next Steps

1. **Run the Quick Diagnosis** (Test 1 above)
2. **Try Manual Escalation** (Test 2 Option A)
3. **Share the Results** - what does the debug endpoint show?
4. **Share Any Errors** - what appears in browser/backend console?

---

## 🔧 Key Endpoints & Logs

| Action | Endpoint | Expected Log |
|--------|----------|--------------|
| Escalate Complaint | `POST /api/admin/escalate` | `[Escalation] Complaint TC-XXXXX escalated with status: FORWARDED` |
| Fetch Escalated | `GET /api/supervisor/complaints/escalated` | `[Escalation Query] Found X escalated complaints` |
| Debug Status | `GET /api/supervisor/debug/escalation` | Database stats in response |

---

## 💡 Expected Flow

```
Admin Escalates → Backend Sets status='FORWARDED' → Database Updated
                                                           ↓
Supervisor Opens Dashboard → Fetches Escalated → Shows Purple Card + Table
```

Once you run these tests, share the results and I can pinpoint exactly what's not working!
