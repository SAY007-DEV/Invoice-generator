import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, DollarSign, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, invoicesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/invoices'),
      ]);
      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'unpaid':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'overdue':
        return 'text-rose-700 bg-rose-50 border border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-12" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-indigo-950 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-2">Overview of your business performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow" data-testid="stat-total-invoices">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Total Invoices
              </CardTitle>
              <Receipt className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-indigo-950 tabular-nums">
              {stats?.total_invoices || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow" data-testid="stat-total-revenue">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-indigo-950 tabular-nums">
              ${(stats?.total_revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow" data-testid="stat-paid">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Paid
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-emerald-700 tabular-nums">
              {stats?.paid_invoices || 0}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              ${(stats?.paid_revenue || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow" data-testid="stat-pending">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Pending
              </CardTitle>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-amber-700 tabular-nums">
              {(stats?.unpaid_invoices || 0) + (stats?.overdue_invoices || 0)}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              ${(stats?.unpaid_revenue || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-indigo-950 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate('/invoices/new')}
            className="bg-indigo-950 hover:bg-indigo-900"
            data-testid="new-invoice-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
          <Button
            onClick={() => navigate('/customers')}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button
            onClick={() => navigate('/products')}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Recent Invoices */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl">Recent Invoices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/invoices')}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500" data-testid="no-invoices">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No invoices yet</p>
              <p className="text-sm mt-1">Create your first invoice to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="recent-invoices-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="py-3 px-4 text-left">Invoice #</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
                      onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                      data-testid={`invoice-row-${invoice.invoice_number}`}
                    >
                      <td className="py-4 px-4 text-sm text-slate-700 font-mono">{invoice.invoice_number}</td>
                      <td className="py-4 px-4 text-sm text-slate-700">{invoice.customer_name}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-900 font-semibold text-right tabular-nums">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                          data-testid={`status-${invoice.status}`}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}