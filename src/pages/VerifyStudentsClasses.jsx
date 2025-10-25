import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const VerifyStudentsClasses = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    verifyStudents();
  }, []);

  const verifyStudents = async () => {
    setLoading(true);
    setIssues([]);
    
    try {
      // 1. Fetch all classes
      const classesQuery = query(
        collection(db, 'classes'),
        where('enabled', '==', true)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classesData = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);
      
      const classCodesSet = new Set(classesData.map(c => c.code));
      console.log('📚 Classes disponibles:', Array.from(classCodesSet));

      // 2. Fetch all students
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);

      // 3. Find issues
      const foundIssues = [];
      
      studentsData.forEach(student => {
        // Issue 1: Missing class field
        if (!student.class) {
          foundIssues.push({
            type: 'missing',
            student,
            message: `Élève sans classe: ${student.email}`
          });
        }
        // Issue 2: Class doesn't exist in classes collection
        else if (!classCodesSet.has(student.class)) {
          foundIssues.push({
            type: 'invalid',
            student,
            message: `Classe invalide "${student.class}": ${student.email}`,
            class: student.class
          });
        }
      });

      setIssues(foundIssues);
      
      if (foundIssues.length === 0) {
        toast.success('✅ Tous les élèves ont des classes valides!');
      } else {
        toast.error(`⚠️ ${foundIssues.length} problème(s) détecté(s)`);
      }

    } catch (error) {
      console.error('Error verifying students:', error);
      toast.error('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const getIssueColor = (type) => {
    switch (type) {
      case 'missing': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'invalid': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'missing': return '⚠️';
      case 'invalid': return '❌';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔍 Vérification des Classes des Étudiants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page vérifie que tous les étudiants ont des classes valides
          </p>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={verifyStudents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Re-vérifier
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Étudiants</div>
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Classes Disponibles</div>
            <div className="text-3xl font-bold text-green-600">{classes.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Étudiants OK</div>
            <div className="text-3xl font-bold text-emerald-600">{students.length - issues.length}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Problèmes</div>
            <div className="text-3xl font-bold text-red-600">{issues.length}</div>
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ⚠️ Problèmes Détectés ({issues.length})
            </h2>
            
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getIssueColor(issue.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getIssueIcon(issue.type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {issue.message}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div><strong>Nom:</strong> {issue.student.fullName || 'N/A'}</div>
                        <div><strong>Email:</strong> {issue.student.email}</div>
                        <div><strong>ID:</strong> {issue.student.id}</div>
                        {issue.type === 'missing' && (
                          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                            <strong>⚠️ Classe manquante:</strong> Le champ "class" n'existe pas dans le document
                          </div>
                        )}
                        {issue.type === 'invalid' && (
                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                            <strong>❌ Classe invalide:</strong> La classe "{issue.class}" n'existe pas dans la collection "classes"
                          </div>
                        )}
                      </div>
                      
                      {/* Suggested Fix */}
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <div className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          💡 Solution Recommandée:
                        </div>
                        {issue.type === 'missing' && (
                          <div className="text-sm text-blue-800 dark:text-blue-300">
                            Ajouter un champ "class" à ce document élève dans Firestore avec l'une des classes disponibles
                          </div>
                        )}
                        {issue.type === 'invalid' && (
                          <div className="text-sm text-blue-800 dark:text-blue-300">
                            Option 1: Créer la classe "{issue.class}" dans la collection "classes"<br/>
                            Option 2: Mettre à jour le champ "class" de l'élève avec une classe existante
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tout est OK !
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tous les étudiants ont des classes valides
            </p>
          </div>
        )}

        {/* Available Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Classes Disponibles ({classes.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((classItem, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="font-semibold text-blue-900 dark:text-blue-200">
                  {classItem.code}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {classItem.nameFr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            👥 Tous les Étudiants ({students.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Classe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => {
                  const hasIssue = issues.find(i => i.student.id === student.id);
                  const classExists = classes.find(c => c.code === student.class);
                  
                  return (
                    <tr key={student.id} className={hasIssue ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {student.fullName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.class ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            classExists
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {student.class}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">Non défini</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {hasIssue ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {hasIssue.type === 'missing' ? '⚠️ Manquante' : '❌ Invalide'}
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            ✅ OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyStudentsClasses;
