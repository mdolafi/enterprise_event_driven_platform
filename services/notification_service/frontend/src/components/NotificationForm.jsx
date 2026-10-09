import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8004/api/v1/notifications';

export default function NotificationForm() {
    const [notificationId, setNotificationId] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [notificationType, setNotificationType] = useState('Email');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setNotificationId('');
        setRecipientEmail('');
        setSubject('');
        setMessageBody('');
        setNotificationType('Email');
        setStatusMessage({ type: '', text: '' });
    };

    const showMessage = (type, text) => setStatusMessage({ type, text });

    // ADD / TRIGGER NOTIFICATION (POST)
    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_email: recipientEmail,
                    subject,
                    message_body: messageBody,
                    notification_type: notificationType,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Notification dispatched! ID: ${data.notification_id}`);
                setNotificationId(data.notification_id);
            } else {
                showMessage('error', data.detail || 'Failed to send notification.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Notification microservice (Port 8004).');
        } finally {
            setLoading(false);
        }
    };

    // EDIT NOTIFICATION SETTINGS (PUT)
    const handleEdit = async () => {
        if (!notificationId) return showMessage('error', 'Please enter a Notification ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message_body: messageBody }),
            });
            if (response.ok) {
                showMessage('success', 'Notification updated successfully.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update notification.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Notification microservice.');
        } finally {
            setLoading(false);
        }
    };

    // DELETE NOTIFICATION LOG (DELETE)
    const handleDelete = async () => {
        if (!notificationId) return showMessage('error', 'Please enter a Notification ID to delete.');
        if (!window.confirm('Are you sure you want to delete this notification record?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${notificationId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Notification log purged.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to delete notification.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Notification microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Notification Service - Alerts & Emails</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Notification ID</label>
                    <input type="text" value={notificationId} onChange={(e) => setNotificationId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Recipient Email *</label>
                    <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="stakeholder@marad.dot.gov" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Subject *</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="CCB Proposal Status Update" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Notification Channel</label>
                    <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} style={styles.select}>
                        <option value="Email">Email Alert</option>
                        <option value="InApp">In-App Notification</option>
                        <option value="SMS">SMS Alert</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Message Body</label>
                    <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} placeholder="Enter alert body..." rows={3} style={styles.input} />
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