import React, { useState } from 'react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('user');

    const services = [
        { id: 'user', name: 'User Service', port: 8000, status: 'UP', desc: 'Manages user accounts, roles, and authentication.' },
        { id: 'submitter', name: 'Submitter Service', port: 8001, status: 'UP', desc: 'Handles CCB change request submissions.' },
        { id: 'voter', name: 'Voter Service', port: 8002, status: 'UP', desc: 'Collects and records board member votes.' },
        { id: 'decision', name: 'Decision Maker Service', port: 8003, status: 'UP', desc: 'Processes final approval/rejection decisions.' },
        { id: 'notification', name: 'Notification Service', port: 8004, status: 'UP', desc: 'Dispatches email and system alerts.' },
        { id: 'investigation', name: 'Investigation Service', port: 8005, status: 'UP', desc: 'Tracks impact analyses and investigations.' },
        { id: 'attachment', name: 'Attachment Service', port: 8006, status: 'UP', desc: 'Manages uploaded documents and evidence.' },
        { id: 'event_store', name: 'Event Store Service', port: 8007, status: 'UP', desc: 'Logs immutable platform events.' },
    ];

    const currentService = services.find((s) => s.id === activeTab);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>MARAD CCB Platform Dashboard</h1>
                    <span style={styles.badge}>8 Microservices Active</span>
                </div>
            </header>

            <nav style={styles.tabNav}>
                {services.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setActiveTab(s.id)}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === s.id ? styles.activeTabButton : {}),
                        }}
                    >
                        {s.name}
                        <span style={styles.portLabel}>:{s.port}</span>
                    </button>
                ))}
            </nav>

            <main style={styles.mainContent}>
                {currentService && (
                    <div style={styles.card}>
                        <h2>{currentService.name} Panel</h2>
                        <p style={styles.desc}>{currentService.desc}</p>
                        <div style={styles.statusBox}>
                            <strong>Backend Endpoint: </strong>
                            <code>http://localhost:{currentService.port}/health</code>
                        </div>
                        <a
                            href={`http://localhost:${currentService.port}/health`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.linkButton}
                        >
                            Test Service Health Endpoint ↗
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: { fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#eef2f5', minHeight: '100vh', margin: 0 },
    header: { backgroundColor: '#002b49', color: '#ffffff', padding: '18px 32px' },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' },
    title: { margin: 0, fontSize: '24px' },
    badge: { backgroundColor: '#28a745', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
    tabNav: { display: 'flex', flexWrap: 'wrap', backgroundColor: '#ffffff', borderBottom: '2px solid #dce3e8', padding: '0 32px', maxWidth: '1200px', margin: '0 auto' },
    tabButton: { padding: '14px 20px', border: 'none', borderBottom: '3px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' },
    activeTabButton: { color: '#002b49', borderBottom: '3px solid #0056b3', backgroundColor: '#f8f9fa' },
    portLabel: { fontSize: '11px', marginLeft: '6px', opacity: 0.6 },
    mainContent: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
    card: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    desc: { color: '#666', fontSize: '15px' },
    statusBox: { marginTop: '20px', padding: '12px', backgroundColor: '#f1f3f5', borderRadius: '4px' },
    linkButton: { display: 'inline-block', marginTop: '16px', padding: '10px 18px', backgroundColor: '#0056b3', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }
};