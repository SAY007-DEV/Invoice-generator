import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
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
    <div className="p-6 md:p-8 lg:p-12" data-testid="invoices-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-indigo-950 tracking-tight">
            Invoices
          </h1>
          <p className="text-slate-600 mt-2">Manage all your invoices</p>
        </div>
        <Button
          onClick={() => navigate('/invoices/new')}
          className="bg-indigo-950 hover:bg-indigo-900"
          data-testid="create-invoice-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-slate-100">
          <CardContent className="py-16">
            <div className="text-center text-slate-500" data-testid="no-invoices">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm mt-2">Create your first invoice to get started</p>
              <Button
                onClick={() => navigate('/invoices/new')}
                className="mt-4 bg-indigo-950 hover:bg-indigo-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="invoices-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="py-3 px-4 text-left">Invoice #</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Invoice Date</th>
                    <th className="py-3 px-4 text-left">Due Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                      data-testid={`invoice-row-${invoice.invoice_number}`}
                    >
                      <td className="py-4 px-4 text-sm text-slate-700 font-mono font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700">{invoice.customer_name}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(invoice.due_date).toLocaleDateString()}
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
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                            data-testid={`view-invoice-${invoice.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
                            data-testid={`edit-invoice-${invoice.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(invoice.id)}
                            data-testid={`delete-invoice-${invoice.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}