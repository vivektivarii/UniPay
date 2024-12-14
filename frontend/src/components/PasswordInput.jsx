import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export function PasswordInput({ label, placeholder, onChange }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <div className="text-sm font-medium text-left py-2">
                {label}
            </div>
            <div className="relative">
                <input 
                    type={showPassword ? "text" : "password"}
                    onChange={onChange} 
                    placeholder={placeholder} 
                    className="w-full px-2 py-1 border rounded border-slate-200 pr-10" // Added pr-10 for icon space
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
            </div>
        </div>
    );
} 