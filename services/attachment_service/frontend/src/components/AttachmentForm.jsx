import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8006/api/v1/attachments';

export default function AttachmentForm() {
    const [attachmentId, setAttachmentId] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [fileName, setFileName] = useState('');
    const [filePath, setFilePath] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setAttachmentId('');
        setProposalId('');
        setFileName('');
        setFilePath('');
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
                body: JSON.stringify({ proposal_id: proposalId, file_name: fileName, file_path: filePath }),
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Attachment linked! ID: ${data.attachment_id}`);
                setAttachmentId(data.attachment_id);
            } else {
                showMessage('error', data.detail || 'Failed to attach file.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Attachment microservice (Port 8006).');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!attachmentId) return showMessage('error', 'Please enter an Attachment ID to edit.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${attachmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_name: fileName, file_path: filePath }),
            });
            if (response.ok) {
                showMessage('success', 'Attachment metadata updated.');
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to update attachment.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Attachment microservice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!attachmentId) return showMessage('error', 'Please enter an Attachment ID to remove.');
        if (!window.confirm('Are you sure you want to remove this attachment?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${attachmentId}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                showMessage('success', 'Attachment removed.');
                handleCancel();
            } else {
                const data = await response.json();
                showMessage('error', data.detail || 'Failed to remove attachment.');
            }
        } catch (err) {
            showMessage('error', 'Cannot connect to Attachment microservice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Attachment Service - Files & Specs</h3>

            {statusMessage.text && (
                <div style={{ ...styles.alert, backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: statusMessage.type === 'success' ? '#155724' : '#721c24' }}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleAdd}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Attachment ID</label>
                    <input type="text" value={attachmentId} onChange={(e) => setAttachmentId(e.target.value)} placeholder="Auto-generated or enter ID to Edit/Delete" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Proposal ID *</label>
                    <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} placeholder="PROP-1001" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>File Name *</label>
                    <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Engineering_Drawing.pdf" required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>File Path / S3 URI</label>
                    <input type="text" value={filePath} onChange={(e) => setFilePath(e.target.value)} placeholder="s3://marad-attachments/drawings/dwg_001.pdf" style={styles.input} />
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