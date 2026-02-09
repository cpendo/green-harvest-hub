import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockSales, mockBuyers, mockProcessedBatches, generateId } from '@/lib/mockData';
import { Sale, Buyer, ProcessedBatch, TeaGrade } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SaleFormData {
  buyerId: string;
  processedBatchId: string;
  quantity: number;
  pricePerKg: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
}

const initialFormData: SaleFormData = {
  buyerId: '',
  processedBatchId: '',
  quantity: 0,
  pricePerKg: 450,
  paymentStatus: 'pending',
};

export function Sales() {
  const { toast } = useToast();
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', mockSales);
  const [buyers] = useLocalStorage<Buyer[]>('buyers', mockBuyers);
  const [processed, setProcessed] = useLocalStorage<ProcessedBatch[]>('processedBatches', mockProcessedBatches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<SaleFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');

  const availableStock = processed.filter(p => p.status === 'available');

  const filteredSales = sales.filter((sale) => {
    return (
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingPayments = sales.filter(s => s.paymentStatus !== 'paid').reduce((sum, s) => sum + s.totalAmount, 0);

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        buyerId: sale.buyerId,
        processedBatchId: sale.processedBatchId,
        quantity: sale.quantity,
        pricePerKg: sale.pricePerKg,
        paymentStatus: sale.paymentStatus,
      });
    } else {
      setEditingSale(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const buyer = buyers.find(b => b.id === formData.buyerId);
      const batch = processed.find(p => p.id === formData.processedBatchId);
      
      if (!buyer) {
        toast({
          title: "Error",
          description: "Please select a buyer.",
          variant: "destructive",
        });
        return;
      }

      if (!batch && !editingSale) {
        toast({
          title: "Error",
          description: "Please select a processed batch.",
          variant: "destructive",
        });
        return;
      }

      const sourceBatch = editingSale 
        ? processed.find(p => p.id === editingSale.processedBatchId) 
        : batch;
      
      if (!sourceBatch) {
        toast({
          title: "Error",
          description: "Source batch not found.",
          variant: "destructive",
        });
        return;
      }

      const totalAmount = formData.quantity * formData.pricePerKg;
      
      if (editingSale) {
        setSales(
          sales.map((s) =>
            s.id === editingSale.id
              ? {
                  ...s,
                  buyerId: formData.buyerId,
                  buyerName: buyer.companyName,
                  quantity: formData.quantity,
                  pricePerKg: formData.pricePerKg,
                  totalAmount,
                  paymentStatus: formData.paymentStatus,
                }
              : s
          )
        );
        toast({
          title: "Sale updated",
          description: `Sale ${editingSale.id} has been updated.`,
        });
      } else {
        const newSale: Sale = {
          id: generateId('S'),
          buyerId: formData.buyerId,
          buyerName: buyer.companyName,
          processedBatchId: formData.processedBatchId,
          date: new Date().toISOString().split('T')[0],
          quantity: formData.quantity,
          grade: sourceBatch.grade,
          pricePerKg: formData.pricePerKg,
          totalAmount,
          paymentStatus: formData.paymentStatus,
          farmerId: sourceBatch.farmerId,
          farmerName: sourceBatch.farmerName,
        };
        setSales([newSale, ...sales]);

        // Update processed batch status
        setProcessed(
          processed.map((p) =>
            p.id === formData.processedBatchId
              ? { ...p, status: 'sold' as const }
              : p
          )
        );
        toast({
          title: "Sale recorded",
          description: `Sale ${newSale.id} to ${buyer.companyName} has been recorded.`,
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sale record.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (sale: Sale) => {
    if (confirm(`Are you sure you want to delete sale ${sale.id}?`)) {
      try {
        setSales(sales.filter((s) => s.id !== sale.id));
        toast({
          title: "Sale deleted",
          description: `Sale record ${sale.id} has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete sale record.",
          variant: "destructive",
        });
      }
    }
  };

  const selectedBatch = processed.find(p => p.id === formData.processedBatchId);

  return (
    <div className="min-h-screen">
      <Header 
        title="Sales" 
        subtitle="Track tea sales and buyer transactions" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="btn-accent"
            disabled={availableStock.length === 0}
          >
            <ShoppingCart className="w-4 h-4" />
            Record Sale
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold font-display">{sales.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold font-display">KES {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-2xl font-bold font-display text-warning">KES {pendingPayments.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Available Stock</p>
            <p className="text-2xl font-bold font-display text-success">
              {availableStock.reduce((sum, p) => sum + p.outputWeight, 0).toFixed(1)} kg
            </p>
          </div>
        </div>

        {availableStock.length === 0 && (
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-info" />
            <p className="text-sm">
              <span className="font-medium">No stock available for sale.</span> Please process some batches in the Processing page first.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="card-elevated p-6">
          <DataTable
            data={filteredSales}
            columns={[
              { key: 'id', header: 'Sale ID' },
              { key: 'date', header: 'Date' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'farmerName', header: 'Farmer (Source)' },
              {
                key: 'quantity',
                header: 'Quantity',
                render: (sale) => `${sale.quantity} kg`,
              },
              {
                key: 'grade',
                header: 'Grade',
                render: (sale) => <GradeBadge grade={sale.grade} />,
              },
              {
                key: 'pricePerKg',
                header: 'Price/kg',
                render: (sale) => `KES ${sale.pricePerKg}`,
              },
              {
                key: 'totalAmount',
                header: 'Total',
                render: (sale) => `KES ${sale.totalAmount.toLocaleString()}`,
              },
              {
                key: 'paymentStatus',
                header: 'Payment',
                render: (sale) => <StatusBadge status={sale.paymentStatus} />,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (sale) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(sale);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(sale);
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No sales found"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSale ? 'Edit Sale' : 'Record New Sale'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Buyer</label>
              <select
                value={formData.buyerId}
                onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a buyer</option>
                {buyers.filter(b => b.status === 'active').map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.companyName}
                  </option>
                ))}
              </select>
            </div>
            
            {!editingSale && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Processed Batch</label>
                <select
                  value={formData.processedBatchId}
                  onChange={(e) => setFormData({ ...formData, processedBatchId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select available stock</option>
                  {availableStock.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.id} - {batch.farmerName} ({batch.outputWeight} kg, Grade {batch.grade})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedBatch || editingSale) && (
              <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Stock Details</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="font-medium">
                      {editingSale 
                        ? `${processed.find(p => p.id === editingSale.processedBatchId)?.outputWeight || 0} kg`
                        : `${selectedBatch?.outputWeight || 0} kg`
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                    <p className="font-medium">
                      {editingSale ? editingSale.grade : selectedBatch?.grade}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Farmer</p>
                    <p className="font-medium">
                      {editingSale ? editingSale.farmerName : selectedBatch?.farmerName}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Quantity (kg)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
                step="0.1"
                max={selectedBatch?.outputWeight || undefined}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Price per kg (KES)</label>
              <input
                type="number"
                value={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as SaleFormData['paymentStatus'] })}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          
          {formData.quantity > 0 && formData.pricePerKg > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Sale Total</p>
              <p className="text-2xl font-bold font-display text-primary">
                KES {(formData.quantity * formData.pricePerKg).toLocaleString()}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-accent flex-1">
              {editingSale ? 'Update Sale' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Sales;
