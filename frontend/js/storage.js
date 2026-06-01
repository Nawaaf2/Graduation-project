// ===== storage.js — يتكلم مع الـ Backend API =====

const API_URL = 'http://localhost:8080/api';

const Storage = {

  getToken()      { return localStorage.getItem('token'); },
  setToken(t)     { localStorage.setItem('token', t); },
  clearToken()    { localStorage.removeItem('token'); localStorage.removeItem('currentUser'); },

  _headers() {
    return { 'Content-Type':'application/json', 'Authorization':`Bearer ${this.getToken()}` };
  },

  async _req(method, path, body=null) {
    const options = { method, headers: this._headers() };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, options);
    if (res.status === 401) { this.clearToken(); window.location.href='login.html'; return null; }
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text || !text.trim()) return null;
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || 'حدث خطأ');
    return data;
  },

  // AUTH
  async register(name, email, password) {
    try {
      const d = await this._req('POST','/auth/register',{name,email,password});
      if (d?.token) { this.setToken(d.token); localStorage.setItem('currentUser',JSON.stringify({name:d.name,email:d.email,id:d.userId})); }
      return { success:true };
    } catch(e) { return { success:false, message:e.message }; }
  },
  async login(email, password) {
    try {
      const d = await this._req('POST','/auth/login',{email,password});
      if (d?.token) { this.setToken(d.token); localStorage.setItem('currentUser',JSON.stringify({name:d.name,email:d.email,id:d.userId})); }
      return { success:true };
    } catch(e) { return { success:false, message:e.message }; }
  },

  // DASHBOARD
  async getDashboard()              { return this._req('GET','/dashboard'); },

  // EXPENSES
  async getExpenses()               { return this._req('GET','/expenses'); },
  async addExpense(e)               { return this._req('POST','/expenses',e); },
  async updateExpense(id,e)         { return this._req('PUT',`/expenses/${id}`,e); },
  async deleteExpense(id)           { return this._req('DELETE',`/expenses/${id}`); },
  async getExpenseStats()           { return this._req('GET','/expenses/stats'); },

  // INCOME
  async getIncome()                 { return this._req('GET','/income'); },
  async addIncome(i)                { return this._req('POST','/income',i); },
  async updateIncome(id,i)          { return this._req('PUT',`/income/${id}`,i); },
  async deleteIncome(id)            { return this._req('DELETE',`/income/${id}`); },

  // GOALS
  async getGoals()                  { return this._req('GET','/goals'); },
  async addGoal(g)                  { return this._req('POST','/goals',g); },
  async updateGoal(id,g)            { return this._req('PUT',`/goals/${id}`,g); },
  async depositGoal(id,amount)      { return this._req('PATCH',`/goals/${id}/deposit`,{amount}); },
  async deleteGoal(id)              { return this._req('DELETE',`/goals/${id}`); },

  // SUBSCRIPTIONS
  async getSubscriptions()          { return this._req('GET','/subscriptions'); },
  async addSubscription(s)          { return this._req('POST','/subscriptions',s); },
  async updateSubscription(id,s)    { return this._req('PUT',`/subscriptions/${id}`,s); },
  async deleteSubscription(id)      { return this._req('DELETE',`/subscriptions/${id}`); },
  async getDueSoon()                { return this._req('GET','/subscriptions/due-soon'); },

  // CATEGORIES
  async getCategories()             { return this._req('GET','/categories'); },
  async addCategory(c)              { return this._req('POST','/categories',c); },
  async deleteCategory(id)          { return this._req('DELETE',`/categories/${id}`); },

  calcTotal(list,field='amount') { return (list||[]).reduce((s,i)=>s+parseFloat(i[field]||0),0); }
};

function getCurrentUser() { const u=localStorage.getItem('currentUser'); return u?JSON.parse(u):null; }
function checkAuth()       { const u=getCurrentUser(); if(!u||!Storage.getToken()){window.location.href='login.html';return null;} return u; }
function logout()          { Storage.clearToken(); window.location.href='login.html'; }
