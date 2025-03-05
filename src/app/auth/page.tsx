"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import Image from "next/image";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isLoggingIn, userRole } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const demoUsers = [
    { username: "superadmin", password: "super", role: "SuperAdmin" },
    { username: "admin", password: "admin", role: "Admin" },
    { username: "agentEY", password: "agentEY", role: "AgentEY" },
    { username: "employeeEY", password: "employeeEY", role: "EmployeeEY" },
  ];

  useEffect(() => {
    if (userRole) {
      const redirectPath = userRole === "EmployeeEY" 
        ? "/EyEngage/EmployeeDashboard" 
        : "/EyEngage/SupervisorDashboard";
      router.push(redirectPath);
    }
  }, [userRole, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const user = demoUsers.find(u => 
      u.username === username.trim() && 
      u.password === password.trim()
    );

    if (user) {
      login(user.role);
    } else {
      setError("Identifiants incorrects, veuillez réessayer.");
      setPassword("");
    }
  };

  if (isLoggingIn) {
    return <SkeletonLoader />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center" 
         style={{ backgroundImage: "url('/assets/images/bg-login.jpg')" }}>
      <div className="absolute inset-0 bg-ey-black/75 backdrop-blur-sm" />

      <motion.div
        className="relative bg-ey-light-gray shadow-2xl rounded-xl p-8 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center mb-8 space-y-4">
          <Image 
            src="/assets/images/ey-logo.png" 
            alt="EY Engage Logo"
            width={140}
            height={60}
            priority
            className="h-auto"
          />
          
          <Typography variant="h4" className="text-center font-bold text-ey-white">
            Plateforme <span className="text-ey-yellow">Collaborative</span>
          </Typography>
        </div>

        <Card className="bg-ey-white/90 shadow-none">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <TextField
                  label="Nom d'utilisateur"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  inputProps={{ className: "font-medium" }}
                  required
                />

                <TextField
                  label="Mot de passe"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  inputProps={{ className: "font-medium" }}
                  required
                />
              </div>

              {error && (
                <Typography 
                  color="error" 
                  className="text-center text-sm font-medium animate-pulse"
                >
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                className="bg-ey-yellow hover:bg-ey-yellow/90 text-black font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] shadow-md"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Typography variant="body2" className="text-ey-white/80">
            Version 1.2.0 • © {new Date().getFullYear()} EY Tunisie
          </Typography>
        </div>
      </motion.div>
    </div>
  );
}