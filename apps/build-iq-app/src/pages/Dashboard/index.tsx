import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from '@igblsln/store';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardSummaryQuery } from './api';
import './index.scss';

const Dashboard = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState<string>("");

    const { data: dashboardData, isLoading, isError } = useGetDashboardSummaryQuery();

    const [projectStatusChartData] = useState({
        labels: ['Planning', 'In Progress', 'Completed', 'On Hold'],
        datasets: [
            {
                data: [5, 12, 8, 2],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',  // Indigo
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(34, 197, 94, 0.8)',   // Green
                    'rgba(251, 146, 60, 0.8)'   // Orange
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(251, 146, 60)'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }
        ]
    });

    const [revenueChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue (₹)',
                backgroundColor: [
                    'rgba(99, 102, 241, 0.85)',   // Jan - Indigo
                    'rgba(251, 146, 60, 0.85)',   // Feb - Orange
                    'rgba(99, 102, 241, 0.85)',   // Mar - Indigo
                    'rgba(251, 146, 60, 0.85)',   // Apr - Orange
                    'rgba(99, 102, 241, 0.85)',   // May - Indigo
                    'rgba(251, 146, 60, 0.85)'    // Jun - Orange
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(251, 146, 60)',
                    'rgb(99, 102, 241)',
                    'rgb(251, 146, 60)',
                    'rgb(99, 102, 241)',
                    'rgb(251, 146, 60)'
                ],
                borderWidth: 0,
                data: [50000, 75000, 60000, 80000, 90000, 100000],
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.95,
                categoryPercentage: 0.98
            }
        ]
    });

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                        family: 'Roboto, sans-serif'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 15,
                bottom: 5,
                left: 10,
                right: 10
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: 12,
                cornerRadius: 6,
                titleFont: {
                    size: 13,
                    weight: '600'
                },
                bodyFont: {
                    size: 12
                },
                callbacks: {
                    label: function(context: any) {
                        return 'Revenue: ₹' + context.parsed.y.toLocaleString();
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                    lineWidth: 1
                },
                border: {
                    display: false
                },
                ticks: {
                    callback: function(value: any) {
                        return '₹' + (value / 1000) + 'k';
                    },
                    font: {
                        size: 11,
                        family: 'Roboto, sans-serif'
                    },
                    padding: 10,
                    maxTicksLimit: 5,
                    color: '#64748b'
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                border: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: 'Roboto, sans-serif'
                    },
                    padding: 8,
                    maxRotation: 0,
                    minRotation: 0,
                    color: '#64748b'
                }
            }
        }
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Good Morning");
        } else if (hour < 18) {
            setGreeting("Good Afternoon");
        } else {
            setGreeting("Good Evening");
        }
    }, []);

    const handleRedirect = (path: string) => {
        navigate(path);
    };

    const renderCardContent = (
        value: number | undefined,
        color: string,
        label: string,
        redirectUrl: string,
        tooltipText: string
    ) => {
        if (isLoading) {
            return <Skeleton width="80%" height="2rem" className="mx-auto my-2" />;
        }
        if (isError) {
            return <p className="text-red-500">Error loading</p>;
        }
        return (
            <div className="text-center py-2">
                <Tooltip target={`.tooltip-${label}`} content={tooltipText} position="top" />
                <h3
                    className={`text-4xl font-bold ${color} m-0 cursor-pointer tooltip-${label}`}
                    onClick={() => handleRedirect(redirectUrl)}
                >
                    {value ?? 0}
                </h3>
                <p className="text-sm text-gray-600 mt-1 mb-0">{label}</p>
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Greeting */}
                <div className="dashboard-header">
                    <h2 className="dashboard-title text-2xl">
                        {greeting ? `${greeting}, ${auth?.user?.user_name || "User"}!` : ''}
                    </h2>
                </div>

                {/* First Row: Four Cards */}
                <div className="grid">
                    <div className="col-3 p-2 metric-card">
                        <Card title="Active Projects" subTitle="Currently Running" className="shadow-4">
                            {renderCardContent(
                                dashboardData?.active_projects,
                                "text-green-500",
                                "Projects in progress",
                                "/projects/project",
                                "Click to view all active projects"
                            )}
                        </Card>
                    </div>
                    <div className="col-3 p-2 metric-card">
                        <Card title="Pending PO's" subTitle="Action Required" className="shadow-4">
                            {renderCardContent(
                                dashboardData?.pending_pos,
                                "text-orange-500",
                                "Requisitions awaiting approval",
                                "/purchase/purchaseorder",
                                "Click to view pending PRs"
                            )}
                        </Card>
                    </div>
                    <div className="col-3 p-2 metric-card">
                        <Card title="Pending Vendor Payments" subTitle="Action Required" className="shadow-4">
                            {renderCardContent(
                                dashboardData?.vendor_pending_payments,
                                "text-red-500",
                                "Orders awaiting approval",
                                "/payment/vendorpayment",
                                "Click to view pending POs"
                            )}
                        </Card>
                    </div>
                    <div className="col-3 p-2 metric-card">
                        <Card title="Pending Contractor Payments" subTitle="Action Required" className="shadow-4">
                            {renderCardContent(
                                dashboardData?.contractor_pending_payments,
                                "text-blue-500",
                                "Payments overdue",
                                "/payment/contractorpayment",
                                "Click to view pending payments"
                            )}
                        </Card>
                    </div>
                </div>

                {/* Quick Access Header */}
                <div className="quick-actions-section">
                    <h2 className="text-2xl font-bold quick-actions-title">Quick Access</h2>
                    
                    {/* Second Row: Navigation Cards */}
                    <div className="grid">
                    <div className="col-3 p-2">
                        <Card className="shadow-1 cursor-pointer quick-card" onClick={() => handleRedirect('/reports/vendorinvoicewithgst')}>
                            <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                                <h3 className="m-0 text-xl font-bold">Reports</h3>
                                <p className="m-0 text-sm muted-text">View Reports</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-3 p-2">
                        <Card className="shadow-1 cursor-pointer quick-card" onClick={() => handleRedirect('/payment/vendorpayment')}>
                            <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                                <h3 className="m-0 text-xl font-bold">Finance</h3>
                                <p className="m-0 text-sm muted-text">Manage Finance</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-3 p-2">
                        <Card className="shadow-1 cursor-pointer quick-card" onClick={() => handleRedirect('/purchase/purchaseorder')}>
                            <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                                <h3 className="m-0 text-xl font-bold">Purchase</h3>
                                <p className="m-0 text-sm muted-text">Manage Purchases</p>
                            </div>
                        </Card>
                    </div>
                    <div className="col-3 p-2">
                        <Card className="shadow-1 cursor-pointer quick-card" onClick={() => handleRedirect('/users/users')}>
                            <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                                <h3 className="m-0 text-xl font-bold">HRM</h3>
                                <p className="m-0 text-sm muted-text">Human Resources</p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Third Row: Charts */}
                <div className="grid">
                    <div className="col-6 p-2 chart-card">
                        <Card title="Project Status Distribution" subTitle="Current Status Overview" className="shadow-2">
                            <div className="chart-wrapper">
                                <Chart type="doughnut" data={projectStatusChartData} options={pieChartOptions} />
                            </div>
                        </Card>
                    </div>
                    <div className="col-6 p-2 chart-card">
                        <Card title="Monthly Revenue" subTitle="Revenue Trends (2024)" className="shadow-2">
                            <div className="chart-wrapper">
                                <Chart type="bar" data={revenueChartData} options={barChartOptions} />
                            </div>
                        </Card>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
