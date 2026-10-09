import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8001/api/v1/submitters';

export default function SubmitterForm() {
    const [submissionId, setSubmissionId] = useState('');
    const [submitterName, setSubmitterName] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setSubmissionId('');
        setSubmitterName('');
        setTitle('');
        setDescription('');
        setStatusMessage({ type: '', text: '' });
    };

    const showMessage = (type, text) => setStatusMessage({ type, text });

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submitter_name: submitterName, title, description }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Change request submitted! ID: ${data.submission_id}`);
                setSubmissionId(data.submission_id);
            } else {
                showMessage('error', data.detail || 'Failed to create submission.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Submitter microservice (Port 8001).');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!submissionId) return showMessage('error', 'Please enter a Submission ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${submissionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });
            if (response.ok) {
                showMessage('success', 'Submission updated successfully.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update submission.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Submitter microservice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!submissionId) return showMessage('error', 'Please enter a Submission ID to delete.');
        if (!window.confirm('Are you sure you want to delete this submission?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${submissionId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Submission deleted successfully.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to delete submission.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Submitter microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Submitter - CCB Change Request</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Submission ID</label>
                    <input type="text" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Submitter Name *</label>
                    <input type="text" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder="Jane Doe" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Change Proposal Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="System Upgrade Proposal" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details of the requested change..." rows={4} style={styles.input} />
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
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '24px' },
    actionBtn: { flex: 1, padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    alert: { padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
};