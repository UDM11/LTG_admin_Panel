import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockTasks = [
  { id: 1, title: 'Design System Implementation', assignedTo: 'John Doe', deadline: '2024-12-15', status: 'completed' },
  { id: 2, title: 'API Integration', assignedTo: 'Jane Smith', deadline: '2024-12-20', status: 'pending' },
  { id: 3, title: 'Database Schema Design', assignedTo: 'Mike Johnson', deadline: '2024-12-18', status: 'pending' },
  { id: 4, title: 'Testing & QA', assignedTo: 'Sarah Williams', deadline: '2024-12-10', status: 'overdue' },
  { id: 5, title: 'Documentation', assignedTo: 'Alex Brown', deadline: '2024-12-25', status: 'completed' },
];

const statusColors = {
  completed: 'success',
  pending: 'warning',
  overdue: 'destructive',
} as const;

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = mockTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track all intern tasks</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="sm:w-auto w-full">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>{task.deadline}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[task.status]}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
