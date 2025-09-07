import React, { useEffect, useMemo, useState } from "react";
import biglogo from "../assets/biglogo.png";
import logo from "../assets/logobg.png";

const LoginLayout = () => {
    const [visible, setVisible] = useState(true);

    // auth state
    const [mode, setMode] = useState("signin"); // "signin" | "signup"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showErr, setShowErr] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
    const passOk = password.length > 0;
    const passMatchOk = mode === "signin" ? true : password === confirm && password.length > 0;
    const nameOk = mode === "signin" ? true : name.trim().length > 0;

    const canSubmit = isValidEmail && passOk && passMatchOk && nameOk && !loading;

    const toggleMode = () => {
        setMode((m) => (m === "signin" ? "signup" : "signin"));
        setShowErr("");
        setPassword("");
        setConfirm("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setShowErr("");
        setLoading(true);

        const endpoint =
            mode === "signin"
                ? "https://su-perfume-api-production.up.railway.app/api/auth/login"
                : "https://su-perfume-api-production.up.railway.app/api/auth/register";

        try {
            const body =
                mode === "signin"
                    ? { email: email.trim(), password }
                    : { name: name.trim(), email: email.trim(), password, role: "USER" };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data?.message || data?.error || "Request failed.";
                throw new Error(msg);
            }

            // API возвращает { user, token }
            if (data?.token) localStorage.setItem("accessToken", data.token); // <-- сохраним токен
            if (data?.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("role", data.user.role); // <-- сохраним роль
            }

            // редирект по роли
            if (mode === "signup" && !data?.token) {
                setMode("signin");
            } else {
                const roleFromResponse = data?.user?.role || "USER";
                if (roleFromResponse === "ADMIN") {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/user";
                }
            }

        } catch (err) {
            setShowErr(err.message || "Unexpected error");
        } finally {
            setLoading(false);
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = data?.message || data?.error || "Request failed.";
            throw new Error(msg);
        }

        if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
        if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.user.role); // Сохраняем роль
        }

        // редирект по роли
        if (mode === "signup" && !data?.accessToken) {
            setMode("signin");
        } else {
            const roleFromResponse = data?.user?.role || "USER";
            if (roleFromResponse === "ADMIN") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/user";
            }
        }

    };

    return (
        <div className="relative flex justify-center items-center w-screen h-screen overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Заставка */}
            <div
                className={`fixed inset-0 z-50 w-screen h-screen bg-white flex items-center justify-center transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                aria-hidden={!visible}
            >
                <img src={biglogo} alt="logo" className="w-full h-full object-cover" />
            </div>

            {/* Карточка */}
            <div className="relative z-10 flex rounded-[10px] sm:rounded-[15px] flex-col justify-start p-4 sm:p-6 md:p-8 lg:p-[38px] w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] min-h-[400px] sm:min-h-[450px] md:min-h-[510px] bg-[#F6F6F6] shadow-sm">
                <img className="w-[60px] sm:w-[70px] md:w-[80px] self-center h-[45px] sm:h-[52px] md:h-[60px]" src={logo} alt="logo" />
                
                <div className="flex flex-col mt-4 sm:mt-5 md:mt-[20px] gap-y-2 sm:gap-y-[8px] items-start">
                    <p className="text-lg sm:text-xl md:text-[22px] font-semibold">
                        {mode === "signin" ? "Sign in" : "Sign up"}
                    </p>

                    {mode === "signin" ? (
                        <p className="text-xs sm:text-sm text-[#4b5563]">
                            If you do not have an account click{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sky-700 hover:underline cursor-pointer touch-manipulation"
                            >
                                here
                            </button>
                        </p>
                    ) : (
                        <p className="text-xs sm:text-sm text-[#4b5563]">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sky-700 hover:underline cursor-pointer touch-manipulation"
                            >
                                Sign in
                            </button>
                        </p>
                    )}
                </div>

                {showErr && (
                    <div className="mt-2 sm:mt-3 w-full rounded-md border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                        {showErr}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 sm:mt-5 md:mt-[20px] flex flex-col justify-center items-center gap-y-3 sm:gap-y-[12px]"
                >
                    {mode === "signup" && (
                        <input
                            className="w-full max-w-[300px] sm:max-w-[330px] md:max-w-[375px] h-[45px] sm:h-[48px] md:h-[50px] rounded-[8px] sm:rounded-[10px] border pl-3 sm:pl-[12px] outline-none transition focus:border-[#5433EB] border-[#DFDFDF] text-sm sm:text-base"
                            type="text"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}

                    <input
                        className={`w-full max-w-[300px] sm:max-w-[330px] md:max-w-[375px] h-[45px] sm:h-[48px] md:h-[50px] rounded-[8px] sm:rounded-[10px] border pl-3 sm:pl-[12px] outline-none transition focus:border-[#5433EB] border-[#DFDFDF] text-sm sm:text-base ${email && !isValidEmail ? "border-red-400" : ""
                            }`}
                        type="email"
                        placeholder="Enter your email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <input
                        className="w-full max-w-[300px] sm:max-w-[330px] md:max-w-[375px] h-[45px] sm:h-[48px] md:h-[50px] rounded-[8px] sm:rounded-[10px] border pl-3 sm:pl-[12px] outline-none transition focus:border-[#5433EB] border-[#DFDFDF] text-sm sm:text-base"
                        type="password"
                        placeholder={mode === "signin" ? "Enter your password..." : "Create a password..."}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        required
                    />

                    {mode === "signup" && (
                        <input
                            className={`w-full max-w-[300px] sm:max-w-[330px] md:max-w-[375px] h-[45px] sm:h-[48px] md:h-[50px] rounded-[8px] sm:rounded-[10px] border pl-3 sm:pl-[12px] outline-none transition focus:border-[#5433EB] border-[#DFDFDF] text-sm sm:text-base ${confirm && confirm !== password ? "border-red-400" : ""
                                }`}
                            type="password"
                            placeholder="Confirm password..."
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    )}

                    {mode === "signup" && confirm && confirm !== password && (
                        <div className="w-full max-w-[300px] sm:max-w-[330px] md:max-w-[375px] text-xs text-red-600">Passwords do not match.</div>
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`w-full max-w-[300px] sm:max-w-[330px] md:max-w-[375px] h-[45px] sm:h-[48px] md:h-[50px] rounded-[8px] sm:rounded-[10px] mt-2 sm:mt-[8px] text-base sm:text-lg md:text-[18px] font-medium text-white transition touch-manipulation
              ${canSubmit
                                ? "bg-[#5433EB] hover:brightness-110 active:scale-[0.98] active:ring-2 active:ring-offset-2 active:ring-[#5433EB]"
                                : "bg-[#A9A1F3] cursor-not-allowed opacity-70"
                            } flex items-center justify-center gap-2`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <span className="text-sm sm:text-base">
                                    {mode === "signin" ? "Signing in..." : "Registering..."}
                                </span>
                            </>
                        ) : mode === "signin" ? (
                            "Continue"
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginLayout;