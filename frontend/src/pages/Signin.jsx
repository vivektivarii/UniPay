import { BottomWarning } from "../components/BottomWarning"
import { Buttonlogin } from "../components/Buttonlogin"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"
import { PasswordInput } from "../components/PasswordInput"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export const Signin = () => {

    const [username, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!username.trim()) {
            newErrors.username = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(username)) {
            newErrors.username = "Please enter a valid email";
        }
        
        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async () => {
        if (!validateForm()) return;

        try {
            const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
                username,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/home");
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || "Sign in failed. Please try again."
            });
        }
    };

    return <div className="bg-slate-300 h-screen flex justify-center">
    <div className="flex flex-col justify-center">
      <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
        <Heading label={"Sign in"} />
        <SubHeading label={"Enter your credentials to access your account"} />
        <div className="mb-4">
            <InputBox 
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com" 
                label={"Email"}
            />
            {errors.username && (
                <p className="text-red-500 text-xs text-left mt-1">{errors.username}</p>
            )}
        </div>

        <div className="mb-4">
            <PasswordInput
                label={"Password"}
                onChange={e => setPassword(e.target.value)}
                placeholder="123456"
            />
            {errors.password && (
                <p className="text-red-500 text-xs text-left mt-1">{errors.password}</p>
            )}
        </div>

        {errors.submit && (
            <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
        )}

        <div className="pt-4">
          <Buttonlogin onClick={handleSignIn} label={"Sign in"} />
        </div>
        <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
      </div>
    </div>
  </div>
}