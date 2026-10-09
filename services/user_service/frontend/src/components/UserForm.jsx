import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000/api/v1/users';

export default function UserForm() {
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmailAddress, setUserEmailAddress] = useState('');
    const [role, setRole] = useState('Submitter');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setUserId('');
        setUserName('');
        setUserEmailAddress('');
        setRole('Submitter');
        setStatusMessage({ type: '', text: '' });
    };

    const showMessage = (type, text) => setStatusMessage({ type, text });

    // ADD USER (POST)
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!userName || !userEmailAddress) {
            return showMessage('error', 'Please fill in Name and Email Address.');
        }
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_name: userName, user_email_address: userEmailAddress, role }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `User created successfully! ID: ${data.user_id}`);
                setUserId(data.user_id);
            } else {
                showMessage('error', data.detail || 'Failed to create user.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to User microservice (Port 8000).');
        } finally {
            setLoading(false);
        }
    };

    // EDIT USER (PUT)
    const handleEdit = async () => {
        if (!userId) return showMessage('error', 'Please enter a User ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_name: userName, role }),
            });
            if (response.ok) {
                showMessage('success', 'User profile updated successfully.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update user.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to User microservice.');
        } finally {
            setLoading(false);
        }
    };

    // DELETE USER (DELETE)
    const handleDelete = async () => {
        if (!userId) return showMessage('error', 'Please enter a User ID to delete.');
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'User deactivated successfully.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to delete user.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to User microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>User Profile Management</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>User ID (UUID)</label>
                    <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Auto-generated on Add, or enter to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>User Email Address *</label>
                    <input type="email" value={userEmailAddress} onChange={(e) => setUserEmailAddress(e.target.value)} placeholder="user@marad.dot.gov" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>User Name *</label>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="John Doe" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>User Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                        <option value="Submitter">Submitter</option>
                        <option value="Approver">Approver</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <div style={styles.buttonGroup}>
                    <button type="submit" disabled={loading} style={{ ...styles.actionBtn, backgroundColor: '#28a745', color: '#fff' }}>Add</button>
                    <button type="button" onClick={handleEdit} disabled={loading} style={{ ...styles.actionBtn, backgroundColor: '#ffc107', color: '#000' }}>Edit</button>
                    <button type="button" onClick={handleDelete} disabled={loading} style={{ ...styles.actionBtn, backgroundColor: '#dc3545', color: '#fff' }}>Delete</button>
                    <button type="button" onClick={handleCancel} style={{ ...styles.actionBtn, backgroundColor: '#6c757d', color: '#fff' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    card: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '500px' },
    cardTitle: { marginTop: 0, color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '10px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
    actionBtn: { flex: 1, padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    alert: { padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
};