import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8005/api/v1/investigations';

export default function InvestigationForm() {
    const [investigationId, setInvestigationId] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [investigatorName, setInvestigatorName] = useState('');
    const [findings, setFindings] = useState('');
    const [status, setStatus] = useState('Open');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setInvestigationId('');
        setProposalId('');
        setInvestigatorName('');
        setFindings('');
        setStatus('Open');
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
                body: JSON.stringify({ proposal_id: proposalId, investigator_name: investigatorName, findings, status }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Investigation recorded! ID: ${data.investigation_id}`);
                setInvestigationId(data.investigation_id);
            } else {
                showMessage('error', data.detail || 'Failed to create investigation.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Investigation microservice (Port 8005).');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!investigationId) return showMessage('error', 'Please enter an Investigation ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${investigationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ findings, status }),
            });
            if (response.ok) {
                showMessage('success', 'Investigation updated.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update investigation.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Investigation microservice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!investigationId) return showMessage('error', 'Please enter an Investigation ID to delete.');
        if (!window.confirm('Are you sure you want to delete this investigation record?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${investigationId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Investigation record deleted.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to delete record.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Investigation microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>CCB Technical Investigation</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Investigation Record ID</label>
                    <input type="text" value={investigationId} onChange={(e) => setInvestigationId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Proposal ID *</label>
                    <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} placeholder="PROP-1001" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Investigator Name *</label>
                    <input type="text" value={investigatorName} onChange={(e) => setInvestigatorName(e.target.value)} placeholder="Lead Engineer" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
                        <option value="Open">Open / Under Investigation</option>
                        <option value="Completed">Completed</option>
                        <option value="Deferred">Deferred</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Investigation Findings</label>
                    <textarea value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="Enter risk assessment and impact details..." rows={3} style={styles.input} />
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