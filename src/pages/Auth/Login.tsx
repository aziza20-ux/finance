import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.login({ email, password });
      login(user);
      navigate("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow border-0">
            <div className="card-body p-4 p-md-5">
              <div className="mb-4">
                <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Welcome back</p>
                <h1 className="h3 mb-0">Sign in to your dashboard</h1>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}

              <form onSubmit={handleSubmit}>
                <Input
                  id="login-email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="demo@finance.app"
                  autoComplete="email"
                />
                <Input
                  id="login-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password123"
                  autoComplete="current-password"
                />

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="text-body-secondary mt-3 mb-0">
                No account yet? <Link to="/register">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
