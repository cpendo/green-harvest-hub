import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Factory, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockProcessedBatches, mockIncomingBatches, generateId } from '@/lib/mockData';
import { ProcessedBatch, IncomingBatch, TeaGrade } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProcessFormData {
  incomingBatchId: string;
  outputWeight: number;
  grade: TeaGrade;
  qualityScore: number;
  packagingType: string;
  status: 'available' | 'reserved' | 'sold';
}

const initialFormData: ProcessFormData = {
  incomingBatchId: '',
  outputWeight: 0,
  grade: 'A',
  qualityScore: 90,
  packagingType: '25kg bags',
  status: 'available',
};

export function Processing() {
  const { toast } = useToast();
  const [processed, setProcessed] = useLocalStorage<ProcessedBatch[]>('processedBatches', mockProcessedBatches);
  const [incomingBatches, setIncomingBatches] = useLocalStorage<IncomingBatch[]>('incomingBatches', mockIncomingBatches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProcessedBatch | null>(null);
  const [formData, setFormData] = useState<ProcessFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');

  // Get pending/processing batches for new processing
  const availableForProcessing = incomingBatches.filter(
    b => b.status === 'pending' || b.status === 'processing'
  );

  const filteredProcessed = processed.filter((batch) => {
    return (
      batch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenModal = (batch?: ProcessedBatch) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        incomingBatchId: batch.incomingBatchId,
        outputWeight: batch.outputWeight,
        grade: batch.grade,
        qualityScore: batch.qualityScore,
        packagingType: batch.packagingType,
        status: batch.status,
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
      const incomingBatch = incomingBatches.find(b => b.id === formData.incomingBatchId);
      if (!incomingBatch && !editingBatch) {
        toast({
          title: "Error",
          description: "Please select a batch to process.",
          variant: "destructive",
        });
        return;
      }

      const sourceBatch = editingBatch 
        ? incomingBatches.find(b => b.id === editingBatch.incomingBatchId) 
        : incomingBatch;
      
      if (!sourceBatch) {
        toast({
          title: "Error",
          description: "Source batch not found.",
          variant: "destructive",
        });
        return;
      }

      const inputWeight = sourceBatch.rawWeight;
      const processingLoss = Math.round(((inputWeight - formData.outputWeight) / inputWeight) * 100);
      
      if (editingBatch) {
        setProcessed(
          processed.map((b) =>
            b.id === editingBatch.id
              ? {
                  ...b,
                  outputWeight: formData.outputWeight,
                  grade: formData.grade,
                  qualityScore: formData.qualityScore,
                  packagingType: formData.packagingType,
                  processingLoss,
                  status: formData.status,
                }
              : b
          )
        );
        toast({
          title: "Processing record updated",
          description: `Batch ${editingBatch.id} has been updated.`,
        });
      } else {
        const newBatch: ProcessedBatch = {
          id: generateId('PB'),
          incomingBatchId: formData.incomingBatchId,
          farmerId: sourceBatch.farmerId,
          farmerName: sourceBatch.farmerName,
          processedDate: new Date().toISOString().split('T')[0],
          inputWeight,
          outputWeight: formData.outputWeight,
          grade: formData.grade,
          processingLoss,
          qualityScore: formData.qualityScore,
          packagingType: formData.packagingType,
          status: formData.status,
        };
        setProcessed([newBatch, ...processed]);

        // Update incoming batch status
        setIncomingBatches(
          incomingBatches.map((b) =>
            b.id === formData.incomingBatchId
              ? { ...b, status: 'processed' as const }
              : b
          )
        );
        toast({
          title: "Processing completed",
          description: `Batch ${newBatch.id} from ${sourceBatch.farmerName} has been processed.`,
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save processing record.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (batch: ProcessedBatch) => {
    if (confirm(`Are you sure you want to delete batch ${batch.id}?`)) {
      try {
        setProcessed(processed.filter((b) => b.id !== batch.id));
        toast({
          title: "Record deleted",
          description: `Processing record ${batch.id} has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete processing record.",
          variant: "destructive",
        });
      }
    }
  };

  const selectedIncomingBatch = incomingBatches.find(b => b.id === formData.incomingBatchId);

  return (
    <div className="min-h-screen">
      <Header 
        title="Processing" 
        subtitle="Track tea processing and output records" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search processed batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
            disabled={availableForProcessing.length === 0}
          >
            <Factory className="w-4 h-4" />
            Process Batch
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Processed</p>
            <p className="text-2xl font-bold font-display">{processed.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Output</p>
            <p className="text-2xl font-bold font-display">
              {processed.reduce((sum, b) => sum + b.outputWeight, 0).toFixed(1)} kg
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Available Stock</p>
            <p className="text-2xl font-bold font-display text-success">
              {processed.filter(b => b.status === 'available').reduce((sum, b) => sum + b.outputWeight, 0).toFixed(1)} kg
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Avg. Quality Score</p>
            <p className="text-2xl font-bold font-display">
              {processed.length > 0 
                ? Math.round(processed.reduce((sum, b) => sum + b.qualityScore, 0) / processed.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* Pending Processing Alert */}
        {availableForProcessing.length > 0 && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-3">
            <Factory className="w-5 h-5 text-warning" />
            <p className="text-sm">
              <span className="font-medium">{availableForProcessing.length} batches</span> are waiting to be processed
            </p>
          </div>
        )}

        {/* Table */}
        <div className="card-elevated p-6">
          <DataTable
            data={filteredProcessed}
            columns={[
              { key: 'id', header: 'Batch ID' },
              { key: 'processedDate', header: 'Date' },
              { key: 'farmerName', header: 'Farmer' },
              {
                key: 'inputWeight',
                header: 'Input',
                render: (batch) => `${batch.inputWeight} kg`,
              },
              {
                key: 'outputWeight',
                header: 'Output',
                render: (batch) => `${batch.outputWeight} kg`,
              },
              {
                key: 'processingLoss',
                header: 'Loss %',
                render: (batch) => (
                  <span className={batch.processingLoss > 80 ? 'text-destructive' : ''}>
                    {batch.processingLoss}%
                  </span>
                ),
              },
              {
                key: 'grade',
                header: 'Grade',
                render: (batch) => <GradeBadge grade={batch.grade} />,
              },
              {
                key: 'qualityScore',
                header: 'Quality',
                render: (batch) => (
                  <span className={`font-medium ${batch.qualityScore >= 90 ? 'text-success' : ''}`}>
                    {batch.qualityScore}%
                  </span>
                ),
              },
              { key: 'packagingType', header: 'Packaging' },
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
            emptyMessage="No processed batches found"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBatch ? 'Edit Processing Record' : 'Process New Batch'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingBatch && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Select Incoming Batch</label>
              <select
                value={formData.incomingBatchId}
                onChange={(e) => setFormData({ ...formData, incomingBatchId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a batch to process</option>
                {availableForProcessing.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.id} - {batch.farmerName} ({batch.rawWeight} kg, Grade {batch.grade})
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedIncomingBatch || editingBatch) && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Input Weight</p>
                  <p className="text-lg font-bold">
                    {editingBatch 
                      ? `${incomingBatches.find(b => b.id === editingBatch.incomingBatchId)?.rawWeight || 0} kg`
                      : `${selectedIncomingBatch?.rawWeight || 0} kg`
                    }
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Output Weight</p>
                  <p className="text-lg font-bold">{formData.outputWeight} kg</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Output Weight (kg)</label>
              <input
                type="number"
                value={formData.outputWeight}
                onChange={(e) => setFormData({ ...formData, outputWeight: parseFloat(e.target.value) || 0 })}
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
              <label className="block text-sm font-medium mb-1.5">Quality Score (%)</label>
              <input
                type="number"
                value={formData.qualityScore}
                onChange={(e) => setFormData({ ...formData, qualityScore: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
                max="100"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Packaging Type</label>
              <select
                value={formData.packagingType}
                onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
                className="input-field"
              >
                <option value="25kg bags">25kg bags</option>
                <option value="50kg bags">50kg bags</option>
                <option value="Bulk containers">Bulk containers</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProcessFormData['status'] })}
                className="input-field"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingBatch ? 'Update Record' : 'Record Processing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Processing;
