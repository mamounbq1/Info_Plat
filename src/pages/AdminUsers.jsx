import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import Pagination from '../components/Pagination';
import { 
  UserPlusIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { isArabic } = useLanguage();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data state
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, active, rejected
  const [filterRole, setFilterRole] = useState('all'); // all, student, teacher, admin

  // Modal state
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Form state
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'teacher',
    subjectCode: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchSubjects();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(isArabic ? 'خطأ في تحميل المستخدمين' : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjectsQuery = query(
        collection(db, 'subjects'),
        where('enabled', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(subjectsQuery);
      const subjectsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        status: 'active',
        approvedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تمت الموافقة على المستخدم' : 'Utilisateur approuvé');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(isArabic ? 'خطأ في الموافقة' : 'Erreur lors de l\'approbation');
    }
  };

  const handleRejectUser = async (userId) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من رفض هذا المستخدم؟' : 'Êtes-vous sûr de refuser cet utilisateur?')) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          approved: false,
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم رفض المستخدم' : 'Utilisateur refusé');
        fetchUsers();
      } catch (error) {
        console.error('Error rejecting user:', error);
        toast.error(isArabic ? 'خطأ في الرفض' : 'Erreur lors du refus');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Êtes-vous sûr de supprimer cet utilisateur?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success(isArabic ? 'تم حذف المستخدم' : 'Utilisateur supprimé');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur lors de la suppression');
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error(isArabic ? 'الرجاء اختيار مستخدمين' : 'Veuillez sélectionner des utilisateurs');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(isArabic ? `حذف ${selectedUsers.length} مستخدمين؟` : `Supprimer ${selectedUsers.length} utilisateurs?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      
      for (const userId of selectedUsers) {
        if (action === 'delete') {
          await deleteDoc(doc(db, 'users', userId));
        } else if (action === 'approve') {
          await updateDoc(doc(db, 'users', userId), {
            approved: true,
            status: 'active',
            approvedAt: new Date().toISOString()
          });
        } else if (action === 'reject') {
          await updateDoc(doc(db, 'users', userId), {
            approved: false,
            status: 'rejected',
            rejectedAt: new Date().toISOString()
          });
        }
      }
      
      const actionMessages = {
        delete: isArabic ? 'تم حذف المستخدمين' : 'Utilisateurs supprimés',
        approve: isArabic ? 'تم الموافقة على المستخدمين' : 'Utilisateurs approuvés',
        reject: isArabic ? 'تم رفض المستخدمين' : 'Utilisateurs refusés'
      };
      
      toast.success(actionMessages[action]);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(isArabic ? 'خطأ في العملية' : 'Erreur dans l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    if (teacherForm.role === 'teacher' && !teacherForm.subjectCode) {
      toast.error(
        isArabic 
          ? 'يرجى اختيار المادة التي سيدرسها المعلم'
          : 'Veuillez sélectionner la matière de l\'enseignant'
      );
      return;
    }
    
    try {
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        teacherForm.email, 
        teacherForm.password
      );
      
      let subjectData = null;
      if (teacherForm.role === 'teacher' && teacherForm.subjectCode) {
        const subject = subjects.find(s => s.code === teacherForm.subjectCode);
        if (subject) {
          subjectData = {
            subjectCode: subject.code,
            subjectNameFr: subject.nameFr,
            subjectNameAr: subject.nameAr
          };
        }
      }
      
      const userProfile = {
        email: teacherForm.email,
        fullName: teacherForm.fullName,
        role: teacherForm.role,
        approved: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        progress: {},
        enrolledCourses: []
      };
      
      if (subjectData) {
        userProfile.subject = subjectData.subjectCode;
        userProfile.subjectNameFr = subjectData.subjectNameFr;
        userProfile.subjectNameAr = subjectData.subjectNameAr;
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      
      toast.success(
        isArabic 
          ? `تمت إضافة ${teacherForm.role === 'teacher' ? 'المعلم' : 'المسؤول'} بنجاح`
          : `${teacherForm.role === 'teacher' ? 'Enseignant' : 'Administrateur'} ajouté avec succès`
      );
      
      setShowAddTeacherModal(false);
      setTeacherForm({
        fullName: '',
        email: '',
        password: '',
        role: 'teacher',
        subjectCode: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      let errorMessage = isArabic ? 'خطأ في الإضافة' : 'Erreur lors de l\'ajout';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = isArabic ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email déjà utilisé';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = isArabic ? 'كلمة المرور ضعيفة جداً' : 'Mot de passe trop faible';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    rejected: users.filter(u => u.status === 'rejected').length
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isArabic ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isArabic
                    ? `${filteredUsers.length} مستخدم`
                    : `${filteredUsers.length} utilisateurs`}
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlusIcon className="w-5 h-5" />
                {isArabic ? 'إضافة معلم/مسؤول' : 'Ajouter Enseignant/Admin'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={isArabic ? 'الإجمالي' : 'Total'}
                value={stats.total}
                icon={<UserPlusIcon className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title={isArabic ? 'في الانتظار' : 'En Attente'}
                value={stats.pending}
                icon={<ClockIcon className="w-6 h-6" />}
                color="yellow"
              />
              <StatCard
                title={isArabic ? 'نشط' : 'Actifs'}
                value={stats.active}
                icon={<CheckCircleIcon className="w-6 h-6" />}
                color="green"
              />
              <StatCard
                title={isArabic ? 'مرفوض' : 'Refusés'}
                value={stats.rejected}
                icon={<XCircleIcon className="w-6 h-6" />}
                color="red"
              />
            </div>

            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {selectedUsers.length} {isArabic ? 'مستخدم محدد' : 'utilisateurs sélectionnés'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {isArabic ? 'موافقة' : 'Approuver'}
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      {isArabic ? 'رفض' : 'Refuser'}
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {isArabic ? 'حذف' : 'Supprimer'}
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                    >
                      {isArabic ? 'إلغاء' : 'Annuler'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isArabic ? 'البحث عن مستخدم...' : 'Rechercher un utilisateur...'}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{isArabic ? 'كل الحالات' : 'Tous les statuts'}</option>
                  <option value="pending">{isArabic ? 'في الانتظار' : 'En attente'}</option>
                  <option value="active">{isArabic ? 'نشط' : 'Actif'}</option>
                  <option value="rejected">{isArabic ? 'مرفوض' : 'Refusé'}</option>
                </select>

                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{isArabic ? 'كل الأدوار' : 'Tous les rôles'}</option>
                  <option value="student">{isArabic ? 'طالب' : 'Élève'}</option>
                  <option value="teacher">{isArabic ? 'معلم' : 'Enseignant'}</option>
                  <option value="admin">{isArabic ? 'مسؤول' : 'Admin'}</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {isArabic ? 'جاري التحميل...' : 'Chargement...'}
                  </p>
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlusIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'لا يوجد مستخدمون' : 'Aucun utilisateur'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'الاسم' : 'Nom'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'البريد' : 'Email'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'الدور' : 'Rôle'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'المادة' : 'Matière'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'الحالة' : 'Statut'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'التاريخ' : 'Date'}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {isArabic ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : user.role === 'teacher'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {user.role === 'admin' 
                                ? (isArabic ? 'مسؤول' : 'Admin')
                                : user.role === 'teacher'
                                ? (isArabic ? 'معلم' : 'Enseignant')
                                : (isArabic ? 'طالب' : 'Élève')
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {user.role === 'teacher' && user.subject ? (
                              <div className="flex items-center gap-1">
                                <BookOpenIcon className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {isArabic ? user.subjectNameAr : user.subjectNameFr}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({user.subject})
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">
                                {user.role === 'teacher' 
                                  ? (isArabic ? 'لا توجد مادة' : 'Aucune matière')
                                  : '-'
                                }
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : user.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {user.status === 'active'
                                ? (isArabic ? 'نشط' : 'Actif')
                                : user.status === 'pending'
                                ? (isArabic ? 'قيد المراجعة' : 'En attente')
                                : (isArabic ? 'مرفوض' : 'Refusé')
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex gap-2 justify-end">
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveUser(user.id)}
                                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                                    title={isArabic ? 'موافقة' : 'Approuver'}
                                  >
                                    <CheckCircleIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectUser(user.id)}
                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                                    title={isArabic ? 'رفض' : 'Refuser'}
                                  >
                                    <XCircleIcon className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                title={isArabic ? 'حذف' : 'Supprimer'}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && filteredUsers.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredUsers.length}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Teacher/Admin Modal */}
      {showAddTeacherModal && (
        <AddTeacherModal
          isArabic={isArabic}
          teacherForm={teacherForm}
          setTeacherForm={setTeacherForm}
          loading={loading}
          subjects={subjects}
          onSubmit={handleAddTeacher}
          onClose={() => {
            setShowAddTeacherModal(false);
            setTeacherForm({
              fullName: '',
              email: '',
              password: '',
              role: 'teacher',
              subjectCode: ''
            });
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-5 shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Add Teacher Modal Component
function AddTeacherModal({ isArabic, teacherForm, setTeacherForm, loading, subjects, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isArabic ? 'إضافة معلم أو مسؤول' : 'Ajouter Enseignant ou Admin'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الاسم الكامل' : 'Nom complet'}
            </label>
            <input
              type="text"
              value={teacherForm.fullName}
              onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'كلمة المرور' : 'Mot de passe'}
            </label>
            <input
              type="password"
              value={teacherForm.password}
              onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الدور' : 'Rôle'}
            </label>
            <select
              value={teacherForm.role}
              onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value, subjectCode: '' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="teacher">{isArabic ? 'معلم' : 'Enseignant'}</option>
              <option value="admin">{isArabic ? 'مسؤول' : 'Administrateur'}</option>
            </select>
          </div>

          {teacherForm.role === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpenIcon className="w-4 h-4 inline-block mr-1" />
                {isArabic ? 'المادة المدرسة' : 'Matière enseignée'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={teacherForm.subjectCode}
                onChange={(e) => setTeacherForm({ ...teacherForm, subjectCode: e.target.value })}
                required={teacherForm.role === 'teacher'}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {isArabic ? 'اختر المادة' : 'Sélectionner une matière'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.docId} value={subject.code}>
                    {isArabic ? subject.nameAr : subject.nameFr} ({subject.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isArabic 
                  ? 'كل معلم يجب أن يكون مرتبط بمادة واحدة فقط'
                  : 'Chaque enseignant doit être associé à une seule matière'
                }
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading 
                ? (isArabic ? 'جاري الإضافة...' : 'Ajout...')
                : (isArabic ? 'إضافة' : 'Ajouter')
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
