import { Users, ListTodo, FileCheck, Award } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const taskData = [
  { name: 'Mon', completed: 12, pending: 5 },
  { name: 'Tue', completed: 19, pending: 8 },
  { name: 'Wed', completed: 15, pending: 6 },
  { name: 'Thu', completed: 22, pending: 4 },
  { name: 'Fri', completed: 18, pending: 7 },
  { name: 'Sat', completed: 10, pending: 3 },
  { name: 'Sun', completed: 8, pending: 2 },
];

const activityData = [
  { name: 'Week 1', interns: 45 },
  { name: 'Week 2', interns: 52 },
  { name: 'Week 3', interns: 48 },
  { name: 'Week 4', interns: 61 },
];

const certificateData = [
  { name: 'Issued', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Pending', value: 23, color: 'hsl(var(--chart-2))' },
  { name: 'Expired', value: 8, color: 'hsl(var(--chart-3))' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your admin panel.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Interns"
          value={156}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="primary"
        />
        <StatsCard
          title="Active Tasks"
          value={89}
          icon={ListTodo}
          trend={{ value: 8, isPositive: true }}
          color="warning"
        />
        <StatsCard
          title="Submissions"
          value={234}
          icon={FileCheck}
          trend={{ value: 5, isPositive: false }}
          color="success"
        />
        <StatsCard
          title="Certificates Issued"
          value={76}
          icon={Award}
          trend={{ value: 15, isPositive: true }}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="hsl(var(--chart-1))" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--chart-3))" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Intern Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="interns" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Active Interns" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={certificateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {certificateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'John Doe', action: 'submitted a task', time: '5 min ago' },
                { user: 'Jane Smith', action: 'received certificate', time: '1 hour ago' },
                { user: 'Mike Johnson', action: 'started new task', time: '2 hours ago' },
                { user: 'Sarah Williams', action: 'completed internship', time: '3 hours ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
