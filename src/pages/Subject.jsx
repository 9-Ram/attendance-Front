import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  BookOpen,
  Loader2,
  FileText,
  Home,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export const API_URL = import.meta.env.VITE_API;

export default function CourseCRUD() {
  // ป้องกัน error ถ้า localStorage ว่าง
  const getToken = () => {
    try {
      const tokenStr = localStorage.getItem("loginToken");
      return tokenStr ? JSON.parse(tokenStr) : null;
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  const token = getToken();

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    course_name: "",
    teacher_name: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(
        (course) =>
          String(course.course_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(course.course_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(course.teacher_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get-all-subjects`);
      const data = await response.json();
      setCourses(data.data || []);
      setFilteredCourses(data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.course_id ||
      !formData.course_name ||
      !formData.teacher_name
    ) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      setLoading(true);

      if (editingCourse) {
        const response = await fetch(
          `${API_URL}/update-subject/${editingCourse.course_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              course_name: formData.course_name,
              teacher_name: formData.teacher_name,
            }),
          }
        );

        if (response.ok) {
          alert("แก้ไขข้อมูลสำเร็จ");
          await fetchCourses();
          resetForm();
        } else {
          const errorData = await response.json();
          alert(errorData.error || "เกิดข้อผิดพลาด");
        }
      } else {
        const response = await fetch(`${API_URL}/create-subject`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("เพิ่มข้อมูลสำเร็จ");
          await fetchCourses();
          resetForm();
        } else {
          const errorData = await response.json();
          alert(errorData.error || "เกิดข้อผิดพลาด");
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      teacher_name: course.teacher_name,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("คุณต้องการลบรายวิชานี้หรือไม่?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delete-subject/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("ลบข้อมูลสำเร็จ");
        await fetchCourses();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("ไม่สามารถลบข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ course_id: "", course_name: "", teacher_name: "" });
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <Link 
          className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-blue-600 transition-colors group"
          to="/dashboard"
        >
          <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">กลับหน้าหลัก</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ระบบจัดการรายวิชา
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  จัดการข้อมูลรายวิชาและอาจารย์ผู้สอน
                </p>
              </div>
            </div>
            
            {token?.data?.role === 3 && (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 font-medium text-base"
              >
                <Plus className="w-5 h-5" />
                <span>เพิ่มรายวิชาใหม่</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="🔍 ค้นหารหัสวิชา ชื่อรายวิชา หรือชื่ออาจารย์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-base"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading && courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? "ไม่พบรายวิชาที่ค้นหา" : "ยังไม่มีรายวิชา"}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ลำดับ</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">รหัสวิชา</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ชื่อรายวิชา</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">อาจารย์ผู้สอน</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCourses.map((course, index) => (
                      <tr
                        key={course.course_id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {course.course_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {token?.data?.role === 1 ? (
                            <Link
                              to={`/check-manual/${course.course_id}/${token?.data?.student_id}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {course.course_name}
                            </Link>
                          ) : (
                            <span>{course.course_name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {course.teacher_name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {token?.data?.role === 3 ? (
                              <>
                                <button
                                  onClick={() => handleEdit(course)}
                                  disabled={loading}
                                  className="flex items-center gap-1 bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span className="text-sm">แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(course.course_id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-sm">ลบ</span>
                                </button>
                              </>
                            ) : (
                              <Link
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
                                to={`/class-detail/${course.course_id}/${token?.data?.student_id}`}
                              >
                                <FileText size={18} />
                                รายละเอียด
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-gray-200">
                {filteredCourses.map((course, index) => (
                  <div key={course.course_id} className="p-4 hover:bg-blue-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {course.course_id}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {token?.data?.role === 1 ? (
                            <Link
                              to={`/check-manual/${course.course_id}/${token?.data?.student_id}`}
                              className="hover:text-blue-600"
                            >
                              {course.course_name}
                            </Link>
                          ) : (
                            <span>{course.course_name}</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          อาจารย์: {course.teacher_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {token?.data?.role === 3 ? (
                        <>
                          <button
                            onClick={() => handleEdit(course)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1 bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(course.course_id)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            ลบ
                          </button>
                        </>
                      ) : (
                        <Link
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 text-sm"
                          to={`/class-detail/${course.course_id}/${token?.data?.student_id}`}
                        >
                          <FileText size={16} />
                          รายละเอียด
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-sm text-gray-600">
                    แสดง{" "}
                    <span className="font-semibold text-blue-600">
                      {filteredCourses.length}
                    </span>{" "}
                    {searchTerm && `จากทั้งหมด ${courses.length} `}
                    รายวิชา
                  </p>
                  <div className="text-xs text-gray-400">
                    Subject Management System
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingCourse ? "แก้ไขรายวิชา" : "เพิ่มรายวิชาใหม่"}
                </h2>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รหัสวิชา
                  </label>
                  <input
                    type="text"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    disabled={editingCourse !== null || loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="เช่น CS101"
                  />
                  {editingCourse && (
                    <p className="text-xs text-gray-500 mt-1">
                      * ไม่สามารถแก้ไขรหัสวิชาได้
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อรายวิชา
                  </label>
                  <input
                    type="text"
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="เช่น การเขียนโปรแกรมคอมพิวเตอร์"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่ออาจารย์ผู้สอน
                  </label>
                  <input
                    type="text"
                    name="teacher_name"
                    value={formData.teacher_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="เช่น อ.สมชาย ใจดี"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{editingCourse ? "บันทึก" : "เพิ่ม"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}