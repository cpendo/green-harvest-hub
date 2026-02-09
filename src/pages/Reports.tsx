import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  mockFarmers, 
  mockIncomingBatches, 
  mockProcessedBatches, 
  mockBuyers, 
  mockSales 
} from '@/lib/mockData';
import { Farmer, IncomingBatch, ProcessedBatch, Buyer, Sale } from '@/types';

const monthlyTrend = [
  { month: 'Aug', revenue: 180000, cost: 120000 },
  { month: 'Sep', revenue: 220000, cost: 145000 },
  { month: 'Oct', revenue: 280000, cost: 180000 },
  { month: 'Nov', revenue: 250000, cost: 165000 },
  { month: 'Dec', revenue: 320000, cost: 210000 },
  { month: 'Jan', revenue: 360000, cost: 235000 },
];

export function Reports() {
  const [farmers] = useLocalStorage<Farmer[]>('farmers', mockFarmers);
  const [batches] = useLocalStorage<IncomingBatch[]>('incomingBatches', mockIncomingBatches);
  const [processed] = useLocalStorage<ProcessedBatch[]>('processedBatches', mockProcessedBatches);
  const [buyers] = useLocalStorage<Buyer[]>('buyers', mockBuyers);
  const [sales] = useLocalStorage<Sale[]>('sales', mockSales);

  // Calculate farmer contribution
  const farmerContribution = farmers
    .filter(f => f.totalDelivered > 0)
    .map(f => ({
      name: f.name.split(' ')[0],
      delivered: f.totalDelivered,
      balance: f.balance,
    }))
    .sort((a, b) => b.delivered - a.delivered)
    .slice(0, 5);

  // Grade distribution
  const gradeCount = batches.reduce((acc, b) => {
    acc[b.grade] = (acc[b.grade] || 0) + b.rawWeight;
    return acc;
  }, {} as Record<string, number>);

  const gradeData = [
    { name: 'Grade A', value: gradeCount['A'] || 0, color: 'hsl(152, 60%, 40%)' },
    { name: 'Grade B', value: gradeCount['B'] || 0, color: 'hsl(152, 45%, 25%)' },
    { name: 'Grade C', value: gradeCount['C'] || 0, color: 'hsl(38, 90%, 50%)' },
  ];

  // Output preference distribution
  const preferenceData = [
    { 
      name: 'Coop Sells', 
      value: farmers.filter(f => f.outputPreference === 'coop-sell').length,
      color: 'hsl(152, 45%, 25%)',
    },
    { 
      name: 'Self Collect', 
      value: farmers.filter(f => f.outputPreference === 'self-collect').length,
      color: 'hsl(38, 90%, 50%)',
    },
  ];

  // Processing efficiency
  const efficiencyData = processed.map(p => ({
    batch: p.id.slice(-4),
    efficiency: 100 - p.processingLoss,
    quality: p.qualityScore,
  }));

  // Buyer activity
  const buyerActivity = buyers.map(b => ({
    name: b.companyName.split(' ')[0],
    purchases: b.totalPurchases / 1000,
  }));

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = batches.reduce((sum, b) => sum + b.totalAmount, 0);
  const grossMargin = totalRevenue - totalCost;

  return (
    <div className="min-h-screen">
      <Header 
        title="Reports & Analytics" 
        subtitle="Comprehensive cooperative performance insights" 
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card bg-primary text-primary-foreground">
            <p className="text-sm opacity-80">Total Revenue</p>
            <p className="text-2xl font-bold font-display">KES {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Costs</p>
            <p className="text-2xl font-bold font-display">KES {totalCost.toLocaleString()}</p>
          </div>
          <div className="stat-card bg-success text-success-foreground">
            <p className="text-sm opacity-80">Gross Margin</p>
            <p className="text-2xl font-bold font-display">KES {grossMargin.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Margin %</p>
            <p className="text-2xl font-bold font-display">
              {totalRevenue > 0 ? Math.round((grossMargin / totalRevenue) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Revenue vs Cost Trend */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold font-display mb-4">Revenue vs Cost Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(150, 10%, 45%)" fontSize={12} />
              <YAxis stroke="hsl(150, 10%, 45%)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip 
                formatter={(value: number) => `KES ${value.toLocaleString()}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)', 
                  border: '1px solid hsl(145, 15%, 88%)',
                  borderRadius: '8px',
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(152, 60%, 40%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(152, 60%, 40%)' }}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="hsl(38, 90%, 50%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(38, 90%, 50%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span>Cost</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Farmer Contribution */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold font-display mb-4">Top Farmers by Delivery</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={farmerContribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
                <XAxis type="number" stroke="hsl(150, 10%, 45%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(150, 10%, 45%)" fontSize={12} width={60} />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()} kg`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(145, 15%, 88%)',
                    borderRadius: '8px',
                  }} 
                />
                <Bar dataKey="delivered" fill="hsl(152, 45%, 25%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold font-display mb-4">Tea Grade Distribution</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} kg`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {gradeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.value.toLocaleString()} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Processing Efficiency */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold font-display mb-4">Processing Efficiency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
                <XAxis dataKey="batch" stroke="hsl(150, 10%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(150, 10%, 45%)" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    [`${value}%`, name === 'efficiency' ? 'Efficiency' : 'Quality']
                  }
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(145, 15%, 88%)',
                    borderRadius: '8px',
                  }} 
                />
                <Bar dataKey="efficiency" fill="hsl(152, 45%, 25%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quality" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Efficiency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success" />
                <span>Quality</span>
              </div>
            </div>
          </div>

          {/* Output Preference */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold font-display mb-4">Farmer Output Preference</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={preferenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {preferenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {preferenceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.value} farmers</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Activity */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold font-display mb-4">Buyer Purchase Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={buyerActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
              <XAxis dataKey="name" stroke="hsl(150, 10%, 45%)" fontSize={12} />
              <YAxis stroke="hsl(150, 10%, 45%)" fontSize={12} tickFormatter={(v) => `${v}k`} />
              <Tooltip 
                formatter={(value: number) => `KES ${(value * 1000).toLocaleString()}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)', 
                  border: '1px solid hsl(145, 15%, 88%)',
                  borderRadius: '8px',
                }} 
              />
              <Bar dataKey="purchases" fill="hsl(38, 90%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Reports;
