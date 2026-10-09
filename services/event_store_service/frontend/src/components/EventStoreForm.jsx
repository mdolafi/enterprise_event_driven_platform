import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8007/api/v1/event-store';

export default function EventStoreForm() {
    const [eventId, setEventId] = useState('');
    const [eventType, setEventType] = useState('PROPOSAL_SUBMITTED');
    const [aggregateId, setAggregateId] = useState('');
    const [payload, setPayload] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setEventId('');
        setEventType('PROPOSAL_SUBMITTED');
        setAggregateId('');
        setPayload('');
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
                body: JSON.stringify({ event_type: eventType, aggregate_id: aggregateId, payload }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Domain event emitted! ID: ${data.event_id}`);
                setEventId(data.event_id);
            } else {
                showMessage('error', data.detail || 'Failed to emit event.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Event Store microservice (Port 8007).');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!eventId) return showMessage('error', 'Please enter an Event ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload }),
            });
            if (response.ok) {
                showMessage('success', 'Event payload updated.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update event.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Event Store microservice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!eventId) return showMessage('error', 'Please enter an Event ID to archive.');
        if (!window.confirm('Are you sure you want to archive this event record?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${eventId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Event record archived.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to archive event.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Event Store microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Event Store - Audit Trail & Domain Events</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Event ID</label>
                    <input type="text" value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Event Type</label>
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={styles.select}>
                        <option value="PROPOSAL_SUBMITTED">PROPOSAL_SUBMITTED</option>
                        <option value="VOTE_CAST">VOTE_CAST</option>
                        <option value="DECISION_FINALIZED">DECISION_FINALIZED</option>
                        <option value="INVESTIGATION_COMPLETED">INVESTIGATION_COMPLETED</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Aggregate ID (Proposal / User ID) *</label>
                    <input type="text" value={aggregateId} onChange={(e) => setAggregateId(e.target.value)} placeholder="PROP-1001" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Event Payload (JSON string)</label>
                    <textarea value={payload} onChange={(e) => setPayload(e.target.value)} placeholder='{"action": "submit", "timestamp": "2026-09-30"}' rows={3} style={styles.input} />
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