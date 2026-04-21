import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.register({ fullName, email, password });
      login(user);
      navigate("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create account.");
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
                <p className="text-body-secondary text-uppercase small fw-semibold mb-1">Create account</p>
                <h1 className="h3 mb-0">Start tracking your finances</h1>
              </div>

              {error ? <div className="alert alert-danger">{error}</div> : null}

              <form onSubmit={handleSubmit}>
                <Input
                  id="register-name"
                  label="Full name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Alex Johnson"
                  autoComplete="name"
                />
                <Input
                  id="register-email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="alex@finance.app"
                  autoComplete="email"
                />
                <Input
                  id="register-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password123"
                  autoComplete="new-password"
                />

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <p className="text-body-secondary mt-3 mb-0">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
