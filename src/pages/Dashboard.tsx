import { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  Building2, 
  TrendingUp, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  Leaf 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  mockFarmers, 
  mockIncomingBatches, 
  mockProcessedBatches, 
  mockBuyers, 
  mockSales 
} from '@/lib/mockData';
import { Farmer, IncomingBatch, Sale } from '@/types';

const monthlyData = [
  { month: 'Aug', incoming: 2400, processed: 1800, sales: 1600 },
  { month: 'Sep', incoming: 2800, processed: 2200, sales: 2000 },
  { month: 'Oct', incoming: 3200, processed: 2600, sales: 2400 },
  { month: 'Nov', incoming: 2900, processed: 2400, sales: 2100 },
  { month: 'Dec', incoming: 3400, processed: 2800, sales: 2600 },
  { month: 'Jan', incoming: 3800, processed: 3100, sales: 2900 },
];

const gradeDistribution = [
  { name: 'Grade A', value: 45, color: 'hsl(152, 60%, 40%)' },
  { name: 'Grade B', value: 35, color: 'hsl(152, 45%, 25%)' },
  { name: 'Grade C', value: 20, color: 'hsl(38, 90%, 50%)' },
];

const regionData = [
  { region: 'Kericho', farmers: 45, volume: 1200 },
  { region: 'Nandi', farmers: 38, volume: 980 },
  { region: 'Kisii', farmers: 32, volume: 850 },
  { region: 'Limuru', farmers: 28, volume: 720 },
  { region: 'Bomet', farmers: 22, volume: 580 },
];

export function Dashboard() {
  const [farmers] = useLocalStorage<Farmer[]>('farmers', mockFarmers);
  const [batches] = useLocalStorage<IncomingBatch[]>('incomingBatches', mockIncomingBatches);
  const [processed] = useLocalStorage('processedBatches', mockProcessedBatches);
  const [buyers] = useLocalStorage('buyers', mockBuyers);
  const [sales] = useLocalStorage<Sale[]>('sales', mockSales);

  const activeFarmers = farmers.filter(f => f.status === 'active').length;
  const pendingBatches = batches.filter(b => b.status === 'pending').length;
  const totalSalesValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const inventoryValue = processed.filter(p => p.status === 'available').reduce((sum, p) => sum + (p.outputWeight * 400), 0);

  const recentBatches = batches.slice(0, 5);

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Overview of your cooperative operations" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Farmers"
            value={farmers.length}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Active Buyers"
            value={buyers.filter(b => b.status === 'active').length}
            icon={Building2}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Batches"
            value={pendingBatches}
            icon={Package}
            variant={pendingBatches > 3 ? 'accent' : 'default'}
          />
          <StatCard
            title="Monthly Sales"
            value={`KES ${totalSalesValue.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold font-display">Operations Overview</h3>
                <p className="text-sm text-muted-foreground">Last 6 months performance</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Incoming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Processed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span>Sales</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 45%, 25%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(152, 45%, 25%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 90%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(38, 90%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
                <XAxis dataKey="month" stroke="hsl(150, 10%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(150, 10%, 45%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(145, 15%, 88%)',
                    borderRadius: '8px',
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="incoming"
                  stroke="hsl(152, 45%, 25%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncoming)"
                />
                <Area
                  type="monotone"
                  dataKey="processed"
                  stroke="hsl(152, 60%, 40%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProcessed)"
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(38, 90%, 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold font-display mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {gradeDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Farmers"
            value={activeFarmers}
            icon={Users}
          />
          <StatCard
            title="Inventory Value"
            value={`KES ${inventoryValue.toLocaleString()}`}
            icon={Scale}
          />
          <StatCard
            title="Processed This Month"
            value={`${processed.length} batches`}
            icon={Leaf}
          />
          <StatCard
            title="Outstanding Payments"
            value={`KES ${(sales.filter(s => s.paymentStatus !== 'paid').reduce((sum, s) => sum + s.totalAmount, 0)).toLocaleString()}`}
            icon={AlertCircle}
          />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Batches */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Recent Incoming Batches</h3>
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
            <DataTable
              data={recentBatches}
              columns={[
                { key: 'id', header: 'Batch ID' },
                { key: 'farmerName', header: 'Farmer' },
                {
                  key: 'rawWeight',
                  header: 'Weight (kg)',
                  render: (item) => `${item.rawWeight} kg`,
                },
                {
                  key: 'grade',
                  header: 'Grade',
                  render: (item) => <GradeBadge grade={item.grade} />,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item) => <StatusBadge status={item.status} />,
                },
              ]}
            />
          </div>

          {/* Regional Overview */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold font-display mb-4">Regional Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
                <XAxis type="number" stroke="hsl(150, 10%, 45%)" fontSize={12} />
                <YAxis dataKey="region" type="category" stroke="hsl(150, 10%, 45%)" fontSize={12} width={60} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(145, 15%, 88%)',
                    borderRadius: '8px',
                  }} 
                />
                <Bar dataKey="volume" fill="hsl(152, 45%, 25%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
