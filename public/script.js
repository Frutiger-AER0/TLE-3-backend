const API_BASE_URL = 'http://145.24.237.168:8000';
let token = localStorage.getItem('authToken');
let currentUserEmail = localStorage.getItem('userEmail');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showApiKeysSection();
    } else {
        showLoginSection();
    }
    loadApiKeyStatus();
});

// ============= LOGIN =============
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.access_token;
            currentUserEmail = email;
            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email);
            document.getElementById('loginError').textContent = '';
            showApiKeysSection();
        } else {
            document.getElementById('loginError').textContent = data.error || 'Login failed';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Error: ' + error.message;
    }
});

// ============= LOGOUT =============
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    token = null;
    currentUserEmail = null;
    showLoginSection();
});

// ============= CREATE API KEY =============
const createKeyForm = document.getElementById('createKeyForm');
createKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('keyName').value;
    const expiresInDays = document.getElementById('expiresInDays').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api-keys/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                expiresInDays: expiresInDays ? parseInt(expiresInDays) : null
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccessMessage(data.api_key, 'API key created! Make sure to copy it now - you won\'t see it again!');
            createKeyForm.reset();
            loadApiKeys();
        } else {
            alert('Error: ' + (data.error || 'Could not create API key'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// ============= LOAD API KEYS =============
async function loadApiKeys() {
    try {
        const response = await fetch(`${API_BASE_URL}/api-keys/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const keys = await response.json();

        if (response.ok) {
            displayApiKeys(keys);
        } else {
            document.getElementById('keysList').innerHTML = '<p class="error-text">Failed to load API keys</p>';
        }
    } catch (error) {
        document.getElementById('keysList').innerHTML = '<p class="error-text">Error loading keys: ' + error.message + '</p>';
    }
}

function displayApiKeys(keys) {
    const keysList = document.getElementById('keysList');

    if (keys.length === 0) {
        keysList.innerHTML = '<p class="loading">No API keys yet. Create one to get started!</p>';
        return;
    }

    keysList.innerHTML = keys.map(key => `
        <div class="key-card">
            <h4>${key.name}</h4>
            <div class="key-info">
                <strong>Created:</strong> ${new Date(key.created_at).toLocaleDateString()}
            </div>
            ${key.expires_at ? `<div class="key-info"><strong>Expires:</strong> ${new Date(key.expires_at).toLocaleDateString()}</div>` : ''}
            <div class="key-info">
                <strong>Status:</strong> <span style="color: ${key.is_active ? '#28a745' : '#dc3545'}">${key.is_active ? 'Active' : 'Revoked'}</span>
            </div>
            <div class="key-info">
                <strong>Last Used:</strong> ${key.last_used ? new Date(key.last_used).toLocaleString() : 'Never'}
            </div>
            <div class="key-value">
                Key: ${key.api_key}
                <button class="btn btn-copy" onclick="copyToClipboard('${key.api_key}')">Copy</button>
            </div>
            <div class="key-actions">
                ${key.is_active ? `<button class="btn btn-danger" onclick="revokeApiKey(${key.id})">Revoke</button>` : ''}
                <button class="btn btn-danger" onclick="deleteApiKey(${key.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ============= REVOKE API KEY =============
async function revokeApiKey(keyId) {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}/revoke`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadApiKeys();
        } else {
            alert('Error revoking API key');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============= DELETE API KEY =============
async function deleteApiKey(keyId) {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadApiKeys();
        } else {
            alert('Error deleting API key');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============= ADMIN: TOGGLE API KEY REQUIREMENT =============
document.getElementById('toggleApiKeyBtn').addEventListener('click', async () => {
    const checkbox = document.getElementById('requireApiKey');
    const newValue = !checkbox.checked;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/toggle-api-key-requirement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requireApiKey: newValue })
        });

        const data = await response.json();

        if (response.ok) {
            checkbox.checked = newValue;
            updateApiKeyStatusDisplay();
            alert('API key requirement updated!');
        } else {
            alert('Error: ' + (data.error || 'Could not update setting'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Check API key status
async function loadApiKeyStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/api-key-status`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('requireApiKey').checked = data.requireApiKey;
            updateApiKeyStatusDisplay();
        }
    } catch (error) {
        console.error('Error loading API key status:', error);
    }
}

function updateApiKeyStatusDisplay() {
    const checkbox = document.getElementById('requireApiKey');
    const statusText = document.getElementById('apiKeyStatus');

    if (checkbox.checked) {
        statusText.textContent = '🔒 API Key Protection: ENABLED';
        statusText.style.color = '#28a745';
        document.getElementById('toggleApiKeyBtn').textContent = 'Disable API Key Protection';
    } else {
        statusText.textContent = '🔓 API Key Protection: DISABLED';
        statusText.style.color = '#dc3545';
        document.getElementById('toggleApiKeyBtn').textContent = 'Enable API Key Protection';
    }
}

// ============= UI HELPERS =============
function showLoginSection() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('apiKeysSection').style.display = 'none';
}

function showApiKeysSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('apiKeysSection').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUserEmail;
    loadApiKeys();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('API key copied to clipboard!');
    });
}

function showSuccessMessage(apiKey, message) {
    const div = document.createElement('div');
    div.className = 'success-text';
    div.style.marginTop = '20px';
    div.style.padding = '15px';
    div.style.backgroundColor = '#d4edda';
    div.style.borderRadius = '5px';
    div.style.border = '1px solid #c3e6cb';
    div.innerHTML = `
        <strong>✓ ${message}</strong><br>
        <code style="background: #fff; padding: 10px; display: block; margin-top: 10px; border-radius: 3px; word-break: break-all;">${apiKey}</code>
        <button class="btn btn-success" style="margin-top: 10px; width: 100%;" onclick="this.parentElement.remove(); copyToClipboard('${apiKey}')">Copy Key</button>
    `;
    document.getElementById('createKeyForm').parentElement.appendChild(div);
    setTimeout(() => div.remove(), 10000);
}