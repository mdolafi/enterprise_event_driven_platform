import React from 'react';
import NotificationForm from './components/NotificationForm';

export default function App() {
    return (
        <div style={styles.appWrapper}>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>MARAD CCB - Notification Service</h1>
            </header>
            <main style={styles.mainContent}>
                <NotificationForm />
            </main>
        </div>
    );
}

const styles = {
    appWrapper: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', margin: 0, padding: 0 },
    header: { backgroundColor: '#003366', color: '#ffffff', padding: '16px 32px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    headerTitle: { margin: 0, fontSize: '22px' },
    mainContent: { display: 'flex', justifyContent: 'center', padding: '40px 20px' },
};