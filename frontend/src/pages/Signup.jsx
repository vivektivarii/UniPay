import { useState } from "react"
import { BottomWarning } from "../components/BottomWarning"
import { Buttonlogin } from "../components/Buttonlogin"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"
import { PasswordInput } from "../components/PasswordInput"
import axios from "axios";
import { useNavigate } from "react-router-dom"

export const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!firstName.trim()) {
            newErrors.firstName = "First name is required";
        }
        
        if (!lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }
        
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

    const handleSignUp = async () => {
        if (!validateForm()) return;

        try {
            const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
                username,
                firstName,
                lastName,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/home");
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || "Sign up failed. Please try again."
            });
        }
    };

    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <Heading label={"Sign up"} />
                <SubHeading label={"Enter your information to create an account"} />
                
                <div className="mb-4">
                    <InputBox
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="John"
                        label={"First Name"}
                    />
                    {errors.firstName && (
                        <p className="text-red-500 text-xs text-left mt-1">{errors.firstName}</p>
                    )}
                </div>

                <div className="mb-4">
                    <InputBox
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Doe"
                        label={"Last Name"}
                    />
                    {errors.lastName && (
                        <p className="text-red-500 text-xs text-left mt-1">{errors.lastName}</p>
                    )}
                </div>

                <div className="mb-4">
                    <InputBox
                        onChange={e => setUsername(e.target.value)}
                        placeholder="example@gmail.com"
                        label={"Email"}
                    />
                    {errors.username && (
                        <p className="text-red-500 text-xs text-left mt-1">{errors.username}</p>
                    )}
                </div>

                <div className="mb-4">
                    <PasswordInput
                        onChange={e => setPassword(e.target.value)}
                        placeholder="123456"
                        label={"Password"}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs text-left mt-1">{errors.password}</p>
                    )}
                </div>

                {errors.submit && (
                    <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
                )}

                <div className="pt-4">
                    <Buttonlogin onClick={handleSignUp} label={"Sign up"} />
                </div>
                <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
            </div>
        </div>
    </div>
}