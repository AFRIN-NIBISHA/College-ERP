import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { CheckCircle, Clock, XCircle, FileText, Send, Trash2 } from 'lucide-react';

const NoDue = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Check role helpers
    // Role Permissions
    const role = user?.role || '';
    const isStudent = role === 'student';

    const canApproveOffice = ['admin', 'office', 'staff', 'principal'].includes(role);
    const canApproveStaff = ['admin', 'staff', 'hod', 'principal'].includes(role);
    const canApproveHod = ['admin', 'hod', 'principal'].includes(role);

    useEffect(() => {
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('role', user.role);
            if (isStudent && user.profileId) {
                params.append('student_id', user.profileId);
            }

            const res = await axios.get(`/api/no-due?${params.toString()}`);
            const fetchedRequests = res.data;

            // Group requests by year and section to minimize API calls
            const uniqueClasses = new Set();
            fetchedRequests.forEach(req => {
                if (req.year && req.section) {
                    uniqueClasses.add(`${req.year}-${req.section}`);
                }
            });

            // Fetch subjects for each unique class
            const subjectsCache = {};
            for (const classKey of uniqueClasses) {
                const [year, section] = classKey.split('-');
                if (!subjectsCache[classKey]) {
                    const subRes = await axios.get(`/api/student/subjects?year=${year}&section=${section}`);
                    // Filter out unwanted subjects
                    subjectsCache[classKey] = subRes.data.filter(subject => {
                        const name = subject.subject_name.toLowerCase();
                        return !name.includes('soft skill') &&
                            !name.includes('softskill') &&
                            !name.includes('nptel');
                    });
                }
            }

            // Combine requests with their specific subjects
            const requestsWithSubjects = fetchedRequests.map(request => {
                const classKey = `${request.year}-${request.section}`;
                const validSubjects = subjectsCache[classKey] || [];

                return {
                    ...request,
                    subjects: validSubjects.map(subject => ({
                        ...subject,
                        status: request[subject.subject_code.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status'] || 'Pending'
                    }))
                };
            });

            setRequests(requestsWithSubjects);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async () => {
        if (!isStudent) return;

        if (!user.profileId) {
            alert("Error: Student Profile ID missing. Please create your profile or re-login.");
            return;
        }

        try {
            const res = await axios.post('/api/no-due/request', {
                student_id: user.profileId,
                semester: 8 // Assuming final sem, or fetch from student data
            });
            console.log("Submit Response:", res.data);
            alert("No Due Request Submitted Successfully!");

            // Wait slightly before refetching to ensure DB commit visibility (optional but safer)
            setTimeout(() => {
                fetchRequests();
            }, 500);

        } catch (err) {
            console.error(err);
            alert("Failed to submit request: " + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdate = async (id, stage, status, remarks = null, subjectCode = null) => {
        try {
            console.log("=== No Due Update Request ===");
            console.log("Request params:", { id, stage, status, remarks, subjectCode });

            let field = '';
            if (subjectCode) {
                // Handle subject-wise approval
                field = subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_status';
                console.log("Subject code to field conversion:");
                console.log(`  Subject code: "${subjectCode}"`);
                console.log(`  Field name: "${field}"`);
            } else if (stage) {
                // Handle traditional stage approval
                if (stage === 'office') field = 'office_status';
                else if (stage === 'staff') field = 'staff_status';
                else if (stage === 'hod') field = 'hod_status';
                else if (stage === 'principal') field = 'principal_status';
                console.log("Stage to field conversion:");
                console.log(`  Stage: "${stage}"`);
                console.log(`  Field name: "${field}"`);
            }

            console.log("Final calculated field:", field);
            console.log("Sending to backend:", { id, field, status, remarks });

            const requestData = { field, status, remarks };
            console.log("Request data object:", requestData);
            console.log("Request URL:", `/api/no-due/${id}/approve`);

            const response = await axios.put(`/api/no-due/${id}/approve`, requestData);

            console.log("✅ Backend response:", response.data);
            fetchRequests();
        } catch (err) {
            console.error("❌ No Due Update Error:", err);
            console.error("❌ Error response:", err.response?.data);
            alert(`Action failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleReject = (id, stage, subjectCode = null) => {
        const reason = window.prompt("Enter rejection reason:");
        if (reason) {
            handleUpdate(id, stage, 'Rejected', reason, subjectCode);
        }
    };

    const handleDeleteRequest = async (id) => {
        console.log("No Due Delete Request - ID:", id);
        if (!window.confirm("Are you sure you want to delete this No Due request?")) return;

        try {
            console.log("Sending No Due delete request for ID:", id);
            await axios.delete(`/api/no-due/${id}`);
            setRequests(requests.filter(req => req.id !== id));
            alert('No Due request deleted successfully');
        } catch (err) {
            console.error("Error deleting No Due request:", err);
            console.error("Error response:", err.response?.data);
            alert('Failed to delete No Due request: ' + (err.response?.data?.message || err.message));
        }
    };

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        if (status === 'Approved') return <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle size={14} className="mr-1" /> Approved</span>;
        if (status === 'Rejected') return <span className="flex items-center text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg"><XCircle size={14} className="mr-1" /> Rejected</span>;
        return <span className="flex items-center text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg"><Clock size={14} className="mr-1" /> Pending</span>;
    };

    const [selectedRequests, setSelectedRequests] = useState([]);

    // ... existing role helpers ...

    // Filter requests based on role and sequential workflow
    const filteredRequests = requests.filter(req => {
        if (isStudent) return true; // Students see all their requests

        // Office stops here
        if (role === 'office' || role === 'admin') { // Admin sees everything? Let's restrict for clarity or keep all.
            // If strictly Office view:
            if (role === 'office') return req.office_status === 'Pending';
            // Admin view: show all for debugging, or follow flow? 
            // Let's stick to the flow requested: "Office la Approve panna tha staffs ku show aahanum"
            if (role === 'admin') return true;
        }

        // Staff Logic: Only show if Office Approved AND Staff has pending subject
        if (role === 'staff') {
            if (req.office_status !== 'Approved') return false; // Waiting for Office

            // Demo/Debug: Allow 'admin' or 'staff' username to see all PENDING requests
            const lowerUser = user?.username?.toLowerCase();
            if (['admin', 'staff', 'hod', 'principal'].includes(lowerUser)) {
                return req.subjects.some(s => s.status === 'Pending');
            }

            // Check if this staff has any pending subjects for this student
            // We need to match logged-in staff to the subjects in the request
            const userName = user?.name?.trim().toLowerCase() || user?.username?.trim().toLowerCase();

            const hasPendingSubjectForThisStaff = req.subjects.some(subject => {
                const staffName = subject.staff_name?.trim().toLowerCase();

                // Priority match: Profile ID comparison
                const isIdMatch = user?.profileId && subject.staff_profile_id && (Number(user.profileId) === Number(subject.staff_profile_id));

                // Fallback match: Name string comparison
                const isNameMatch = userName && staffName && (userName === staffName || userName.includes(staffName) || staffName.includes(userName));

                const isMySubject = isIdMatch || isNameMatch;

                return isMySubject && subject.status === 'Pending';
            });

            return hasPendingSubjectForThisStaff;
        }

        // HOD Logic: Only show if All Subjects Approved AND HOD Pending
        if (role === 'hod') {
            if (req.office_status !== 'Approved') return false;

            const allSubjectsApproved = req.subjects.every(s => s.status === 'Approved');
            if (!allSubjectsApproved) return false; // Waiting for Staffs

            return req.hod_status === 'Pending';
        }

        // Principal Logic: Only show if HOD Approved AND Principal Pending
        if (role === 'principal') {
            return req.hod_status === 'Approved' && req.principal_status === 'Pending';
        }

        return false;
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRequests(filteredRequests.map(r => r.id));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleSelectRequest = (id) => {
        if (selectedRequests.includes(id)) {
            setSelectedRequests(selectedRequests.filter(reqId => reqId !== id));
        } else {
            setSelectedRequests([...selectedRequests, id]);
        }
    };

    const handleBulkApprove = async () => {
        if (!window.confirm(`Approve ${selectedRequests.length} selected requests?`)) return;

        setLoading(true);
        try {
            // Process sequentially or Promise.all
            for (const id of selectedRequests) {
                const req = requests.find(r => r.id === id);
                if (!req) continue;

                if (role === 'office') {
                    await handleUpdate(id, 'office', 'Approved');
                } else if (role === 'hod') {
                    await handleUpdate(id, 'hod', 'Approved');
                } else if (role === 'principal') {
                    await handleUpdate(id, 'principal', 'Approved');
                } else if (role === 'staff') {
                    // For staff, we need to approve ALL subjects assigned to this staff for this student
                    const userName = user?.name?.trim().toLowerCase() || user?.username?.trim().toLowerCase();

                    // Demo Mode
                    const isDemo = ['admin', 'staff', 'hod', 'principal'].includes(user?.username?.toLowerCase());

                    const mySubjects = req.subjects.filter(subject => {
                        if (isDemo && subject.status === 'Pending') return true;

                        const staffName = subject.staff_name?.trim().toLowerCase();
                        if (!staffName || !userName) return false;
                        return (userName === staffName || userName.includes(staffName) || staffName.includes(userName)) && subject.status === 'Pending';
                    });

                    for (const sub of mySubjects) {
                        await handleUpdate(id, null, 'Approved', null, sub.subject_code);
                    }
                }
            }
            setSelectedRequests([]);
            // fetchRequests is called inside handleUpdate but we might want to wait
        } catch (err) {
            console.error("Bulk Approve Error", err);
            alert("Some requests failed to approve.");
        } finally {
            setLoading(false);
            fetchRequests();
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                        {isStudent ? "My No Due Status" : "Pending Approvals"}
                    </h2>
                    <p className="text-slate-500">
                        {isStudent ? "Track your clearance progress" : `Manage ${role} clearance requests`}
                    </p>
                </div>
                {isStudent && requests.length === 0 && (
                    <button
                        onClick={handleRequest}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Send size={20} /> Apply for No Due
                    </button>
                )}
                {!isStudent && filteredRequests.length > 0 && (
                    <button
                        onClick={handleBulkApprove}
                        disabled={selectedRequests.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle size={20} /> Approve Selected ({selectedRequests.length})
                    </button>
                )}
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid gap-6">
                    {/* Select All Bar for Staff/Admin */}
                    {!isStudent && filteredRequests.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedRequests.length === filteredRequests.length}
                                onChange={handleSelectAll}
                            />
                            <span className="font-bold text-slate-700">Select All Pending Requests</span>
                        </div>
                    )}

                    {filteredRequests.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500">
                                {isStudent ? "No active clearance requests found." : "No pending approvals found for you."}
                            </p>
                        </div>
                    ) : (
                        filteredRequests.map(req => (
                            <div key={req.id} className={`bg-white p-4 md:p-6 rounded-2xl border transition-all ${selectedRequests.includes(req.id) ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200'} shadow-sm flex flex-col xl:flex-row xl:items-start justify-between gap-6`}>

                                {/* Selection Checkbox */}
                                {!isStudent && (
                                    <div className="pt-1 flex items-center md:items-start gap-3">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedRequests.includes(req.id)}
                                            onChange={() => handleSelectRequest(req.id)}
                                        />
                                        <span className="xl:hidden font-bold text-slate-700">Select this request</span>
                                    </div>
                                )}

                                <div className="min-w-0 md:min-w-[200px]">
                                    <h3 className="text-lg md:text-xl font-bold text-slate-800 break-words">{req.name}</h3>
                                    <p className="text-slate-500 text-sm">{req.roll_no}</p>
                                    <p className="text-sm text-slate-400">{req.department} • Year {req.year}</p>
                                    <p className="text-xs text-slate-400 mt-2">Requested <span className="hide-on-mobile">on</span> {new Date(req.created_at).toLocaleDateString()}</p>

                                    {isStudent && (
                                        <button
                                            onClick={() => handleDeleteRequest(req.id)}
                                            className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={14} /> Delete Request
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Office - Only show if relevant or completed (Hidden for HOD/Principal) */}
                                    {((role !== 'hod' && role !== 'principal') && (role === 'office' || role === 'admin' || isStudent || req.office_status === 'Approved')) && (
                                        <div className={`p-4 rounded-xl border ${req.office_status === 'Pending' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'} ${role === 'office' ? 'ring-2 ring-blue-100' : ''}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold uppercase text-slate-500">Office</span>
                                                <StatusBadge status={req.office_status} />
                                            </div>

                                            {/* Fee Details for Office */}
                                            {(role === 'office' || role === 'admin') && (
                                                <div className="mb-3 p-2 bg-white rounded border border-slate-200 text-xs text-slate-600 space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>Total Fees:</span>
                                                        <span className="font-bold">₹{Number(req.total_fee || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Paid:</span>
                                                        <span className="text-green-600 font-bold">₹{Number(req.paid_amount || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                                                        <span>Pending:</span>
                                                        <span className={`font-bold ${(Number(req.total_fee || 0) - Number(req.paid_amount || 0)) > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                            ₹{Number((req.total_fee || 0) - (req.paid_amount || 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-right mt-1">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${(req.fee_status === 'Paid') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {req.fee_status || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {role === 'office' && req.office_status === 'Pending' && (
                                                <div className="flex gap-2 text-xs">
                                                    <button onClick={() => handleUpdate(req.id, 'office', 'Approved')} className="flex-1 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">Approve</button>
                                                    <button onClick={() => handleReject(req.id, 'office')} className="py-1.5 px-3 bg-red-100 text-red-600 rounded hover:bg-red-200">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Staff - Show subject details if Office Approved (Hidden for HOD/Principal) */}
                                    {((role !== 'hod' && role !== 'principal') && (role === 'staff' || role === 'admin' || isStudent || (req.office_status === 'Approved' && role !== 'office'))) && (
                                        <div className="md:col-span-2">
                                            {req.office_status === 'Approved' ? (
                                                <div className="space-y-2">
                                                    {req.subjects.map((sub, idx) => {
                                                        // Logic to show approval buttons only to relevant staff
                                                        const userName = user?.name?.trim().toLowerCase() || user?.username?.trim().toLowerCase();
                                                        const staffName = sub.staff_name?.trim().toLowerCase();

                                                        // Priority match: Profile ID comparison
                                                        const isIdMatch = user?.profileId && sub.staff_profile_id && (Number(user.profileId) === Number(sub.staff_profile_id));

                                                        // Fallback match: Name string comparison
                                                        const isNameMatch = userName && staffName && (userName === staffName || userName.includes(staffName) || staffName.includes(userName));

                                                        const isMySubject = isIdMatch || isNameMatch;

                                                        // Demo Mode Check - admin or specific demo usernames get all buttons
                                                        const isDemo = ['admin', 'staff', 'hod', 'principal'].includes(user?.username?.toLowerCase());
                                                        const isRelevantStaff = (role === 'staff' && (isMySubject || isDemo)) || role === 'admin';

                                                        return (
                                                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border text-xs ${isRelevantStaff && sub.status === 'Pending' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                                                                <div>
                                                                    <p className="font-bold text-slate-700">{sub.subject_code}</p>
                                                                    <p className="text-slate-500 truncate max-w-[120px]">{sub.staff_name}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {sub.status === 'Pending' && isRelevantStaff ? (
                                                                        <>
                                                                            <button onClick={() => handleUpdate(req.id, null, 'Approved', null, sub.subject_code)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">✓</button>
                                                                            <button onClick={() => handleReject(req.id, null, sub.subject_code)} className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">✕</button>
                                                                        </>
                                                                    ) : (
                                                                        <StatusBadge status={sub.status} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400 italic">
                                                    Waiting for Office Clearance
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* HOD & Principal Group */}
                                    {(role === 'hod' || role === 'principal' || role === 'admin' || isStudent) && (
                                        <div className="space-y-3">
                                            {/* HOD (Hidden for Principal) */}
                                            {role !== 'principal' && (
                                                <div className={`p-3 rounded-xl border ${req.hod_status === 'Pending' && req.subjects.every(s => s.status === 'Approved') ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'} ${role === 'hod' ? 'ring-2 ring-blue-100' : ''}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold uppercase text-slate-500">HOD</span>
                                                        <StatusBadge status={req.hod_status} />
                                                    </div>
                                                    {role === 'hod' && req.hod_status === 'Pending' && req.subjects.every(s => s.status === 'Approved') && (
                                                        <div className="flex gap-2 text-xs mt-2">
                                                            <button onClick={() => handleUpdate(req.id, 'hod', 'Approved')} className="flex-1 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700">Approve</button>
                                                            <button onClick={() => handleReject(req.id, 'hod')} className="py-1.5 px-3 bg-red-100 text-red-600 rounded hover:bg-red-200">Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Principal (Hidden for HOD) */}

                                            {/* Principal (Hidden for HOD) */}
                                            {role !== 'hod' && (
                                                <div className={`p-3 rounded-xl border ${req.principal_status === 'Pending' && req.hod_status === 'Approved' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'} ${role === 'principal' ? 'ring-2 ring-blue-100' : ''}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold uppercase text-slate-500">Principal</span>
                                                        <StatusBadge status={req.principal_status} />
                                                    </div>
                                                    {role === 'principal' && req.principal_status === 'Pending' && req.hod_status === 'Approved' && (
                                                        <div className="flex gap-2 text-xs mt-2">
                                                            <button onClick={() => handleUpdate(req.id, 'principal', 'Approved')} className="flex-1 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Approve</button>
                                                            <button onClick={() => handleReject(req.id, 'principal')} className="py-1.5 px-3 bg-red-100 text-red-600 rounded hover:bg-red-200">Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NoDue;
