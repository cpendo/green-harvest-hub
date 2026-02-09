import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Package } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockIncomingBatches, mockFarmers, generateId } from '@/lib/mockData';
import { IncomingBatch, TeaGrade, BatchStatus, Farmer } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BatchFormData {
  farmerId: string;
  rawWeight: number;
  grade: TeaGrade;
  moistureContent: number;
  pricePerKg: number;
  status: BatchStatus;
  notes: string;
}

const initialFormData: BatchFormData = {
  farmerId: '',
  rawWeight: 0,
  grade: 'A',
  moistureContent: 70,
  pricePerKg: 85,
  status: 'pending',
  notes: '',
};

export function Inventory() {
  const { toast } = useToast();
  const [batches, setBatches] = useLocalStorage<IncomingBatch[]>('incomingBatches', mockIncomingBatches);
  const [farmers] = useLocalStorage<Farmer[]>('farmers', mockFarmers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<IncomingBatch | null>(null);
  const [formData, setFormData] = useState<BatchFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BatchStatus>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | TeaGrade>('all');

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || batch.grade === gradeFilter;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const totalWeight = filteredBatches.reduce((sum, b) => sum + b.rawWeight, 0);
  const totalValue = filteredBatches.reduce((sum, b) => sum + b.totalAmount, 0);

  const handleOpenModal = (batch?: IncomingBatch) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        farmerId: batch.farmerId,
        rawWeight: batch.rawWeight,
        grade: batch.grade,
        moistureContent: batch.moistureContent,
        pricePerKg: batch.pricePerKg,
        status: batch.status,
        notes: batch.notes || '',
      });
    } else {
      setEditingBatch(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const farmer = farmers.find(f => f.id === formData.farmerId);
      if (!farmer) {
        toast({
          title: "Error",
          description: "Please select a valid farmer.",
          variant: "destructive",
        });
        return;
      }

      const totalAmount = formData.rawWeight * formData.pricePerKg;
      
      if (editingBatch) {
        setBatches(
          batches.map((b) =>
            b.id === editingBatch.id
              ? {
                  ...b,
                  ...formData,
                  farmerName: farmer.name,
                  totalAmount,
                }
              : b
          )
        );
        toast({
          title: "Delivery updated",
          description: `Batch ${editingBatch.id} has been updated.`,
        });
      } else {
        const newBatch: IncomingBatch = {
          id: generateId('IB'),
          ...formData,
          farmerName: farmer.name,
          date: new Date().toISOString().split('T')[0],
          totalAmount,
        };
        setBatches([newBatch, ...batches]);
        toast({
          title: "Delivery recorded",
          description: `New batch ${newBatch.id} from ${farmer.name} has been recorded.`,
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save delivery information.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (batch: IncomingBatch) => {
    if (confirm(`Are you sure you want to delete batch ${batch.id}?`)) {
      try {
        setBatches(batches.filter((b) => b.id !== batch.id));
        toast({
          title: "Delivery deleted",
          description: `Batch ${batch.id} has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete delivery.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Incoming Inventory" 
        subtitle="Track raw tea deliveries from farmers" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-full sm:w-64"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="processed">Processed</option>
              <option value="sold">Sold</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as typeof gradeFilter)}
              className="input-field"
            >
              <option value="all">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Record Delivery
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Batches</p>
            <p className="text-2xl font-bold font-display">{filteredBatches.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Weight</p>
            <p className="text-2xl font-bold font-display">{totalWeight.toLocaleString()} kg</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold font-display">KES {totalValue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold font-display text-warning">
              {batches.filter(b => b.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated p-6">
          <DataTable
            data={filteredBatches}
            columns={[
              { key: 'id', header: 'Batch ID' },
              { key: 'date', header: 'Date' },
              { key: 'farmerName', header: 'Farmer' },
              {
                key: 'rawWeight',
                header: 'Weight (kg)',
                render: (batch) => `${batch.rawWeight} kg`,
              },
              {
                key: 'grade',
                header: 'Grade',
                render: (batch) => <GradeBadge grade={batch.grade} />,
              },
              {
                key: 'moistureContent',
                header: 'Moisture %',
                render: (batch) => `${batch.moistureContent}%`,
              },
              {
                key: 'pricePerKg',
                header: 'Price/kg',
                render: (batch) => `KES ${batch.pricePerKg}`,
              },
              {
                key: 'totalAmount',
                header: 'Total',
                render: (batch) => `KES ${batch.totalAmount.toLocaleString()}`,
              },
              {
                key: 'status',
                header: 'Status',
                render: (batch) => <StatusBadge status={batch.status} />,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (batch) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(batch);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(batch);
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No batches found"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBatch ? 'Edit Delivery' : 'Record New Delivery'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Farmer</label>
              <select
                value={formData.farmerId}
                onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a farmer</option>
                {farmers.filter(f => f.status === 'active').map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name} ({farmer.id})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Raw Weight (kg)</label>
              <input
                type="number"
                value={formData.rawWeight}
                onChange={(e) => setFormData({ ...formData, rawWeight: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as TeaGrade })}
                className="input-field"
              >
                <option value="A">Grade A - Premium</option>
                <option value="B">Grade B - Standard</option>
                <option value="C">Grade C - Basic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Moisture Content (%)</label>
              <input
                type="number"
                value={formData.moistureContent}
                onChange={(e) => setFormData({ ...formData, moistureContent: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
                max="100"
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
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BatchStatus })}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="processed">Processed</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              rows={3}
            />
          </div>
          
          {formData.rawWeight > 0 && formData.pricePerKg > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Total</p>
              <p className="text-xl font-bold font-display">
                KES {(formData.rawWeight * formData.pricePerKg).toLocaleString()}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingBatch ? 'Update Delivery' : 'Record Delivery'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Inventory;
