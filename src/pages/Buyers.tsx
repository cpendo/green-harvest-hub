import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Mail, Phone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockBuyers, generateId } from '@/lib/mockData';
import { Buyer } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BuyerFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

const initialFormData: BuyerFormData = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
};

export function Buyers() {
  const { toast } = useToast();
  const [buyers, setBuyers] = useLocalStorage<Buyer[]>('buyers', mockBuyers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [formData, setFormData] = useState<BuyerFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuyers = buyers.filter((buyer) => {
    return (
      buyer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPurchases = buyers.reduce((sum, b) => sum + b.totalPurchases, 0);

  const handleOpenModal = (buyer?: Buyer) => {
    if (buyer) {
      setEditingBuyer(buyer);
      setFormData({
        companyName: buyer.companyName,
        contactPerson: buyer.contactPerson,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        status: buyer.status,
      });
    } else {
      setEditingBuyer(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBuyer(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBuyer) {
        setBuyers(
          buyers.map((b) =>
            b.id === editingBuyer.id
              ? { ...b, ...formData }
              : b
          )
        );
        toast({
          title: "Buyer updated",
          description: `${formData.companyName} has been updated successfully.`,
        });
      } else {
        const newBuyer: Buyer = {
          id: generateId('B'),
          ...formData,
          registrationDate: new Date().toISOString().split('T')[0],
          totalPurchases: 0,
        };
        setBuyers([...buyers, newBuyer]);
        toast({
          title: "Buyer added",
          description: `${formData.companyName} has been added to the system.`,
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save buyer information.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (buyer: Buyer) => {
    if (confirm(`Are you sure you want to delete ${buyer.companyName}?`)) {
      try {
        setBuyers(buyers.filter((b) => b.id !== buyer.id));
        toast({
          title: "Buyer deleted",
          description: `${buyer.companyName} has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete buyer.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Buyers" 
        subtitle="Manage tea buyers and trading partners" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search buyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Buyer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Buyers</p>
            <p className="text-2xl font-bold font-display">{buyers.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold font-display text-success">
              {buyers.filter(b => b.status === 'active').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold font-display text-muted-foreground">
              {buyers.filter(b => b.status === 'inactive').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="text-2xl font-bold font-display">KES {(totalPurchases / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated p-6">
          <DataTable
            data={filteredBuyers}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'companyName', header: 'Company' },
              { key: 'contactPerson', header: 'Contact Person' },
              {
                key: 'email',
                header: 'Email',
                render: (buyer) => (
                  <a 
                    href={`mailto:${buyer.email}`} 
                    className="flex items-center gap-1.5 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="w-3 h-3" />
                    {buyer.email}
                  </a>
                ),
              },
              {
                key: 'phone',
                header: 'Phone',
                render: (buyer) => (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    {buyer.phone}
                  </span>
                ),
              },
              {
                key: 'totalPurchases',
                header: 'Total Purchases',
                render: (buyer) => `KES ${buyer.totalPurchases.toLocaleString()}`,
              },
              {
                key: 'status',
                header: 'Status',
                render: (buyer) => <StatusBadge status={buyer.status} />,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (buyer) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(buyer);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(buyer);
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No buyers found"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBuyer ? 'Edit Buyer' : 'Add New Buyer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                rows={2}
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Buyers;
