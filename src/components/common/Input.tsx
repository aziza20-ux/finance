import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

const Input = ({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}: InputProps) => {
  const inputClassName = ["form-control", error ? "is-invalid" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mb-3">
      {label ? (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      ) : null}
      <input id={id} className={inputClassName} {...props} />
      {error ? <div className="invalid-feedback d-block">{error}</div> : null}
      {!error && helperText ? <div className="form-text">{helperText}</div> : null}
    </div>
  );
};

export default Input;
