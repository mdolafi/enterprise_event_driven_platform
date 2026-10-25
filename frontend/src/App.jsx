import React, { useState } from 'react';

export default function App() {
    const [activeTab, setActiveTab] = useState('submitter_service');
    const [consoleLogs, setConsoleLogs] = useState(['// Dashboard initialized. Ready to execute API requests...']);

    const [formData, setFormData] = useState({
        issue_title: '',
        issue_category: 'Minor',
        issue_priority: 'Low',
        issue_domain: 'Application',
        assigned_to: '',
        outage: '',
        postmaster: '',
        issue_proposed_impl_date: '',
        issue_review_date: '',
        system_owner_approval: 'Pending',
        attachment_s3_url: '',
        issue_description: '',
        issue_justification: '',
        system_owner_approval_justification: ''
    });

    const logToConsole = (msg) => {
        setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitterSubmit = async (e) => {
        e.preventDefault();
        logToConsole(`[POST] Sending Issue payload to http://localhost:8001/events...`);

        try {
            const res = await fetch('http://localhost:8001/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            logToConsole(`[RESPONSE ${res.status}] ${JSON.stringify(data, null, 2)}`);
        } catch (err) {
            logToConsole(`[SUBMITTED PAYLOAD]\n${JSON.stringify(formData, null, 2)}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">MARAD CCB Platform Dashboard</h1>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">8 Microservices Active</span>
            </header>

            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <section className="lg:col-span-8 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
                        {[
                            { id: 'user_service', label: 'User (:8000)' },
                            { id: 'submitter_service', label: 'Submitter (:8001)' },
                            { id: 'voter_service', label: 'Voter (:8002)' },
                            { id: 'decision_maker_service', label: 'Decision Maker (:8003)' },
                            { id: 'notification_service', label: 'Notification (:8004)' },
                            { id: 'investigation_service', label: 'Investigation (:8005)' },
                            { id: 'attachment_service', label: 'Attachment (:8006)' },
                            { id: 'event_store_service', label: 'Event Store (:8007)' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${activeTab === tab.id
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Container */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        {activeTab === 'submitter_service' && (
                            <form onSubmit={handleSubmitterSubmit} className="space-y-4">
                                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900">Submitter Service — Create Issue Record</h2>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">Port 8001</span>
                                </div>

                                {/* Auto-managed Readonly Banner */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 grid grid-cols-3 gap-2 font-mono">
                                    <div><strong>issue_unique_id:</strong> (Auto UUID)</div>
                                    <div><strong>issue_id:</strong> (Auto BigInt Sequence)</div>
                                    <div><strong>issue_submitter:</strong> (API User Context)</div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Title *</label>
                                    <input type="text" name="issue_title" required value={formData.issue_title} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. Upgrade PostgreSQL database cluster" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                                        <select name="issue_category" value={formData.issue_category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                            <option value="Minor">Minor</option>
                                            <option value="Major">Major</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                                        <select name="issue_priority" value={formData.issue_priority} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                            <option value="Low">Low</option>
                                            <option value="High">High</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Domain</label>
                                        <select name="issue_domain" value={formData.issue_domain} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                            <option value="Application">Application</option>
                                            <option value="Infrastructure">Infrastructure</option>
                                            <option value="Security">Security</option>
                                            <option value="EA">EA</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned To (Email)</label>
                                        <input type="email" name="assigned_to" required value={formData.assigned_to} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="lead@marad.gov" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Outage Impact</label>
                                        <input type="text" name="outage" required value={formData.outage} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. None / 2 Hours" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Postmaster Email</label>
                                        <input type="email" name="postmaster" value={formData.postmaster} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="postmaster@marad.gov" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Proposed Impl Date</label>
                                        <input type="date" name="issue_proposed_impl_date" value={formData.issue_proposed_impl_date} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Review Date</label>
                                        <input type="date" name="issue_review_date" value={formData.issue_review_date} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">System Owner Approval</label>
                                        <select name="system_owner_approval" value={formData.system_owner_approval} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Attachment S3 URL</label>
                                    <input type="text" name="attachment_s3_url" value={formData.attachment_s3_url} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="https://s3.amazonaws.com/marad-bucket/doc.pdf" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Description *</label>
                                    <textarea name="issue_description" rows="3" required value={formData.issue_description} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Detailed technical issue description..."></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Justification</label>
                                        <textarea name="issue_justification" rows="2" value={formData.issue_justification} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Business justification..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">System Owner Justification</label>
                                        <textarea name="system_owner_approval_justification" rows="2" value={formData.system_owner_approval_justification} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Approval justification..."></textarea>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm">
                                    Submit Issue Record
                                </button>
                            </form>
                        )}

                        {activeTab !== 'submitter_service' && (
                            <div className="text-center py-12 text-slate-500">
                                <p className="text-sm">Service form for <strong className="text-slate-800">{activeTab}</strong> is ready for payload testing.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Execution Output Console */}
                <section className="lg:col-span-4">
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 h-full font-mono text-xs flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                            <span className="font-bold text-sky-400">Execution Output</span>
                            <button onClick={() => setConsoleLogs([])} className="text-slate-500 hover:text-slate-300">Clear</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[550px]">
                            {consoleLogs.map((log, idx) => (
                                <pre key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-300 border-b border-slate-800 pb-1">{log}</pre>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}