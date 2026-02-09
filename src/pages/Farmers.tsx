import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockFarmers, generateId } from '@/lib/mockData';
import { Farmer, FarmerStatus, OutputPreference } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface FarmerFormData {
  name: string;
  phone: string;
  location: string;
  status: FarmerStatus;
  outputPreference: OutputPreference;
}

const initialFormData: FarmerFormData = {
  name: '',
  phone: '',
  location: '',
  status: 'active',
  outputPreference: 'coop-sell',
};

export function Farmers() {
  const { toast } = useToast();
  const [farmers, setFarmers] = useLocalStorage<Farmer[]>('farmers', mockFarmers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FarmerStatus>('all');

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || farmer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (farmer?: Farmer) => {
    if (farmer) {
      setEditingFarmer(farmer);
      setFormData({
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location,
        status: farmer.status,
        outputPreference: farmer.outputPreference,
      });
    } else {
      setEditingFarmer(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFarmer(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFarmer) {
        setFarmers(
          farmers.map((f) =>
            f.id === editingFarmer.id
              ? { ...f, ...formData }
              : f
          )
        );
        toast({
          title: "Farmer updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const newFarmer: Farmer = {
          id: generateId('F'),
          ...formData,
          registrationDate: new Date().toISOString().split('T')[0],
          totalDelivered: 0,
          balance: 0,
        };
        setFarmers([...farmers, newFarmer]);
        toast({
          title: "Farmer added",
          description: `${formData.name} has been added to the cooperative.`,
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save farmer information.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (farmer: Farmer) => {
    if (confirm(`Are you sure you want to delete ${farmer.name}?`)) {
      try {
        setFarmers(farmers.filter((f) => f.id !== farmer.id));
        toast({
          title: "Farmer deleted",
          description: `${farmer.name} has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete farmer.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Farmers" 
        subtitle="Manage cooperative members and their information" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-full sm:w-64"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="input-field pl-10 pr-8 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Farmer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Farmers</p>
            <p className="text-2xl font-bold font-display">{farmers.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold font-display text-success">
              {farmers.filter(f => f.status === 'active').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Self-Collect</p>
            <p className="text-2xl font-bold font-display">
              {farmers.filter(f => f.outputPreference === 'self-collect').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Coop Sells</p>
            <p className="text-2xl font-bold font-display">
              {farmers.filter(f => f.outputPreference === 'coop-sell').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated p-6">
          <DataTable
            data={filteredFarmers}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'name', header: 'Name' },
              { key: 'phone', header: 'Phone' },
              { key: 'location', header: 'Location' },
              {
                key: 'outputPreference',
                header: 'Output Preference',
                render: (farmer) => (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    farmer.outputPreference === 'self-collect' 
                      ? 'bg-info/10 text-info' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {farmer.outputPreference === 'self-collect' ? 'Self Collect' : 'Coop Sells'}
                  </span>
                ),
              },
              {
                key: 'totalDelivered',
                header: 'Total Delivered',
                render: (farmer) => `${farmer.totalDelivered.toLocaleString()} kg`,
              },
              {
                key: 'balance',
                header: 'Balance',
                render: (farmer) => `KES ${farmer.balance.toLocaleString()}`,
              },
              {
                key: 'status',
                header: 'Status',
                render: (farmer) => <StatusBadge status={farmer.status} />,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (farmer) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(farmer);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(farmer);
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No farmers found"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as FarmerStatus })}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Output Preference</label>
            <select
              value={formData.outputPreference}
              onChange={(e) => setFormData({ ...formData, outputPreference: e.target.value as OutputPreference })}
              className="input-field"
            >
              <option value="coop-sell">Cooperative Sells</option>
              <option value="self-collect">Self Collect</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingFarmer ? 'Update Farmer' : 'Add Farmer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Farmers;
