const STORE_KEY = "atomquest_goal_portal_v1";

const ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
};

const UOM_LABELS = {
  NUMERIC_MIN: "Numeric - higher is better",
  NUMERIC_MAX: "Numeric - lower is better",
  PERCENT_MIN: "% - higher is better",
  PERCENT_MAX: "% - lower is better",
  TIMELINE: "Timeline",
  ZERO_BASED: "Zero-based",
};

const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  RETURNED: "Returned",
  LOCKED: "Locked",
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const nowText = () => new Date().toLocaleString();
const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

let state = loadState();
let session = state.session || { userId: null, view: "dashboard" };
let modal = null;

function seedState() {
  const users = [
    {
      id: "u_emp_1",
      name: "Aarav Mehta",
      email: "employee@test.com",
      password: "123456",
      role: ROLES.EMPLOYEE,
      managerId: "u_mgr_1",
      department: "Sales",
    },
    {
      id: "u_emp_2",
      name: "Nisha Rao",
      email: "nisha@test.com",
      password: "123456",
      role: ROLES.EMPLOYEE,
      managerId: "u_mgr_1",
      department: "Sales",
    },
    {
      id: "u_mgr_1",
      name: "Priya Sharma",
      email: "manager@test.com",
      password: "123456",
      role: ROLES.MANAGER,
      managerId: null,
      department: "Sales",
    },
    {
      id: "u_admin_1",
      name: "HR Admin",
      email: "admin@test.com",
      password: "123456",
      role: ROLES.ADMIN,
      managerId: null,
      department: "Human Resources",
    },
  ];

  const cycles = [
    { id: "c_goal", name: "Phase 1 - Goal Setting", type: "GOAL_SETTING", openDate: "2026-05-01", closeDate: "2026-06-30", active: true },
    { id: "c_q1", name: "Q1 Check-in", type: "Q1", openDate: "2026-07-01", closeDate: "2026-07-31", active: true },
    { id: "c_q2", name: "Q2 Check-in", type: "Q2", openDate: "2026-10-01", closeDate: "2026-10-31", active: false },
    { id: "c_q3", name: "Q3 Check-in", type: "Q3", openDate: "2027-01-01", closeDate: "2027-01-31", active: false },
    { id: "c_q4", name: "Q4 / Annual", type: "Q4", openDate: "2027-03-01", closeDate: "2027-04-30", active: false },
  ];

  const goals = [
    {
      id: "g_1",
      employeeId: "u_emp_1",
      primaryOwnerId: "u_emp_1",
      thrustArea: "Revenue Growth",
      title: "Grow enterprise sales pipeline",
      description: "Build a qualified enterprise pipeline for strategic accounts.",
      uomType: "NUMERIC_MIN",
      targetValue: 120,
      targetDate: "",
      weightage: 35,
      status: "LOCKED",
      locked: true,
      isShared: false,
      sharedGroupId: "",
      createdAt: nowText(),
      updatedAt: nowText(),
    },
    {
      id: "g_2",
      employeeId: "u_emp_1",
      primaryOwnerId: "u_emp_1",
      thrustArea: "Customer Success",
      title: "Improve renewal coverage",
      description: "Ensure all renewal accounts have a documented action plan.",
      uomType: "PERCENT_MIN",
      targetValue: 95,
      targetDate: "",
      weightage: 25,
      status: "LOCKED",
      locked: true,
      isShared: false,
      sharedGroupId: "",
      createdAt: nowText(),
      updatedAt: nowText(),
    },
    {
      id: "g_3",
      employeeId: "u_emp_1",
      primaryOwnerId: "u_emp_1",
      thrustArea: "Operational Excellence",
      title: "Reduce quote turnaround time",
      description: "Bring quote response time below agreed SLA.",
      uomType: "NUMERIC_MAX",
      targetValue: 2,
      targetDate: "",
      weightage: 20,
      status: "LOCKED",
      locked: true,
      isShared: false,
      sharedGroupId: "",
      createdAt: nowText(),
      updatedAt: nowText(),
    },
    {
      id: "g_4",
      employeeId: "u_emp_1",
      primaryOwnerId: "u_emp_1",
      thrustArea: "Compliance",
      title: "Complete account hygiene review",
      description: "Finish CRM data cleanup before the audit checkpoint.",
      uomType: "TIMELINE",
      targetValue: 0,
      targetDate: "2026-07-25",
      weightage: 20,
      status: "LOCKED",
      locked: true,
      isShared: false,
      sharedGroupId: "",
      createdAt: nowText(),
      updatedAt: nowText(),
    },
  ];

  const achievements = [
    { id: "a_1", goalId: "g_1", employeeId: "u_emp_1", quarter: "Q1", actual: 88, completionDate: "", progressScore: 73, status: "ON_TRACK", updatedBy: "u_emp_1", updatedAt: nowText() },
    { id: "a_2", goalId: "g_2", employeeId: "u_emp_1", quarter: "Q1", actual: 91, completionDate: "", progressScore: 96, status: "ON_TRACK", updatedBy: "u_emp_1", updatedAt: nowText() },
  ];

  return {
    users,
    cycles,
    goals,
    submissions: [{ id: "s_1", employeeId: "u_emp_1", cycleId: "c_goal", status: "APPROVED", submittedAt: nowText(), managerComments: "Approved with weighted focus on pipeline.", approvedBy: "u_mgr_1", approvedAt: nowText() }],
    achievements,
    checkins: [{ id: "ci_1", employeeId: "u_emp_1", managerId: "u_mgr_1", goalId: "g_1", quarter: "Q1", comment: "Strong start. Improve conversion notes for late-stage deals.", createdAt: nowText() }],
    auditLogs: [{ id: "log_1", userId: "u_mgr_1", entityType: "Goal", entityId: "g_1", action: "APPROVE", fieldChanged: "status", oldValue: "SUBMITTED", newValue: "LOCKED", createdAt: nowText() }],
    escalations: [{ id: "e_1", userId: "u_emp_2", reason: "Goals not submitted within 7 days of cycle open", level: "Manager", status: "OPEN", triggeredAt: nowText() }],
    session: { userId: null, view: "dashboard" },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : seedState();
  } catch {
    return seedState();
  }
}

function saveState() {
  state.session = session;
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function currentUser() {
  return state.users.find((user) => user.id === session.userId);
}

function setView(view) {
  session.view = view;
  saveState();
  render();
}

function login(email, password) {
  const user = state.users.find((item) => item.email === email && item.password === password);
  if (!user) {
    alert("Invalid login. Use the seeded demo credentials.");
    return;
  }
  session.userId = user.id;
  session.view = "dashboard";
  saveState();
  render();
}

function quickLogin(userId) {
  session.userId = userId;
  session.view = "dashboard";
  saveState();
  render();
}

function logout() {
  session.userId = null;
  session.view = "dashboard";
  saveState();
  render();
}

function resetDemo() {
  if (!confirm("Reset demo data to the original seeded state?")) return;
  localStorage.removeItem(STORE_KEY);
  state = seedState();
  session = state.session;
  render();
}

function userById(id) {
  return state.users.find((user) => user.id === id);
}

function employeeGoals(employeeId) {
  return state.goals.filter((goal) => goal.employeeId === employeeId);
}

function teamMembers(managerId) {
  return state.users.filter((user) => user.managerId === managerId);
}

function latestSubmission(employeeId) {
  return [...state.submissions].reverse().find((submission) => submission.employeeId === employeeId);
}

function activeQuarter() {
  const active = state.cycles.find((cycle) => cycle.active && cycle.type.startsWith("Q"));
  return active ? active.type : "Q1";
}

function addAudit(userId, entityType, entityId, action, fieldChanged, oldValue, newValue) {
  state.auditLogs.unshift({
    id: uid("log"),
    userId,
    entityType,
    entityId,
    action,
    fieldChanged,
    oldValue: String(oldValue ?? ""),
    newValue: String(newValue ?? ""),
    createdAt: nowText(),
  });
}

function validateGoalSheet(goals) {
  const errors = [];
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  if (goals.length === 0) errors.push("Add at least one goal before submitting.");
  if (goals.length > 8) errors.push("Maximum 8 goals are allowed.");
  if (goals.some((goal) => Number(goal.weightage) < 10)) errors.push("Every goal must have at least 10% weightage.");
  if (total !== 100) errors.push(`Total weightage must equal 100%. Current total is ${total}%.`);
  return { valid: errors.length === 0, errors, total };
}

function scoreGoal(goal, actual, completionDate) {
  const target = Number(goal.targetValue);
  const value = Number(actual);
  if (goal.uomType === "TIMELINE") {
    return completionDate && completionDate <= goal.targetDate ? 100 : 0;
  }
  if (goal.uomType === "ZERO_BASED") {
    return value === 0 ? 100 : 0;
  }
  if (!target || !value) return 0;
  if (goal.uomType.endsWith("_MIN")) return Math.min(Math.round((value / target) * 100), 100);
  if (goal.uomType.endsWith("_MAX")) return Math.min(Math.round((target / value) * 100), 100);
  return 0;
}

function statusBadge(status) {
  const normalized = String(status || "").toUpperCase();
  let color = "blue";
  if (["LOCKED", "APPROVED", "COMPLETED", "RESOLVED", "ON_TRACK"].includes(normalized)) color = "green";
  if (["SUBMITTED", "OPEN", "RETURNED"].includes(normalized)) color = "amber";
  if (["NOT_STARTED"].includes(normalized)) color = "red";
  return `<span class="badge ${color}">${(STATUS_LABELS[normalized] || normalized).replaceAll("_", " ")}</span>`;
}

function progressBar(value) {
  const safe = Math.max(0, Math.min(Number(value || 0), 100));
  return `<div class="progress" aria-label="Progress ${safe}%"><span style="--value:${safe}%"></span></div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  const app = document.querySelector("#app");
  const user = currentUser();
  app.innerHTML = user ? renderShell(user) : renderLogin();
  attachGlobalHandlers();
}

function renderLogin() {
  return `
    <main class="login-screen">
      <section class="login-box">
        <div class="login-hero">
          <div>
            <h1>AtomQuest Goal Portal</h1>
            <p>Goal creation, manager approvals, quarterly check-ins, audit logs, shared KPIs, and exportable governance reports in one demo-ready portal.</p>
          </div>
        </div>
        <form class="login-form" data-action="login">
          <div>
            <h2>Sign in</h2>
            <p class="muted">Use seeded credentials or jump directly into a role.</p>
          </div>
          <div class="field">
            <label>Email</label>
            <input name="email" value="employee@test.com" autocomplete="username" />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" value="123456" type="password" autocomplete="current-password" />
          </div>
          <button class="btn primary" type="submit">Sign in</button>
          <div class="demo-users">
            ${state.users
              .filter((user) => ["employee@test.com", "manager@test.com", "admin@test.com"].includes(user.email))
              .map((user) => `<button class="btn ghost" type="button" data-quick-login="${user.id}">${user.role}: ${user.email}</button>`)
              .join("")}
          </div>
        </form>
      </section>
    </main>
  `;
}

function renderShell(user) {
  const nav = navForRole(user.role);
  return `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="mark">AQ</div>
          <div>
            <h1>AtomQuest</h1>
            <small>Goal tracking portal</small>
          </div>
        </div>
        <div class="user-card">
          <strong>${escapeHtml(user.name)}</strong>
          <p>${user.role.replace("_", " ")} - ${escapeHtml(user.department)}</p>
        </div>
        <nav class="nav">
          ${nav.map((item) => `<button class="${session.view === item.id ? "active" : ""}" data-view="${item.id}"><span>${item.label}</span><span>${item.icon}</span></button>`).join("")}
        </nav>
        <div class="role-switcher">
          <small>Demo role switch</small>
          ${state.users
            .filter((item) => ["employee@test.com", "manager@test.com", "admin@test.com"].includes(item.email))
            .map((item) => `<button class="role-button" data-quick-login="${item.id}"><span>${item.role}</span><span>${item.email}</span></button>`)
            .join("")}
          <button class="role-button" data-action="logout"><span>Logout</span><span>Exit</span></button>
        </div>
      </aside>
      <main class="main">
        ${renderMain(user)}
      </main>
    </div>
    ${modal ? renderModal(modal) : ""}
  `;
}

function navForRole(role) {
  const common = [{ id: "dashboard", label: "Dashboard", icon: ">" }];
  if (role === ROLES.EMPLOYEE) {
    return [...common, { id: "goals", label: "My Goals", icon: ">" }, { id: "achievements", label: "Quarterly Updates", icon: ">" }, { id: "comments", label: "Manager Comments", icon: ">" }];
  }
  if (role === ROLES.MANAGER) {
    return [...common, { id: "approvals", label: "Approvals", icon: ">" }, { id: "checkins", label: "Check-ins", icon: ">" }, { id: "shared", label: "Shared Goals", icon: ">" }, { id: "analytics", label: "Analytics", icon: ">" }];
  }
  return [...common, { id: "users", label: "Users", icon: ">" }, { id: "cycles", label: "Cycles", icon: ">" }, { id: "reports", label: "Reports", icon: ">" }, { id: "audit", label: "Audit Logs", icon: ">" }, { id: "analytics", label: "Analytics", icon: ">" }];
}

function renderMain(user) {
  if (user.role === ROLES.EMPLOYEE) return renderEmployee(user);
  if (user.role === ROLES.MANAGER) return renderManager(user);
  return renderAdmin(user);
}

function pageHeader(title, subtitle, actions = "") {
  return `
    <div class="topbar">
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="toolbar">${actions}</div>
    </div>
  `;
}

function renderEmployee(user) {
  if (session.view === "goals") return renderEmployeeGoals(user);
  if (session.view === "achievements") return renderAchievements(user);
  if (session.view === "comments") return renderEmployeeComments(user);
  return renderEmployeeDashboard(user);
}

function renderEmployeeDashboard(user) {
  const goals = employeeGoals(user.id);
  const validation = validateGoalSheet(goals);
  const submission = latestSubmission(user.id);
  const canEditSheet = !goals.some((goal) => goal.locked);
  const achievements = state.achievements.filter((item) => item.employeeId === user.id);
  const average = achievements.length ? Math.round(achievements.reduce((sum, item) => sum + item.progressScore, 0) / achievements.length) : 0;
  return `
    ${pageHeader("Employee Dashboard", "Create goals, track approval status, and update quarterly achievement.", `<button class="btn primary" data-modal="goal" ${canEditSheet ? "" : "disabled"}>Add Goal</button><button class="btn ghost" data-view="achievements">Update Quarter</button>`)}
    <section class="grid four">
      ${metric("Goals", goals.length, "Maximum 8 per employee")}
      ${metric("Weightage", `${validation.total}%`, validation.valid ? "Ready to submit" : "Needs correction")}
      ${metric("Submission", submission ? STATUS_LABELS[submission.status] || submission.status : "Draft", "Manager workflow")}
      ${metric("Q Progress", `${average}%`, "Tracking score only")}
    </section>
    <section class="panel" style="margin-top:16px">
      <div class="section-title">
        <div><h3>My Goal Sheet</h3><p>Goals lock after manager approval.</p></div>
        <div class="row-actions">
          <button class="btn ghost" data-view="goals">Manage</button>
          <button class="btn primary" data-action="submit-goals" ${validation.valid && !goals.every((goal) => goal.locked) ? "" : "disabled"}>Submit</button>
        </div>
      </div>
      ${renderValidation(validation)}
      ${renderGoalsTable(goals, user)}
    </section>
  `;
}

function renderEmployeeGoals(user) {
  const goals = employeeGoals(user.id);
  const validation = validateGoalSheet(goals);
  const canEditSheet = !goals.some((goal) => goal.locked);
  return `
    ${pageHeader("My Goals", "Create up to 8 goals with total weightage exactly 100%.", `<button class="btn primary" data-modal="goal" ${canEditSheet ? "" : "disabled"}>Add Goal</button><button class="btn ghost" data-action="submit-goals" ${validation.valid && canEditSheet ? "" : "disabled"}>Submit Goal Sheet</button>`)}
    <section class="panel">
      ${renderValidation(validation)}
      ${renderGoalsTable(goals, user, true)}
    </section>
  `;
}

function renderGoalsTable(goals, user, editable = false) {
  if (!goals.length) return `<div class="empty">No goals yet. Add goals to start your goal sheet.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Goal</th><th>Thrust Area</th><th>UoM</th><th>Target</th><th>Weight</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${goals
            .map((goal) => {
              const target = goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue;
              const canEdit = editable && !goal.locked;
              const lockedShared = goal.isShared ? "<br><small>Shared KPI: title/target locked</small>" : "";
              return `
                <tr>
                  <td><strong>${escapeHtml(goal.title)}</strong><br><small>${escapeHtml(goal.description)}${lockedShared}</small></td>
                  <td>${escapeHtml(goal.thrustArea)}</td>
                  <td>${UOM_LABELS[goal.uomType]}</td>
                  <td>${escapeHtml(target)}</td>
                  <td>${goal.weightage}%</td>
                  <td>${statusBadge(goal.status)}</td>
                  <td>
                    <div class="row-actions">
                      <button class="btn ghost" data-modal="goal" data-id="${goal.id}" ${canEdit ? "" : "disabled"}>Edit</button>
                      <button class="btn danger" data-action="delete-goal" data-id="${goal.id}" ${canEdit ? "" : "disabled"}>Delete</button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderValidation(validation) {
  const className = validation.valid ? "notice" : "notice error";
  return `
    <div class="validation">
      <div class="${className}">
        <strong>Validation:</strong>
        ${validation.valid ? "Goal sheet passes max count, minimum weightage, and 100% total checks." : validation.errors.map(escapeHtml).join(" ")}
      </div>
    </div>
  `;
}

function renderAchievements(user) {
  const quarter = activeQuarter();
  const goals = employeeGoals(user.id).filter((goal) => goal.locked);
  return `
    ${pageHeader("Quarterly Updates", `Active quarter: ${quarter}. Enter actual achievement against locked approved goals.`)}
    <section class="panel">
      ${goals.length ? renderAchievementTable(goals, user, quarter) : `<div class="empty">No locked goals are available for achievement updates.</div>`}
    </section>
  `;
}

function renderAchievementTable(goals, user, quarter) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Goal</th><th>Planned Target</th><th>Actual</th><th>Status</th><th>Score</th><th>Action</th></tr></thead>
        <tbody>
          ${goals
            .map((goal) => {
              const achievement = state.achievements.find((item) => item.goalId === goal.id && item.quarter === quarter);
              return `
                <tr>
                  <td><strong>${escapeHtml(goal.title)}</strong><br><small>${UOM_LABELS[goal.uomType]}</small></td>
                  <td>${goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue}</td>
                  <td>${achievement ? escapeHtml(achievement.actual || achievement.completionDate) : "-"}</td>
                  <td>${achievement ? statusBadge(achievement.status) : statusBadge("NOT_STARTED")}</td>
                  <td>${achievement ? `${achievement.progressScore}% ${progressBar(achievement.progressScore)}` : "0%"}</td>
                  <td><button class="btn primary" data-modal="achievement" data-id="${goal.id}">Update</button></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmployeeComments(user) {
  const comments = state.checkins.filter((item) => item.employeeId === user.id);
  return `
    ${pageHeader("Manager Comments", "Structured check-in feedback from quarterly discussions.")}
    <section class="panel">
      ${comments.length ? comments.map(renderCheckinComment).join("") : `<div class="empty">No check-in comments yet.</div>`}
    </section>
  `;
}

function renderManager(user) {
  if (session.view === "approvals") return renderApprovals(user);
  if (session.view === "checkins") return renderManagerCheckins(user);
  if (session.view === "shared") return renderSharedGoals(user);
  if (session.view === "analytics") return renderAnalytics(user);
  return renderManagerDashboard(user);
}

function renderManagerDashboard(user) {
  const team = teamMembers(user.id);
  const pending = team.filter((member) => latestSubmission(member.id)?.status === "SUBMITTED").length;
  const locked = state.goals.filter((goal) => team.some((member) => member.id === goal.employeeId) && goal.locked).length;
  const checkins = state.checkins.filter((item) => item.managerId === user.id).length;
  return `
    ${pageHeader("Manager Dashboard", "Review submissions, approve goals, and run quarterly check-ins.", `<button class="btn primary" data-view="approvals">Review Approvals</button><button class="btn ghost" data-modal="shared-goal">Push Shared Goal</button>`)}
    <section class="grid four">
      ${metric("Team", team.length, "Direct reports")}
      ${metric("Pending", pending, "Goal sheets awaiting approval")}
      ${metric("Locked Goals", locked, "Approved and frozen")}
      ${metric("Check-ins", checkins, "Comments logged")}
    </section>
    <section class="panel" style="margin-top:16px">
      <div class="section-title"><div><h3>Team Overview</h3><p>Submission and quarterly progress by employee.</p></div></div>
      ${renderTeamTable(team)}
    </section>
  `;
}

function renderTeamTable(team) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Department</th><th>Submission</th><th>Goals</th><th>Q Progress</th><th>Actions</th></tr></thead>
        <tbody>
          ${team
            .map((member) => {
              const goals = employeeGoals(member.id);
              const submission = latestSubmission(member.id);
              const achievements = state.achievements.filter((item) => item.employeeId === member.id);
              const average = achievements.length ? Math.round(achievements.reduce((sum, item) => sum + item.progressScore, 0) / achievements.length) : 0;
              return `
                <tr>
                  <td><strong>${escapeHtml(member.name)}</strong><br><small>${member.email}</small></td>
                  <td>${escapeHtml(member.department)}</td>
                  <td>${submission ? statusBadge(submission.status) : statusBadge("DRAFT")}</td>
                  <td>${goals.length}</td>
                  <td>${average}% ${progressBar(average)}</td>
                  <td><button class="btn ghost" data-view="approvals">Review</button></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderApprovals(user) {
  const team = teamMembers(user.id);
  return `
    ${pageHeader("Goal Approvals", "Inline edit targets and weightages, then approve or return for rework.")}
    <section class="grid">
      ${team.map((member) => renderApprovalCard(member, user)).join("")}
    </section>
  `;
}

function renderApprovalCard(member, manager) {
  const goals = employeeGoals(member.id);
  const submission = latestSubmission(member.id);
  const validation = validateGoalSheet(goals);
  return `
    <article class="panel">
      <div class="section-title">
        <div>
          <h3>${escapeHtml(member.name)}</h3>
          <p>${member.email} - ${submission ? STATUS_LABELS[submission.status] || submission.status : "Draft"}</p>
        </div>
        <div class="row-actions">
          <button class="btn primary" data-action="approve-goals" data-id="${member.id}" ${submission?.status === "SUBMITTED" && validation.valid ? "" : "disabled"}>Approve</button>
          <button class="btn ghost" data-modal="return" data-id="${member.id}" ${submission?.status === "SUBMITTED" ? "" : "disabled"}>Return</button>
        </div>
      </div>
      ${renderValidation(validation)}
      ${goals.length ? renderManagerGoalEditor(goals, manager) : `<div class="empty">No goals submitted.</div>`}
    </article>
  `;
}

function renderManagerGoalEditor(goals, manager) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Goal</th><th>UoM</th><th>Target</th><th>Weightage</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${goals
            .map((goal) => `
              <tr>
                <td><strong>${escapeHtml(goal.title)}</strong><br><small>${escapeHtml(goal.description)}</small></td>
                <td>${UOM_LABELS[goal.uomType]}</td>
                <td><input value="${escapeHtml(goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue)}" data-inline="target" data-id="${goal.id}" ${goal.locked || goal.isShared ? "readonly" : ""} /></td>
                <td><input type="number" min="10" max="100" value="${goal.weightage}" data-inline="weightage" data-id="${goal.id}" ${goal.locked ? "readonly" : ""} /></td>
                <td>${statusBadge(goal.status)}</td>
                <td><button class="btn ghost" data-action="save-inline" data-id="${goal.id}" ${goal.locked ? "disabled" : ""}>Save</button></td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderManagerCheckins(user) {
  const quarter = activeQuarter();
  const goals = state.goals.filter((goal) => teamMembers(user.id).some((member) => member.id === goal.employeeId) && goal.locked);
  return `
    ${pageHeader("Quarterly Check-ins", `Active quarter: ${quarter}. Review planned vs actual and document the discussion.`)}
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Goal</th><th>Planned</th><th>Actual</th><th>Score</th><th>Check-in</th></tr></thead>
          <tbody>
            ${goals
              .map((goal) => {
                const employee = userById(goal.employeeId);
                const achievement = state.achievements.find((item) => item.goalId === goal.id && item.quarter === quarter);
                const comment = state.checkins.find((item) => item.goalId === goal.id && item.quarter === quarter);
                return `
                  <tr>
                    <td>${escapeHtml(employee.name)}</td>
                    <td><strong>${escapeHtml(goal.title)}</strong></td>
                    <td>${goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue}</td>
                    <td>${achievement ? escapeHtml(achievement.actual || achievement.completionDate) : "-"}</td>
                    <td>${achievement ? `${achievement.progressScore}%` : "0%"}</td>
                    <td>
                      ${comment ? `<small>${escapeHtml(comment.comment)}</small><br>` : ""}
                      <button class="btn primary" data-modal="checkin" data-id="${goal.id}">${comment ? "Edit Comment" : "Add Comment"}</button>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSharedGoals(user) {
  const shared = state.goals.filter((goal) => goal.isShared);
  return `
    ${pageHeader("Shared Goals", "Push departmental KPIs to multiple employees. Recipients can adjust weightage only.", `<button class="btn primary" data-modal="shared-goal">Push Shared Goal</button>`)}
    <section class="panel">
      ${shared.length ? renderGoalsTable(shared, user, false) : `<div class="empty">No shared goals have been pushed yet.</div>`}
    </section>
  `;
}

function renderAdmin(user) {
  if (session.view === "users") return renderUsers(user);
  if (session.view === "cycles") return renderCycles(user);
  if (session.view === "reports") return renderReports(user);
  if (session.view === "audit") return renderAudit(user);
  if (session.view === "analytics") return renderAnalytics(user);
  return renderAdminDashboard(user);
}

function renderAdminDashboard(user) {
  const employees = state.users.filter((item) => item.role === ROLES.EMPLOYEE);
  const lockedEmployees = employees.filter((employee) => employeeGoals(employee.id).some((goal) => goal.locked)).length;
  const checkinEmployees = employees.filter((employee) => state.checkins.some((item) => item.employeeId === employee.id && item.quarter === activeQuarter())).length;
  return `
    ${pageHeader("Admin Dashboard", "Monitor completion, govern exceptions, and export performance data.", `<button class="btn primary" data-action="export-csv">Export Achievement CSV</button><button class="btn ghost" data-action="reset-demo">Reset Demo</button>`)}
    <section class="grid four">
      ${metric("Employees", employees.length, "Active population")}
      ${metric("Goal Completion", `${Math.round((lockedEmployees / employees.length) * 100)}%`, "Employees with locked goals")}
      ${metric("Check-ins", `${Math.round((checkinEmployees / employees.length) * 100)}%`, `${activeQuarter()} completion`)}
      ${metric("Audit Events", state.auditLogs.length, "Governance trail")}
    </section>
    <section class="grid two" style="margin-top:16px">
      <div class="panel">${renderCompletionChart()}</div>
      <div class="panel">${renderEscalations()}</div>
    </section>
  `;
}

function renderUsers(user) {
  return `
    ${pageHeader("User Management", "Manage demo users and reporting hierarchy.", `<button class="btn primary" data-modal="user">Add User</button>`)}
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Manager</th><th>Department</th></tr></thead>
          <tbody>
            ${state.users
              .map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.email}</td><td>${item.role}</td><td>${item.managerId ? escapeHtml(userById(item.managerId)?.name) : "-"}</td><td>${escapeHtml(item.department)}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCycles(user) {
  return `
    ${pageHeader("Cycle Management", "Open or close quarterly windows for achievement capture.")}
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Cycle</th><th>Type</th><th>Window</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${state.cycles
              .map((cycle) => `
                <tr>
                  <td>${escapeHtml(cycle.name)}</td>
                  <td>${cycle.type}</td>
                  <td>${cycle.openDate} to ${cycle.closeDate}</td>
                  <td>${cycle.active ? statusBadge("OPEN") : statusBadge("DRAFT")}</td>
                  <td><button class="btn ghost" data-action="toggle-cycle" data-id="${cycle.id}">${cycle.active ? "Close" : "Open"}</button></td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderReports(user) {
  return `
    ${pageHeader("Reports", "Export planned target vs actual achievement for all employees.", `<button class="btn primary" data-action="export-csv">Download CSV</button>`)}
    <section class="panel">
      ${renderAchievementReportTable()}
    </section>
  `;
}

function renderAchievementReportTable() {
  const rows = achievementReportRows();
  const admin = currentUser()?.role === ROLES.ADMIN;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Department</th><th>Goal</th><th>Quarter</th><th>Planned</th><th>Actual</th><th>Score</th><th>Status</th>${admin ? "<th>Admin</th>" : ""}</tr></thead>
        <tbody>
          ${rows
            .map((row) => `<tr><td>${escapeHtml(row.employee)}</td><td>${escapeHtml(row.department)}</td><td>${escapeHtml(row.goal)}</td><td>${row.quarter}</td><td>${row.planned}</td><td>${row.actual}</td><td>${row.score}%</td><td>${row.status}</td>${admin ? `<td><button class="btn ghost" data-action="unlock-goal" data-id="${row.goalId}" ${row.locked ? "" : "disabled"}>Unlock</button></td>` : ""}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAudit(user) {
  return `
    ${pageHeader("Audit Logs", "All governance-significant changes are recorded with actor, field, old value, and new value.")}
    <section class="panel">
      ${state.auditLogs.length ? state.auditLogs.map(renderAuditItem).join("") : `<div class="empty">No audit logs yet.</div>`}
    </section>
  `;
}

function renderAuditItem(log) {
  const actor = userById(log.userId);
  return `
    <div class="audit-item">
      <strong>${escapeHtml(log.action)} ${escapeHtml(log.entityType)} ${escapeHtml(log.entityId)}</strong>
      <span>${escapeHtml(actor?.name || "System")} changed ${escapeHtml(log.fieldChanged)} from "${escapeHtml(log.oldValue)}" to "${escapeHtml(log.newValue)}".</span>
      <small class="muted">${escapeHtml(log.createdAt)}</small>
    </div>
  `;
}

function renderAnalytics(user) {
  return `
    ${pageHeader("Analytics", "QoQ trends, completion rates, goal distribution, and manager effectiveness.")}
    <section class="grid two">
      <div class="panel">${renderCompletionChart()}</div>
      <div class="panel">${renderDistributionChart()}</div>
      <div class="panel">${renderQuarterTrend()}</div>
      <div class="panel">${renderManagerEffectiveness()}</div>
    </section>
  `;
}

function renderCompletionChart() {
  const employees = state.users.filter((user) => user.role === ROLES.EMPLOYEE);
  const goalDone = employees.filter((employee) => employeeGoals(employee.id).some((goal) => goal.locked)).length;
  const checkinDone = employees.filter((employee) => state.checkins.some((checkin) => checkin.employeeId === employee.id && checkin.quarter === activeQuarter())).length;
  return `
    <div class="section-title"><div><h3>Completion Dashboard</h3><p>Employee and manager workflow completion.</p></div></div>
    <div class="chart">
      ${barRow("Goals locked", pct(goalDone, employees.length))}
      ${barRow("Check-ins", pct(checkinDone, employees.length))}
      ${barRow("Approvals", pct(state.submissions.filter((item) => item.status === "APPROVED").length, employees.length))}
    </div>
  `;
}

function renderDistributionChart() {
  const counts = state.goals.reduce((acc, goal) => {
    acc[goal.uomType] = (acc[goal.uomType] || 0) + 1;
    return acc;
  }, {});
  return `
    <div class="section-title"><div><h3>Goal Distribution</h3><p>Breakdown by UoM type.</p></div></div>
    <div class="chart">
      ${Object.entries(counts).map(([label, count]) => barRow(label.replace("_", " "), pct(count, state.goals.length), `${count}`)).join("") || `<div class="empty">No goals yet.</div>`}
    </div>
  `;
}

function renderQuarterTrend() {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  return `
    <div class="section-title"><div><h3>QoQ Trend</h3><p>Average achievement score by quarter.</p></div></div>
    <div class="chart">
      ${quarters
        .map((quarter) => {
          const rows = state.achievements.filter((item) => item.quarter === quarter);
          const average = rows.length ? Math.round(rows.reduce((sum, item) => sum + item.progressScore, 0) / rows.length) : 0;
          return barRow(quarter, average);
        })
        .join("")}
    </div>
  `;
}

function renderManagerEffectiveness() {
  const managers = state.users.filter((user) => user.role === ROLES.MANAGER);
  return `
    <div class="section-title"><div><h3>Manager Effectiveness</h3><p>Check-in completion by L1 manager.</p></div></div>
    <div class="chart">
      ${managers
        .map((manager) => {
          const members = teamMembers(manager.id);
          const done = members.filter((member) => state.checkins.some((item) => item.employeeId === member.id && item.quarter === activeQuarter())).length;
          return barRow(manager.name, pct(done, members.length));
        })
        .join("")}
    </div>
  `;
}

function renderEscalations() {
  return `
    <div class="section-title"><div><h3>Escalations</h3><p>Rule-based overdue workflow alerts.</p></div></div>
    ${state.escalations
      .map((item) => {
        const user = userById(item.userId);
        return `<div class="audit-item"><strong>${escapeHtml(user?.name || "Unknown")}</strong><span>${escapeHtml(item.reason)}</span><small>${item.level} - ${item.status} - ${item.triggeredAt}</small></div>`;
      })
      .join("")}
  `;
}

function pct(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function barRow(label, value, suffix = `${value}%`) {
  return `
    <div class="bar-row">
      <strong>${escapeHtml(label)}</strong>
      <div class="bar"><span style="--value:${Math.min(value, 100)}%"></span></div>
      <span>${suffix}</span>
    </div>
  `;
}

function metric(title, value, hint) {
  return `<article class="card metric"><span>${title}</span><strong>${value}</strong><span>${hint}</span></article>`;
}

function renderCheckinComment(comment) {
  const goal = state.goals.find((item) => item.id === comment.goalId);
  const manager = userById(comment.managerId);
  return `
    <div class="audit-item">
      <strong>${comment.quarter}: ${escapeHtml(goal?.title || "Goal")}</strong>
      <span>${escapeHtml(comment.comment)}</span>
      <small>${escapeHtml(manager?.name || "Manager")} - ${escapeHtml(comment.createdAt)}</small>
    </div>
  `;
}

function renderModal(config) {
  if (config.type === "goal") return renderGoalModal(config.id);
  if (config.type === "achievement") return renderAchievementModal(config.id);
  if (config.type === "checkin") return renderCheckinModal(config.id);
  if (config.type === "return") return renderReturnModal(config.id);
  if (config.type === "shared-goal") return renderSharedGoalModal();
  if (config.type === "user") return renderUserModal();
  return "";
}

function modalWrap(title, body, formAction) {
  return `
    <div class="modal" data-action="close-modal-bg">
      <form class="modal-card" data-action="${formAction}">
        <div class="section-title">
          <div><h3>${title}</h3></div>
          <button class="btn ghost" type="button" data-action="close-modal">Close</button>
        </div>
        ${body}
      </form>
    </div>
  `;
}

function renderGoalModal(goalId) {
  const user = currentUser();
  const goal = goalId ? state.goals.find((item) => item.id === goalId) : null;
  const isShared = Boolean(goal?.isShared);
  const body = `
    <input type="hidden" name="id" value="${goal?.id || ""}" />
    <div class="form-grid">
      <div class="field">
        <label>Thrust Area</label>
        <input name="thrustArea" value="${escapeHtml(goal?.thrustArea || "")}" ${isShared ? "readonly" : ""} required />
      </div>
      <div class="field">
        <label>UoM Type</label>
        <select name="uomType" ${isShared ? "disabled" : ""}>
          ${Object.entries(UOM_LABELS).map(([value, label]) => `<option value="${value}" ${goal?.uomType === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      <div class="field full">
        <label>Goal Title</label>
        <input name="title" value="${escapeHtml(goal?.title || "")}" ${isShared ? "readonly" : ""} required />
      </div>
      <div class="field full">
        <label>Description</label>
        <textarea name="description" ${isShared ? "readonly" : ""}>${escapeHtml(goal?.description || "")}</textarea>
      </div>
      <div class="field">
        <label>Target Value</label>
        <input name="targetValue" type="number" step="0.01" value="${goal?.targetValue || ""}" ${isShared ? "readonly" : ""} />
      </div>
      <div class="field">
        <label>Target Date for Timeline</label>
        <input name="targetDate" type="date" value="${goal?.targetDate || ""}" ${isShared ? "readonly" : ""} />
      </div>
      <div class="field">
        <label>Weightage</label>
        <input name="weightage" type="number" min="10" max="100" value="${goal?.weightage || 10}" required />
      </div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" type="submit">${goal ? "Save Goal" : "Add Goal"}</button>
    </div>
  `;
  return modalWrap(goal ? "Edit Goal" : "Add Goal", body, "save-goal");
}

function renderAchievementModal(goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  const quarter = activeQuarter();
  const achievement = state.achievements.find((item) => item.goalId === goalId && item.quarter === quarter);
  const body = `
    <input type="hidden" name="goalId" value="${goalId}" />
    <div class="notice"><strong>${escapeHtml(goal.title)}</strong><br>Planned target: ${goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue}</div>
    <div class="form-grid" style="margin-top:14px">
      <div class="field">
        <label>Quarter</label>
        <input name="quarter" value="${quarter}" readonly />
      </div>
      <div class="field">
        <label>Status</label>
        <select name="status">
          ${["NOT_STARTED", "ON_TRACK", "COMPLETED"].map((value) => `<option value="${value}" ${achievement?.status === value ? "selected" : ""}>${value.replace("_", " ")}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Actual Achievement</label>
        <input name="actual" type="number" step="0.01" value="${achievement?.actual || ""}" />
      </div>
      <div class="field">
        <label>Completion Date</label>
        <input name="completionDate" type="date" value="${achievement?.completionDate || todayIso()}" />
      </div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" type="submit">Save Achievement</button>
    </div>
  `;
  return modalWrap("Quarterly Achievement", body, "save-achievement");
}

function renderCheckinModal(goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  const quarter = activeQuarter();
  const comment = state.checkins.find((item) => item.goalId === goalId && item.quarter === quarter);
  const body = `
    <input type="hidden" name="goalId" value="${goalId}" />
    <div class="notice"><strong>${escapeHtml(goal.title)}</strong><br>Document the structured manager discussion for ${quarter}.</div>
    <div class="field full" style="margin-top:14px">
      <label>Check-in Comment</label>
      <textarea name="comment" required>${escapeHtml(comment?.comment || "")}</textarea>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" type="submit">Save Comment</button>
    </div>
  `;
  return modalWrap("Manager Check-in", body, "save-checkin");
}

function renderReturnModal(employeeId) {
  const employee = userById(employeeId);
  const body = `
    <input type="hidden" name="employeeId" value="${employeeId}" />
    <div class="notice">Return ${escapeHtml(employee.name)}'s goal sheet for rework with a clear reason.</div>
    <div class="field full" style="margin-top:14px">
      <label>Manager Comment</label>
      <textarea name="comment" required>Please revise weightage and clarify measurable target.</textarea>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" type="submit">Return for Rework</button>
    </div>
  `;
  return modalWrap("Return Goal Sheet", body, "return-goals");
}

function renderSharedGoalModal() {
  const employees = state.users.filter((user) => user.role === ROLES.EMPLOYEE);
  const body = `
    <div class="form-grid">
      <div class="field">
        <label>Thrust Area</label>
        <input name="thrustArea" value="Department KPI" required />
      </div>
      <div class="field">
        <label>UoM Type</label>
        <select name="uomType">
          ${Object.entries(UOM_LABELS).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
        </select>
      </div>
      <div class="field full">
        <label>Goal Title</label>
        <input name="title" value="Improve departmental customer NPS" required />
      </div>
      <div class="field full">
        <label>Description</label>
        <textarea name="description">Shared departmental KPI assigned by manager or HR.</textarea>
      </div>
      <div class="field">
        <label>Target Value</label>
        <input name="targetValue" type="number" value="85" />
      </div>
      <div class="field">
        <label>Default Weightage</label>
        <input name="weightage" type="number" min="10" max="100" value="10" />
      </div>
      <div class="field full">
        <label>Assign To</label>
        ${employees.map((employee) => `<label><input type="checkbox" name="employees" value="${employee.id}" checked /> ${escapeHtml(employee.name)} (${employee.department})</label>`).join("")}
      </div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" type="submit">Push Shared Goal</button>
    </div>
  `;
  return modalWrap("Push Shared Goal", body, "save-shared-goal");
}

function renderUserModal() {
  const managers = state.users.filter((user) => user.role === ROLES.MANAGER);
  const body = `
    <div class="form-grid">
      <div class="field"><label>Name</label><input name="name" required /></div>
      <div class="field"><label>Email</label><input name="email" type="email" required /></div>
      <div class="field">
        <label>Role</label>
        <select name="role">
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="MANAGER">MANAGER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div class="field">
        <label>Manager</label>
        <select name="managerId">
          <option value="">None</option>
          ${managers.map((manager) => `<option value="${manager.id}">${escapeHtml(manager.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field full"><label>Department</label><input name="department" value="Sales" /></div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" type="submit">Add User</button>
    </div>
  `;
  return modalWrap("Add User", body, "save-user");
}

function attachGlobalHandlers() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.querySelectorAll("[data-quick-login]").forEach((button) => {
    button.addEventListener("click", () => quickLogin(button.dataset.quickLogin));
  });

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      modal = { type: button.dataset.modal, id: button.dataset.id };
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((node) => {
    const action = node.dataset.action;
    if (node.tagName === "FORM") {
      node.addEventListener("submit", handleSubmit);
    } else {
      node.addEventListener("click", handleClick);
    }
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const action = event.currentTarget.dataset.action;
  const form = new FormData(event.currentTarget);
  if (action === "login") login(form.get("email"), form.get("password"));
  if (action === "save-goal") saveGoal(form);
  if (action === "save-achievement") saveAchievement(form);
  if (action === "save-checkin") saveCheckin(form);
  if (action === "return-goals") returnGoals(form);
  if (action === "save-shared-goal") saveSharedGoal(form);
  if (action === "save-user") saveUser(form);
}

function handleClick(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (action === "logout") logout();
  if (action === "reset-demo") resetDemo();
  if (action === "close-modal") {
    modal = null;
    render();
  }
  if (action === "close-modal-bg" && event.target === target) {
    modal = null;
    render();
  }
  if (action === "delete-goal") deleteGoal(target.dataset.id);
  if (action === "submit-goals") submitGoals();
  if (action === "approve-goals") approveGoals(target.dataset.id);
  if (action === "save-inline") saveInlineGoal(target.dataset.id);
  if (action === "toggle-cycle") toggleCycle(target.dataset.id);
  if (action === "export-csv") exportCsv();
  if (action === "unlock-goal") unlockGoal(target.dataset.id);
}

function saveGoal(form) {
  const user = currentUser();
  const id = form.get("id");
  const existing = id ? state.goals.find((goal) => goal.id === id) : null;
  const goals = employeeGoals(user.id);
  if (!existing && goals.some((goal) => goal.locked)) {
    alert("Goals are locked after approval. Ask Admin to unlock before adding or editing goals.");
    return;
  }
  if (!existing && goals.length >= 8) {
    alert("Maximum 8 goals are allowed.");
    return;
  }
  const data = {
    thrustArea: form.get("thrustArea"),
    title: form.get("title"),
    description: form.get("description"),
    uomType: existing?.isShared ? existing.uomType : form.get("uomType"),
    targetValue: Number(form.get("targetValue") || 0),
    targetDate: form.get("targetDate"),
    weightage: Number(form.get("weightage")),
  };
  if (data.weightage < 10) {
    alert("Minimum weightage per goal is 10%.");
    return;
  }
  if (existing) {
    if (existing.locked) return;
    Object.entries(data).forEach(([key, value]) => {
      const oldValue = existing[key];
      if (oldValue !== value) addAudit(user.id, "Goal", existing.id, "UPDATE", key, oldValue, value);
      existing[key] = value;
    });
    existing.updatedAt = nowText();
  } else {
    state.goals.push({
      id: uid("g"),
      employeeId: user.id,
      primaryOwnerId: user.id,
      ...data,
      status: "DRAFT",
      locked: false,
      isShared: false,
      sharedGroupId: "",
      createdAt: nowText(),
      updatedAt: nowText(),
    });
  }
  modal = null;
  saveState();
  render();
}

function deleteGoal(goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal || goal.locked) return;
  state.goals = state.goals.filter((item) => item.id !== goalId);
  addAudit(currentUser().id, "Goal", goalId, "DELETE", "goal", goal.title, "");
  saveState();
  render();
}

function submitGoals() {
  const user = currentUser();
  const goals = employeeGoals(user.id);
  const validation = validateGoalSheet(goals);
  if (!validation.valid) {
    alert(validation.errors.join("\n"));
    return;
  }
  goals.forEach((goal) => {
    if (!goal.locked) {
      goal.status = "SUBMITTED";
      goal.updatedAt = nowText();
    }
  });
  state.submissions.push({
    id: uid("s"),
    employeeId: user.id,
    cycleId: "c_goal",
    status: "SUBMITTED",
    submittedAt: nowText(),
    managerComments: "",
    approvedBy: "",
    approvedAt: "",
  });
  addAudit(user.id, "GoalSheet", user.id, "SUBMIT", "status", "DRAFT", "SUBMITTED");
  saveState();
  render();
}

function approveGoals(employeeId) {
  const manager = currentUser();
  const goals = employeeGoals(employeeId);
  const validation = validateGoalSheet(goals);
  if (!validation.valid) {
    alert(validation.errors.join("\n"));
    return;
  }
  goals.forEach((goal) => {
    const oldStatus = goal.status;
    goal.status = "LOCKED";
    goal.locked = true;
    goal.updatedAt = nowText();
    addAudit(manager.id, "Goal", goal.id, "APPROVE", "status", oldStatus, "LOCKED");
  });
  const submission = latestSubmission(employeeId);
  if (submission) {
    submission.status = "APPROVED";
    submission.approvedBy = manager.id;
    submission.approvedAt = nowText();
  }
  saveState();
  render();
}

function returnGoals(form) {
  const employeeId = form.get("employeeId");
  const comment = form.get("comment");
  const submission = latestSubmission(employeeId);
  if (submission) {
    submission.status = "RETURNED";
    submission.managerComments = comment;
  }
  employeeGoals(employeeId).forEach((goal) => {
    if (!goal.locked) goal.status = "RETURNED";
  });
  addAudit(currentUser().id, "GoalSheet", employeeId, "RETURN", "managerComments", "", comment);
  modal = null;
  saveState();
  render();
}

function saveInlineGoal(goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal || goal.locked) return;
  const targetInput = document.querySelector(`[data-inline="target"][data-id="${goalId}"]`);
  const weightInput = document.querySelector(`[data-inline="weightage"][data-id="${goalId}"]`);
  const oldTarget = goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue;
  const newTarget = targetInput.value;
  const oldWeight = goal.weightage;
  if (goal.uomType === "TIMELINE") goal.targetDate = newTarget;
  else goal.targetValue = Number(newTarget);
  goal.weightage = Number(weightInput.value);
  goal.updatedAt = nowText();
  addAudit(currentUser().id, "Goal", goal.id, "MANAGER_EDIT", "target", oldTarget, newTarget);
  addAudit(currentUser().id, "Goal", goal.id, "MANAGER_EDIT", "weightage", oldWeight, goal.weightage);
  saveState();
  render();
}

function saveAchievement(form) {
  const user = currentUser();
  const goalId = form.get("goalId");
  const goal = state.goals.find((item) => item.id === goalId);
  const quarter = form.get("quarter");
  const actual = Number(form.get("actual") || 0);
  const completionDate = form.get("completionDate");
  const progressScore = scoreGoal(goal, actual, completionDate);
  let achievement = state.achievements.find((item) => item.goalId === goalId && item.quarter === quarter);
  if (!achievement) {
    achievement = { id: uid("a"), goalId, employeeId: goal.employeeId, quarter };
    state.achievements.push(achievement);
  }
  Object.assign(achievement, {
    actual,
    completionDate,
    progressScore,
    status: form.get("status"),
    updatedBy: user.id,
    updatedAt: nowText(),
  });
  syncSharedAchievement(goal, achievement);
  addAudit(user.id, "Achievement", achievement.id, "UPSERT", "progressScore", "", progressScore);
  modal = null;
  saveState();
  render();
}

function syncSharedAchievement(goal, achievement) {
  if (!goal.sharedGroupId || goal.primaryOwnerId !== goal.employeeId) return;
  const linked = state.goals.filter((item) => item.sharedGroupId === goal.sharedGroupId && item.id !== goal.id);
  linked.forEach((linkedGoal) => {
    let linkedAchievement = state.achievements.find((item) => item.goalId === linkedGoal.id && item.quarter === achievement.quarter);
    if (!linkedAchievement) {
      linkedAchievement = { id: uid("a"), goalId: linkedGoal.id, employeeId: linkedGoal.employeeId, quarter: achievement.quarter };
      state.achievements.push(linkedAchievement);
    }
    Object.assign(linkedAchievement, {
      actual: achievement.actual,
      completionDate: achievement.completionDate,
      progressScore: achievement.progressScore,
      status: achievement.status,
      updatedBy: achievement.updatedBy,
      updatedAt: nowText(),
    });
  });
}

function saveCheckin(form) {
  const manager = currentUser();
  const goalId = form.get("goalId");
  const goal = state.goals.find((item) => item.id === goalId);
  const quarter = activeQuarter();
  let checkin = state.checkins.find((item) => item.goalId === goalId && item.quarter === quarter);
  if (!checkin) {
    checkin = { id: uid("ci"), goalId, employeeId: goal.employeeId, managerId: manager.id, quarter, createdAt: nowText() };
    state.checkins.push(checkin);
  }
  const oldValue = checkin.comment || "";
  checkin.comment = form.get("comment");
  checkin.createdAt = nowText();
  addAudit(manager.id, "Checkin", checkin.id, "COMMENT", "comment", oldValue, checkin.comment);
  modal = null;
  saveState();
  render();
}

function saveSharedGoal(form) {
  const creator = currentUser();
  const employeeIds = form.getAll("employees");
  if (!employeeIds.length) {
    alert("Select at least one employee.");
    return;
  }
  const groupId = uid("shared");
  const primaryOwnerId = employeeIds[0];
  employeeIds.forEach((employeeId) => {
    state.goals.push({
      id: uid("g"),
      employeeId,
      primaryOwnerId,
      thrustArea: form.get("thrustArea"),
      title: form.get("title"),
      description: form.get("description"),
      uomType: form.get("uomType"),
      targetValue: Number(form.get("targetValue") || 0),
      targetDate: "",
      weightage: Number(form.get("weightage") || 10),
      status: "DRAFT",
      locked: false,
      isShared: true,
      sharedGroupId: groupId,
      createdAt: nowText(),
      updatedAt: nowText(),
    });
  });
  addAudit(creator.id, "SharedGoal", groupId, "CREATE", "recipients", "", employeeIds.length);
  modal = null;
  saveState();
  render();
}

function saveUser(form) {
  const user = {
    id: uid("u"),
    name: form.get("name"),
    email: form.get("email"),
    password: "123456",
    role: form.get("role"),
    managerId: form.get("managerId"),
    department: form.get("department"),
  };
  state.users.push(user);
  addAudit(currentUser().id, "User", user.id, "CREATE", "email", "", user.email);
  modal = null;
  saveState();
  render();
}

function toggleCycle(cycleId) {
  const cycle = state.cycles.find((item) => item.id === cycleId);
  const oldValue = cycle.active;
  cycle.active = !cycle.active;
  addAudit(currentUser().id, "Cycle", cycleId, "TOGGLE", "active", oldValue, cycle.active);
  saveState();
  render();
}

function achievementReportRows() {
  return state.goals.map((goal) => {
    const employee = userById(goal.employeeId);
    const achievement = state.achievements.find((item) => item.goalId === goal.id && item.quarter === activeQuarter());
    return {
      employee: employee?.name || "",
      department: employee?.department || "",
      goal: goal.title,
      quarter: activeQuarter(),
      planned: goal.uomType === "TIMELINE" ? goal.targetDate : goal.targetValue,
      actual: achievement ? achievement.actual || achievement.completionDate : "",
      score: achievement ? achievement.progressScore : 0,
      status: achievement ? achievement.status : "NOT_STARTED",
      goalId: goal.id,
      locked: goal.locked,
    };
  });
}

function unlockGoal(goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal || !goal.locked) return;
  goal.locked = false;
  goal.status = "RETURNED";
  goal.updatedAt = nowText();
  const submission = latestSubmission(goal.employeeId);
  if (submission) {
    submission.status = "RETURNED";
    submission.managerComments = "Unlocked by Admin for exception handling.";
  }
  addAudit(currentUser().id, "Goal", goal.id, "ADMIN_UNLOCK", "locked", true, false);
  saveState();
  render();
}

function exportCsv() {
  const rows = achievementReportRows();
  const header = ["Employee", "Department", "Goal", "Quarter", "Planned Target", "Actual Achievement", "Progress Score", "Status"];
  const csv = [
    header.join(","),
    ...rows.map((row) => [row.employee, row.department, row.goal, row.quarter, row.planned, row.actual, row.score, row.status].map(csvCell).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "atomquest-achievement-report.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

render();
