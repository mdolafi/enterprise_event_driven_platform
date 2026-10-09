import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8003/api/v1/decision-maker';

export default function DecisionMakerForm() {
    const [decisionId, setDecisionId] = useState('');
    const [decisionMakerName, setDecisionMakerName] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [finalDecision, setFinalDecision] = useState('Approved');
    const [notes, setNotes] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setDecisionId('');
        setDecisionMakerName('');
        setProposalId('');
        setFinalDecision('Approved');
        setNotes('');
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
                body: JSON.stringify({ decision_maker_name: decisionMakerName, proposal_id: proposalId, final_decision: finalDecision, notes }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Final decision recorded! ID: ${data.decision_id}`);
                setDecisionId(data.decision_id);
            } else {
                showMessage('error', data.detail || 'Failed to record decision.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Decision Maker microservice (Port 8003).');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!decisionId) return showMessage('error', 'Please enter a Decision ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${decisionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ final_decision: finalDecision, notes }),
            });
            if (response.ok) {
                showMessage('success', 'Decision record updated successfully.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update decision.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Decision Maker microservice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!decisionId) return showMessage('error', 'Please enter a Decision ID to delete.');
        if (!window.confirm('Are you sure you want to delete this final decision record?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${decisionId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Decision record deleted successfully.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to delete decision record.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Decision Maker microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Decision Maker - Final CCB Approval</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Decision Record ID</label>
                    <input type="text" value={decisionId} onChange={(e) => setDecisionId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Decision Maker Name *</label>
                    <input type="text" value={decisionMakerName} onChange={(e) => setDecisionMakerName(e.target.value)} placeholder="CCB Chair Name" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Proposal ID *</label>
                    <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} placeholder="PROP-1001" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Final Determination</label>
                    <select value={finalDecision} onChange={(e) => setFinalDecision(e.target.value)} style={styles.select}>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Deferred">Deferred for Review</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Directive / Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Final executive instructions..." rows={3} style={styles.input} />
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