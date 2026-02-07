import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileText, Download, Filter, Printer, FileSpreadsheet } from 'lucide-react';

const Reports = () => {
    const { user } = useAuth();
    const isStaff = ['staff', 'admin', 'hod', 'principal', 'office'].includes(user?.role);

    const [activeTab, setActiveTab] = useState('no_due'); // Default to No Due
    const [year, setYear] = useState(isStaff ? '3' : user?.year?.toString() || '1');
    const [section, setSection] = useState(isStaff ? 'A' : user?.section || 'A');
    const [month, setMonth] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // For No Due: All, Completed, Pending
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Column Configuration
    const columnConfig = {
        no_due: [
            { header: "S.No", key: "s_no" },
            { header: "Roll No", key: "roll_no" },
            { header: "Name", key: "name" },
            { header: "Office", key: "office_status" },
            { header: "Staff", key: "staff_status" },
            { header: "HOD", key: "hod_status" },
            { header: "Principal", key: "principal_status" },
            { header: "Overall", key: "nodue_overall_status" }
        ],
        students: [
            { header: "S.No", key: "s_no" },
            { header: "Roll No", key: "roll_no" },
            { header: "Name", key: "name" },
            { header: "Dept", key: "department" },
            { header: "Year", key: "year" },
            { header: "Section", key: "section" },
            { header: "Phone", key: "phone" }
        ],
        attendance: [
            { header: "S.No", key: "s_no" },
            { header: "Roll No", key: "roll_no" },
            { header: "Name", key: "name" },
            { header: "Total Days", key: "total_days" },
            { header: "Present", key: "present_days" },
            { header: "Absent", key: "absent_days" },
            { header: "%", key: "percentage_str" }
        ],
        marks: [
            { header: "S.No", key: "s_no" },
            { header: "Roll No", key: "roll_no" },
            { header: "Name", key: "name" },
            { header: "IA1", key: "ia1" },
            { header: "IA2", key: "ia2" },
            { header: "IA3", key: "ia3" }
        ],
        fees: [
            { header: "S.No", key: "s_no" },
            { header: "Roll No", key: "roll_no" },
            { header: "Name", key: "name" },
            { header: "Total Fee", key: "total_fee" },
            { header: "Paid", key: "paid_amount" },
            { header: "Status", key: "status" },
            { header: "Receipt", key: "receipt_no" }
        ],
        staff: [
            { header: "S.No", key: "s_no" },
            { header: "Email ID", key: "email" },
            { header: "Name", key: "name" },
            { header: "Designation", key: "designation" },
            { header: "Dept", key: "department" },
            { header: "Phone", key: "phone" }
        ]
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, year, section, month, statusFilter, selectedStudentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '';
            const params = new URLSearchParams();
            if (activeTab !== 'staff') {
                params.append('year', year);
                params.append('section', section);
            }

            if (user) {
                params.append('role', user.role);
                if (!isStaff && user.profileId) {
                    params.append('student_id', user.profileId);
                } else if (selectedStudentId) {
                    params.append('student_id', selectedStudentId);
                }
            }

            if (activeTab === 'students') {
                url = `/api/students?${params.toString()}`;
            } else if (activeTab === 'attendance') {
                if (month) params.append('month', month);
                url = `/api/attendance/report?${params.toString()}`;
            } else if (activeTab === 'marks') {
                params.append('subject_code', 'CS101'); // Default subject or add selector
                url = `/api/marks?${params.toString()}`;
            } else if (activeTab === 'fees') {
                url = `/api/fees?${params.toString()}`;
            } else if (activeTab === 'staff') {
                url = `/api/staff`;
            } else if (activeTab === 'no_due') {
                url = `/api/no-due?${params.toString()}`;
            }

            if (url) {
                const res = await axios.get(url);
                let rawData = res.data;

                // Client-side status filtering for No Due
                if (activeTab === 'no_due' && statusFilter !== 'All') {
                    rawData = rawData.filter(item => {
                        const overall = item.nodue_overall_status || 'Not Started';
                        if (statusFilter === 'Completed') return overall === 'Completed';
                        if (statusFilter === 'Pending') return overall !== 'Completed' && overall !== 'Not Started';
                        if (statusFilter === 'Not Started') return overall === 'Not Started';
                        return true;
                    });
                }

                // Process data to add S.No and formatting
                const processed = rawData.map((item, index) => ({
                    ...item,
                    s_no: index + 1,
                    percentage_str: item.percentage ? item.percentage + '%' : (activeTab === 'attendance' ? '0%' : ''),
                    ia1: item.ia1 || '-',
                    ia2: item.ia2 || '-',
                    ia3: item.ia3 || '-',
                    receipt_no: item.receipt_no || '-',
                    paid_amount: item.paid_amount || 0,
                    total_fee: item.total_fee || 0,
                    status: item.status || 'Pending',
                    nodue_overall_status: item.nodue_overall_status || 'Not Started',
                    office_status: item.office_status || '-',
                    staff_status: item.staff_status || '-',
                    hod_status: item.hod_status || '-',
                    principal_status: item.principal_status || '-'
                }));
                setData(processed);
            }
        } catch (err) {
            console.error("Error fetching report data", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            const config = columnConfig[activeTab];

            // Header
            doc.setFontSize(22);
            doc.text("DMI Engineering College", 105, 20, null, null, "center");
            doc.setFontSize(14);
            doc.text(`${activeTab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Report`, 105, 30, null, null, "center");

            const tableRows = data.map(item => config.map(col => item[col.key]));
            const tableHeaders = config.map(col => col.header);

            autoTable(doc, {
                startY: 40,
                head: [tableHeaders],
                body: tableRows,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            });

            doc.save(`${activeTab}_report.pdf`);
        } catch (err) {
            console.error("PDF Error", err);
        }
    };

    const downloadExcel = () => {
        const config = columnConfig[activeTab];
        const excelData = data.map(item => {
            const row = {};
            config.forEach(col => {
                row[col.header] = item[col.key];
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${activeTab}_report.xlsx`);
    };

    const currentConfig = columnConfig[activeTab] || [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Reports & Analytics</h2>
                    <p className="text-slate-500">Generate and download detailed reports</p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card p-4 rounded-xl flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/60">
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
                    {Object.keys(columnConfig).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize whitespace-nowrap transition-all ${activeTab === tab
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {activeTab !== 'staff' && (
                    <div className="flex items-center gap-3 w-full lg:w-auto relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${year || section || month || statusFilter !== 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} />
                            {year || section ? `Filtering: Year ${year}${section}` : 'More Filters'}
                        </button>

                        {showFilterDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 shadow-blue-900/10 scale-in-center">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Year</p>
                                                <select value={year} onChange={(e) => setYear(e.target.value)} disabled={!isStaff} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                                                    <option value="1">1st Year</option>
                                                    <option value="2">2nd Year</option>
                                                    <option value="3">3rd Year</option>
                                                    <option value="4">4th Year</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Section</p>
                                                <select value={section} onChange={(e) => setSection(e.target.value)} disabled={!isStaff} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                                                    <option value="A">Sec A</option>
                                                    <option value="B">Sec B</option>
                                                    <option value="C">Sec C</option>
                                                </select>
                                            </div>
                                        </div>

                                        {activeTab === 'attendance' && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Month</p>
                                                <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                                                    <option value="">All Months</option>
                                                    <option value="1">January</option>
                                                    <option value="2">February</option>
                                                    <option value="3">March</option>
                                                    <option value="4">April</option>
                                                    <option value="5">May</option>
                                                    <option value="6">June</option>
                                                    <option value="7">July</option>
                                                    <option value="8">August</option>
                                                    <option value="9">September</option>
                                                    <option value="10">October</option>
                                                    <option value="11">November</option>
                                                    <option value="12">December</option>
                                                </select>
                                            </div>
                                        )}

                                        {activeTab === 'no_due' && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Status</p>
                                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                                                    <option value="All">All Status</option>
                                                    <option value="Completed">Approved (Completed)</option>
                                                    <option value="Pending">Pending / In Progress</option>
                                                    <option value="Not Started">Not Started</option>
                                                </select>
                                            </div>
                                        )}

                                        {isStaff && (
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Specific Student (Roll No)</p>
                                                <input
                                                    type="text"
                                                    placeholder="Enter Roll No..."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                                                    value={selectedStudentId}
                                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setShowFilterDropdown(false)}
                                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-blue-500/10"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Area */}
            <div className="glass-card rounded-2xl overflow-hidden bg-white border border-slate-200 min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-700">Preview: {data.length} Records Found</h3>
                    <div className="flex gap-2">
                        <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
                            <Printer size={16} /> PDF
                        </button>
                        <button onClick={downloadExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-slate-400">Loading...</div>
                    ) : data.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400">No records found.</div>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    {currentConfig.map(col => (
                                        <th key={col.key} className="p-3 whitespace-nowrap">{col.header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        {currentConfig.map(col => (
                                            <td key={col.key} className="p-3 text-slate-700">{row[col.key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
