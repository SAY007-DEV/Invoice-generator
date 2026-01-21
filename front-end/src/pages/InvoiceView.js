import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [invoiceRes, shopRes] = await Promise.all([
        api.get(`/invoices/${id}`),
        api.get('/shop'),
      ]);
      setInvoice(invoiceRes.data);
      setShop(shopRes.data);
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: invoice ? invoice.invoice_number : 'Invoice',
  });

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/invoices/${id}/status?status=${newStatus}`);
      setInvoice({ ...invoice, status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
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
    <div className="p-6 md:p-8 lg:p-12 bg-slate-50" data-testid="invoice-view-page">
      {/* Actions Bar */}
      <div className="mb-8 flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => navigate('/invoices')} data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex items-center space-x-3">
          <Select value={invoice.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40" data-testid="status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate(`/invoices/edit/${id}`)} data-testid="edit-button">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handlePrint} className="bg-indigo-950 hover:bg-indigo-900" data-testid="print-button">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="flex justify-center">
        <Card
          ref={printRef}
          className="w-full max-w-[210mm] bg-white shadow-xl border-slate-200 print:shadow-none print:border-0"
          data-testid="invoice-preview"
        >
          <div className="p-12 print:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-slate-900">
              <div>
                <h1 className="text-4xl font-heading font-bold text-indigo-950 tracking-tight mb-2">
                  {shop?.shop_name || 'Business Name'}
                </h1>
                {shop?.address && (
                  <div className="text-sm text-slate-600 space-y-0.5">
                    <p>{shop.address}</p>
                    <p>
                      {shop.city}
                      {shop.city && shop.state && ', '}
                      {shop.state} {shop.zip_code}
                    </p>
                    {shop.country && <p>{shop.country}</p>}
                    {shop.phone && <p>Phone: {shop.phone}</p>}
                    {shop.email && <p>Email: {shop.email}</p>}
                    {shop.gst_number && <p>GST: {shop.gst_number}</p>}
                  </div>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">INVOICE</h2>
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-semibold">Invoice #:</span>
                  <span className="font-mono ml-2">{invoice.invoice_number}</span>
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-semibold">Date:</span>
                  <span className="ml-2">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Due Date:</span>
                  <span className="ml-2">{new Date(invoice.due_date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Bill To</h3>
              <div className="text-slate-700">
                <p className="font-semibold text-lg">{invoice.customer_name}</p>
                {invoice.customer_email && <p className="text-sm">{invoice.customer_email}</p>}
                {invoice.customer_phone && <p className="text-sm">{invoice.customer_phone}</p>}
                {invoice.customer_address && <p className="text-sm mt-1">{invoice.customer_address}</p>}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-3 px-4 text-left text-xs uppercase tracking-wider font-semibold">Description</th>
                    <th className="py-3 px-4 text-right text-xs uppercase tracking-wider font-semibold">Qty</th>
                    <th className="py-3 px-4 text-right text-xs uppercase tracking-wider font-semibold">Unit</th>
                    <th className="py-3 px-4 text-right text-xs uppercase tracking-wider font-semibold">Price</th>
                    <th className="py-3 px-4 text-right text-xs uppercase tracking-wider font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-200">
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">{item.product_name}</p>
                        {item.description && <p className="text-sm text-slate-600 mt-0.5">{item.description}</p>}
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums text-slate-700">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-slate-700">{item.unit}</td>
                      <td className="py-4 px-4 text-right tabular-nums text-slate-700">${item.price.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right font-semibold tabular-nums text-slate-900">
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-mono tabular-nums">${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount_percentage > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Discount ({invoice.discount_percentage}%):</span>
                      <span className="font-mono tabular-nums text-rose-600">-${invoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.tax_percentage > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Tax ({invoice.tax_percentage}%):</span>
                      <span className="font-mono tabular-nums">${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-heading font-bold tabular-nums">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status Badge - Only visible on screen */}
            <div className="mb-8 no-print flex justify-end">
              <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8 p-4 bg-slate-50 rounded">
                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Notes</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 pt-8 border-t border-slate-200">
              <p>Thank you for your business!</p>
              {shop?.website && <p className="mt-1">{shop.website}</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}