import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { certificateService, Certificate } from '@/services/backendless';
import { 
  Search, 
  Plus, 
  Download, 
  Eye,
  Award, 
  Calendar, 
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  FileText,
  Users,
  Upload,
  X,
  Send,
  Star,
  TrendingUp,
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building
} from 'lucide-react';



interface CertificateFormData {
  internName: string;
  internEmail: string;
  internPhone: string;
  courseName: string;
  courseCategory: string;
  completionScore: number;
  instructor: string;
  department: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  uploadedFile: File | null;
}



const COURSE_CATEGORIES = ['Web Development', 'Design', 'Analytics', 'Mobile Development', 'DevOps', 'Cybersecurity'];
const DEPARTMENTS = ['Computer Science', 'Design', 'Data Science', 'Engineering', 'Business'];
const INSTRUCTORS = ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Emily Rodriguez', 'Prof. David Wilson'];

export default function Certificates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'pending' | 'revoked' | 'expired'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [deletingCertificate, setDeletingCertificate] = useState<Certificate | null>(null);
  const [rejectingCertificate, setRejectingCertificate] = useState<Certificate | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [newCertificate, setNewCertificate] = useState<CertificateFormData>({
    internName: '',
    internEmail: '',
    internPhone: '',
    courseName: '',
    courseCategory: '',
    completionScore: 0,
    instructor: '',
    department: '',
    notes: '',
    priority: 'medium',
    description: '',
    uploadedFile: null
  });

  // Load certificates from Backendless
  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        const data = await certificateService.getAllCertificates();
        setCertificates(data);
      } catch (error) {
        console.error('Failed to load certificates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  // Modal management
  useEffect(() => {
    const hasModal = showIssueModal || showEditModal || showViewModal || showDeleteModal || showUpdateModal || showRejectModal;
    document.body.style.overflow = hasModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showIssueModal, showEditModal, showViewModal, showDeleteModal, showUpdateModal, showRejectModal]);

  // Advanced filtering and sorting
  const filteredAndSortedCertificates = useMemo(() => {
    let filtered = certificates.filter(cert => {
      const matchesSearch = [cert.internName, cert.courseName, cert.certificateId, cert.instructor]
        .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || cert.courseCategory === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || cert.priority === priorityFilter;

      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
          break;
        case 'name':
          comparison = a.internName.localeCompare(b.internName);
          break;
        case 'score':
          comparison = a.completionScore - b.completionScore;
          break;

      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [certificates, searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  // Advanced statistics
  const stats = useMemo(() => {
    const total = certificates.length;
    const issued = certificates.filter(c => c.status === 'issued').length;
    const pending = certificates.filter(c => c.status === 'pending').length;
    const revoked = certificates.filter(c => c.status === 'revoked').length;
    const expired = certificates.filter(c => c.status === 'expired').length;
    const thisMonth = certificates.filter(c => 
      new Date(c.issueDate).getMonth() === new Date().getMonth() &&
      new Date(c.issueDate).getFullYear() === new Date().getFullYear()
    ).length;
    const avgScore = certificates.reduce((sum, c) => sum + c.completionScore, 0) / total || 0;

    const highPriority = certificates.filter(c => c.priority === 'high').length;

    return { total, issued, pending, revoked, expired, thisMonth, avgScore, highPriority };
  }, [certificates]);

  // Utility functions
  const generateCertificateId = useCallback(() => {
    const year = new Date().getFullYear();
    const nextNumber = certificates.length + 1;
    return `LTG-${year}-${String(nextNumber).padStart(3, '0')}`;
  }, [certificates.length]);

  const generateVerificationCode = useCallback(() => {
    return `VER-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${new Date().getFullYear()}`;
  }, []);

  const calculateGrade = useCallback((score: number): Certificate['grade'] => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 77) return 'C+';
    if (score >= 70) return 'C';
    return 'F';
  }, []);

  // Event handlers
  const handleIssueCertificate = useCallback(async () => {
    if (!newCertificate.internName || !newCertificate.courseName || newCertificate.completionScore <= 0) return;

    try {
      setIsCreating(true);
      const certificate = {
        ...newCertificate,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending' as const,
        certificateId: generateCertificateId(),
        grade: calculateGrade(newCertificate.completionScore),
        verificationCode: generateVerificationCode(),
      };

      const savedCertificate = await certificateService.createCertificate(certificate, newCertificate.uploadedFile || undefined);
      setCertificates(prev => [...prev, savedCertificate]);
      setNewCertificate({
        internName: '', internEmail: '', internPhone: '', courseName: '', courseCategory: '',
        completionScore: 0, instructor: '', department: '', notes: '',
        priority: 'medium', description: '', uploadedFile: null
      });
      setShowIssueModal(false);
    } catch (error) {
      console.error('Failed to create certificate:', error);
    } finally {
      setIsCreating(false);
    }
  }, [newCertificate, generateCertificateId, generateVerificationCode, calculateGrade]);

  const handleEditCertificate = useCallback((certificate: Certificate) => {
    setEditingCertificate(certificate);
    setShowEditModal(true);
  }, []);

  const handleViewCertificate = useCallback((certificate: Certificate) => {
    setViewingCertificate(certificate);
    setShowViewModal(true);
  }, []);

  const handleUpdateClick = useCallback(() => {
    setShowUpdateModal(true);
  }, []);

  const handleConfirmUpdate = useCallback(async () => {
    if (!editingCertificate) return;
    
    try {
      const updatedCertificate = { ...editingCertificate, grade: calculateGrade(editingCertificate.completionScore) };
      await certificateService.updateCertificate(updatedCertificate);
      setCertificates(prev => prev.map(cert => 
        cert.objectId === editingCertificate.objectId ? updatedCertificate : cert
      ));
      setShowUpdateModal(false);
      setShowEditModal(false);
      setEditingCertificate(null);
    } catch (error) {
      console.error('Failed to update certificate:', error);
    }
  }, [editingCertificate, calculateGrade]);

  const handleUpdateCertificate = useCallback(() => {
    if (!editingCertificate) return;
    
    setCertificates(prev => prev.map(cert => 
      cert.id === editingCertificate.id 
        ? { ...editingCertificate, grade: calculateGrade(editingCertificate.completionScore) }
        : cert
    ));
    setShowEditModal(false);
    setEditingCertificate(null);
  }, [editingCertificate, calculateGrade]);

  const handleDownload = useCallback((certificate: Certificate) => {
    const content = `
Certificate of Completion
${certificate.certificateId}

This certifies that ${certificate.internName} has successfully completed
${certificate.courseName} with a score of ${certificate.completionScore}%

Grade: ${certificate.grade}
Instructor: ${certificate.instructor}
Department: ${certificate.department}
Issue Date: ${new Date(certificate.issueDate).toLocaleDateString()}
Verification Code: ${certificate.verificationCode}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificate.certificateId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleRejectClick = useCallback((certificate: Certificate) => {
    setRejectingCertificate(certificate);
    setShowRejectModal(true);
  }, []);

  const handleConfirmReject = useCallback(async () => {
    if (rejectingCertificate) {
      try {
        const updatedCert = { ...rejectingCertificate, status: 'revoked' as const };
        await certificateService.updateCertificate(updatedCert);
        setCertificates(prev => prev.map(cert => 
          cert.objectId === rejectingCertificate.objectId ? updatedCert : cert
        ));
        setShowRejectModal(false);
        setRejectingCertificate(null);
      } catch (error) {
        console.error('Failed to reject certificate:', error);
      }
    }
  }, [rejectingCertificate]);

  const handleStatusChange = useCallback(async (objectId: string, newStatus: Certificate['status']) => {
    try {
      const cert = certificates.find(c => c.objectId === objectId);
      if (cert) {
        const updatedCert = { ...cert, status: newStatus };
        await certificateService.updateCertificate(updatedCert);
        setCertificates(prev => prev.map(c => 
          c.objectId === objectId ? updatedCert : c
        ));
      }
    } catch (error) {
      console.error('Failed to update certificate status:', error);
    }
  }, [certificates]);

  const handleDeleteClick = useCallback((certificate: Certificate) => {
    setDeletingCertificate(certificate);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingCertificate && deletingCertificate.objectId) {
      try {
        await certificateService.deleteCertificate(deletingCertificate.objectId);
        setCertificates(prev => prev.filter(cert => cert.objectId !== deletingCertificate.objectId));
        setShowDeleteModal(false);
        setDeletingCertificate(null);
      } catch (error) {
        console.error('Failed to delete certificate:', error);
      }
    }
  }, [deletingCertificate]);

  const handleDelete = useCallback((id: string) => {
    setCertificates(prev => prev.filter(cert => cert.id !== id));
  }, []);

  const handleBulkAction = useCallback((action: 'approve' | 'revoke' | 'delete', selectedIds: string[]) => {
    if (action === 'delete') {
      setCertificates(prev => prev.filter(cert => !selectedIds.includes(cert.id)));
    } else {
      const status = action === 'approve' ? 'issued' : 'revoked';
      setCertificates(prev => prev.map(cert => 
        selectedIds.includes(cert.id) ? { ...cert, status } : cert
      ));
    }
  }, []);

  const addSkill = useCallback((skill: string) => {
    if (skill && !newCertificate.skills.includes(skill)) {
      setNewCertificate(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  }, [newCertificate.skills]);

  const removeSkill = useCallback((skillToRemove: string) => {
    setNewCertificate(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(skill => skill !== skillToRemove) 
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSelectedSkill('');
  }, []);

  // UI Helper functions
  const getStatusIcon = (status: Certificate['status']) => {
    const icons = {
      issued: <CheckCircle className="h-4 w-4" />,
      pending: <Clock className="h-4 w-4" />,
      revoked: <XCircle className="h-4 w-4" />,
      expired: <AlertCircle className="h-4 w-4" />
    };
    return icons[status];
  };

  const getStatusColor = (status: Certificate['status']) => {
    const colors = {
      issued: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Certificate['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    return colors[priority];
  };

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Certificate Management System</h1>
            <p className="text-muted-foreground">Advanced certificate lifecycle management with analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowIssueModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </div>
        </div>

        {/* Advanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Certificates', value: stats.total, icon: FileText, color: 'text-blue-600', trend: '+12%' },
            { title: 'Issued', value: stats.issued, icon: CheckCircle, color: 'text-green-600', trend: '+8%' },
            { title: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-600', trend: '-3%' },
            { title: 'Average Score', value: `${stats.avgScore.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', trend: '+2.1%' }
          ].map((stat, index) => (
            <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Advanced Filters */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search certificates, names, instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full sm:w-auto px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="issued">Issued</option>
                  <option value="pending">Pending</option>
                  <option value="revoked">Revoked</option>
                  <option value="expired">Expired</option>
                </select>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {COURSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="w-full sm:w-auto px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
              {['date', 'name', 'score'].map(sort => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (sortBy === sort) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(sort as any);
                      setSortOrder('desc');
                    }
                  }}
                  className="capitalize text-xs sm:text-sm"
                >
                  {sort} {sortBy === sort && (sortOrder === 'desc' ? '↓' : '↑')}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Enhanced Certificates Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedCertificates.map((certificate) => (
            <Card key={certificate.id} className="p-4 sm:p-6 hover:shadow-xl transition-all group">
              <div className="space-y-4">
                {/* Enhanced Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{certificate.internName}</h3>
                      <Badge className={`${getPriorityColor(certificate.priority)} text-xs`}>
                        {certificate.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{certificate.courseName}</p>
                    <p className="text-xs text-muted-foreground">{certificate.courseCategory}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCertificate(certificate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(certificate)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{certificate.certificateId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(certificate.status)} flex items-center gap-1`}>
                      {getStatusIcon(certificate.status)}
                      {certificate.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Grade: {certificate.grade}</p>
                      <p className="font-semibold">{certificate.completionScore}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{certificate.internEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{certificate.internPhone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{certificate.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{certificate.department}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:col-span-2">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{new Date(certificate.issueDate).toLocaleDateString()}</span>
                    </div>
                  </div>


                </div>

                {/* Enhanced Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewCertificate(certificate)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => handleDownload(certificate)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>

                {certificate.status === 'pending' && (
                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" 
                      onClick={() => handleStatusChange(certificate.objectId!, 'issued')}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1"
                      onClick={() => handleRejectClick(certificate)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          </div>
        )}

        {/* Enhanced Empty State */}
        {filteredAndSortedCertificates.length === 0 && (
          <Card className="p-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No certificates found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No certificates match your current filters. Try adjusting your search criteria.'
                : 'Get started by issuing your first certificate to an intern.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => setShowIssueModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Issue Certificate
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowIssueModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-slate-900 dark:to-slate-800 rounded-xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 mb-6 relative">
                <div className="flex items-center space-x-4 pr-12">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Issue New Certificate</h2>
                    <p className="text-green-100 text-sm">Create and issue a professional certificate for intern completion</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowIssueModal(false)} 
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-[70vh] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-green-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Intern Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                        <Input
                          placeholder="Enter intern's full name"
                          value={newCertificate.internName}
                          onChange={(e) => setNewCertificate({...newCertificate, internName: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={newCertificate.internEmail}
                          onChange={(e) => setNewCertificate({...newCertificate, internEmail: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <Input
                          placeholder="Enter phone number"
                          value={newCertificate.internPhone}
                          onChange={(e) => setNewCertificate({...newCertificate, internPhone: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Information Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-emerald-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Course Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Name *</label>
                        <Input
                          placeholder="Enter course name"
                          value={newCertificate.courseName}
                          onChange={(e) => setNewCertificate({...newCertificate, courseName: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Category</label>
                        <select 
                          value={newCertificate.courseCategory} 
                          onChange={(e) => setNewCertificate({...newCertificate, courseCategory: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select Category</option>
                          {COURSE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
                        <select 
                          value={newCertificate.instructor} 
                          onChange={(e) => setNewCertificate({...newCertificate, instructor: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select Instructor</option>
                          {INSTRUCTORS.map(inst => (
                            <option key={inst} value={inst}>{inst}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance & Settings Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Performance</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Score *</label>
                        <Input
                          type="number"
                          placeholder="Enter score (0-100)"
                          min="0"
                          max="100"
                          value={newCertificate.completionScore || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const clampedValue = Math.min(Math.max(value, 0), 100);
                            setNewCertificate({...newCertificate, completionScore: clampedValue});
                          }}
                          className="border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Calculated Grade</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {newCertificate.completionScore ? calculateGrade(newCertificate.completionScore) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-purple-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                        <select 
                          value={newCertificate.department} 
                          onChange={(e) => setNewCertificate({...newCertificate, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority Level</label>
                        <select 
                          value={newCertificate.priority} 
                          onChange={(e) => setNewCertificate({...newCertificate, priority: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* File Upload Section */}
                <div className="col-span-full mt-8">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certificate Document</h3>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        id="certificate-upload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewCertificate({...newCertificate, uploadedFile: file});
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="certificate-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Certificate Document</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Drag and drop or click to select files
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                        </p>
                      </label>
                      {newCertificate.uploadedFile && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Selected: {newCertificate.uploadedFile.name}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Size: {(newCertificate.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="bg-gray-50 dark:bg-slate-800/50 -m-4 mt-2 p-7 rounded-b-lg">
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowIssueModal(false)} 
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleIssueCertificate} 
                    disabled={isCreating}
                    className="px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Issue Certificate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Certificate Modal */}
      {showEditModal && editingCertificate && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-slate-900 dark:to-slate-800 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 mb-6 relative">
                <div className="flex items-center space-x-4 pr-12">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Edit className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Edit Certificate</h2>
                    <p className="text-orange-100 text-sm">Modify certificate details for {editingCertificate.internName}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {editingCertificate.certificateId}
                      </Badge>
                      <Badge className={`${getStatusColor(editingCertificate.status)} text-xs`}>
                        {editingCertificate.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowEditModal(false)} 
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-[70vh] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-orange-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Info</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                        <Input
                          placeholder="Full Name"
                          value={editingCertificate.internName}
                          onChange={(e) => setEditingCertificate({...editingCertificate, internName: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={editingCertificate.internEmail}
                          onChange={(e) => setEditingCertificate({...editingCertificate, internEmail: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <Input
                          placeholder="Phone Number"
                          value={editingCertificate.internPhone}
                          onChange={(e) => setEditingCertificate({...editingCertificate, internPhone: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-amber-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Name *</label>
                        <Input
                          placeholder="Course Name"
                          value={editingCertificate.courseName}
                          onChange={(e) => setEditingCertificate({...editingCertificate, courseName: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select 
                          value={editingCertificate.courseCategory} 
                          onChange={(e) => setEditingCertificate({...editingCertificate, courseCategory: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="">Select Category</option>
                          {COURSE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
                        <select 
                          value={editingCertificate.instructor} 
                          onChange={(e) => setEditingCertificate({...editingCertificate, instructor: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="">Select Instructor</option>
                          {INSTRUCTORS.map(inst => (
                            <option key={inst} value={inst}>{inst}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                        <select 
                          value={editingCertificate.department} 
                          onChange={(e) => setEditingCertificate({...editingCertificate, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Performance & Settings */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-red-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Score *</label>
                        <Input
                          type="number"
                          placeholder="Score (0-100)"
                          min="0"
                          max="100"
                          value={editingCertificate.completionScore}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const clampedValue = Math.min(Math.max(value, 0), 100);
                            setEditingCertificate({...editingCertificate, completionScore: clampedValue});
                          }}
                          className="border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority Level</label>
                        <select 
                          value={editingCertificate.priority} 
                          onChange={(e) => setEditingCertificate({...editingCertificate, priority: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Current Grade</p>
                          <p className="text-3xl font-bold text-red-600">
                            {calculateGrade(editingCertificate.completionScore)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p><strong>Certificate ID:</strong> {editingCertificate.certificateId}</p>
                          <p><strong>Verification:</strong> {editingCertificate.verificationCode}</p>
                          <p><strong>Issue Date:</strong> {new Date(editingCertificate.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              <div className="bg-gray-50 dark:bg-slate-800/50 -m-6 mt-6 p-10 rounded-b-lg">
                <div className="flex justify-between w-full">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => setShowEditModal(false)} className="px-6">
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateClick} className="px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Certificate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Certificate Modal */}
      {showViewModal && viewingCertificate && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowViewModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Certificate Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowViewModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Certificate Header */}
                <div className="text-center border-b pb-6">
                  <h3 className="text-xl font-bold mb-2">Certificate of Completion</h3>
                  <p className="text-lg text-muted-foreground">{viewingCertificate.certificateId}</p>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg font-semibold">{viewingCertificate.internName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{viewingCertificate.internEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg">{viewingCertificate.internPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={`${getStatusColor(viewingCertificate.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(viewingCertificate.status)}
                      {viewingCertificate.status}
                    </Badge>
                  </div>
                </div>

                {/* Course Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Course Name</label>
                    <p className="text-lg font-semibold">{viewingCertificate.courseName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-lg">{viewingCertificate.courseCategory}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Instructor</label>
                    <p className="text-lg">{viewingCertificate.instructor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-lg">{viewingCertificate.department}</p>
                  </div>
                </div>

                {/* Performance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completion Score</label>
                    <p className="text-2xl font-bold text-primary">{viewingCertificate.completionScore}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Grade</label>
                    <p className="text-2xl font-bold text-primary">{viewingCertificate.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <Badge className={`${getPriorityColor(viewingCertificate.priority)} w-fit capitalize`}>
                      {viewingCertificate.priority}
                    </Badge>
                  </div>
                </div>

                {/* Dates and Verification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                    <p className="text-lg">{new Date(viewingCertificate.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                    <p className="text-lg">{new Date(viewingCertificate.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Verification Code</label>
                    <p className="text-lg font-mono bg-muted px-3 py-2 rounded">{viewingCertificate.verificationCode}</p>
                  </div>
                </div>

                {/* Notes */}
                {viewingCertificate.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-lg bg-muted p-3 rounded">{viewingCertificate.notes}</p>
                  </div>
                )}

                {/* Certificate Document */}
                {viewingCertificate.documentUrl && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Certificate Document</label>
                    <div className="mt-2 p-4 border border-border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Certificate File</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(viewingCertificate.documentUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = viewingCertificate.documentUrl!;
                              link.download = `${viewingCertificate.certificateId}_certificate`;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                <Button onClick={() => handleDownload(viewingCertificate)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="outline" onClick={() => setShowViewModal(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCertificate && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Delete Certificate</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to delete this certificate for <strong>{deletingCertificate.internName}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingCertificate(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDelete}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Update Confirmation Modal */}
      {showUpdateModal && editingCertificate && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Update Certificate</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to update this certificate for <strong>{editingCertificate.internName}</strong>?
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmUpdate}
                    className="flex-1"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && rejectingCertificate && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reject Certificate</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to reject this certificate for <strong>{rejectingCertificate.internName}</strong>?
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectingCertificate(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmReject}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}