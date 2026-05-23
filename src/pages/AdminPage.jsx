import React, { useState, useEffect } from 'react';
import { useWorkers } from '../hooks/useWorkers';
import { Upload, LogOut, Save, PieChart, Trash2, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'tadbeer2024';

const AdminPage = () => {
  const navigate = useNavigate();
  const { workers, whatsappNumber, isLoading, uploadData, updateWhatsapp, clearAllData } = useWorkers();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('tadbeer_auth') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [currentProgress, setCurrentProgress] = useState('');
  const [jsonFile, setJsonFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tempWhatsapp, setTempWhatsapp] = useState(whatsappNumber || '');

  useEffect(() => {
    document.title = `لوحة الإدارة | ${import.meta.env.VITE_OFFICE_NAME || 'تدبير بوابه الشرق مول'}`;
  }, []);

  // Synchronize tempWhatsapp ONLY on initial mount/data load, not on every render
  useEffect(() => {
    if (whatsappNumber && !tempWhatsapp) {
      setTempWhatsapp(whatsappNumber);
    }
  }, [whatsappNumber, tempWhatsapp]);

  if (isLoading && workers.length === 0) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tadbeer_auth', 'true');
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tadbeer_auth');
    navigate('/');
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العاملة؟')) {
      try {
        await deleteWorker(id);
        setUploadStatus({ success: true, message: 'تم حذف العاملة بنجاح' });
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (err) {
        setUploadStatus({ success: false, message: 'فشل حذف العاملة' });
      }
    }
  };

  const handleUpload = async () => {
    if (!jsonFile) {
      setUploadStatus({ success: false, message: 'يرجى اختيار ملف JSON أولاً' });
      return;
    }

    setIsUploading(true);
    setCurrentProgress('بدء المعالجة...');
    setUploadStatus(null);

    try {
      const result = await uploadData(jsonFile, pdfFile, (progress) => {
        setCurrentProgress(progress);
      });
      
      setUploadStatus({ 
        success: true, 
        message: (
          <div className="flex flex-col gap-1 text-right">
            <span className="text-lg font-black">✓ اكتملت العملية بنجاح</span>
            <span className="text-sm">إجمالي العاملات: {result.total}</span>
            <span className="text-sm text-green-600 font-bold">تم الرفع بنجاح: {result.success}</span>
            {result.failed > 0 && <span className="text-sm text-red-600 font-bold">فشل رفع: {result.failed}</span>}
          </div>
        )
      });
      setJsonFile(null);
      setPdfFile(null);
      setCurrentProgress('');
    } catch (err) {
      console.error('Upload catch block:', err);
      setUploadStatus({ 
        success: false, 
        message: `فشل العملية: ${err.message || 'خطأ غير معروف'}. يرجى التحقق من الكونسول للمزيد من التفاصيل.` 
      });
      setCurrentProgress('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = () => {
    updateWhatsapp(tempWhatsapp);
    setUploadStatus({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
    setTimeout(() => setUploadStatus(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">لوحة الإدارة</h1>
            <p className="text-gray-500 text-sm mt-1">يرجى إدخال كلمة المرور للمتابعة</p>
          </div>
          
          <div className="space-y-2">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent outline-none"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
          >
            تسجيل الدخول
          </button>
          
          <Link to="/" className="block text-center text-sm text-gray-400 hover:text-accent">
            العودة للموقع
          </Link>
        </form>
      </div>
    );
  }

  // Stats Breakdown
  const nationalityStats = workers.reduce((acc, w) => {
    acc[w.Nationality] = (acc[w.Nationality] || 0) + 1;
    return acc;
  }, {});

  const expStats = workers.reduce((acc, w) => {
    const key = w.Experience === 'Experienced' ? 'خبيرة' : 'مبتدئة';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-xl font-black text-primary">لوحة الإدارة</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-8 space-y-8 max-w-6xl">
        {uploadStatus && (
          <div className={`p-4 rounded-lg border flex items-center justify-between ${uploadStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="font-bold">{uploadStatus.message}</span>
            <button onClick={() => setUploadStatus(null)} className="text-sm">إغلاق</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-lg font-bold text-primary">رفع البيانات (JSON + PDF)</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* JSON Input */}
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 transition-colors relative ${jsonFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-accent'}`}>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => setJsonFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-sm font-bold text-gray-700">{jsonFile ? jsonFile.name : 'اختر ملف JSON'}</p>
                    <p className="text-[10px] text-gray-400">ملف العمالة الأساسي</p>
                  </div>

                  {/* PDF Input */}
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 transition-colors relative ${pdfFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-accent'}`}>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-sm font-bold text-gray-700">{pdfFile ? pdfFile.name : 'ملف الـ PDF (اختياري)'}</p>
                    <p className="text-[10px] text-gray-400">لاستخراج الخبرة السابقة</p>
                  </div>

                </div>

                <button 
                  onClick={handleUpload}
                  disabled={!jsonFile || isUploading}
                  className={`w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 ${!jsonFile || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-accent hover:bg-opacity-90 shadow-xl shadow-accent/20'}`}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isUploading ? 'جاري المعالجة...' : 'بدء عملية الرفع والمعالجة'}
                </button>

                {isUploading && currentProgress && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                    <p className="text-sm font-bold text-blue-700">{currentProgress}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Worker List Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-primary">إدارة العاملات ({workers.length})</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-4">الاسم</th>
                      <th className="p-4">الرقم</th>
                      <th className="p-4">الجنسية</th>
                      <th className="p-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map(worker => (
                      <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-primary">{worker.Worker_Name}</td>
                        <td className="p-4 text-gray-500 font-mono">{worker.Worker_No}</td>
                        <td className="p-4 text-gray-500">{worker.Nationality}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleDeleteWorker(worker.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {workers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-400 font-bold italic">
                          لا توجد بيانات حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* App Settings */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Save className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-primary">إعدادات الهوية والتواصل</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">المسؤول</label>
                    <input 
                      type="text" 
                      value={import.meta.env.VITE_OFFICE_MANAGER || 'عادل'}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الموقع / المكتب</label>
                    <input 
                      type="text" 
                      value={import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31'}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none text-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">رقم واتساب المكتب</label>
                  <input 
                    type="text" 
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    placeholder="+971500000000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button 
                    onClick={handleSaveSettings}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-black hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    حفظ التعديلات
                  </button>
                  <p className="text-[10px] text-gray-400 max-w-[200px] text-left leading-tight">
                    * يتم تعديل الاسم والمكتب عبر ملف <code className="bg-gray-100 px-1">.env</code> في بيئة الإنتاج.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-primary">إحصائيات فورية</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي العاملات</p>
                  <p className="text-2xl font-black text-primary">{workers.length}</p>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">آخر تحديث</p>
                  <p className="text-xs font-bold text-primary mt-2">اليوم</p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 border-b pb-2 mb-3">حسب الجنسية</h3>
                  <div className="space-y-2">
                    {Object.entries(nationalityStats).map(([nat, count]) => (
                      <div key={nat} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">{nat}</span>
                        <span className="font-bold text-primary">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-gray-400 border-b pb-2 mb-3">مستوى الخبرة</h3>
                  <div className="space-y-2">
                    {Object.entries(expStats).map(([exp, count]) => (
                      <div key={exp} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">{exp}</span>
                        <span className="font-bold text-primary">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => { if(window.confirm('هل أنت متأكد من مسح جميع البيانات؟')) clearAllData(); }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    مسح جميع البيانات
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
