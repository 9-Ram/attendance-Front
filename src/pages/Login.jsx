import { useEffect, useState } from "react";
import { Lock, User, LogIn, GraduationCap, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./Subject";
import Swal from "sweetalert2";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [whoLoading, setWhoLogin] = useState(0);
  const [errors, setErrors] = useState({ username: "", password: "" });

  // ✅ Validation Function
  const validateForm = () => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    // ตรวจสอบ username
    if (!username.trim()) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
      isValid = false;
    } else if (username.length > 50) {
      newErrors.username = "ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "ชื่อผู้ใช้ต้องเป็นตัวอักษร ตัวเลข หรือ _ เท่านั้น";
      isValid = false;
    }

    // ตรวจสอบ password
    if (!password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร";
      isValid = false;
    } else if (password.length > 100) {
      newErrors.password = "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ✅ Clear error เมื่อพิมพ์
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors({ ...errors, username: "" });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
  };

  const handleLogin = async () => {
    // ✅ Validate ก่อน submit
    if (!validateForm()) {
      return Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ถูกต้อง",
        text: "กรุณาตรวจสอบข้อมูลที่กรอก",
        confirmButtonColor: "#F59E0B",
      });
    }

    setIsLoading(true);

    try {
      // Admin login
      if (username === "admin" && password === "1234") {
        const token = {
          data: { role: 3, signInDate: new Date(), username: "admin" },
        };
        localStorage.setItem("loginToken", JSON.stringify(token));

        await Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ยินดีต้อนรับ Admin",
          timer: 1500,
          showConfirmButton: false,
        });

        location.href = "/dashboard";
      } else {
        // Student/Teacher login
        const res = await axios.post(
          `${API_URL}/login`,
          { username, password },
          { params: { type: whoLoading } },
        );

        // ✅ ตรวจสอบ error จาก backend
        if (res.data.err) {
          return Swal.fire({
            icon: "error",
            title: "เข้าสู่ระบบไม่สำเร็จ",
            text: res.data.err,
            confirmButtonColor: "#EF4444",
          });
        }

        if (res.status === 200 && res.data.ok) {
          localStorage.setItem("loginToken", JSON.stringify(res.data));

          await Swal.fire({
            icon: "success",
            title: "เข้าสู่ระบบสำเร็จ",
            text: `ยินดีต้อนรับ ${res.data.data?.fullname || username}`,
            timer: 1500,
            showConfirmButton: false,
          });

          location.href =
            res.data.data?.role == 1 ? "/my-profile" : "/teacher-profile";
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      // ✅ แสดง error ที่เข้าใจง่ายขึ้น
      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

      if (error.response) {
        // Error จาก server
        if (error.response.status === 401) {
          errorMessage = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        } else if (error.response.status === 500) {
          errorMessage = "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
        } else if (error.response.data?.err) {
          errorMessage = error.response.data.err;
        }
      } else if (error.request) {
        // ไม่ได้รับ response จาก server
        errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ";
      }

      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("loginToken")?.data;
    if (token)
      location.href =
        token?.role == "3"
          ? "/dashboard"
          : token?.role == "2"
            ? "/crud/subject"
            : "/my-profile";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          ระบบเช็คชื่อเข้าเรียน
        </h2>
        <p className="text-white/70 text-center mb-8 text-sm">
          เข้าสู่ระบบเพื่อเริ่มต้นการใช้งาน
        </p>

        {/* Form */}
        <div className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="text-white font-semibold mb-2 block flex items-center gap-2">
              <User className="w-4 h-4" />
              ชื่อผู้ใช้
            </label>
            <div className="relative">
              <input
                type="text"
                className={`w-full p-3 pl-11 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 transition shadow-sm ${
                  errors.username
                    ? "ring-2 ring-red-400 focus:ring-red-500"
                    : "focus:ring-blue-400"
                }`}
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {/* ✅ แสดง Error Message */}
            {errors.username && (
              <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="text-white font-semibold mb-2 block flex items-center gap-2">
              <Lock className="w-4 h-4" />
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type="password"
                className={`w-full p-3 pl-11 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 transition shadow-sm ${
                  errors.password
                    ? "ring-2 ring-red-400 focus:ring-red-500"
                    : "focus:ring-blue-400"
                }`}
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {/* ✅ แสดง Error Message */}
            {errors.password && (
              <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-white/70 text-sm">
              ยังไม่มีบัญชี?{" "}
              <Link
                to={"register/"}
                className="text-emerald-300 hover:text-emerald-200 font-semibold underline"
              >
                ลงทะเบียน
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-white/60 text-xs mt-6">
            © {new Date().getFullYear()} ระบบเช็คชื่อเข้าเรียน - All Rights
            Reserved
          </p>
        </div>
      </div>
    </div>
  );
}