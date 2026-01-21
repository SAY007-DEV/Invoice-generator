import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    notes: '',
    status: 'unpaid',
    tax_percentage: 0,
    discount_percentage: 0,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);

      if (id) {
        const invoiceRes = await api.get(`/invoices/${id}`);
        const invoice = invoiceRes.data;
        setFormData({
          customer_id: invoice.customer_id,
          invoice_date: invoice.invoice_date,
          due_date: invoice.due_date,
          items: invoice.items,
          notes: invoice.notes || '',
          status: invoice.status,
          tax_percentage: invoice.tax_percentage,
          discount_percentage: invoice.discount_percentage,
        });
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_name: '',
          description: '',
          quantity: 1,
          unit: 'pcs',
          price: 0,
          amount: 0,
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = parseFloat(newItems[index].quantity || 0) * parseFloat(newItems[index].price || 0);
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const selectProduct = (index, productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, 'product_id', product.id);
      updateItem(index, 'product_name', product.name);
      updateItem(index, 'description', product.description || '');
      updateItem(index, 'price', product.price);
      updateItem(index, 'unit', product.unit);
      const newItems = [...formData.items];
      newItems[index].amount = parseFloat(newItems[index].quantity || 1) * product.price;
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = (subtotal * formData.discount_percentage) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * formData.tax_percentage) / 100;
    const total = afterDiscount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const totals = calculateTotals();
    const invoiceData = {
      customer_id: formData.customer_id,
      invoice_date: formData.invoice_date,
      due_date: formData.due_date,
      items: formData.items,
      subtotal: totals.subtotal,
      tax_percentage: formData.tax_percentage,
      tax_amount: totals.taxAmount,
      discount_percentage: formData.discount_percentage,
      discount_amount: totals.discountAmount,
      total: totals.total,
      notes: formData.notes,
      status: formData.status,
    };

    try {
      if (id) {
        await api.put(`/invoices/${id}`, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        const response = await api.post('/invoices', invoiceData);
        toast.success('Invoice created successfully');
        navigate(`/invoices/view/${response.data.id}`);
        return;
      }
      navigate('/invoices');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save invoice');
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-12" data-testid="invoice-form-page">
      <div className="mb-8 flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/invoices')} data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-indigo-950 tracking-tight">
            {id ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Dates */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                >
                  <SelectTrigger data-testid="customer-select">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoice_date">Invoice Date *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  required
                  data-testid="invoice-date-input"
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                  data-testid="due-date-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading">Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm" data-testid="add-item-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3" data-testid={`item-${index}`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <Label>Product</Label>
                      <Select
                        value={item.product_id || ''}
                        onValueChange={(value) => selectProduct(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        data-testid={`quantity-${index}`}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label>Unit</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        data-testid={`price-${index}`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-slate-50"
                        data-testid={`amount-${index}`}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="w-full"
                        data-testid={`remove-item-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-12">
                    <Label>Description</Label>
                    <Input
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                </div>
              ))}
              {formData.items.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No items added yet</p>
                  <p className="text-sm mt-1">Click "Add Item" to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                    data-testid="discount-input"
                  />
                </div>
                <div>
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                    data-testid="tax-input"
                  />
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-mono font-semibold" data-testid="subtotal-display">${totals.subtotal.toFixed(2)}</span>
                </div>
                {formData.discount_percentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount ({formData.discount_percentage}%):</span>
                    <span className="font-mono text-rose-600">-${totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {formData.tax_percentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax ({formData.tax_percentage}%):</span>
                    <span className="font-mono">${totals.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                  <span className="text-indigo-950">Total:</span>
                  <span className="font-mono text-indigo-950" data-testid="total-display">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes or payment terms..."
              rows={4}
              data-testid="notes-input"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-950 hover:bg-indigo-900" data-testid="save-invoice-button">
            {id ? 'Update' : 'Create'} Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}