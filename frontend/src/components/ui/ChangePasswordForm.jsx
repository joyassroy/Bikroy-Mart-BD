"use client";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = form;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t.allFieldsRequired || "All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t.passwordRequirements || "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error(t.newPasswordSameAsOld || "New password must be different from the current password");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success(t.passwordChangedSuccess || "Password changed successfully");
      setForm(initialForm);
      setShow({ currentPassword: false, newPassword: false, confirmPassword: false });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        t.currentPasswordIncorrect ||
        "Failed to change password";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      name: "currentPassword",
      label: t.currentPassword || "Current Password",
      placeholder: t.currentPasswordPlaceholder || "Enter your current password",
      icon: Lock,
    },
    {
      name: "newPassword",
      label: t.newPassword || "New Password",
      placeholder: t.newPasswordPlaceholder || "At least 6 characters",
      icon: KeyRound,
    },
    {
      name: "confirmPassword",
      label: t.confirmNewPassword || "Confirm New Password",
      placeholder: t.confirmNewPasswordPlaceholder || "Re-enter your new password",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F4F7FB] flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#EC008C]/10 flex items-center justify-center">
          <KeyRound size={15} className="text-[#EC008C]" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-[#000000]">
            {t.changePassword || "Change Password"}
          </h3>
          <p className="text-[10px] text-[#667085] mt-0.5">
            {t.changePasswordDesc || "Keep your account secure by updating your password."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          const isVisible = show[field.name];
          return (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-[11px] font-semibold text-[#667085] mb-1.5"
              >
                {field.label}
              </label>
              <div className="relative">
                <Icon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                />
                <input
                  id={field.name}
                  name={field.name}
                  type={isVisible ? "text" : "password"}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.name === "currentPassword" ? "current-password" : "new-password"}
                  className="w-full border border-[#E5E7EB] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#000000] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#EC008C]/30 focus:border-[#EC008C] transition"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(field.name)}
                  aria-label={isVisible ? (t.hidePassword || "Hide password") : (t.showPassword || "Show password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#364152] transition"
                >
                  {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#EC008C] hover:bg-[#d1007d] disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <KeyRound size={14} />
          )}
          {saving ? "..." : (t.updatePassword || "Update Password")}
        </button>
      </form>
    </div>
  );
}
