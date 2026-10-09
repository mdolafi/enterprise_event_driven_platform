import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8002/api/v1/voters';

export default function VoterForm() {
    const [voteId, setVoteId] = useState('');
    const [voterName, setVoterName] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [voteDecision, setVoteDecision] = useState('Approve');
    const [comments, setComments] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setVoteId('');
        setVoterName('');
        setProposalId('');
        setVoteDecision('Approve');
        setComments('');
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
                body: JSON.stringify({ voter_name: voterName, proposal_id: proposalId, vote_decision: voteDecision, comments }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Vote submitted successfully! ID: ${data.vote_id}`);
                setVoteId(data.vote_id);
            } else {
                showMessage('error', data.detail || 'Failed to submit vote.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Voter microservice (Port 8002).');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!voteId) return showMessage('error', 'Please enter a Vote ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${voteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote_decision: voteDecision, comments }),
            });
            if (response.ok) {
                showMessage('success', 'Vote updated successfully.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update vote.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Voter microservice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!voteId) return showMessage('error', 'Please enter a Vote ID to retract.');
        if (!window.confirm('Are you sure you want to retract this vote?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${voteId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Vote retracted successfully.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to retract vote.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Voter microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Voter - Balloting Form</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Vote Record ID</label>
                    <input type="text" value={voteId} onChange={(e) => setVoteId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Voter Name *</label>
                    <input type="text" value={voterName} onChange={(e) => setVoterName(e.target.value)} placeholder="Board Member Name" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Proposal ID *</label>
                    <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} placeholder="PROP-1001" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Vote Decision</label>
                    <select value={voteDecision} onChange={(e) => setVoteDecision(e.target.value)} style={styles.select}>
                        <option value="Approve">Approve</option>
                        <option value="Reject">Reject</option>
                        <option value="Abstain">Abstain</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Comments</label>
                    <textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Justification for decision..." rows={3} style={styles.input} />
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